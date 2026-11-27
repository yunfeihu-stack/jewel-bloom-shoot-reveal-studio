export type BeadColorKey = 'K' | 'W' | 'Y' | 'B' | 'P' | 'R';

export type CellState = 'EMPTY' | 'UNFILLED' | 'INCOMING' | 'COLORED';

export interface BeadColorMeta {
  key: BeadColorKey;
  name: string;
  zhName: string;
  base: string;
  light: string;
  dark: string;
  centerGlow: string;
  socketBase: string;
  socketLight: string;
  socketHole: string;
  orbGradient: string;
  orbText: string;
  orbStroke: string;
  symbol: string;
}

export const BEAD_PALETTE: Record<BeadColorKey, BeadColorMeta> = {
  K: {
    key: 'K',
    name: 'Charcoal',
    zhName: '炭黑轮廓',
    base: '#1e2938',
    light: '#37485e',
    dark: '#0f1620',
    centerGlow: '#29384c',
    socketBase: '#727e8e',
    socketLight: '#8a95a5',
    socketHole: '#556171',
    orbGradient: 'radial-gradient(circle at 34% 28%, #546880 0%, #233040 60%, #101720 100%)',
    orbText: '#f8fafc',
    orbStroke: '#0b1017',
    symbol: '◆',
  },
  W: {
    key: 'W',
    name: 'Cream',
    zhName: '奶白绒毛',
    base: '#e4d7be',
    light: '#fcf8ef',
    dark: '#b7a688',
    centerGlow: '#efe4cf',
    socketBase: '#ede6d9',
    socketLight: '#f6f2ea',
    socketHole: '#d7cebe',
    orbGradient: 'radial-gradient(circle at 34% 28%, #ffffff 0%, #e6dcc9 62%, #b5a78e 100%)',
    orbText: '#1e293b',
    orbStroke: '#ffffff',
    symbol: '○',
  },
  Y: {
    key: 'Y',
    name: 'Amber',
    zhName: '金黄毛色',
    base: '#eb9108',
    light: '#ffc44d',
    dark: '#a85a00',
    centerGlow: '#f9a828',
    socketBase: '#f0c47a',
    socketLight: '#f7d69a',
    socketHole: '#d9a85a',
    orbGradient: 'radial-gradient(circle at 34% 28%, #ffd370 0%, #f19d19 60%, #a85f02 100%)',
    orbText: '#1f1605',
    orbStroke: '#ffe7ad',
    symbol: '★',
  },
  B: {
    key: 'B',
    name: 'Cocoa',
    zhName: '可可棕',
    base: '#7b2e20',
    light: '#a64b38',
    dark: '#4a170e',
    centerGlow: '#8f3929',
    socketBase: '#b07b70',
    socketLight: '#c49287',
    socketHole: '#915e53',
    orbGradient: 'radial-gradient(circle at 34% 28%, #b85c49 0%, #85392a 60%, #4d1b12 100%)',
    orbText: '#fff7f5',
    orbStroke: '#38120c',
    symbol: '■',
  },
  P: {
    key: 'P',
    name: 'Blush',
    zhName: '粉嫩肉垫',
    base: '#ef868a',
    light: '#ffbfc1',
    dark: '#b85458',
    centerGlow: '#f89ea1',
    socketBase: '#f3c3c4',
    socketLight: '#fad7d8',
    socketHole: '#dea5a7',
    orbGradient: 'radial-gradient(circle at 34% 28%, #ffd1d2 0%, #f59c9e 60%, #bf6063 100%)',
    orbText: '#3b0d12',
    orbStroke: '#ffe5e6',
    symbol: '♥',
  },
  R: {
    key: 'R',
    name: 'Cherry',
    zhName: '樱桃红',
    base: '#c92327',
    light: '#f45457',
    dark: '#870f12',
    centerGlow: '#dc3539',
    socketBase: '#e08284',
    socketLight: '#eda2a4',
    socketHole: '#c36264',
    orbGradient: 'radial-gradient(circle at 34% 28%, #ff6b6e 0%, #d33336 60%, #8a1417 100%)',
    orbText: '#ffffff',
    orbStroke: '#570a0c',
    symbol: '●',
  },
};

export const HAMSTER_ROWS: readonly string[] = [
  '................KK..........',
  '...............K............',
  '..............K.............',
  '............KKKKK...........',
  '...........KRRKRRK..........',
  '..........KRRKKKRRK.........',
  '..........KRWWRRRRK.........',
  '..........KRRRRRRRK.........',
  '....KKK...KRRRRRRRK..KKK....',
  '...KPBBKKKBKRRRRRKBKKBBPK...',
  '...KPPBBBBBBKKKKKBBBBBPPK...',
  '...KPPBBYYYYBBBBBYYYBBPPK...',
  '....KBBYYYYYYYYYYYYYYYBK....',
  '....KBYYWKYYYYYYYYWKYYBK....',
  '...KBBYYKKYYYYYYYYKKYYYBK...',
  '...KBYYYYYYYYYYYYYYYYYYBK...',
  '..KBYYYYYYYYYKYYYYYYYYYYBK..',
  '..KBYYYYYYYYKWKYYYYYYYYYBK..',
  '.KBYYYYYWWWWWWWWWWYYYYYYYBK.',
  '.KBYYYWWWWWWWWWWWWWWWYYYYBK.',
  '.KYYYWWKWWWWWWWWWWWKWWWYYYK.',
  'KYYYWWWKWWWWWWWWWWWKWWWWYYYK',
  'KYYWWWWKWWKWWWWWKWWKWWWWWYYK',
  'KYYWWWWKPPKWWWWWKPPKWWWWWYYK',
  'KYYWWWWWKKWWWWWWWKKWWWWWWYYK',
  '.KYWWWWWWWWWWWWWWWWWWWWWWYK.',
  '.KYWWKKKWWWWWWWWWWWWKKKWWYK.',
  '..KWWKPPKWWWWWWWWWWKPPKWWK..',
  '..KWWKPPPKKWWWWWWWKPPPKWWK..',
  '...KWWKPPPKWWWWWWKPPPKWWK...',
  '....KKKPPPKWWWWWWKPPPKKK....',
  '.......KKKKKKKKKKKKKK.......',
];

export const GRID_ROWS = HAMSTER_ROWS.length; // 32
export const GRID_COLS = HAMSTER_ROWS[0].length; // 28

export const COLOR_TOTALS: Record<BeadColorKey, number> = (() => {
  const counts: Record<BeadColorKey, number> = { K: 0, W: 0, Y: 0, B: 0, P: 0, R: 0 };
  for (const row of HAMSTER_ROWS) {
    for (const ch of row) {
      if (ch !== '.') {
        counts[ch as BeadColorKey]++;
      }
    }
  }
  return counts;
})();

export const TOTAL_BEADS = Object.values(COLOR_TOTALS).reduce((acc, v) => acc + v, 0); // 602

export interface EmitterItem {
  id: string;
  color: BeadColorKey;
  ammo: number;
  maxAmmo: number;
}

export interface BufferSlot {
  slotIndex: number;
  emitter: EmitterItem | null;
  lastFiredAt: number;
  isWaiting: boolean;
}

export const COLOR_ORDER: BeadColorKey[] = ['K', 'Y', 'W', 'B', 'P', 'R'];

const CARDINAL_DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

export function createInitialGridState(): CellState[][] {
  return HAMSTER_ROWS.map((row) =>
    Array.from(row).map((ch) => (ch === '.' ? 'EMPTY' : 'UNFILLED'))
  );
}

/**
 * Initial revealed mask: outer silhouette cells touching empty background are open sockets;
 * all inner cells start hidden behind "?" mystery tiles.
 */
export function createInitialRevealedState(): boolean[][] {
  const revealed = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (HAMSTER_ROWS[r][c] === '.') continue;
      for (const [dr, dc] of CARDINAL_DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= GRID_ROWS || nc < 0 || nc >= GRID_COLS || HAMSTER_ROWS[nr][nc] === '.') {
          revealed[r][c] = true;
          break;
        }
      }
    }
  }
  return revealed;
}

export function getCellColor(row: number, col: number): BeadColorKey | null {
  const ch = HAMSTER_ROWS[row]?.[col];
  if (!ch || ch === '.') return null;
  return ch as BeadColorKey;
}

/**
 * Flood-reveals a connected patch of same-color cells starting from (startRow, startCol)
 * within a Manhattan radius so filling border beads pops open a big satisfying chunk at once.
 */
export function floodRevealPatch(
  revealed: boolean[][],
  startRow: number,
  startCol: number,
  maxCluster = 6,
  maxDist = 2
): Array<{ row: number; col: number; dist: number }> {
  const targetColor = getCellColor(startRow, startCol);
  if (!targetColor) return [];

  const newlyRevealed: Array<{ row: number; col: number; dist: number }> = [];
  const queue: Array<{ r: number; c: number }> = [{ r: startRow, c: startCol }];
  const visited = new Set<string>([`${startRow},${startCol}`]);

  while (queue.length > 0 && newlyRevealed.length < maxCluster) {
    const { r, c } = queue.shift()!;
    const dist = Math.abs(r - startRow) + Math.abs(c - startCol);
    if (!revealed[r][c]) {
      revealed[r][c] = true;
      newlyRevealed.push({ row: r, col: c, dist });
    }
    for (const [dr, dc] of CARDINAL_DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (
        nr >= 0 &&
        nr < GRID_ROWS &&
        nc >= 0 &&
        nc < GRID_COLS &&
        !visited.has(key) &&
        getCellColor(nr, nc) === targetColor &&
        Math.abs(nr - startRow) + Math.abs(nc - startCol) <= maxDist
      ) {
        visited.add(key);
        queue.push({ r: nr, c: nc });
      }
    }
  }

  return newlyRevealed;
}

/**
 * A bead is exposed/targetable if it is currently UNFILLED, revealed (when tracked),
 * and sits on the active outer-inward frontier (adjacent to an EMPTY or COLORED cell).
 * This creates crisp layer-by-layer peeling while revealed "?" tiles provide 1–2 ring lookahead.
 */
export function isCellExposed(
  grid: CellState[][],
  row: number,
  col: number,
  revealed?: boolean[][]
): boolean {
  if (grid[row]?.[col] !== 'UNFILLED') return false;
  if (revealed && !revealed[row]?.[col]) return false;
  for (const [dr, dc] of CARDINAL_DIRS) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= GRID_ROWS || nc < 0 || nc >= GRID_COLS) return true;
    const neighbor = grid[nr][nc];
    if (neighbor === 'EMPTY' || neighbor === 'COLORED') return true;
  }
  return false;
}

export function getExposedCellsByColor(
  grid: CellState[][],
  revealed?: boolean[][]
): Record<BeadColorKey, Array<{ row: number; col: number }>> {
  const result: Record<BeadColorKey, Array<{ row: number; col: number }>> = {
    K: [],
    W: [],
    Y: [],
    B: [],
    P: [],
    R: [],
  };
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (isCellExposed(grid, r, c, revealed)) {
        const color = getCellColor(r, c);
        if (color) {
          result[color].push({ row: r, col: c });
        }
      }
    }
  }
  return result;
}

/**
 * Picks the next target cell using a top-down regional sweep so the iconic red cherry,
 * ears, and cute hamster face bloom in the first 25-35% of play to hook the player,
 * while keeping the lower cream belly & paws sealed for genuine 4-slot tension.
 */
export function pickTargetCellForSlot(
  grid: CellState[][],
  color: BeadColorKey,
  slotIndex: number,
  totalSlots: number,
  revealed?: boolean[][]
): { row: number; col: number } | null {
  const candidates: Array<{ row: number; col: number; score: number }> = [];
  const laneRatio = (slotIndex + 0.5) / Math.max(1, totalSlots);
  const slotTargetCol = laneRatio * GRID_COLS;

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (getCellColor(r, c) === color && isCellExposed(grid, r, c, revealed)) {
        const score = r * 2.5 + Math.abs(c - slotTargetCol) * 0.25;
        candidates.push({ row: r, col: c, score });
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.score - b.score);
  return { row: candidates[0].row, col: candidates[0].col };
}

const DEFAULT_DECK_SPEC: Array<Array<{ color: BeadColorKey; ammo: number }>> = [
  [
    { color: 'W', ammo: 42 },
    { color: 'K', ammo: 25 },
    { color: 'Y', ammo: 26 },
    { color: 'W', ammo: 26 },
    { color: 'K', ammo: 25 },
  ],
  [
    { color: 'K', ammo: 24 },
    { color: 'R', ammo: 32 },
    { color: 'B', ammo: 44 },
    { color: 'Y', ammo: 28 },
    { color: 'W', ammo: 27 },
  ],
  [
    { color: 'P', ammo: 36 },
    { color: 'K', ammo: 26 },
    { color: 'W', ammo: 32 },
    { color: 'Y', ammo: 25 },
    { color: 'K', ammo: 24 },
  ],
  [
    { color: 'Y', ammo: 44 },
    { color: 'W', ammo: 40 },
    { color: 'K', ammo: 25 },
    { color: 'Y', ammo: 25 },
    { color: 'W', ammo: 26 },
  ],
];

export function buildDefaultColumns(): EmitterItem[][] {
  return DEFAULT_DECK_SPEC.map((col, colIdx) =>
    col.map((item, rowIdx) => ({
      id: `em-${colIdx}-${rowIdx}-${item.color}-${item.ammo}`,
      color: item.color,
      ammo: item.ammo,
      maxAmmo: item.ammo,
    }))
  );
}

/**
 * Checks whether a given 5-column arrangement is solvable by greedy simulation
 * with a 5-slot buffer, so randomized replays are always 100% winnable.
 */
function isDeckSolvable(columns: EmitterItem[][]): boolean {
  const simGrid = createInitialGridState();
  const simRevealed = createInitialRevealedState();
  const simCols = columns.map((col) => col.map((x) => ({ ...x })));
  const buf: Array<{ color: BeadColorKey; ammo: number }> = [];

  const fireSim = () => {
    let progress = true;
    while (progress) {
      progress = false;
      for (let i = 0; i < buf.length; i++) {
        const item = buf[i];
        if (item.ammo <= 0) continue;
        const target = pickTargetCellForSlot(simGrid, item.color, i, 4, simRevealed);
        if (target) {
          simGrid[target.row][target.col] = 'COLORED';
          simRevealed[target.row][target.col] = true;
          for (const [dr, dc] of CARDINAL_DIRS) {
            const nr = target.row + dr;
            const nc = target.col + dc;
            if (
              nr >= 0 &&
              nr < GRID_ROWS &&
              nc >= 0 &&
              nc < GRID_COLS &&
              simGrid[nr][nc] !== 'EMPTY' &&
              !simRevealed[nr][nc]
            ) {
              floodRevealPatch(simRevealed, nr, nc, 6, 2);
            }
          }
          item.ammo--;
          progress = true;
          if (item.ammo === 0) {
            buf.splice(i, 1);
          }
          break;
        }
      }
    }
  };

  while (simCols.some((c) => c.length > 0)) {
    const exposed = getExposedCellsByColor(simGrid, simRevealed);
    let chosenCol = -1;
    let bestExposed = -1;
    for (let ci = 0; ci < simCols.length; ci++) {
      const front = simCols[ci][0];
      if (front && exposed[front.color].length > bestExposed) {
        bestExposed = exposed[front.color].length;
        chosenCol = ci;
      }
    }
    if (chosenCol === -1 || buf.length >= 4) return false;
    const picked = simCols[chosenCol].shift()!;
    buf.push({ color: picked.color, ammo: picked.ammo });
    fireSim();
  }

  return buf.length === 0;
}

export function buildShuffledSolvableColumns(): EmitterItem[][] {
  const flat: Array<{ color: BeadColorKey; ammo: number }> = DEFAULT_DECK_SPEC.flat();
  for (let attempt = 0; attempt < 120; attempt++) {
    const copy = [...flat];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    // Ensure at least one K emitter is in the top row for clean opening play
    const topHasK = copy.slice(0, 4).some((e) => e.color === 'K');
    if (!topHasK) continue;

    const cols: EmitterItem[][] = [[], [], [], []];
    for (let i = 0; i < copy.length; i++) {
      const cIdx = i % 4;
      const rIdx = Math.floor(i / 4);
      const item = copy[i];
      cols[cIdx].push({
        id: `em-shuf-${attempt}-${cIdx}-${rIdx}-${item.color}`,
        color: item.color,
        ammo: item.ammo,
        maxAmmo: item.ammo,
      });
    }
    if (isDeckSolvable(cols)) {
      return cols;
    }
  }
  return buildDefaultColumns();
}

export interface HintSuggestion {
  colIndex: number;
  reason: string;
}

export function findBestHint(
  grid: CellState[][],
  columns: EmitterItem[][],
  slots: BufferSlot[],
  revealed?: boolean[][]
): HintSuggestion | null {
  const exposed = getExposedCellsByColor(grid, revealed);
  const waitingColors = new Set(
    slots.filter((s) => s.emitter && s.emitter.ammo > 0).map((s) => s.emitter!.color)
  );

  // Priority 1: Pick a front emitter whose color currently has exposed beads
  let bestCol = -1;
  let bestScore = -1;
  for (let ci = 0; ci < columns.length; ci++) {
    const front = columns[ci][0];
    if (!front) continue;
    const exposedCount = exposed[front.color].length;
    if (exposedCount > 0) {
      let score = Math.min(exposedCount, front.ammo) * 2;
      // Bonus if the emitter behind it matches a waiting slot or is also currently exposed
      const nextItem = columns[ci][1];
      if (nextItem && waitingColors.has(nextItem.color)) score += 12;
      if (nextItem && exposed[nextItem.color].length > 0) score += 6;
      if (score > bestScore) {
        bestScore = score;
        bestCol = ci;
      }
    }
  }

  if (bestCol !== -1) {
    const picked = columns[bestCol][0];
    return {
      colIndex: bestCol,
      reason: `Deploy ${BEAD_PALETTE[picked.color].name} (${picked.ammo}) to peel ${exposed[picked.color].length} exposed beads.`,
    };
  }

  // Priority 2: Pick a non-empty column that exposes a currently needed color underneath
  for (let ci = 0; ci < columns.length; ci++) {
    if (columns[ci].length > 1) {
      const next = columns[ci][1];
      if (exposed[next.color].length > 0) {
        return {
          colIndex: ci,
          reason: `Clear column ${ci + 1} to uncover ${BEAD_PALETTE[next.color].name} underneath.`,
        };
      }
    }
  }

  // Fallback: any non-empty column
  const firstCol = columns.findIndex((c) => c.length > 0);
  if (firstCol !== -1) {
    return {
      colIndex: firstCol,
      reason: `Load column ${firstCol + 1} into the turret dock.`,
    };
  }

  return null;
}

import type { LevelRuntime } from './levelTemplate';

export const DEFAULT_HAMSTER_LEVEL: LevelRuntime = {
  id: 'default-cherry-hamster',
  name: 'Cherry Hamster',
  rows: GRID_ROWS,
  cols: GRID_COLS,
  gridColors: HAMSTER_ROWS.map((row) =>
    Array.from(row).map((ch) => (ch === '.' ? null : ch))
  ),
  palette: BEAD_PALETTE,
  colorKeys: ['K', 'W', 'Y', 'B', 'P', 'R'],
  colorTotals: COLOR_TOTALS,
  totalBeads: TOTAL_BEADS,
  deckSpec: DEFAULT_DECK_SPEC,
  victoryImage: '/assets/aistudio/level_200220_hamster_f3b8ee93.png',
};
