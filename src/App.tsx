import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BeadBoardCanvas, BloomBurst, RevealBurst } from './components/BeadBoardCanvas';
import { BufferDock } from './components/BufferDock';
import { ComboPraiseOverlay, PraisePopup } from './components/ComboPraiseOverlay';
import { EmitterQueue } from './components/EmitterQueue';
import { FailModal } from './components/FailModal';
import { PlayableCtaBar } from './components/PlayableCtaBar';
import { ProgressBar } from './components/ProgressBar';
import { ActiveProjectile, ProjectileOverlay } from './components/ProjectileOverlay';
import { VictoryModal } from './components/VictoryModal';
import { TemplateStudioDrawer } from './components/TemplateStudioDrawer';
import { DEFAULT_HAMSTER_LEVEL } from './data/hamsterLevel';
import {
  INITIAL_TEMPLATE_CONFIG,
  resolveInitialLevel,
  resolveMascotSrc,
} from './data/activeTemplate';
import {
  buildColumnsFromLevel,
  createInitialGridState,
  createInitialRevealedState,
  findBestHintForLevel,
  floodRevealPatch,
  getExposedCellsByColor,
  pickTargetCellForSlotForLevel,
  type BeadColorKey,
  type BufferSlot,
  type CellState,
  type EmitterItem,
  type LevelJsonDefinition,
  type LevelRuntime,
} from './data/levelTemplate';
import type { MascotId } from './data/mascots';
import { soundEngine } from './utils/sound';
import { mraidBridge } from './utils/mraid';
import { openStoreUrl } from './utils/storeRedirect';

const PRAISE_WORDS: readonly PraisePopup['word'][] = [
  'NICE!',
  'GREAT!',
  'AMAZING!',
  'BRILLIANT!',
  'FANTASTIC!',
];

type GameState = 'PLAYING' | 'JAMMED' | 'VICTORY';

interface UndoSnapshot {
  grid: CellState[][];
  revealed: boolean[][];
  slots: BufferSlot[];
  columns: EmitterItem[][];
  moves: number;
  extraSlotUnlocked: boolean;
}

const CARDINAL_DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

function createEmptySlots(count = 5): BufferSlot[] {
  return Array.from({ length: count }, (_, idx) => ({
    slotIndex: idx,
    emitter: null,
    lastFiredAt: 0,
    isWaiting: false,
  }));
}

function cloneGrid(grid: CellState[][]): CellState[][] {
  return grid.map((row) => [...row]);
}

function cloneRevealed(revealed: boolean[][]): boolean[][] {
  return revealed.map((row) => [...row]);
}

function cloneSlots(slots: BufferSlot[]): BufferSlot[] {
  return slots.map((s) => ({
    ...s,
    emitter: s.emitter ? { ...s.emitter } : null,
  }));
}

function cloneColumns(columns: EmitterItem[][]): EmitterItem[][] {
  return columns.map((col) => col.map((item) => ({ ...item })));
}

export default function App() {
  const [activeLevel, setActiveLevel] = useState<LevelRuntime>(() => resolveInitialLevel());
  const [activeLevelJson, setActiveLevelJson] = useState<LevelJsonDefinition | null>(
    () => INITIAL_TEMPLATE_CONFIG.levelJson ?? null
  );
  const [mascotId, setMascotId] = useState<MascotId>(() => INITIAL_TEMPLATE_CONFIG.mascotId);
  const [customMascotDataUrl, setCustomMascotDataUrl] = useState<string | null>(
    () => INITIAL_TEMPLATE_CONFIG.customMascotDataUrl ?? null
  );
  const [victoryImageDataUrl, setVictoryImageDataUrl] = useState<string | null>(
    () => INITIAL_TEMPLATE_CONFIG.victoryImageDataUrl ?? null
  );
  const [victorySnapshotUrl, setVictorySnapshotUrl] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState<string>(
    () =>
      INITIAL_TEMPLATE_CONFIG.outputFilename ||
      'T_S_JPJB_var_Shoot-Reveal-Hamster_en_261124_Christy_AppLovin.html'
  );

  const [grid, setGrid] = useState<CellState[][]>(() => createInitialGridState(activeLevel));
  const [revealed, setRevealed] = useState<boolean[][]>(() =>
    createInitialRevealedState(activeLevel)
  );
  const [filledCount, setFilledCount] = useState(0);
  const [slots, setSlots] = useState<BufferSlot[]>(() => createEmptySlots(5));
  const [columns, setColumns] = useState<EmitterItem[][]>(() =>
    buildColumnsFromLevel(activeLevel, false)
  );
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [moves, setMoves] = useState(0);
  const [extraSlotUnlocked, setExtraSlotUnlocked] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<BeadColorKey | null>(null);
  const [, setUndoStack] = useState<UndoSnapshot[]>([]);
  const [victoryAt, setVictoryAt] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [praisePopups, setPraisePopups] = useState<PraisePopup[]>([]);
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 390,
    h: typeof window !== 'undefined' ? window.innerHeight : 844,
  }));

  useEffect(() => {
    mraidBridge.init();
    const updateViewport = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  const isCompactLandscape = viewport.w > viewport.h;
  // Detect tall notch / Dynamic Island / punch-hole phones (aspect ratio >= 1.9) where ad-SDK WebViews often report env(safe-area-inset-top) = 0
  const isTallNotchPhone = !isCompactLandscape && viewport.h / Math.max(1, viewport.w) >= 1.9;
  const uiScale = useMemo(() => {
    const { w, h } = viewport;
    if (isCompactLandscape) {
      if (w > 820 && h > 460) {
        return Math.min(w / 820, h / 430);
      }
      return 1;
    }
    if (w > 460 && h > 660) {
      return Math.min(w / 400, h / 660);
    }
    return 1;
  }, [viewport, isCompactLandscape]);

  const playfieldRef = useRef<HTMLDivElement | null>(null);
  const boardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);

  const levelRef = useRef<LevelRuntime>(activeLevel);
  levelRef.current = activeLevel;

  const gridRef = useRef<CellState[][]>(grid);
  const revealedRef = useRef<boolean[][]>(revealed);
  const slotsRef = useRef<BufferSlot[]>(slots);
  const projectilesRef = useRef<ActiveProjectile[]>([]);
  const bloomBurstsRef = useRef<BloomBurst[]>([]);
  const revealBurstsRef = useRef<RevealBurst[]>([]);
  const gameStateRef = useRef<GameState>(gameState);
  const maxSlotsRef = useRef<number>(4);
  const shotParityRef = useRef<number>(0);
  const filledCountRef = useRef<number>(0);
  const lastUiSyncAtRef = useRef<number>(0);
  const pendingGridSyncRef = useRef<boolean>(false);
  const pendingRevealedSyncRef = useRef<boolean>(false);
  const pendingSlotsSyncRef = useRef<boolean>(false);

  const comboStreakRef = useRef<number>(0);
  const lastPraiseAtRef = useRef<number>(0);
  const recentLandsRef = useRef<number[]>([]);

  const maxSlots = extraSlotUnlocked ? 5 : 4;
  maxSlotsRef.current = maxSlots;
  gameStateRef.current = gameState;

  const triggerPraise = useCallback((nowMs: number) => {
    if (nowMs - lastPraiseAtRef.current < 900) return;
    if (nowMs - lastPraiseAtRef.current > 4000) {
      comboStreakRef.current = 0;
    }
    comboStreakRef.current += 1;
    lastPraiseAtRef.current = nowMs;

    const streak = comboStreakRef.current;
    const word = PRAISE_WORDS[Math.min(streak - 1, PRAISE_WORDS.length - 1)];
    const id = `praise-${nowMs}-${Math.random().toString(36).slice(2, 6)}`;
    const offsetX = ((streak % 3) - 1) * 6;

    setPraisePopups((prev) => [...prev.slice(-2), { id, word, combo: streak, offsetX }]);
    soundEngine.playPraiseVoice(word);
    window.setTimeout(() => {
      setPraisePopups((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  }, []);

  const exposedCounts = useMemo(() => {
    const exposedMap = getExposedCellsByColor(activeLevel, grid, revealed);
    const exposed: Record<BeadColorKey, number> = {};
    for (const k of activeLevel.colorKeys) {
      exposed[k] = exposedMap[k]?.length ?? 0;
    }
    return exposed;
  }, [activeLevel, grid, revealed]);

  useEffect(() => {
    let rafId = 0;

    const tick = (now: number) => {
      let gridChanged = false;
      let revealedChanged = false;
      let slotsChanged = false;
      const currentLevel = levelRef.current;
      const currentGrid = gridRef.current;
      const currentRevealed = revealedRef.current;
      const currentSlots = slotsRef.current;
      const activeLimit = maxSlotsRef.current;

      // 1. Resolve landed projectiles & flood-reveal big connected color patches
      if (projectilesRef.current.length > 0) {
        const stillFlying: ActiveProjectile[] = [];
        for (const p of projectilesRef.current) {
          if (now - p.startedAt >= p.duration) {
            if (currentGrid[p.targetRow]?.[p.targetCol] !== 'COLORED') {
              if (!currentGrid[p.targetRow]) continue;
              currentGrid[p.targetRow][p.targetCol] = 'COLORED';
              currentRevealed[p.targetRow][p.targetCol] = true;
              filledCountRef.current += 1;
              gridChanged = true;
              bloomBurstsRef.current.push({
                row: p.targetRow,
                col: p.targetCol,
                color: p.color,
                startedAt: now,
              });
              soundEngine.playBloom();

              // Track rapid large-batch fills for elastic combo praise popups
              recentLandsRef.current.push(now);
              recentLandsRef.current = recentLandsRef.current.filter((t) => now - t < 1300);
              if (recentLandsRef.current.length >= 16) {
                recentLandsRef.current = [];
                triggerPraise(now);
              }

              // Flood-reveal adjacent unrevealed same-color clusters so whole regions flip open together
              let anyNewRevealed = false;
              for (const [dr, dc] of CARDINAL_DIRS) {
                const nr = p.targetRow + dr;
                const nc = p.targetCol + dc;
                if (
                  nr >= 0 &&
                  nr < currentLevel.rows &&
                  nc >= 0 &&
                  nc < currentLevel.cols &&
                  currentGrid[nr][nc] !== 'EMPTY' &&
                  !currentRevealed[nr][nc]
                ) {
                  const batch = floodRevealPatch(currentLevel, currentRevealed, nr, nc, 4, 2);
                  if (batch.length > 0) {
                    revealedChanged = true;
                    anyNewRevealed = true;
                    batch.forEach((item, idx) => {
                      revealBurstsRef.current.push({
                        row: item.row,
                        col: item.col,
                        startedAt: now + idx * 14,
                      });
                    });
                  }
                }
              }
              if (anyNewRevealed) {
                soundEngine.playReveal();
              }
            }
          } else {
            stillFlying.push(p);
          }
        }
        projectilesRef.current = stillFlying;
      }

      // 2. Rapid-fire active emitters with sweeping flight trajectories
      if (gameStateRef.current === 'PLAYING') {
        const fireInterval = 40;
        const flightDuration = 148;

        for (let i = 0; i < activeLimit; i++) {
          const slot = currentSlots[i];
          if (!slot || !slot.emitter) continue;

          if (slot.emitter.ammo <= 0) {
            slot.emitter = null;
            slot.isWaiting = false;
            slotsChanged = true;
            continue;
          }

          if (now - slot.lastFiredAt >= fireInterval) {
            const target = pickTargetCellForSlotForLevel(
              currentLevel,
              currentGrid,
              slot.emitter.color,
              i,
              activeLimit,
              currentRevealed
            );
            if (target) {
              currentGrid[target.row][target.col] = 'INCOMING';
              slot.emitter.ammo -= 1;
              slot.lastFiredAt = now;
              slot.isWaiting = false;
              gridChanged = true;
              slotsChanged = true;

              const parity = shotParityRef.current++ % 3;
              const arcDir = parity === 0 ? -1 : parity === 1 ? 1 : 0.35 * (i % 2 === 0 ? -1 : 1);

              projectilesRef.current.push({
                id: `proj-${now}-${i}-${target.row}-${target.col}-${Math.random()}`,
                slotIndex: i,
                color: slot.emitter.color,
                targetRow: target.row,
                targetCol: target.col,
                startedAt: now,
                duration: flightDuration,
                arcDirection: arcDir,
              });

              if (slot.emitter.ammo === 0) {
                slot.emitter = null;
                slot.isWaiting = false;
                soundEngine.playSlotClear();
                triggerPraise(now);
              }
            } else if (!slot.isWaiting) {
              slot.isWaiting = true;
              slotsChanged = true;
            }
          }
        }

        let coloredTotal = 0;
        for (let r = 0; r < currentLevel.rows; r++) {
          for (let c = 0; c < currentLevel.cols; c++) {
            if (currentGrid[r]?.[c] === 'COLORED') coloredTotal++;
          }
        }
        if (coloredTotal === currentLevel.totalBeads) {
          gameStateRef.current = 'VICTORY';
          setGameState('VICTORY');
          setVictoryAt(now);
          // Capture a snapshot of the completed board so custom JSON patterns show their own artwork on victory
          try {
            const snap = boardCanvasRef.current?.toDataURL('image/png') ?? null;
            setVictorySnapshotUrl(snap);
          } catch {
            setVictorySnapshotUrl(null);
          }
          soundEngine.stopBgm();
          soundEngine.playVictory();
        } else if (projectilesRef.current.length === 0) {
          const occupied = currentSlots.slice(0, activeLimit).filter((s) => s.emitter !== null);
          if (occupied.length === activeLimit) {
            const exposed = getExposedCellsByColor(currentLevel, currentGrid, currentRevealed);
            const anyCanFire = occupied.some(
              (s) => s.emitter !== null && (exposed[s.emitter.color]?.length ?? 0) > 0
            );
            if (!anyCanFire) {
              gameStateRef.current = 'JAMMED';
              setGameState('JAMMED');
              soundEngine.playBlocked();
            }
          }
        }
      }

      if (gridChanged) pendingGridSyncRef.current = true;
      if (revealedChanged) pendingRevealedSyncRef.current = true;
      if (slotsChanged) pendingSlotsSyncRef.current = true;

      const isIdleNow = gameStateRef.current !== 'PLAYING' || projectilesRef.current.length === 0;
      const timeToTickUi = now - lastUiSyncAtRef.current >= 120;

      // During rapid bead flight: ONLY update lightweight filledCount + slots every 120ms.
      // NEVER clone 896-cell grid/revealed arrays mid-flight (BeadBoardCanvas reads refs directly at 60fps!).
      if (isIdleNow || timeToTickUi) {
        if (pendingGridSyncRef.current || pendingSlotsSyncRef.current || pendingRevealedSyncRef.current) {
          lastUiSyncAtRef.current = now;
          if (pendingGridSyncRef.current) {
            setFilledCount(filledCountRef.current);
          }
          if (pendingSlotsSyncRef.current) {
            pendingSlotsSyncRef.current = false;
            setSlots(cloneSlots(currentSlots));
          }
          if (isIdleNow) {
            if (pendingGridSyncRef.current) {
              pendingGridSyncRef.current = false;
              setGrid(cloneGrid(currentGrid));
            }
            if (pendingRevealedSyncRef.current) {
              pendingRevealedSyncRef.current = false;
              setRevealed(cloneRevealed(currentRevealed));
            }
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const hasEmptySlot = slots.slice(0, maxSlots).some((s) => s.emitter === null);
  const canDeploy = gameState === 'PLAYING' && hasEmptySlot;

  const createConservingSnapshot = useCallback((): UndoSnapshot => {
    const snapGrid = cloneGrid(gridRef.current);
    const snapRevealed = cloneRevealed(revealedRef.current);
    const snapSlots = cloneSlots(slotsRef.current);

    const flyingBySlot = new Map<number, number>();
    for (const p of projectilesRef.current) {
      if (snapGrid[p.targetRow][p.targetCol] === 'INCOMING') {
        snapGrid[p.targetRow][p.targetCol] = 'UNFILLED';
        flyingBySlot.set(p.slotIndex, (flyingBySlot.get(p.slotIndex) ?? 0) + 1);
      }
    }
    for (const [slotIdx, refund] of flyingBySlot.entries()) {
      const slot = snapSlots[slotIdx];
      if (slot) {
        if (slot.emitter) {
          slot.emitter.ammo += refund;
        } else {
          const matchingProj = projectilesRef.current.find((p) => p.slotIndex === slotIdx);
          if (matchingProj) {
            slot.emitter = {
              id: `em-restored-${Date.now()}-${slotIdx}`,
              color: matchingProj.color,
              ammo: refund,
              maxAmmo: refund,
            };
          }
        }
      }
    }

    return {
      grid: snapGrid,
      revealed: snapRevealed,
      slots: snapSlots,
      columns: cloneColumns(columns),
      moves,
      extraSlotUnlocked: false,
    };
  }, [columns, moves]);

  const handleDeployColumn = useCallback(
    (colIndex: number) => {
      if (gameStateRef.current !== 'PLAYING') return;
      const front = columns[colIndex]?.[0];
      if (!front) return;

      const emptyIdx = slotsRef.current
        .slice(0, maxSlotsRef.current)
        .findIndex((s) => s.emitter === null);
      if (emptyIdx === -1) {
        soundEngine.playBlocked();
        return;
      }

      const snapshot = createConservingSnapshot();
      setUndoStack((prev) => [...prev.slice(-29), snapshot]);

      const nextColumns = cloneColumns(columns);
      const picked = nextColumns[colIndex].shift()!;

      const nextSlots = cloneSlots(slotsRef.current);
      nextSlots[emptyIdx] = {
        slotIndex: emptyIdx,
        emitter: { ...picked },
        lastFiredAt: 0,
        isWaiting: false,
      };

      slotsRef.current = nextSlots;
      setSlots(nextSlots);
      setColumns(nextColumns);
      setMoves((m) => m + 1);
      setShowGuide(false);
      soundEngine.startBgm();
      soundEngine.playPick();
    },
    [columns, createConservingSnapshot]
  );

  const handleUnlockExtraSlot = useCallback(() => {
    if (extraSlotUnlocked || gameState === 'VICTORY') return;
    setExtraSlotUnlocked(true);
    if (gameStateRef.current === 'JAMMED') {
      gameStateRef.current = 'PLAYING';
      setGameState('PLAYING');
    }
    soundEngine.playSlotClear();
  }, [extraSlotUnlocked, gameState]);

  const resetGameForLevel = useCallback((targetLevel: LevelRuntime, shuffled: boolean) => {
    const freshGrid = createInitialGridState(targetLevel);
    const freshRevealed = createInitialRevealedState(targetLevel);
    const freshSlots = createEmptySlots(5);
    const freshCols = buildColumnsFromLevel(targetLevel, shuffled);

    projectilesRef.current = [];
    bloomBurstsRef.current = [];
    revealBurstsRef.current = [];
    comboStreakRef.current = 0;
    lastPraiseAtRef.current = 0;
    recentLandsRef.current = [];
    levelRef.current = targetLevel;
    gridRef.current = freshGrid;
    revealedRef.current = freshRevealed;
    slotsRef.current = freshSlots;
    filledCountRef.current = 0;
    gameStateRef.current = 'PLAYING';

    setGrid(freshGrid);
    setRevealed(freshRevealed);
    setFilledCount(0);
    setSlots(freshSlots);
    setColumns(freshCols);
    setMoves(0);
    setExtraSlotUnlocked(false);
    setUndoStack([]);
    setGameState('PLAYING');
    setVictoryAt(null);
    setVictorySnapshotUrl(null);
    setPraisePopups([]);
    setShowGuide(true);
    soundEngine.stopBgm();
    soundEngine.resetCombo();
  }, []);

  const resetGame = useCallback(
    (shuffled: boolean) => {
      resetGameForLevel(levelRef.current, shuffled);
    },
    [resetGameForLevel]
  );

  const handleApplyTemplateLevel = useCallback(
    (level: LevelRuntime, rawJson: LevelJsonDefinition) => {
      setActiveLevel(level);
      setActiveLevelJson(rawJson);
      resetGameForLevel(level, false);
    },
    [resetGameForLevel]
  );

  const handleResetDefaultLevel = useCallback(() => {
    setActiveLevel(DEFAULT_HAMSTER_LEVEL);
    setActiveLevelJson(null);
    resetGameForLevel(DEFAULT_HAMSTER_LEVEL, false);
  }, [resetGameForLevel]);

  const handlePlayNowClick = useCallback(() => {
    soundEngine.playSlotClear();
    openStoreUrl();
  }, []);

  const remainingTotal = Math.max(0, activeLevel.totalBeads - filledCount);
  const mascotSrc = useMemo(
    () => resolveMascotSrc(mascotId, customMascotDataUrl),
    [mascotId, customMascotDataUrl]
  );
  const effectiveVictoryImage =
    victoryImageDataUrl || activeLevel.victoryImage || victorySnapshotUrl;

  // Re-show finger guide after 5s of idle play so the player never feels lost
  useEffect(() => {
    if (showGuide || gameState !== 'PLAYING' || !canDeploy) return;
    const timer = window.setTimeout(() => {
      setShowGuide(true);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [showGuide, gameState, canDeploy, moves]);

  const guideColIndex = useMemo(() => {
    if (!showGuide || gameState !== 'PLAYING' || !canDeploy) return null;
    return findBestHintForLevel(activeLevel, grid, columns, slots, revealed)?.colIndex ?? null;
  }, [showGuide, gameState, canDeploy, activeLevel, grid, columns, slots, revealed]);

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#fff8ea] text-[#26211a] flex items-center justify-center">
      {/* Full-bleed Responsive Portrait & Landscape Playable Frame (scales proportionally on wide previewers & tablets) */}
      <main
        className="relative bg-[#fff8ea] overflow-hidden flex flex-col shrink-0"
        style={
          uiScale > 1.001
            ? {
                width: `${viewport.w / uiScale}px`,
                height: `${viewport.h / uiScale}px`,
                transform: `scale(${uiScale})`,
                transformOrigin: 'center center',
              }
            : { width: '100%', height: '100%' }
        }
      >
        {/* Playfield Surface (flex-1 min-h-0 guarantees zero overflow) */}
        <div
          ref={playfieldRef}
          onTouchStart={() => {
            if (gameStateRef.current === 'PLAYING') {
              soundEngine.startBgm();
            }
          }}
          onPointerDown={() => {
            if (gameStateRef.current === 'PLAYING') {
              soundEngine.startBgm();
            }
          }}
          className={`relative flex-1 min-h-0 flex ${
            isCompactLandscape
              ? 'flex-row items-stretch gap-4'
              : 'flex-col gap-1.5 px-3 pb-2'
          }`}
          style={{
            background: 'linear-gradient(180deg, #fffaf0 0%, #f8ebd0 100%)',
            paddingTop: isCompactLandscape
              ? 'max(10px, env(safe-area-inset-top))'
              : isTallNotchPhone
                ? 'max(46px, calc(env(safe-area-inset-top) + 6px))'
                : 'max(16px, calc(env(safe-area-inset-top) + 6px))',
            paddingBottom: isCompactLandscape
              ? 'max(10px, env(safe-area-inset-bottom))'
              : undefined,
            paddingLeft: isCompactLandscape
              ? 'max(28px, env(safe-area-inset-left))'
              : undefined,
            paddingRight: isCompactLandscape
              ? 'max(28px, env(safe-area-inset-right))'
              : undefined,
          }}
        >
          {isCompactLandscape ? (
            <>
              {/* Landscape Left Column: Jewel Bloom Logo + Progress Bar + Large Cherry Hamster Pattern */}
              <div className="flex-1 min-w-0 h-full flex flex-col gap-1">
                <div className="relative z-20 w-full shrink-0 flex items-center gap-2">
                  <img
                    src="/assets/jewel_bloom_logo.png"
                    alt="Jewel Bloom"
                    draggable={false}
                    className="h-9 w-auto object-contain shrink-0 select-none pointer-events-none"
                  />
                  <div className="flex-1 min-w-0">
                    <ProgressBar
                      filledCount={filledCount}
                      totalBeads={activeLevel.totalBeads}
                      isVictory={gameState === 'VICTORY'}
                      mascotSrc={mascotSrc}
                    />
                  </div>
                </div>
                <div className="relative z-10 flex-1 min-h-0 w-full">
                  <BeadBoardCanvas
                    level={activeLevel}
                    boardRef={boardCanvasRef}
                    gridRef={gridRef}
                    revealedRef={revealedRef}
                    bloomBurstsRef={bloomBurstsRef}
                    revealBurstsRef={revealBurstsRef}
                    hoveredColor={hoveredColor}
                    isVictory={gameState === 'VICTORY'}
                    victoryAt={victoryAt}
                  />
                </div>
              </div>

              {/* Landscape Right Column: Generously Proportioned Buffer Dock + 4-Column Queue + CTA Bar */}
              <div className="relative z-20 w-[47%] max-w-[380px] shrink-0 h-full flex flex-col justify-between gap-2 py-0.5">
                <div className="flex-1 flex flex-col justify-evenly gap-2">
                  <BufferDock
                    slots={slots}
                    maxSlots={maxSlots}
                    extraSlotUnlocked={extraSlotUnlocked}
                    onUnlockExtraSlot={handleUnlockExtraSlot}
                    slotRefs={slotRefs}
                    onHoverColor={setHoveredColor}
                    isJammed={gameState === 'JAMMED'}
                    palette={activeLevel.palette}
                  />
                  <EmitterQueue
                    columns={columns}
                    exposedCounts={exposedCounts}
                    canDeploy={canDeploy}
                    hintColIndex={guideColIndex}
                    onDeployColumn={handleDeployColumn}
                    onHoverColor={setHoveredColor}
                    palette={activeLevel.palette}
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-[#e5d5b6] shrink-0">
                  <PlayableCtaBar onPlayNow={handlePlayNowClick} />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Portrait: Top Jewel Bloom Brand Logo */}
              <div className="relative z-20 w-full shrink-0 flex justify-center -mb-0.5">
                <img
                  src="/assets/jewel_bloom_logo.png"
                  alt="Jewel Bloom"
                  draggable={false}
                  className="h-[50px] w-auto object-contain select-none pointer-events-none"
                />
              </div>

              {/* Portrait: Top Progress Bar with Animated Runner Mascot */}
              <div className="relative z-20 w-full shrink-0">
                <ProgressBar
                  filledCount={filledCount}
                  totalBeads={activeLevel.totalBeads}
                  isVictory={gameState === 'VICTORY'}
                  mascotSrc={mascotSrc}
                />
              </div>

              {/* Portrait: Auto-scaling Pixel Bead Pegboard (borderless, no clipping frame) */}
              <div className="relative z-10 flex-1 min-h-0 w-full">
                <BeadBoardCanvas
                  level={activeLevel}
                  boardRef={boardCanvasRef}
                  gridRef={gridRef}
                  revealedRef={revealedRef}
                  bloomBurstsRef={bloomBurstsRef}
                  revealBurstsRef={revealBurstsRef}
                  hoveredColor={hoveredColor}
                  isVictory={gameState === 'VICTORY'}
                  victoryAt={victoryAt}
                />
              </div>

              {/* Portrait: Compact 4+1 Recessed Square Buffer Zone + 4-Column Queue */}
              <div className="relative z-20 w-full shrink-0 flex flex-col gap-2">
                <BufferDock
                  slots={slots}
                  maxSlots={maxSlots}
                  extraSlotUnlocked={extraSlotUnlocked}
                  onUnlockExtraSlot={handleUnlockExtraSlot}
                  slotRefs={slotRefs}
                  onHoverColor={setHoveredColor}
                  isJammed={gameState === 'JAMMED'}
                  palette={activeLevel.palette}
                />

                <EmitterQueue
                  columns={columns}
                  exposedCounts={exposedCounts}
                  canDeploy={canDeploy}
                  hintColIndex={guideColIndex}
                  onDeployColumn={handleDeployColumn}
                  onHoverColor={setHoveredColor}
                  palette={activeLevel.palette}
                />
              </div>
            </>
          )}

          {/* Elastic Combo Praise Popups */}
          <ComboPraiseOverlay popups={praisePopups} />

          {/* Full-Playfield Projectile Overlay */}
          <ProjectileOverlay
            level={activeLevel}
            playfieldRef={playfieldRef}
            boardCanvasRef={boardCanvasRef}
            slotRefs={slotRefs}
            projectilesRef={projectilesRef}
            overlayCanvasRef={overlayCanvasRef}
          />

          {/* Royal Match Style Fail Modal */}
          {gameState === 'JAMMED' && (
            <FailModal
              remainingBeads={remainingTotal}
              onMoreLevels={handlePlayNowClick}
              onTryAgain={() => resetGame(false)}
            />
          )}

          {/* Royal Match Style Center Victory Modal showcasing completed artwork */}
          {gameState === 'VICTORY' && (
            <VictoryModal
              onPlayNow={handlePlayNowClick}
              onReplay={() => resetGame(false)}
              victoryImageSrc={effectiveVictoryImage}
            />
          )}
        </div>

        {/* Bottom CTA Bar anchored at bottom in Portrait */}
        {!isCompactLandscape && (
          <div className="relative z-30 w-full shrink-0">
            <PlayableCtaBar onPlayNow={handlePlayNowClick} />
          </div>
        )}
      </main>

      {/* Dev-only Template Studio Drawer (tree-shaken out of production AppLovin builds) */}
      {import.meta.env.DEV && (
        <TemplateStudioDrawer
          activeLevel={activeLevel}
          activeLevelJson={activeLevelJson}
          mascotId={mascotId}
          customMascotDataUrl={customMascotDataUrl}
          victoryImageDataUrl={victoryImageDataUrl}
          outputFilename={outputFilename}
          onApplyLevel={handleApplyTemplateLevel}
          onResetDefaultLevel={handleResetDefaultLevel}
          onSelectMascot={(id, customUrl) => {
            setMascotId(id);
            if (customUrl !== undefined) {
              setCustomMascotDataUrl(customUrl);
            }
          }}
          onChangeVictoryImage={setVictoryImageDataUrl}
          onChangeOutputFilename={setOutputFilename}
        />
      )}
    </div>
  );
}
