export type BeadColorKey = string;

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

export interface HintSuggestion {
  colIndex: number;
  reason: string;
}

export interface LevelJsonDefinition {
  name?: string;
  palette?: Record<string, string | Partial<BeadColorMeta>> | string[];
  rows?: string[];
  grid?: Array<Array<string | number | null>>;
  matrix?: Array<Array<string | number | null>>;
  map?: Array<Array<string | number | null>>;
  data?: Array<Array<string | number | null>>;
  cells?:
    | Array<Array<string | number | null>>
    | Array<{
        x?: number;
        y?: number;
        row?: number;
        col?: number;
        color?: string;
        colorId?: string | number;
        c?: string | number;
      }>;
  pixels?:
    | Array<Array<string | number | null>>
    | Array<{
        x?: number;
        y?: number;
        row?: number;
        col?: number;
        color?: string;
        colorId?: string | number;
      }>;
  layoutSize?: { x: number; y: number };
  layout?: Array<{
    pos?: { x: number; y: number };
    x?: number;
    y?: number;
    tile?: string | number;
    block?: string | number;
    color?: string | number;
  }>;
  flipY?: boolean;
  mysteryMode?: 'smart' | 'strip_bg' | 'none';
  width?: number;
  height?: number;
  deck?: Array<Array<{ color: string; ammo: number }>>;
  victoryImage?: string;
}

// Known Jewel Bloom official numeric tile color IDs + vivid defaults for 1..36
export const JEWEL_BLOOM_TILE_COLORS: Record<string, string> = {
  '1': '#e11d48',
  '2': '#8fad05',
  '3': '#00702d',
  '4': '#2563eb',
  '5': '#f59e0b',
  '6': '#9333ea',
  '7': '#06b6d4',
  '8': '#ec4899',
  '9': '#7c2d12',
  '10': '#334155',
  '11': '#ef4444',
  '12': '#22c55e',
  '13': '#3b82f6',
  '14': '#eab308',
  '15': '#a855f7',
  '16': '#1e2938',
  '17': '#f97316',
  '18': '#f89d9f',
  '19': '#8c442a',
  '20': '#e76108',
  '21': '#14b8a6',
  '22': '#6366f1',
  '23': '#f5a817',
  '24': '#f8e42e',
  '25': '#f1eba5',
  '26': '#26303d',
  '27': '#4ade80',
  '28': '#1877e8',
  '29': '#eb9108',
  '30': '#f0eadc',
  '31': '#64748b',
  '32': '#c92327',
};

export interface LevelRuntime {
  id: string;
  name: string;
  rows: number;
  cols: number;
  gridColors: Array<Array<BeadColorKey | null>>;
  palette: Record<BeadColorKey, BeadColorMeta>;
  colorKeys: BeadColorKey[];
  colorTotals: Record<BeadColorKey, number>;
  totalBeads: number;
  deckSpec: Array<Array<{ color: BeadColorKey; ammo: number }>>;
  victoryImage?: string;
  mysteryMode?: 'smart' | 'strip_bg' | 'none';
}

const SYMBOLS = ['◆', '○', '★', '■', '♥', '●', '▲', '✦', '❖', '⬟'];

const CARDINAL_DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16) || 0,
      parseInt(clean[1] + clean[1], 16) || 0,
      parseInt(clean[2] + clean[2], 16) || 0,
    ];
  }
  if (clean.length >= 6) {
    return [
      parseInt(clean.slice(0, 2), 16) || 0,
      parseInt(clean.slice(2, 4), 16) || 0,
      parseInt(clean.slice(4, 6), 16) || 0,
    ];
  }
  return [128, 128, 128];
}

function toHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => clampByte(v).toString(16).padStart(2, '0'))
      .join('')
  );
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function luminance(rgb: [number, number, number]): number {
  return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
}

export function deriveBeadColorMeta(
  key: BeadColorKey,
  hexOrPartial: string | Partial<BeadColorMeta>,
  index = 0
): BeadColorMeta {
  const partial: Partial<BeadColorMeta> =
    typeof hexOrPartial === 'string' ? { base: hexOrPartial } : hexOrPartial;

  const baseHex = partial.base && /^#[0-9a-fA-F]{3,6}$/.test(partial.base.trim())
    ? partial.base.trim()
    : '#64748b';
  const rgb = parseHex(baseHex);
  const lum = luminance(rgb);

  const lightRgb = mixRgb(rgb, [255, 255, 255], lum > 0.7 ? 0.55 : 0.28);
  const darkRgb = mixRgb(rgb, [12, 16, 24], 0.38);
  const glowRgb = mixRgb(rgb, [255, 255, 255], 0.12);

  // Soft pastel-muted socket colors so unfilled open sockets clearly contrast against snapped gems
  const socketBaseRgb = mixRgb(rgb, [242, 236, 226], 0.52);
  const socketLightRgb = mixRgb(socketBaseRgb, [255, 255, 255], 0.26);
  const socketHoleRgb = mixRgb(socketBaseRgb, [30, 32, 42], 0.16);

  const orbHiRgb = mixRgb(rgb, [255, 255, 255], 0.36);
  const orbMidRgb = mixRgb(rgb, [255, 255, 255], 0.04);
  const orbLoRgb = mixRgb(rgb, [10, 12, 18], 0.36);

  const isLightOrb = lum > 0.58;
  const orbText = partial.orbText || (isLightOrb ? '#1e293b' : '#ffffff');
  const orbStroke =
    partial.orbStroke ||
    (isLightOrb
      ? toHex(...mixRgb(rgb, [255, 255, 255], 0.72))
      : toHex(...mixRgb(rgb, [0, 0, 0], 0.52)));

  return {
    key,
    name: partial.name || `Color ${key}`,
    zhName: partial.zhName || `颜色 ${key}`,
    base: baseHex,
    light: partial.light || toHex(...lightRgb),
    dark: partial.dark || toHex(...darkRgb),
    centerGlow: partial.centerGlow || toHex(...glowRgb),
    socketBase: partial.socketBase || toHex(...socketBaseRgb),
    socketLight: partial.socketLight || toHex(...socketLightRgb),
    socketHole: partial.socketHole || toHex(...socketHoleRgb),
    orbGradient:
      partial.orbGradient ||
      `radial-gradient(circle at 34% 28%, ${toHex(...orbHiRgb)} 0%, ${toHex(...orbMidRgb)} 60%, ${toHex(...orbLoRgb)} 100%)`,
    orbText,
    orbStroke,
    symbol: partial.symbol || SYMBOLS[index % SYMBOLS.length],
  };
}

function isEmptyToken(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'number') return v <= 0 || Number.isNaN(v);
  if (typeof v === 'string') {
    const t = v.trim();
    return t === '' || t === '.' || t === '_' || t === '0' || t === 'null' || t === 'none';
  }
  return false;
}

function isHexColorString(s: string): boolean {
  return /^#[0-9a-fA-F]{3,6}$/.test(s.trim());
}

/**
 * Universal JSON parser for Jewel Bloom playable templates.
 * Supports:
 * 1) { rows: ["..KK..", ...], palette: { K: "#1e2938", ... } }
 * 2) { grid/matrix/cells/map/data/pixels: [[0,1,2], ...], palette: ["#...", ...] | { "1": "#..." } }
 * 3) { grid: [["#ff0000", null], ...] } (inline hex strings)
 * 4) { width, height, cells/pixels: [{ x/col, y/row, color/colorId }, ...], palette? }
 */
export function parseLevelJson(raw: unknown): LevelRuntime {
  if (!raw || typeof raw !== 'object') {
    throw new Error('JSON 格式无效：根节点必须是对象。');
  }

  const obj = raw as LevelJsonDefinition;
  const name = typeof obj.name === 'string' && obj.name.trim() ? obj.name.trim() : 'Custom Pattern';

  // Normalize palette lookup map
  const paletteInput: Record<string, string | Partial<BeadColorMeta>> = {};
  if (Array.isArray(obj.palette)) {
    obj.palette.forEach((hex, idx) => {
      if (typeof hex === 'string' && isHexColorString(hex)) {
        // Support both 0-based and 1-based indexing gracefully when grid uses 1..N
        paletteInput[String(idx + 1)] = hex;
        paletteInput[`C${idx + 1}`] = hex;
      }
    });
  } else if (obj.palette && typeof obj.palette === 'object') {
    for (const [k, v] of Object.entries(obj.palette)) {
      if (typeof v === 'string' || (v && typeof v === 'object')) {
        paletteInput[k] = v;
      }
    }
  }

  let rawGrid: Array<Array<BeadColorKey | null>> = [];
  const hexToAutoKey = new Map<string, string>();
  let autoKeyCounter = 1;

  const resolveCellToken = (token: unknown): BeadColorKey | null => {
    if (isEmptyToken(token)) return null;
    const str = String(token).trim();

    if (isHexColorString(str)) {
      const normHex = str.toLowerCase();
      let key = hexToAutoKey.get(normHex);
      if (!key) {
        key = `C${autoKeyCounter++}`;
        hexToAutoKey.set(normHex, key);
        paletteInput[key] = normHex;
      }
      return key;
    }

    // If palette is an array and grid uses 1-based numeric tokens, map directly
    if (paletteInput[str]) return str;
    if (typeof token === 'number' && Array.isArray(obj.palette)) {
      const idx = token - 1;
      if (idx >= 0 && idx < obj.palette.length) {
        return String(token);
      }
    }
    return str;
  };

  // Format 1: string rows
  if (Array.isArray(obj.rows) && obj.rows.length > 0 && typeof obj.rows[0] === 'string') {
    const maxLen = Math.max(...obj.rows.map((r) => r.length));
    rawGrid = obj.rows.map((rowStr) => {
      const padded = rowStr.padEnd(maxLen, '.');
      return Array.from(padded).map((ch) => resolveCellToken(ch));
    });
  } else if (Array.isArray(obj.layout) && obj.layout.length > 0) {
    // Format 1B: Official Jewel Bloom level JSON ({ layoutSize: {x,y}, layout: [{ pos: {x,y}, tile, block }] })
    let maxR = typeof obj.layoutSize?.y === 'number' ? obj.layoutSize.y - 1 : 0;
    let maxC = typeof obj.layoutSize?.x === 'number' ? obj.layoutSize.x - 1 : 0;
    for (const item of obj.layout) {
      const r = item.pos?.y ?? item.y ?? 0;
      const c = item.pos?.x ?? item.x ?? 0;
      if (r > maxR) maxR = r;
      if (c > maxC) maxC = c;
    }
    rawGrid = Array.from({ length: maxR + 1 }, () =>
      Array.from({ length: maxC + 1 }, () => null)
    );
    for (const item of obj.layout) {
      const r = item.pos?.y ?? item.y;
      const c = item.pos?.x ?? item.x;
      if (typeof r !== 'number' || typeof c !== 'number' || r < 0 || c < 0) continue;
      rawGrid[r][c] = resolveCellToken(item.tile ?? item.color ?? item.block);
    }
  } else {
    // Format 2: 2D array under grid / matrix / map / data / cells / pixels
    const matrixCandidate =
      obj.grid || obj.matrix || obj.map || obj.data || obj.cells || obj.pixels;

    if (Array.isArray(matrixCandidate) && matrixCandidate.length > 0 && Array.isArray(matrixCandidate[0])) {
      const mat = matrixCandidate as Array<Array<string | number | null>>;
      const maxCols = Math.max(...mat.map((r) => (Array.isArray(r) ? r.length : 0)));
      rawGrid = mat.map((row) => {
        const out: Array<BeadColorKey | null> = [];
        for (let c = 0; c < maxCols; c++) {
          out.push(resolveCellToken(row[c]));
        }
        return out;
      });
    } else if (
      Array.isArray(matrixCandidate) &&
      matrixCandidate.length > 0 &&
      typeof matrixCandidate[0] === 'object' &&
      matrixCandidate[0] !== null
    ) {
      // Format 3: flat list of { x/col, y/row, color/colorId }
      const list = matrixCandidate as Array<{
        x?: number;
        y?: number;
        row?: number;
        col?: number;
        color?: string;
        colorId?: string | number;
        c?: string | number;
      }>;
      let maxR = typeof obj.height === 'number' ? obj.height - 1 : 0;
      let maxC = typeof obj.width === 'number' ? obj.width - 1 : 0;
      for (const item of list) {
        const r = item.row ?? item.y ?? 0;
        const c = item.col ?? item.x ?? 0;
        if (r > maxR) maxR = r;
        if (c > maxC) maxC = c;
      }
      rawGrid = Array.from({ length: maxR + 1 }, () =>
        Array.from({ length: maxC + 1 }, () => null)
      );
      for (const item of list) {
        const r = item.row ?? item.y;
        const c = item.col ?? item.x;
        if (typeof r !== 'number' || typeof c !== 'number' || r < 0 || c < 0) continue;
        rawGrid[r][c] = resolveCellToken(item.color ?? item.colorId ?? item.c);
      }
    } else {
      throw new Error(
        '无法识别图案数据：请提供 rows（字符数组）、grid/matrix（二维数组）或 cells（坐标列表）。'
      );
    }
  }

  // Trim excess empty outer rows & cols so uploaded patterns fill the canvas nicely
  let minR = rawGrid.length;
  let maxR = -1;
  let minC = rawGrid[0]?.length ?? 0;
  let maxC = -1;
  for (let r = 0; r < rawGrid.length; r++) {
    for (let c = 0; c < rawGrid[r].length; c++) {
      if (rawGrid[r][c] !== null) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }

  if (maxR < minR || maxC < minC) {
    throw new Error('上传的图案 JSON 中没有任何有效拼豆像素。');
  }

  let gridColors = rawGrid
    .slice(minR, maxR + 1)
    .map((row) => row.slice(minC, maxC + 1));
  if (obj.flipY) {
    gridColors = gridColors.reverse();
  }

  const mysteryMode: 'smart' | 'strip_bg' | 'none' =
    obj.mysteryMode === 'none' || obj.mysteryMode === 'strip_bg' ? obj.mysteryMode : 'smart';

  // Optional: strip outer connected solid background so full-rectangle JSON becomes a clean silhouette
  if (mysteryMode === 'strip_bg') {
    const bgMask = detectOuterBackgroundMask(gridColors);
    let strippedCount = 0;
    for (let r = 0; r < gridColors.length; r++) {
      for (let c = 0; c < gridColors[r].length; c++) {
        if (bgMask[r][c]) {
          gridColors[r][c] = null;
          strippedCount++;
        }
      }
    }
    // Re-trim empty outer margins after stripping background
    if (strippedCount > 0) {
      let nMinR = gridColors.length, nMaxR = -1, nMinC = gridColors[0].length, nMaxC = -1;
      for (let r = 0; r < gridColors.length; r++) {
        for (let c = 0; c < gridColors[r].length; c++) {
          if (gridColors[r][c] !== null) {
            if (r < nMinR) nMinR = r;
            if (r > nMaxR) nMaxR = r;
            if (c < nMinC) nMinC = c;
            if (c > nMaxC) nMaxC = c;
          }
        }
      }
      if (nMaxR >= nMinR && nMaxC >= nMinC) {
        gridColors = gridColors
          .slice(nMinR, nMaxR + 1)
          .map((row) => row.slice(nMinC, nMaxC + 1));
      }
    }
  }

  const rows = gridColors.length;
  const cols = gridColors[0].length;

  // Count beads per color & collect active color keys
  const colorTotals: Record<BeadColorKey, number> = {};
  let totalBeads = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = gridColors[r][c];
      if (!k) continue;
      colorTotals[k] = (colorTotals[k] || 0) + 1;
      totalBeads++;
    }
  }

  const colorKeys = Object.keys(colorTotals);
  if (colorKeys.length === 0 || totalBeads < 10) {
    throw new Error('图案像素数量过少（至少需要 10 颗豆子）。');
  }

  // Fallback vivid palette if a JSON key wasn't defined in palette
  const fallbackHexes = [
    '#1e2938',
    '#e4d7be',
    '#eb9108',
    '#c92327',
    '#ef868a',
    '#2563eb',
    '#16a34a',
    '#9333ea',
    '#0ea5e9',
    '#7b2e20',
  ];

  const palette: Record<BeadColorKey, BeadColorMeta> = {};
  colorKeys.forEach((k, idx) => {
    const entry =
      paletteInput[k] ||
      JEWEL_BLOOM_TILE_COLORS[k] ||
      fallbackHexes[idx % fallbackHexes.length];
    palette[k] = deriveBeadColorMeta(k, entry, idx);
  });

  // Build base runtime first so we can auto-generate a guaranteed-solvable deck
  const baseRuntime: LevelRuntime = {
    id: `lvl-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${rows}x${cols}-${totalBeads}`,
    name,
    rows,
    cols,
    gridColors,
    palette,
    colorKeys,
    colorTotals,
    totalBeads,
    deckSpec: [[], [], [], []],
    victoryImage: typeof obj.victoryImage === 'string' ? obj.victoryImage : undefined,
    mysteryMode,
  };

  if (Array.isArray(obj.deck) && obj.deck.length === 4) {
    baseRuntime.deckSpec = obj.deck;
  } else {
    baseRuntime.deckSpec = generateAutoDeckSpec(baseRuntime);
  }

  return baseRuntime;
}

export function createInitialGridState(level: LevelRuntime): CellState[][] {
  return level.gridColors.map((row) =>
    row.map((cell) => (cell === null ? 'EMPTY' : 'UNFILLED'))
  );
}

/**
 * Detects an outer solid-color background region on full-rectangle pixel art
 * (e.g. Jewel Bloom official JSONs where every cell in the rectangle has a tile ID).
 * Flood-fills from the outer border using the dominant border color if it occupies
 * >= 35% of perimeter cells.
 */
function detectOuterBackgroundMask(
  gridColors: Array<Array<BeadColorKey | null>>
): boolean[][] {
  const rows = gridColors.length;
  const cols = gridColors[0]?.length ?? 0;
  const mask: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => false)
  );
  if (rows < 4 || cols < 4) return mask;

  const borderCounts: Record<string, number> = {};
  let borderTotal = 0;
  let borderFilled = 0;
  const sample = (r: number, c: number) => {
    borderTotal++;
    const k = gridColors[r][c];
    if (k !== null) {
      borderFilled++;
      borderCounts[k] = (borderCounts[k] || 0) + 1;
    }
  };
  for (let c = 0; c < cols; c++) {
    sample(0, c);
    sample(rows - 1, c);
  }
  for (let r = 1; r < rows - 1; r++) {
    sample(r, 0);
    sample(r, cols - 1);
  }

  // Only treat as full-rectangle background if >= 80% of border cells are filled
  if (borderFilled / Math.max(1, borderTotal) < 0.8) return mask;

  let bgKey: string | null = null;
  let bgCount = 0;
  for (const [k, cnt] of Object.entries(borderCounts)) {
    if (cnt > bgCount) {
      bgCount = cnt;
      bgKey = k;
    }
  }
  if (!bgKey || bgCount / borderFilled < 0.35) return mask;

  // Flood-fill from all border cells matching bgKey
  const q: Array<[number, number]> = [];
  const tryPush = (r: number, c: number) => {
    if (
      r >= 0 &&
      r < rows &&
      c >= 0 &&
      c < cols &&
      !mask[r][c] &&
      gridColors[r][c] === bgKey
    ) {
      mask[r][c] = true;
      q.push([r, c]);
    }
  };
  for (let c = 0; c < cols; c++) {
    tryPush(0, c);
    tryPush(rows - 1, c);
  }
  for (let r = 1; r < rows - 1; r++) {
    tryPush(r, 0);
    tryPush(r, cols - 1);
  }
  let head = 0;
  while (head < q.length) {
    const [r, c] = q[head++];
    for (const [dr, dc] of CARDINAL_DIRS) {
      tryPush(r + dr, c + dc);
    }
  }

  return mask;
}

/**
 * High-tension "?" mystery reveal mask:
 * - Only exposes the thin 1-cell outer perimeter ring (leaving ~82-90% covered by "?")
 *   so players must strategically peel inward and manage their 4 buffer slots carefully!
 * - If mysteryMode === 'none', reveals everything.
 */
export function createInitialRevealedState(level: LevelRuntime): boolean[][] {
  const { rows, cols, gridColors, mysteryMode } = level;
  const revealed: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => false)
  );

  const isFilled = (r: number, c: number) =>
    r >= 0 && r < rows && c >= 0 && c < cols && gridColors[r][c] !== null;

  if (mysteryMode === 'none') {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (isFilled(r, c)) revealed[r][c] = true;
      }
    }
    return revealed;
  }

  // Only reveal the 1-cell outer boundary ring (cells touching empty space or board edge)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!isFilled(r, c)) continue;
      const touchesEdgeOrEmpty = CARDINAL_DIRS.some(
        ([dr, dc]) => !isFilled(r + dr, c + dc)
      );
      if (touchesEdgeOrEmpty) {
        revealed[r][c] = true;
      }
    }
  }

  return revealed;
}

export function isCellExposed(
  level: LevelRuntime,
  grid: CellState[][],
  row: number,
  col: number,
  revealed?: boolean[][]
): boolean {
  if (row < 0 || row >= level.rows || col < 0 || col >= level.cols) return false;
  if (grid[row]?.[col] !== 'UNFILLED') return false;
  if (revealed && !revealed[row]?.[col]) return false;
  for (const [dr, dc] of CARDINAL_DIRS) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= level.rows || nc < 0 || nc >= level.cols) return true;
    const neighbor = grid[nr][nc];
    if (neighbor === 'EMPTY' || neighbor === 'COLORED') return true;
  }
  return false;
}

export function pickTargetCellForSlotForLevel(
  level: LevelRuntime,
  grid: CellState[][],
  color: BeadColorKey,
  slotIndex: number,
  totalSlots: number,
  revealed?: boolean[][]
): { row: number; col: number } | null {
  const candidates: Array<{ row: number; col: number; score: number }> = [];
  const laneRatio = (slotIndex + 0.5) / Math.max(1, totalSlots);
  const slotTargetCol = laneRatio * level.cols;

  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      if (level.gridColors[r][c] === color && isCellExposed(level, grid, r, c, revealed)) {
        const score = r * 2.5 + Math.abs(c - slotTargetCol) * 0.25;
        candidates.push({ row: r, col: c, score });
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.score - b.score);
  return { row: candidates[0].row, col: candidates[0].col };
}

export function getExposedCellsByColor(
  level: LevelRuntime,
  grid: CellState[][],
  revealed?: boolean[][]
): Record<BeadColorKey, Array<{ row: number; col: number }>> {
  const result: Record<BeadColorKey, Array<{ row: number; col: number }>> = {};
  for (const key of level.colorKeys) {
    result[key] = [];
  }
  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      if (isCellExposed(level, grid, r, c, revealed)) {
        const color = level.gridColors[r][c];
        if (color && result[color]) {
          result[color].push({ row: r, col: c });
        }
      }
    }
  }
  return result;
}

export function floodRevealPatch(
  level: LevelRuntime,
  revealed: boolean[][],
  startRow: number,
  startCol: number,
  maxCells = 6,
  maxDepth = 2
): Array<{ row: number; col: number }> {
  if (
    startRow < 0 ||
    startRow >= level.rows ||
    startCol < 0 ||
    startCol >= level.cols ||
    level.gridColors[startRow][startCol] === null ||
    revealed[startRow][startCol]
  ) {
    return [];
  }

  const targetColor = level.gridColors[startRow][startCol];
  const newlyRevealed: Array<{ row: number; col: number }> = [];
  const queue: Array<[number, number, number]> = [[startRow, startCol, 0]];
  revealed[startRow][startCol] = true;
  newlyRevealed.push({ row: startRow, col: startCol });

  let head = 0;
  while (head < queue.length && newlyRevealed.length < maxCells) {
    const [r, c, depth] = queue[head++];
    if (depth >= maxDepth) continue;
    for (const [dr, dc] of CARDINAL_DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 &&
        nr < level.rows &&
        nc >= 0 &&
        nc < level.cols &&
        !revealed[nr][nc] &&
        level.gridColors[nr][nc] === targetColor
      ) {
        revealed[nr][nc] = true;
        newlyRevealed.push({ row: nr, col: nc });
        queue.push([nr, nc, depth + 1]);
        if (newlyRevealed.length >= maxCells) break;
      }
    }
  }

  return newlyRevealed;
}

export function isDeckSolvable(level: LevelRuntime, columns: EmitterItem[][]): boolean {
  const simGrid = createInitialGridState(level);
  const simRevealed = createInitialRevealedState(level);
  const simCols = columns.map((c) => c.map((e) => ({ ...e })));
  const buf: Array<{ color: BeadColorKey; ammo: number }> = [];

  const fireSim = () => {
    let progress = true;
    while (progress) {
      progress = false;
      for (let i = 0; i < buf.length; i++) {
        const item = buf[i];
        const exposed = getExposedCellsByColor(level, simGrid, simRevealed)[item.color] || [];
        if (exposed.length > 0 && item.ammo > 0) {
          const target = exposed[0];
          simGrid[target.row][target.col] = 'COLORED';
          for (const [dr, dc] of CARDINAL_DIRS) {
            const nr = target.row + dr;
            const nc = target.col + dc;
            if (
              nr >= 0 &&
              nr < level.rows &&
              nc >= 0 &&
              nc < level.cols &&
              simGrid[nr][nc] !== 'EMPTY' &&
              !simRevealed[nr][nc]
            ) {
              floodRevealPatch(level, simRevealed, nr, nc, 6, 2);
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
    const exposed = getExposedCellsByColor(level, simGrid, simRevealed);
    let chosenCol = -1;
    let bestExposed = -1;
    for (let ci = 0; ci < simCols.length; ci++) {
      const front = simCols[ci][0];
      if (front && (exposed[front.color]?.length ?? 0) > bestExposed) {
        bestExposed = exposed[front.color]?.length ?? 0;
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

/**
 * Splits a level's exact color totals into balanced 4-column launchers and searches
 * for a 100% solvable ordering where initial exposed colors appear in row 0.
 */
function generateAutoDeckSpec(
  level: LevelRuntime
): Array<Array<{ color: BeadColorKey; ammo: number }>> {
  const idealChunk = Math.max(12, Math.min(44, Math.round(level.totalBeads / 18)));
  const flat: Array<{ color: BeadColorKey; ammo: number }> = [];

  for (const color of level.colorKeys) {
    let remaining = level.colorTotals[color];
    if (remaining <= 0) continue;
    const chunks = Math.max(1, Math.round(remaining / idealChunk));
    const baseAmmo = Math.floor(remaining / chunks);
    let extra = remaining - baseAmmo * chunks;
    for (let i = 0; i < chunks; i++) {
      const ammo = baseAmmo + (extra > 0 ? 1 : 0);
      if (extra > 0) extra--;
      if (ammo > 0) {
        flat.push({ color, ammo });
      }
    }
  }

  // Determine which colors are exposed at the very start
  const initGrid = createInitialGridState(level);
  const initRev = createInitialRevealedState(level);
  const initExposed = getExposedCellsByColor(level, initGrid, initRev);
  const exposedRanked = [...level.colorKeys].sort(
    (a, b) => (initExposed[b]?.length ?? 0) - (initExposed[a]?.length ?? 0)
  );
  const topExposedSet = new Set(
    exposedRanked.filter((k) => (initExposed[k]?.length ?? 0) > 0).slice(0, 4)
  );

  // Deterministic PRNG so the same JSON always produces a consistent layout
  let seed = level.totalBeads * 2654435761 + level.rows * 97 + level.cols * 31;
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  const maxAttempts = level.totalBeads > 750 ? 45 : 160;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const copy = [...flat];
    // Sort exposed colors toward front on early attempts, shuffle freely on later attempts
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    // Put at least 2 initially-exposed colors in the front row
    const frontExposedCount = copy.slice(0, 4).filter((e) => topExposedSet.has(e.color)).length;
    if (frontExposedCount < Math.min(2, topExposedSet.size)) continue;

    const spec: Array<Array<{ color: BeadColorKey; ammo: number }>> = [[], [], [], []];
    const cols: EmitterItem[][] = [[], [], [], []];
    for (let i = 0; i < copy.length; i++) {
      const ci = i % 4;
      const ri = Math.floor(i / 4);
      spec[ci].push(copy[i]);
      cols[ci].push({
        id: `em-auto-${ci}-${ri}-${copy[i].color}`,
        color: copy[i].color,
        ammo: copy[i].ammo,
        maxAmmo: copy[i].ammo,
      });
    }

    if (isDeckSolvable(level, cols)) {
      return spec;
    }
  }

  // Guaranteed fallback: sort by initial exposure descending and deal round-robin
  const sorted = [...flat].sort(
    (a, b) => (initExposed[b.color]?.length ?? 0) - (initExposed[a.color]?.length ?? 0)
  );
  const fallbackSpec: Array<Array<{ color: BeadColorKey; ammo: number }>> = [[], [], [], []];
  sorted.forEach((item, i) => {
    fallbackSpec[i % 4].push(item);
  });
  return fallbackSpec;
}

export function buildColumnsFromLevel(level: LevelRuntime, shuffle = false): EmitterItem[][] {
  if (!shuffle) {
    return level.deckSpec.map((col, colIdx) =>
      col.map((item, rowIdx) => ({
        id: `em-${colIdx}-${rowIdx}-${item.color}`,
        color: item.color,
        ammo: item.ammo,
        maxAmmo: item.ammo,
      }))
    );
  }

  const flat = level.deckSpec.flat();
  const initGrid = createInitialGridState(level);
  const initRev = createInitialRevealedState(level);
  const initExposed = getExposedCellsByColor(level, initGrid, initRev);
  const topColor = [...level.colorKeys].sort(
    (a, b) => (initExposed[b]?.length ?? 0) - (initExposed[a]?.length ?? 0)
  )[0];

  for (let attempt = 0; attempt < 120; attempt++) {
    const copy = [...flat];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    if (topColor && !copy.slice(0, 4).some((e) => e.color === topColor)) continue;

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
    if (isDeckSolvable(level, cols)) {
      return cols;
    }
  }
  return buildColumnsFromLevel(level, false);
}

export function findBestHintForLevel(
  level: LevelRuntime,
  grid: CellState[][],
  columns: EmitterItem[][],
  slots: BufferSlot[],
  revealed?: boolean[][]
): HintSuggestion | null {
  const exposed = getExposedCellsByColor(level, grid, revealed);
  const waitingColors = new Set(
    slots.filter((s) => s.emitter && s.emitter.ammo > 0).map((s) => s.emitter!.color)
  );

  let bestCol = -1;
  let bestScore = -1;
  for (let ci = 0; ci < columns.length; ci++) {
    const front = columns[ci][0];
    if (!front) continue;
    const exposedCount = exposed[front.color]?.length ?? 0;
    if (exposedCount > 0) {
      let score = Math.min(exposedCount, front.ammo) * 2;
      const nextItem = columns[ci][1];
      if (nextItem && waitingColors.has(nextItem.color)) score += 12;
      if (nextItem && (exposed[nextItem.color]?.length ?? 0) > 0) score += 6;
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
      reason: `Deploy ${level.palette[picked.color]?.name ?? picked.color} (${picked.ammo})`,
    };
  }

  for (let ci = 0; ci < columns.length; ci++) {
    if (columns[ci].length > 1) {
      const next = columns[ci][1];
      if ((exposed[next.color]?.length ?? 0) > 0) {
        return {
          colIndex: ci,
          reason: `Clear column ${ci + 1}`,
        };
      }
    }
  }

  const firstCol = columns.findIndex((c) => c.length > 0);
  if (firstCol !== -1) {
    return {
      colIndex: firstCol,
      reason: `Load column ${firstCol + 1}`,
    };
  }

  return null;
}

/**
 * Generates an example level JSON object from any LevelRuntime so users can
 * download it as a clean reference schema for creating their own JSON patterns.
 */
export function exportLevelToJson(level: LevelRuntime): LevelJsonDefinition {
  const palette: Record<string, string> = {};
  for (const k of level.colorKeys) {
    palette[k] = level.palette[k].base;
  }
  const rows = level.gridColors.map((row) =>
    row.map((cell) => (cell === null ? '.' : cell)).join('')
  );
  return {
    name: level.name,
    palette,
    rows,
  };
}
