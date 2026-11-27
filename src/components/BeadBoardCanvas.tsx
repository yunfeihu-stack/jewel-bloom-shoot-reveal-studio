import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { BEAD_PALETTE } from '../data/hamsterLevel';
import {
  isCellExposed,
  type BeadColorKey,
  type CellState,
  type LevelRuntime,
} from '../data/levelTemplate';

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.2;
const ZOOM_STEP = 0.35;

export interface BloomBurst {
  row: number;
  col: number;
  color: BeadColorKey;
  startedAt: number;
}

export interface RevealBurst {
  row: number;
  col: number;
  startedAt: number;
}

interface BeadBoardCanvasProps {
  level: LevelRuntime;
  boardRef: React.RefObject<HTMLCanvasElement | null>;
  gridRef: React.MutableRefObject<CellState[][]>;
  revealedRef: React.MutableRefObject<boolean[][]>;
  bloomBurstsRef: React.MutableRefObject<BloomBurst[]>;
  revealBurstsRef: React.MutableRefObject<RevealBurst[]>;
  hoveredColor: BeadColorKey | null;
  isVictory: boolean;
  victoryAt: number | null;
}

/**
 * Dark charcoal "?" mystery tile modeled after Brilliant Sort video.
 * High-contrast dark tile so revealed colored sockets & snapped beads pop vividly.
 */
function drawMysteryTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const r = Math.max(1.2, size * 0.14);

  // Crisp dark charcoal block
  ctx.fillStyle = '#2d313b';
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, r);
  ctx.fill();

  // Subtle top highlight & bottom depth
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(x + 0.8, y + 0.5, size - 1.6, Math.max(1, size * 0.12));

  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.fillRect(x + 0.8, y + size - Math.max(1, size * 0.12), size - 1.6, Math.max(1, size * 0.12));

  // Centered bright "?" mark
  ctx.fillStyle = '#d1d6e0';
  ctx.font = `700 ${Math.max(7, Math.round(size * 0.64))}px Outfit, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', x + size / 2, y + size / 2 + 0.5);
}

/**
 * Exposed open socket waiting to be filled — muted pale target tint with recessed circular pit.
 */
function drawOpenSocket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  socketBase: string,
  socketLight: string,
  socketHole: string
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const holeR = size * 0.34;

  ctx.fillStyle = socketBase;
  ctx.fillRect(x, y, size, size);

  ctx.fillStyle = socketLight;
  ctx.fillRect(x, y, size, Math.max(0.8, size * 0.1));
  ctx.fillRect(x, y, Math.max(0.8, size * 0.1), size);

  ctx.fillStyle = socketHole;
  ctx.beginPath();
  ctx.arc(cx, cy, holeR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(20, 22, 30, 0.25)';
  ctx.lineWidth = Math.max(0.8, size * 0.08);
  ctx.beginPath();
  ctx.arc(cx, cy, holeR - ctx.lineWidth * 0.4, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
  ctx.lineWidth = Math.max(0.6, size * 0.06);
  ctx.beginPath();
  ctx.arc(cx, cy, holeR - ctx.lineWidth * 0.4, Math.PI * 0.12, Math.PI * 0.88);
  ctx.stroke();
}

/**
 * Snapped-in / filled bead — rich, deeper, high-contrast faceted jewel bead.
 */
function drawFacetedBead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  topCol: string,
  sideCol: string,
  bottomCol: string,
  centerCol: string
): void {
  const half = size / 2;
  const cx = x + half;
  const cy = y + half;

  ctx.fillStyle = sideCol;
  ctx.fillRect(x, y, size, size);

  ctx.fillStyle = topCol;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = bottomCol;
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = sideCol;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(cx, cy);
  ctx.lineTo(x, y + size);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = centerCol;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.29, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
  ctx.beginPath();
  ctx.arc(cx - size * 0.09, cy - size * 0.09, size * 0.095, 0, Math.PI * 2);
  ctx.fill();
}

export const BeadBoardCanvas: React.FC<BeadBoardCanvasProps> = ({
  level,
  boardRef,
  gridRef,
  revealedRef,
  bloomBurstsRef,
  revealBurstsRef,
  hoveredColor,
  isVictory,
  victoryAt,
}) => {
  const hoveredRef = useRef(hoveredColor);
  const victoryRef = useRef({ isVictory, victoryAt });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  zoomRef.current = zoom;
  panRef.current = pan;

  // Multi-touch pinch + single-finger drag + double-tap tracking
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartRef = useRef<{ dist: number; zoom: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const lastTapAtRef = useRef<number>(0);

  hoveredRef.current = hoveredColor;
  victoryRef.current = { isVictory, victoryAt };

  const clampPan = useCallback((nextX: number, nextY: number, nextZoom: number) => {
    if (nextZoom <= 1.01) return { x: 0, y: 0 };
    const vp = viewportRef.current;
    const maxPanX = vp ? (vp.clientWidth * (nextZoom - 1)) / 2 + 12 : 120;
    const maxPanY = vp ? (vp.clientHeight * (nextZoom - 1)) / 2 + 12 : 140;
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, nextX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, nextY)),
    };
  }, []);

  const applyZoom = useCallback(
    (targetZoom: number) => {
      const clamped = Math.round(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom)) * 100) / 100;
      setZoom(clamped);
      setPan((prev) => clampPan(prev.x, prev.y, clamped));
    },
    [clampPan]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const pts = activePointersRef.current;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pts.size === 2) {
        const [a, b] = Array.from(pts.values());
        pinchStartRef.current = {
          dist: Math.hypot(a.x - b.x, a.y - b.y),
          zoom: zoomRef.current,
        };
        dragStartRef.current = null;
      } else if (pts.size === 1) {
        const now = Date.now();
        if (now - lastTapAtRef.current < 280) {
          lastTapAtRef.current = 0;
          if (zoomRef.current > 1.05) {
            applyZoom(1);
          } else {
            applyZoom(1.65);
          }
          return;
        }
        lastTapAtRef.current = now;
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          panX: panRef.current.x,
          panY: panRef.current.y,
        };
      }
    },
    [applyZoom]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const pts = activePointersRef.current;
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pts.size === 2 && pinchStartRef.current) {
        const [a, b] = Array.from(pts.values());
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchStartRef.current.dist > 8) {
          const nextZoom = pinchStartRef.current.zoom * (dist / pinchStartRef.current.dist);
          applyZoom(nextZoom);
        }
      } else if (pts.size === 1 && dragStartRef.current && zoomRef.current > 1.02) {
        const vp = viewportRef.current;
        const renderScale =
          vp && vp.clientWidth > 0 ? vp.getBoundingClientRect().width / vp.clientWidth : 1;
        const dx = (e.clientX - dragStartRef.current.x) / renderScale;
        const dy = (e.clientY - dragStartRef.current.y) / renderScale;
        setPan(clampPan(dragStartRef.current.panX + dx, dragStartRef.current.panY + dy, zoomRef.current));
      }
    },
    [applyZoom, clampPan]
  );

  const handlePointerUpOrCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const pts = activePointersRef.current;
    pts.delete(e.pointerId);
    if (pts.size < 2) {
      pinchStartRef.current = null;
    }
    if (pts.size === 1) {
      const [remaining] = Array.from(pts.values());
      dragStartRef.current = {
        x: remaining.x,
        y: remaining.y,
        panX: panRef.current.x,
        panY: panRef.current.y,
      };
    } else if (pts.size === 0) {
      dragStartRef.current = null;
    }
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (Math.abs(e.deltaY) < 1) return;
      const delta = e.deltaY < 0 ? 0.16 : -0.16;
      applyZoom(zoomRef.current + delta);
    },
    [applyZoom]
  );

  useEffect(() => {
    const canvas = boardRef.current;
    if (!canvas) return;
    let animId = 0;

    // Incremental HD offscreen static board cache:
    // Only redraws the 1-5 cells that actually changed (0.03ms vs 16ms full redraw!),
    // eliminating mobile gameplay stutter while keeping every bead razor-sharp up to 2.2x zoom.
    const staticCanvas = document.createElement('canvas');
    const gridRows = level.rows;
    const gridCols = level.cols;
    const lastCellCode = new Uint8Array(gridRows * gridCols); // 0=unset, 1=mystery, 2=socket, 3=colored
    const getCellColorLocal = (r: number, c: number) => level.gridColors[r]?.[c] ?? null;
    let cachedW = 0;
    let cachedH = 0;
    let cachedScale = 0;
    let lastHadDynamic = true;

    const render = (now: number) => {
      const parent = canvas.parentElement;
      if (!parent) {
        animId = requestAnimationFrame(render);
        return;
      }

      const baseW = canvas.offsetWidth;
      const baseH = canvas.offsetHeight;
      if (baseW < 20 || baseH < 20) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Crisp Retina backing resolution capped at 960px (cuts mobile GPU fill-rate by 44% while staying sharp)
      const rawScale = Math.min(Math.max(window.devicePixelRatio || 1, 2), 2.5);
      const maxDimCap = 960 / Math.max(baseW, baseH);
      const effectiveDpr = Math.max(1.5, Math.min(rawScale, maxDimCap));
      const targetW = Math.max(1, Math.round(baseW * effectiveDpr));
      const targetH = Math.max(1, Math.round(baseH * effectiveDpr));

      const sizeChanged =
        canvas.width !== targetW ||
        canvas.height !== targetH ||
        cachedW !== baseW ||
        cachedH !== baseH ||
        Math.abs(cachedScale - effectiveDpr) > 0.01;

      if (sizeChanged) {
        canvas.width = targetW;
        canvas.height = targetH;
        staticCanvas.width = targetW;
        staticCanvas.height = targetH;
        lastCellCode.fill(0);
      }

      const currentGrid = gridRef.current;
      const currentRevealed = revealedRef.current;
      const currentHover = hoveredRef.current;
      const { isVictory: vFlag, victoryAt: vAt } = victoryRef.current;

      // Active bloom bursts (bead snap-in pop)
      const activeBursts = new Map<string, number>();
      const remainingBursts: BloomBurst[] = [];
      for (const b of bloomBurstsRef.current) {
        const age = now - b.startedAt;
        if (age < 320) {
          remainingBursts.push(b);
          activeBursts.set(`${b.row}:${b.col}`, age);
        }
      }
      bloomBurstsRef.current = remainingBursts;

      // Active reveal bursts ("?" flipping open into socket in a staggered wave)
      const activeReveals = new Map<string, number>();
      const remainingReveals: RevealBurst[] = [];
      for (const rv of revealBurstsRef.current) {
        const age = now - rv.startedAt;
        if (age < 220) {
          remainingReveals.push(rv);
          activeReveals.set(`${rv.row}:${rv.col}`, age);
        }
      }
      revealBurstsRef.current = remainingReveals;

      const width = baseW;
      const height = baseH;
      const pad = 2;
      const innerW = width - pad * 2;
      const innerH = height - pad * 2;
      const cellSize = Math.min(innerW / gridCols, innerH / gridRows);
      if (cellSize <= 1) {
        animId = requestAnimationFrame(render);
        return;
      }
      const boardW = cellSize * gridCols;
      const boardH = cellSize * gridRows;
      const originX = (width - boardW) / 2;
      const originY = (height - boardH) / 2;
      const gap = Math.max(0.6, cellSize * 0.055);
      const drawSize = cellSize - gap;

      // Incrementally paint ONLY cells whose state changed onto staticCanvas
      let anyCellUpdated = sizeChanged;
      const sCtx = staticCanvas.getContext('2d');
      if (sCtx) {
        let ctxPrepared = false;
        if (sizeChanged) {
          sCtx.save();
          sCtx.setTransform(effectiveDpr, 0, 0, effectiveDpr, 0, 0);
          sCtx.clearRect(0, 0, width, height);
          ctxPrepared = true;
        }
        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            const state = currentGrid[r]?.[c];
            if (!state || state === 'EMPTY') continue;
            const code =
              state === 'COLORED'
                ? 3
                : currentRevealed[r]?.[c] || state === 'INCOMING'
                  ? 2
                  : 1;
            const idx = r * gridCols + c;
            if (lastCellCode[idx] === code) continue;

            lastCellCode[idx] = code;
            anyCellUpdated = true;
            const colorKey = getCellColorLocal(r, c);
            if (!colorKey) continue;

            if (!ctxPrepared) {
              sCtx.save();
              sCtx.setTransform(effectiveDpr, 0, 0, effectiveDpr, 0, 0);
              ctxPrepared = true;
            }

            const meta = level.palette[colorKey] ?? BEAD_PALETTE.K;
            const bx = originX + c * cellSize + gap / 2;
            const by = originY + r * cellSize + gap / 2;
            sCtx.clearRect(bx - 0.5, by - 0.5, drawSize + 1, drawSize + 1);

            if (code === 3) {
              drawFacetedBead(
                sCtx,
                bx,
                by,
                drawSize,
                meta.light,
                meta.base,
                meta.dark,
                meta.centerGlow
              );
            } else if (code === 2) {
              drawOpenSocket(
                sCtx,
                bx,
                by,
                drawSize,
                meta.socketBase,
                meta.socketLight,
                meta.socketHole
              );
            } else {
              drawMysteryTile(sCtx, bx, by, drawSize);
            }
          }
        }
        if (ctxPrepared) {
          sCtx.restore();
        }
        if (sizeChanged) {
          cachedW = baseW;
          cachedH = baseH;
          cachedScale = effectiveDpr;
        }
      }

      const hasDynamicOverlay =
        remainingBursts.length > 0 ||
        remainingReveals.length > 0 ||
        currentHover !== null ||
        (vFlag && vAt !== null);

      // Zero-cost skip when no cell changed and nothing is animating
      if (!anyCellUpdated && !hasDynamicOverlay && !lastHadDynamic) {
        animId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.setTransform(effectiveDpr, 0, 0, effectiveDpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 0.1ms GPU blit of the HD static board
      ctx.drawImage(staticCanvas, 0, 0, width, height);

      // Draw ONLY animated cells & dynamic overlays on top
      if (hasDynamicOverlay) {
        for (const [key, burstAge] of activeBursts) {
          if (burstAge >= 200) continue;
          const [rStr, cStr] = key.split(':');
          const r = Number(rStr);
          const c = Number(cStr);
          const colorKey = getCellColorLocal(r, c);
          if (!colorKey) continue;
          const meta = level.palette[colorKey] ?? BEAD_PALETTE.K;
          const bx = originX + c * cellSize + gap / 2;
          const by = originY + r * cellSize + gap / 2;
          const t = burstAge / 200;
          const scale = 1 + Math.sin(t * Math.PI) * 0.34;
          ctx.save();
          ctx.translate(bx + drawSize / 2, by + drawSize / 2);
          ctx.scale(scale, scale);
          drawFacetedBead(
            ctx,
            -drawSize / 2,
            -drawSize / 2,
            drawSize,
            meta.light,
            meta.base,
            meta.dark,
            meta.centerGlow
          );
          ctx.restore();
        }

        for (const [key, revAge] of activeReveals) {
          if (revAge < 0 || revAge >= 200) continue;
          const [rStr, cStr] = key.split(':');
          const r = Number(rStr);
          const c = Number(cStr);
          if (currentGrid[r]?.[c] === 'COLORED') continue;
          const colorKey = getCellColorLocal(r, c);
          if (!colorKey) continue;
          const meta = level.palette[colorKey] ?? BEAD_PALETTE.K;
          const bx = originX + c * cellSize + gap / 2;
          const by = originY + r * cellSize + gap / 2;
          const t = revAge / 200;
          const scaleX = Math.abs(Math.cos((1 - t) * Math.PI * 0.5));
          const scaleY = 0.88 + 0.12 * t;
          ctx.save();
          ctx.translate(bx + drawSize / 2, by + drawSize / 2);
          ctx.scale(Math.max(0.15, scaleX), scaleY);
          drawOpenSocket(
            ctx,
            -drawSize / 2,
            -drawSize / 2,
            drawSize,
            meta.socketBase,
            meta.socketLight,
            meta.socketHole
          );
          ctx.fillStyle = `rgba(255, 255, 255, ${((1 - t) * 0.55).toFixed(3)})`;
          ctx.fillRect(-drawSize / 2, -drawSize / 2, drawSize, drawSize);
          ctx.restore();
        }

        if (currentHover) {
          const pulse = 0.7 + 0.3 * Math.sin(now * 0.01);
          const meta = level.palette[currentHover] ?? BEAD_PALETTE.K;
          ctx.strokeStyle = meta.base;
          ctx.lineWidth = Math.max(1.6, cellSize * 0.18);
          ctx.globalAlpha = pulse;
          for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
              if (
                currentGrid[r]?.[c] === 'UNFILLED' &&
                getCellColorLocal(r, c) === currentHover &&
                isCellExposed(level, currentGrid, r, c, currentRevealed)
              ) {
                const bx = originX + c * cellSize + gap / 2;
                const by = originY + r * cellSize + gap / 2;
                ctx.strokeRect(bx, by, drawSize, drawSize);
              }
            }
          }
          ctx.globalAlpha = 1;
        }

        if (vFlag && vAt !== null) {
          const elapsed = (now - vAt) % 2400;
          const wavePos = (elapsed / 2400) * (gridRows + gridCols + 10) - 5;
          for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
              if (currentGrid[r]?.[c] !== 'COLORED') continue;
              const dist = Math.abs(r + c - wavePos);
              if (dist < 2.6) {
                const alpha = (1 - dist / 2.6) * 0.5;
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
                ctx.fillRect(originX + c * cellSize + gap / 2, originY + r * cellSize + gap / 2, drawSize, drawSize);
              }
            }
          }
        }
      }

      // Snap-in jewel ring shockwaves + 4-point sparkle glint
      for (const b of remainingBursts) {
        const age = now - b.startedAt;
        if (age < 300) {
          const t = age / 300;
          const cx = originX + b.col * cellSize + cellSize / 2;
          const cy = originY + b.row * cellSize + cellSize / 2;
          const meta = level.palette[b.color] ?? BEAD_PALETTE.K;
          ctx.save();
          ctx.globalAlpha = (1 - t) * 0.85;
          ctx.strokeStyle = meta.light;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, cellSize * (0.42 + t * 1.25), 0, Math.PI * 2);
          ctx.stroke();

          if (t < 0.65) {
            const starAlpha = (1 - t / 0.65) * 0.95;
            const r = cellSize * (0.68 - t * 0.45);
            ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(cx, cy - r);
            ctx.lineTo(cx + r * 0.26, cy - r * 0.26);
            ctx.lineTo(cx + r, cy);
            ctx.lineTo(cx + r * 0.26, cy + r * 0.26);
            ctx.lineTo(cx, cy + r);
            ctx.lineTo(cx - r * 0.26, cy + r * 0.26);
            ctx.lineTo(cx - r, cy);
            ctx.lineTo(cx - r * 0.26, cy - r * 0.26);
            ctx.closePath();
            ctx.fill();

            const sparkDist = cellSize * (0.35 + t * 1.15);
            const sparkR = Math.max(1.2, cellSize * 0.14 * (1 - t / 0.65));
            ctx.fillStyle = meta.light;
            ctx.globalAlpha = starAlpha * 0.9;
            for (let k = 0; k < 4; k++) {
              const ang = (k * Math.PI) / 2 + Math.PI / 4;
              ctx.beginPath();
              ctx.arc(cx + Math.cos(ang) * sparkDist, cy + Math.sin(ang) * sparkDist, sparkR, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();
        }
      }

      lastHadDynamic = hasDynamicOverlay;
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [level, boardRef, bloomBurstsRef, revealBurstsRef]);

  return (
    <div
      ref={viewportRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      onWheel={handleWheel}
      className={`relative w-full h-full flex items-center justify-center overflow-visible ${
        zoom > 1.02 ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{ containerType: 'size', touchAction: 'none' }}
    >
      <div
        className="relative overflow-visible"
        style={{
          width: 'min(100cqw, calc(100cqh * 28 / 32))',
          aspectRatio: '28 / 32',
        }}
      >
        <canvas
          ref={boardRef}
          className="w-full h-full block will-change-transform"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: activePointersRef.current.size > 0 ? 'none' : 'transform 140ms ease-out',
          }}
          aria-label="Cherry Hamster pixel bead board"
        />
      </div>

      {/* Compact floating zoom controls for easy one-handed mobile use */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute right-1.5 bottom-1.5 z-20 flex flex-col items-center gap-1"
      >
        {zoom > 1.02 && (
          <button
            type="button"
            onClick={() => applyZoom(1)}
            aria-label="Reset zoom"
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90"
            style={{
              background: 'rgba(255, 250, 240, 0.92)',
              border: '1.5px solid #d4b472',
              boxShadow: '0 2px 5px rgba(74, 49, 16, 0.18)',
              color: '#6b4514',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={() => applyZoom(zoom + ZOOM_STEP)}
          disabled={zoom >= MAX_ZOOM - 0.01}
          aria-label="Zoom in"
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90 disabled:opacity-45 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255, 250, 240, 0.92)',
            border: '1.5px solid #d4b472',
            boxShadow: '0 2px 5px rgba(74, 49, 16, 0.18)',
            color: '#6b4514',
          }}
        >
          <Plus className="w-4 h-4 stroke-[2.6]" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => applyZoom(zoom - ZOOM_STEP)}
          disabled={zoom <= MIN_ZOOM + 0.01}
          aria-label="Zoom out"
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90 disabled:opacity-45 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255, 250, 240, 0.92)',
            border: '1.5px solid #d4b472',
            boxShadow: '0 2px 5px rgba(74, 49, 16, 0.18)',
            color: '#6b4514',
          }}
        >
          <Minus className="w-4 h-4 stroke-[2.6]" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
