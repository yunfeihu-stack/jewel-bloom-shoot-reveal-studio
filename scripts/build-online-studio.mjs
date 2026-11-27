import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const publicDir = path.resolve(rootDir, 'public');

// Locate base AppLovin single-file HTML
const templateConfigPath = path.resolve(rootDir, 'template.config.json');
let outputFilename = 'T_S_JPJB_var_Shoot-Reveal-Hamster_en_261124_Christy_AppLovin.html';
if (fs.existsSync(templateConfigPath)) {
  try {
    const cfg = JSON.parse(fs.readFileSync(templateConfigPath, 'utf8'));
    if (cfg.outputFilename) outputFilename = cfg.outputFilename;
  } catch {
    // ignore
  }
}

const baseHtmlPath = path.resolve(distDir, outputFilename);
if (!fs.existsSync(baseHtmlPath)) {
  console.error(`Base AppLovin HTML not found: ${baseHtmlPath}. Run npm run build:applovin first.`);
  process.exit(1);
}

const baseHtml = fs.readFileSync(baseHtmlPath, 'utf8');
if (!baseHtml.includes('/*__PLAYABLE_TEMPLATE_INJECT__*/')) {
  console.error('Base AppLovin HTML is missing /*__PLAYABLE_TEMPLATE_INJECT__*/ placeholder.');
  process.exit(1);
}

function fileToDataUri(filePath) {
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

const mascots = [
  {
    id: 'hamster',
    zhName: '苹果小仓鼠',
    category: '动物',
    dataUrl: fileToDataUri(path.resolve(publicDir, 'assets/chibi_hamster_runner.png')),
  },
  {
    id: 'cat',
    zhName: '橘猫小团子',
    category: '动物',
    dataUrl: fileToDataUri(path.resolve(publicDir, 'assets/mascots/mascot_cat.png')),
  },
  {
    id: 'shiba',
    zhName: '柴犬小萌狗',
    category: '动物',
    dataUrl: fileToDataUri(path.resolve(publicDir, 'assets/mascots/mascot_shiba.png')),
  },
  {
    id: 'bunny',
    zhName: '草莓小白兔',
    category: '动物',
    dataUrl: fileToDataUri(path.resolve(publicDir, 'assets/mascots/mascot_bunny.png')),
  },
  {
    id: 'girl',
    zhName: '宝石小女孩',
    category: '人物',
    dataUrl: fileToDataUri(path.resolve(publicDir, 'assets/mascots/mascot_girl.png')),
  },
];

// Extract default Cherry Hamster JSON example from hamsterLevel.ts
const hamsterTs = fs.readFileSync(path.resolve(rootDir, 'src/data/hamsterLevel.ts'), 'utf8');
const rowsMatch = hamsterTs.match(/HAMSTER_ROWS:\s*readonly\s+string\[\]\s*=\s*\[([\s\S]*?)\];/);
const exampleRows = rowsMatch
  ? Array.from(rowsMatch[1].matchAll(/'([^']+)'/g)).map((m) => m[1])
  : [];

const sampleLevelJson = {
  name: 'Cherry Hamster',
  palette: {
    K: '#1e2938',
    W: '#e4d7be',
    Y: '#eb9108',
    B: '#7b2e20',
    P: '#ef868a',
    R: '#c92327',
  },
  rows: exampleRows,
};

const baseHtmlB64 = Buffer.from(baseHtml, 'utf8').toString('base64');

const studioHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Jewel Bloom 试玩在线替换工具</title>
<style>
  :root {
    --bg: #f6f0e4;
    --card: #fffdf8;
    --border: #e5d4b3;
    --ink: #2b2116;
    --muted: #7a6548;
    --accent: #e5930b;
    --accent-bg: #fff6e0;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", Roboto, sans-serif;
    background: var(--bg);
    color: var(--ink);
  }
  .layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }
  /* Left Live Preview Stage */
  .stage {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 18px 24px;
    background: radial-gradient(circle at 30% 20%, #fffaf0 0%, #efe3cb 100%);
    gap: 14px;
  }
  .stage-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 253, 248, 0.92);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 6px 12px;
    box-shadow: 0 4px 14px rgba(82, 54, 18, 0.08);
  }
  .stage-btn {
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .stage-btn.active {
    background: var(--accent);
    color: #fff;
  }
  .stage-btn:hover:not(.active) {
    background: var(--accent-bg);
    color: var(--ink);
  }
  .phone-shell {
    position: relative;
    background: #1b1712;
    border-radius: 34px;
    padding: 10px;
    box-shadow: 0 24px 55px rgba(45, 28, 8, 0.28), inset 0 0 0 2px rgba(255, 255, 255, 0.12);
    transition: width 0.25s ease, height 0.25s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .phone-shell.portrait {
    width: min(392px, 44vw);
    height: min(760px, calc(100vh - 96px));
    aspect-ratio: 9 / 16;
  }
  .phone-shell.landscape {
    width: min(740px, calc(100vw - 470px));
    height: min(416px, calc(100vh - 110px));
    aspect-ratio: 16 / 9;
  }
  .phone-shell iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 25px;
    background: #fff8ea;
  }

  /* Right Config Panel */
  .panel {
    width: 420px;
    max-width: 46vw;
    height: 100%;
    background: var(--card);
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    box-shadow: -8px 0 30px rgba(72, 48, 16, 0.06);
  }
  .panel-header {
    padding: 16px 20px;
    border-bottom: 1px solid #efe2c6;
    background: linear-gradient(135deg, #fff9ea 0%, #fcefd2 100%);
  }
  .panel-header h1 {
    margin: 0;
    font-size: 17px;
    font-weight: 800;
    color: #3a260f;
  }
  .panel-header p {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--muted);
  }
  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .sec-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .sec-title {
    font-size: 13px;
    font-weight: 800;
    color: #3d2a13;
  }
  .mini-actions {
    display: flex;
    gap: 6px;
  }
  .mini-btn {
    border: 1px solid #e2c995;
    background: #fff8e8;
    color: #8a5607;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 9px;
    border-radius: 8px;
    cursor: pointer;
  }
  .mini-btn:hover { background: #ffefc8; }
  .mini-btn.subtle {
    border-color: #dfd7c8;
    background: #f5f2ec;
    color: #5c5142;
  }
  .dropzone {
    border: 2px dashed #dfb361;
    border-radius: 14px;
    padding: 14px;
    text-align: center;
    background: #fffaf0;
    cursor: pointer;
    transition: all 0.15s;
  }
  .dropzone:hover, .dropzone.dragover {
    border-color: var(--accent);
    background: #fff3d6;
  }
  .dropzone-main {
    font-size: 13px;
    font-weight: 800;
    color: #7c4c06;
  }
  .dropzone-sub {
    margin-top: 4px;
    font-size: 11px;
    color: var(--muted);
  }
  .pattern-info {
    margin-top: 8px;
    border: 1px solid #ebdcc0;
    background: #fff;
    border-radius: 12px;
    padding: 10px 12px;
    font-size: 12px;
  }
  .pattern-row {
    display: flex;
    justify-content: space-between;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .swatch {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 7px;
    border-radius: 999px;
    border: 1px solid #eadcc2;
    background: #fffdf9;
    font-size: 11px;
  }
  .swatch-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.18);
  }

  /* Mascot Grid */
  .mascot-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .mascot-card {
    position: relative;
    border: 2px solid #e7d8bc;
    border-radius: 14px;
    background: #fff;
    padding: 8px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .mascot-card:hover { border-color: #eab14d; }
  .mascot-card.active {
    border-color: var(--accent);
    background: var(--accent-bg);
    box-shadow: 0 3px 10px rgba(229, 147, 11, 0.18);
  }
  .mascot-card img {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }
  .mascot-name {
    font-size: 11px;
    font-weight: 800;
    color: var(--ink);
  }
  .mascot-tag {
    font-size: 10px;
    color: var(--muted);
  }
  .check-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
    font-size: 11px;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .text-input {
    width: 100%;
    padding: 9px 11px;
    border: 1px solid #ddc89f;
    border-radius: 10px;
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    background: #fff;
    color: var(--ink);
  }
  .text-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(229, 147, 11, 0.15);
  }
  .msg {
    padding: 9px 11px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;
  }
  .msg.error { background: #fff1f2; border: 1px solid #fecdd3; color: #be123c; }
  .msg.ok { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }

  .panel-footer {
    padding: 14px 20px 18px;
    border-top: 1px solid #efe2c6;
    background: #fffaf0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .size-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--muted);
    font-weight: 600;
  }
  .size-ok { color: #15803d; font-weight: 800; }
  .size-warn { color: #dc2626; font-weight: 800; }
  .export-btn {
    width: 100%;
    border: none;
    border-radius: 14px;
    padding: 13px 16px;
    font-size: 14px;
    font-weight: 900;
    color: #fff;
    cursor: pointer;
    background: linear-gradient(180deg, #5cd62a 0%, #27a811 100%);
    box-shadow: 0 4px 0 #166b06, 0 8px 18px rgba(39, 168, 17, 0.25);
    transition: transform 0.1s;
  }
  .export-btn:active { transform: translateY(2px); }

  @media (max-width: 860px) {
    .layout { flex-direction: column; height: auto; overflow: auto; }
    .stage { min-height: 75vh; }
    .panel { width: 100%; max-width: 100%; height: auto; border-left: none; border-top: 1px solid var(--border); }
    .phone-shell.portrait { width: 320px; height: 570px; }
  }
</style>
</head>
<body>
<div class="layout">
  <!-- Left: Real-time Interactive Preview -->
  <div class="stage">
    <div class="stage-bar">
      <button id="btnPortrait" class="stage-btn active" type="button">竖屏 9:16</button>
      <button id="btnLandscape" class="stage-btn" type="button">横屏 16:9</button>
      <button id="btnReload" class="stage-btn" type="button">↻ 重新开始</button>
    </div>
    <div id="phoneShell" class="phone-shell portrait">
      <iframe id="previewFrame" title="Playable Live Preview" allow="autoplay"></iframe>
    </div>
  </div>

  <!-- Right: Online Replacement Studio Controls -->
  <aside class="panel">
    <div class="panel-header">
      <h1>Jewel Bloom 试玩在线替换工具</h1>
      <p>纯浏览器运行 · 替换图案 JSON &amp; 顶部角色 · 一键导出 AppLovin 单文件 HTML</p>
    </div>

    <div class="panel-body">
      <!-- 1. Pattern JSON -->
      <section>
        <div class="sec-head">
          <span class="sec-title">1. 待填图案 JSON</span>
          <div class="mini-actions">
            <button id="btnFlipY" class="mini-btn subtle" type="button" style="display:none;">↕ 上下翻转</button>
            <button id="btnSampleJson" class="mini-btn" type="button">下载示例 JSON</button>
            <button id="btnResetPattern" class="mini-btn subtle" type="button" style="display:none;">恢复默认</button>
          </div>
        </div>
        <div id="jsonDropzone" class="dropzone">
          <div class="dropzone-main">点击或拖拽上传图案 .json 文件</div>
          <div class="dropzone-sub">原生支持 Jewel Bloom 关卡 JSON（layout/tile）及 rows / grid / cells</div>
          <input id="jsonInput" type="file" accept=".json,application/json" hidden />
        </div>
        <div id="patternInfo" class="pattern-info"></div>
        <div id="mysteryWrap" style="display:none; margin-top:8px;">
          <div style="font-size:11px; font-weight:700; color:#7a6548; margin-bottom:5px;">问号遮罩模式（点击切换）：</div>
          <div id="mysteryBar" style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="mini-btn" data-mystery="smart" style="flex:1;">高难问号(仅留外圈)</button>
            <button type="button" class="mini-btn subtle" data-mystery="strip_bg" style="flex:1;">抠背景+高难问号</button>
            <button type="button" class="mini-btn subtle" data-mystery="none" style="flex:1;">关闭问号(全显)</button>
          </div>
        </div>
      </section>

      <!-- 1B. Auto-extract real colors from reference finished image -->
      <section id="refImgSection" style="display:none;">
        <div class="sec-head">
          <span class="sec-title">🎨 一键吸色（上传成品原图自动识别真实颜色）</span>
          <div class="mini-actions">
            <button id="btnClearRefImg" class="mini-btn subtle" type="button" style="display:none;">清除</button>
          </div>
        </div>
        <button id="btnUploadRefImg" class="dropzone" type="button" style="width:100%; padding:10px 12px;">
          <div class="dropzone-main" style="font-size:12px;">上传该关卡的成品参考图（PNG/JPG）</div>
          <div class="dropzone-sub">自动按像素精准识别每个色号 ID 的真实颜色，并同步用作通关展示图！</div>
        </button>
        <input id="refImgInput" type="file" accept="image/png,image/webp,image/jpeg" hidden />
      </section>

      <!-- 2. Runner Mascot -->
      <section>
        <div class="sec-head">
          <span class="sec-title">2. 顶部进度条奔跑角色</span>
          <div class="mini-actions">
            <button id="btnUploadMascot" class="mini-btn" type="button">上传自定义 PNG</button>
            <input id="mascotInput" type="file" accept="image/png,image/webp,image/jpeg" hidden />
          </div>
        </div>
        <div id="mascotGrid" class="mascot-grid"></div>
      </section>

      <!-- 3. Victory Image -->
      <section>
        <div class="sec-head">
          <span class="sec-title">3. 通关弹窗成品图（可选）</span>
          <div class="mini-actions">
            <button id="btnClearVictory" class="mini-btn subtle" type="button" style="display:none;">清除</button>
          </div>
        </div>
        <button id="btnUploadVictory" class="mini-btn" type="button" style="width:100%; padding:9px;">
          上传自定义通关图（不传则自动截取拼好的拼豆画布）
        </button>
        <input id="victoryInput" type="file" accept="image/png,image/webp,image/jpeg" hidden />
      </section>

      <!-- 4. Structured Export Naming -->
      <section>
        <div class="sec-head">
          <span class="sec-title">4. 导出命名</span>
        </div>
        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:8px; margin-bottom:8px;">
          <div>
            <div style="font-size:11px; font-weight:700; color:#7a6548; margin-bottom:4px;">图案名称（待填）</div>
            <input
              id="patternTagInput"
              class="text-input"
              type="text"
              value="Hamster"
              placeholder="如 Eagle / Cat / LV4533"
            />
          </div>
          <div>
            <div style="font-size:11px; font-weight:700; color:#7a6548; margin-bottom:4px;">导出日期 (yymmdd)</div>
            <input
              id="exportDateInput"
              class="text-input"
              type="text"
              maxlength="6"
              placeholder="261125"
            />
          </div>
        </div>
        <div style="font-size:11px; font-weight:700; color:#7a6548; margin-bottom:4px;">最终导出文件名预览：</div>
        <input
          id="filenameInput"
          class="text-input"
          type="text"
          readonly
          style="background:#fffaf0; color:#5a3f1a; font-weight:700;"
        />
      </section>

      <div id="msgBox"></div>
    </div>

    <div class="panel-footer">
      <div class="size-row">
        <span>导出包体大小（AppLovin 上限 5.00 MB）</span>
        <span id="sizeText" class="size-ok">-- MB</span>
      </div>
      <button id="btnExport" class="export-btn" type="button">
        一键生成并下载 AppLovin 单文件 HTML
      </button>
    </div>
  </aside>
</div>

<script>
(function() {
  const BASE_HTML_B64 = ${JSON.stringify(baseHtmlB64)};
  const MASCOTS = ${JSON.stringify(mascots)};
  const SAMPLE_JSON = ${JSON.stringify(sampleLevelJson)};

  function decodeBase64Utf8(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }

  const BASE_HTML = decodeBase64Utf8(BASE_HTML_B64);

  const JEWEL_TILE_COLORS = {
    '1': '#e11d48', '2': '#8fad05', '3': '#00702d', '4': '#2563eb',
    '5': '#f59e0b', '6': '#9333ea', '7': '#06b6d4', '8': '#ec4899',
    '9': '#7c2d12', '10': '#334155', '11': '#ef4444', '12': '#22c55e',
    '13': '#3b82f6', '14': '#eab308', '15': '#a855f7', '16': '#1e2938',
    '17': '#f97316', '18': '#f89d9f', '19': '#8c442a', '20': '#e76108',
    '21': '#14b8a6', '22': '#6366f1', '23': '#f5a817', '24': '#f8e42e',
    '25': '#f1eba5', '26': '#26303d', '27': '#4ade80', '28': '#1877e8',
    '29': '#eb9108', '30': '#f0eadc', '31': '#64748b', '32': '#c92327',
  };

  let savedTileColors = {};
  try {
    savedTileColors = JSON.parse(localStorage.getItem('jb_tile_colors_v1') || '{}') || {};
  } catch {}
  const getDefaultTileHex = (k) => savedTileColors[k] || JEWEL_TILE_COLORS[k] || '#64748b';

  const state = {
    levelJson: null, // null = default Cherry Hamster
    paletteOverrides: {},
    flipY: false,
    mysteryMode: 'smart',
    mascotId: 'hamster',
    customMascotDataUrl: null,
    victoryImageDataUrl: null,
  };

  const els = {
    frame: document.getElementById('previewFrame'),
    shell: document.getElementById('phoneShell'),
    btnPortrait: document.getElementById('btnPortrait'),
    btnLandscape: document.getElementById('btnLandscape'),
    btnReload: document.getElementById('btnReload'),
    jsonDropzone: document.getElementById('jsonDropzone'),
    jsonInput: document.getElementById('jsonInput'),
    btnFlipY: document.getElementById('btnFlipY'),
    btnSampleJson: document.getElementById('btnSampleJson'),
    btnResetPattern: document.getElementById('btnResetPattern'),
    patternInfo: document.getElementById('patternInfo'),
    mysteryWrap: document.getElementById('mysteryWrap'),
    mysteryBar: document.getElementById('mysteryBar'),
    refImgSection: document.getElementById('refImgSection'),
    btnUploadRefImg: document.getElementById('btnUploadRefImg'),
    btnClearRefImg: document.getElementById('btnClearRefImg'),
    refImgInput: document.getElementById('refImgInput'),
    mascotGrid: document.getElementById('mascotGrid'),
    btnUploadMascot: document.getElementById('btnUploadMascot'),
    mascotInput: document.getElementById('mascotInput'),
    btnUploadVictory: document.getElementById('btnUploadVictory'),
    btnClearVictory: document.getElementById('btnClearVictory'),
    victoryInput: document.getElementById('victoryInput'),
    patternTagInput: document.getElementById('patternTagInput'),
    exportDateInput: document.getElementById('exportDateInput'),
    filenameInput: document.getElementById('filenameInput'),
    sizeText: document.getElementById('sizeText'),
    btnExport: document.getElementById('btnExport'),
    msgBox: document.getElementById('msgBox'),
  };

  function getTodayYYMMDD() {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return yy + mm + dd;
  }

  function updateExportFilename() {
    const rawTag = (els.patternTagInput.value || '').trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]+/g, '-').replace(/^-+|-+$/g, '');
    const tag = rawTag || 'Pattern';
    const rawDate = (els.exportDateInput.value || '').trim().replace(/[^0-9]/g, '');
    const dateStr = rawDate || getTodayYYMMDD();
    els.filenameInput.value = 'T_S_JPJB_var_Shoot-Reveal-' + tag + '_en_' + dateStr + '_Christy_AppLovin.html';
  }

  els.exportDateInput.value = getTodayYYMMDD();
  els.patternTagInput.addEventListener('input', updateExportFilename);
  els.exportDateInput.addEventListener('input', updateExportFilename);

  function showMsg(text, isError) {
    if (!text) { els.msgBox.innerHTML = ''; return; }
    els.msgBox.innerHTML = '<div class="msg ' + (isError ? 'error' : 'ok') + '">' + text + '</div>';
  }

  function summarizeJson(raw) {
    const obj = raw || SAMPLE_JSON;
    const name = obj.name || 'Custom Pattern';
    let rows = 0, cols = 0, total = 0;
    const counts = {};
    const paletteMap = {};
    if (Array.isArray(obj.palette)) {
      obj.palette.forEach((h, i) => { paletteMap[String(i + 1)] = h; });
    } else if (obj.palette && typeof obj.palette === 'object') {
      for (const [k, v] of Object.entries(obj.palette)) {
        paletteMap[k] = typeof v === 'string' ? v : (v && v.base) || '#64748b';
      }
    }
    const isEmpty = (v) => v === null || v === undefined || v === 0 || v === '' || v === '.' || v === '_' || v === '0';
    if (Array.isArray(obj.rows) && typeof obj.rows[0] === 'string') {
      rows = obj.rows.length;
      cols = Math.max(...obj.rows.map((r) => r.length));
      for (const r of obj.rows) {
        for (const ch of r) {
          if (!isEmpty(ch)) { counts[ch] = (counts[ch] || 0) + 1; total++; }
        }
      }
    } else if (Array.isArray(obj.layout) && obj.layout.length > 0) {
      rows = obj.layoutSize && obj.layoutSize.y ? obj.layoutSize.y : 0;
      cols = obj.layoutSize && obj.layoutSize.x ? obj.layoutSize.x : 0;
      for (const item of obj.layout) {
        const r = (item.pos ? item.pos.y : item.y) ?? 0;
        const c = (item.pos ? item.pos.x : item.x) ?? 0;
        if (r + 1 > rows) rows = r + 1;
        if (c + 1 > cols) cols = c + 1;
        const v = item.tile ?? item.color ?? item.block;
        if (!isEmpty(v)) {
          const k = String(v);
          counts[k] = (counts[k] || 0) + 1;
          if (!paletteMap[k]) paletteMap[k] = JEWEL_TILE_COLORS[k] || '#64748b';
          total++;
        }
      }
    } else {
      const mat = obj.grid || obj.matrix || obj.map || obj.data || obj.cells || obj.pixels;
      if (Array.isArray(mat) && Array.isArray(mat[0])) {
        rows = mat.length;
        cols = Math.max(...mat.map((r) => r.length));
        for (const r of mat) {
          for (const v of r) {
            if (!isEmpty(v)) {
              const k = String(v);
              counts[k] = (counts[k] || 0) + 1;
              if (!paletteMap[k] && /^#[0-9a-fA-F]{3,6}$/.test(k)) paletteMap[k] = k;
              total++;
            }
          }
        }
      } else if (Array.isArray(mat) && mat[0] && typeof mat[0] === 'object') {
        for (const item of mat) {
          const r = item.row ?? item.y ?? 0;
          const c = item.col ?? item.x ?? 0;
          if (r + 1 > rows) rows = r + 1;
          if (c + 1 > cols) cols = c + 1;
          const v = item.color ?? item.colorId ?? item.c;
          if (!isEmpty(v)) {
            const k = String(v);
            counts[k] = (counts[k] || 0) + 1;
            if (!paletteMap[k] && /^#[0-9a-fA-F]{3,6}$/.test(k)) paletteMap[k] = k;
            total++;
          }
        }
      } else {
        throw new Error('JSON 中未找到 rows、grid/matrix 或 cells 图案字段');
      }
    }
    if (total < 10) throw new Error('图案有效拼豆数量过少（至少需要 10 颗）');
    return { name, rows, cols, total, counts, paletteMap };
  }

  function buildMiniPreviewGrid(raw) {
    const obj = raw || SAMPLE_JSON;
    const isEmpty = (v) => v === null || v === undefined || v === 0 || v === '' || v === '.' || v === '_' || v === '0';
    let grid = [];
    if (Array.isArray(obj.rows) && typeof obj.rows[0] === 'string') {
      const w = Math.max(...obj.rows.map((r) => r.length));
      grid = obj.rows.map((r) => Array.from(r.padEnd(w, '.')).map((ch) => (isEmpty(ch) ? null : ch)));
    } else if (Array.isArray(obj.layout) && obj.layout.length > 0) {
      let h = obj.layoutSize && obj.layoutSize.y ? obj.layoutSize.y : 0;
      let w = obj.layoutSize && obj.layoutSize.x ? obj.layoutSize.x : 0;
      for (const it of obj.layout) {
        const r = (it.pos ? it.pos.y : it.y) ?? 0;
        const c = (it.pos ? it.pos.x : it.x) ?? 0;
        if (r + 1 > h) h = r + 1;
        if (c + 1 > w) w = c + 1;
      }
      grid = Array.from({ length: h }, () => Array(w).fill(null));
      for (const it of obj.layout) {
        const r = it.pos ? it.pos.y : it.y;
        const c = it.pos ? it.pos.x : it.x;
        const v = it.tile ?? it.color ?? it.block;
        if (r >= 0 && r < h && c >= 0 && c < w && !isEmpty(v)) grid[r][c] = String(v);
      }
    } else {
      const mat = obj.grid || obj.matrix || obj.map || obj.data || obj.cells || obj.pixels;
      if (Array.isArray(mat) && Array.isArray(mat[0])) {
        const w = Math.max(...mat.map((r) => r.length));
        grid = mat.map((r) => Array.from({ length: w }, (_, c) => (isEmpty(r[c]) ? null : String(r[c]))));
      }
    }
    if (state.flipY) grid = grid.slice().reverse();
    return grid;
  }

  function renderPatternInfo() {
    const info = summarizeJson(state.levelJson);
    const keys = Object.keys(info.counts);
    els.btnResetPattern.style.display = state.levelJson ? 'inline-block' : 'none';
    els.btnFlipY.style.display = state.levelJson ? 'inline-block' : 'none';
    els.mysteryWrap.style.display = state.levelJson ? 'block' : 'none';
    els.refImgSection.style.display = state.levelJson ? 'block' : 'none';
    els.mysteryBar.querySelectorAll('[data-mystery]').forEach((btn) => {
      const active = btn.getAttribute('data-mystery') === state.mysteryMode;
      btn.className = 'mini-btn' + (active ? '' : ' subtle');
      btn.style.flex = '1';
    });

    const getHexForKey = (k) => state.paletteOverrides[k] || info.paletteMap[k] || getDefaultTileHex(k);

    const swatchesHtml = keys.slice(0, 16).map((k) => {
      const hex = getHexForKey(k);
      if (state.levelJson) {
        return '<label class="swatch" style="cursor:pointer;padding:3px 8px;" title="点击修改色号 ' + k + ' 的颜色">' +
          '<input type="color" data-color-key="' + k + '" value="' + hex + '" style="width:18px;height:18px;border:none;padding:0;background:none;cursor:pointer;" />' +
          '<span>ID ' + k + ' (' + info.counts[k] + ')</span></label>';
      }
      return '<span class="swatch"><span class="swatch-dot" style="background:' + hex + '"></span>' + k + ' (' + info.counts[k] + ')</span>';
    }).join('');

    const miniHtml = state.levelJson
      ? '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
          '<canvas id="miniFullCanvas" width="84" height="84" style="width:76px;height:76px;border-radius:10px;border:1px solid #e5d4b3;background:#fffaf0;flex-shrink:0;cursor:crosshair;" title="点击图中任意区域可快速定位修改该色号颜色"></canvas>' +
          '<div style="font-size:11px;color:#7a6548;line-height:1.45;">' +
            '<div style="font-weight:800;color:#3d2a13;margin-bottom:2px;">全彩成品对照图（无问号）</div>' +
            '官方 JSON 仅含色号数字，<b>点击下方色块</b>或<b>直接点左图任意位置</b>即可调色，自动记住色号！' +
          '</div>' +
        '</div>'
      : '';

    els.patternInfo.innerHTML =
      '<div class="pattern-row"><span>' + info.name + (state.levelJson ? '' : '（默认）') + '</span><span>' + info.cols + '×' + info.rows + ' · ' + info.total + ' 豆 · ' + keys.length + ' 色</span></div>' +
      miniHtml +
      '<div class="swatches">' + swatchesHtml + '</div>';

    if (state.levelJson) {
      const miniCanvas = document.getElementById('miniFullCanvas');
      const grid = buildMiniPreviewGrid(state.levelJson);
      const drawMini = () => {
        if (!miniCanvas || grid.length === 0) return;
        const ctx = miniCanvas.getContext('2d');
        const h = grid.length, w = grid[0].length;
        const cell = Math.min(80 / w, 80 / h);
        const ox = (84 - cell * w) / 2;
        const oy = (84 - cell * h) / 2;
        ctx.clearRect(0, 0, 84, 84);
        for (let r = 0; r < h; r++) {
          for (let c = 0; c < w; c++) {
            const k = grid[r][c];
            if (!k) continue;
            ctx.fillStyle = getHexForKey(k);
            ctx.fillRect(ox + c * cell, oy + r * cell, Math.ceil(cell), Math.ceil(cell));
          }
        }
      };
      drawMini();

      if (miniCanvas && grid.length > 0) {
        miniCanvas.addEventListener('click', (ev) => {
          const rect = miniCanvas.getBoundingClientRect();
          const px = ((ev.clientX - rect.left) / rect.width) * 84;
          const py = ((ev.clientY - rect.top) / rect.height) * 84;
          const h = grid.length, w = grid[0].length;
          const cell = Math.min(80 / w, 80 / h);
          const ox = (84 - cell * w) / 2;
          const oy = (84 - cell * h) / 2;
          const c = Math.floor((px - ox) / cell);
          const r = Math.floor((py - oy) / cell);
          const k = grid[r] && grid[r][c];
          if (k) {
            const inp = els.patternInfo.querySelector('input[data-color-key="' + k + '"]');
            if (inp) inp.click();
          }
        });
      }

      els.patternInfo.querySelectorAll('input[data-color-key]').forEach((inp) => {
        const applyColor = (e, rebuildFrame) => {
          const key = e.target.getAttribute('data-color-key');
          state.paletteOverrides[key] = e.target.value;
          savedTileColors[key] = e.target.value;
          try { localStorage.setItem('jb_tile_colors_v1', JSON.stringify(savedTileColors)); } catch {}
          drawMini();
          if (rebuildFrame) refreshPreview();
        };
        inp.addEventListener('input', (e) => applyColor(e, false));
        inp.addEventListener('change', (e) => applyColor(e, true));
      });
    }
  }

  function renderMascotGrid() {
    const cards = MASCOTS.map((m) => {
      const active = state.mascotId === m.id;
      return '<button type="button" class="mascot-card' + (active ? ' active' : '') + '" data-mascot="' + m.id + '">' +
        (active ? '<span class="check-badge">✓</span>' : '') +
        '<img src="' + m.dataUrl + '" alt="' + m.zhName + '" />' +
        '<span class="mascot-name">' + m.zhName + '</span>' +
        '<span class="mascot-tag">' + m.category + '</span>' +
      '</button>';
    });
    if (state.customMascotDataUrl) {
      const active = state.mascotId === 'custom';
      cards.push(
        '<button type="button" class="mascot-card' + (active ? ' active' : '') + '" data-mascot="custom">' +
          (active ? '<span class="check-badge">✓</span>' : '') +
          '<img src="' + state.customMascotDataUrl + '" alt="自定义角色" />' +
          '<span class="mascot-name">自定义角色</span>' +
          '<span class="mascot-tag">已上传</span>' +
        '</button>'
      );
    }
    els.mascotGrid.innerHTML = cards.join('');
    els.mascotGrid.querySelectorAll('[data-mascot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.mascotId = btn.getAttribute('data-mascot');
        renderMascotGrid();
        refreshPreview();
      });
    });
  }

  function buildFinalPlayableHtml() {
    const chosenMascot = MASCOTS.find((m) => m.id === state.mascotId);
    const mascotDataUrl = state.mascotId === 'custom'
      ? state.customMascotDataUrl
      : (chosenMascot && state.mascotId !== 'hamster' ? chosenMascot.dataUrl : null);

    let finalLevelJson = state.levelJson;
    if (finalLevelJson) {
      const info = summarizeJson(finalLevelJson);
      const grid = buildMiniPreviewGrid(finalLevelJson);
      const keys = Object.keys(info.counts);
      const mergedPalette = {};
      const keyToChar = {};
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      keys.forEach((k, idx) => {
        const ch = alphabet[idx] || String(idx);
        keyToChar[k] = ch;
        mergedPalette[ch] = state.paletteOverrides[k] || info.paletteMap[k] || getDefaultTileHex(k);
      });
      // Compact verbose layout/matrix JSON (~110KB) into tiny string-rows format (~1.5KB!)
      if (grid.length > 0 && keys.length <= alphabet.length) {
        const compactRows = grid.map((row) =>
          row.map((cell) => (cell ? (keyToChar[cell] || '.') : '.')).join('')
        );
        finalLevelJson = {
          name: info.name,
          mysteryMode: state.mysteryMode,
          palette: mergedPalette,
          rows: compactRows,
        };
      } else {
        const rawPalette = {};
        for (const k of keys) {
          rawPalette[k] = state.paletteOverrides[k] || info.paletteMap[k] || getDefaultTileHex(k);
        }
        finalLevelJson = {
          ...finalLevelJson,
          flipY: state.flipY,
          mysteryMode: state.mysteryMode,
          palette: rawPalette,
        };
      }
    }

    const payload = {
      mascotId: mascotDataUrl ? 'custom' : 'hamster',
      customMascotDataUrl: mascotDataUrl,
      levelJson: finalLevelJson,
      victoryImageDataUrl: state.victoryImageDataUrl,
    };

    const safePayloadJson = JSON.stringify(payload)
      .replace(/<\\/script/gi, '\\\\x3c/script')
      .replace(/<script/gi, '\\\\x3cscript');

    const injectSnippet = 'window.__PLAYABLE_TEMPLATE__=' + safePayloadJson + ';';
    return BASE_HTML.replace('/*__PLAYABLE_TEMPLATE_INJECT__*/', injectSnippet);
  }

  function refreshPreview() {
    const html = buildFinalPlayableHtml();
    const bytes = new TextEncoder().encode(html).length;
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    els.sizeText.textContent = mb + ' MB' + (bytes <= 5 * 1024 * 1024 ? ' ✅' : ' ⚠️ 超出5MB');
    els.sizeText.className = bytes <= 5 * 1024 * 1024 ? 'size-ok' : 'size-warn';
    els.frame.srcdoc = html;
  }

  async function handleJsonFile(file) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const info = summarizeJson(parsed);
      state.levelJson = parsed;
      state.paletteOverrides = {};
      state.flipY = false;
      const slug = info.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]+/g, '-').replace(/^-+|-+$/g, '') || 'Custom';
      els.patternTagInput.value = slug;
      updateExportFilename();
      renderPatternInfo();
      refreshPreview();
      showMsg('已加载图案「' + info.name + '」（' + info.cols + '×' + info.rows + '，' + info.total + ' 颗豆子），左侧已实时更新！', false);
    } catch (err) {
      showMsg('JSON 解析失败：' + (err && err.message ? err.message : '请检查文件格式'), true);
    }
  }

  function readDataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ''));
      r.onerror = () => reject(new Error('文件读取失败'));
      r.readAsDataURL(file);
    });
  }

  function compressImageDataUrl(dataUrl, maxDim, forceAlpha) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || maxDim;
        const h = img.naturalHeight || maxDim;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        const tw = Math.max(1, Math.round(w * scale));
        const th = Math.max(1, Math.round(h * scale));
        const c = document.createElement('canvas');
        c.width = tw;
        c.height = th;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, tw, th);
        ctx.drawImage(img, 0, 0, tw, th);

        // Detect if image contains any transparent pixels so we NEVER turn alpha into solid black via JPEG!
        let hasAlpha = Boolean(forceAlpha);
        if (!hasAlpha) {
          try {
            const px = ctx.getImageData(0, 0, tw, th).data;
            for (let i = 3; i < px.length; i += 16) {
              if (px[i] < 250) { hasAlpha = true; break; }
            }
          } catch {}
        }

        let out;
        if (hasAlpha) {
          const webp = c.toDataURL('image/webp', 0.85);
          out = webp.startsWith('data:image/webp') ? webp : c.toDataURL('image/png');
        } else {
          out = c.toDataURL('image/jpeg', 0.84);
        }
        resolve(out.length < dataUrl.length ? out : dataUrl);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  // Events
  els.btnPortrait.addEventListener('click', () => {
    els.shell.className = 'phone-shell portrait';
    els.btnPortrait.classList.add('active');
    els.btnLandscape.classList.remove('active');
  });
  els.btnLandscape.addEventListener('click', () => {
    els.shell.className = 'phone-shell landscape';
    els.btnLandscape.classList.add('active');
    els.btnPortrait.classList.remove('active');
  });
  els.btnReload.addEventListener('click', refreshPreview);

  els.jsonDropzone.addEventListener('click', () => els.jsonInput.click());
  els.jsonDropzone.addEventListener('dragover', (e) => { e.preventDefault(); els.jsonDropzone.classList.add('dragover'); });
  els.jsonDropzone.addEventListener('dragleave', () => els.jsonDropzone.classList.remove('dragover'));
  els.jsonDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    els.jsonDropzone.classList.remove('dragover');
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleJsonFile(f);
  });
  els.jsonInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleJsonFile(f);
    e.target.value = '';
  });

  els.btnSampleJson.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(SAMPLE_JSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jewel_bloom_pattern_example.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  els.btnFlipY.addEventListener('click', () => {
    state.flipY = !state.flipY;
    renderPatternInfo();
    refreshPreview();
  });

  els.mysteryBar.querySelectorAll('[data-mystery]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mysteryMode = btn.getAttribute('data-mystery');
      renderPatternInfo();
      refreshPreview();
    });
  });

  els.btnResetPattern.addEventListener('click', () => {
    state.levelJson = null;
    state.paletteOverrides = {};
    state.flipY = false;
    state.mysteryMode = 'smart';
    els.patternTagInput.value = 'Hamster';
    updateExportFilename();
    renderPatternInfo();
    refreshPreview();
    showMsg('已恢复默认樱桃仓鼠图案。', false);
  });

  els.btnUploadMascot.addEventListener('click', () => els.mascotInput.click());
  els.mascotInput.addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const rawUrl = await readDataUrl(f);
      state.customMascotDataUrl = await compressImageDataUrl(rawUrl, 160, true);
      state.mascotId = 'custom';
      renderMascotGrid();
      refreshPreview();
      showMsg('已替换为自定义进度条角色！', false);
    } catch {
      showMsg('图片读取失败', true);
    }
    e.target.value = '';
  });

  function extractColorsFromReferenceImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const grid = buildMiniPreviewGrid(state.levelJson);
          if (!grid.length || !grid[0].length) {
            reject(new Error('请先上传图案 JSON'));
            return;
          }
          const rows = grid.length;
          const cols = grid[0].length;
          const cw = Math.min(512, img.naturalWidth || 512);
          const ch = Math.min(512, img.naturalHeight || 512);
          const canvas = document.createElement('canvas');
          canvas.width = cw;
          canvas.height = ch;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, cw, ch);
          const pixels = ctx.getImageData(0, 0, cw, ch).data;

          // Collect RGB samples per tile ID at cell centers
          const buckets = {};
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const k = grid[r][c];
              if (!k) continue;
              const sx = Math.min(cw - 1, Math.max(0, Math.floor(((c + 0.5) / cols) * cw)));
              const sy = Math.min(ch - 1, Math.max(0, Math.floor(((r + 0.5) / rows) * ch)));
              const idx = (sy * cw + sx) * 4;
              if (!buckets[k]) buckets[k] = { r: [], g: [], b: [] };
              buckets[k].r.push(pixels[idx]);
              buckets[k].g.push(pixels[idx + 1]);
              buckets[k].b.push(pixels[idx + 2]);
            }
          }
          const median = (arr) => {
            const s = arr.slice().sort((a, b) => a - b);
            return s[Math.floor(s.length / 2)] || 0;
          };
          const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
          const extracted = {};
          for (const [k, b] of Object.entries(buckets)) {
            extracted[k] = '#' + toHex(median(b.r)) + toHex(median(b.g)) + toHex(median(b.b));
          }
          resolve(extracted);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('参考图片加载失败'));
      img.src = dataUrl;
    });
  }

  els.btnUploadRefImg.addEventListener('click', () => els.refImgInput.click());
  els.refImgInput.addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const dataUrl = await readDataUrl(f);
      const extracted = await extractColorsFromReferenceImage(dataUrl);
      const compactVictory = await compressImageDataUrl(dataUrl, 360, false);
      Object.assign(state.paletteOverrides, extracted);
      Object.assign(savedTileColors, extracted);
      try { localStorage.setItem('jb_tile_colors_v1', JSON.stringify(savedTileColors)); } catch {}
      state.victoryImageDataUrl = compactVictory;
      els.btnClearRefImg.style.display = 'inline-block';
      els.btnClearVictory.style.display = 'inline-block';
      els.btnUploadVictory.textContent = '已自动同步成品参考图（点击可单独更换）';
      renderPatternInfo();
      refreshPreview();
      showMsg('已从成品图精准吸取 ' + Object.keys(extracted).length + ' 个色号的真实颜色，并同步设为通关展示图！', false);
    } catch (err) {
      showMsg('吸色失败：' + (err && err.message ? err.message : '请检查图片'), true);
    }
    e.target.value = '';
  });
  els.btnClearRefImg.addEventListener('click', () => {
    els.btnClearRefImg.style.display = 'none';
  });

  els.btnUploadVictory.addEventListener('click', () => els.victoryInput.click());
  els.victoryInput.addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const rawUrl = await readDataUrl(f);
      state.victoryImageDataUrl = await compressImageDataUrl(rawUrl, 360, false);
      els.btnClearVictory.style.display = 'inline-block';
      els.btnUploadVictory.textContent = '已上传通关图（点击更换）';
      refreshPreview();
      showMsg('已更新通关弹窗展示图！', false);
    } catch {
      showMsg('图片读取失败', true);
    }
    e.target.value = '';
  });
  els.btnClearVictory.addEventListener('click', () => {
    state.victoryImageDataUrl = null;
    els.btnClearVictory.style.display = 'none';
    els.btnUploadVictory.textContent = '上传自定义通关图（不传则自动截取拼好的拼豆画布）';
    refreshPreview();
  });

  els.btnExport.addEventListener('click', () => {
    const html = buildFinalPlayableHtml();
    const rawName = (els.filenameInput.value || 'Playable_AppLovin.html').trim();
    const fileName = rawName.toLowerCase().endsWith('.html') ? rawName : rawName + '.html';
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    showMsg('已生成并开始下载：' + fileName + '（可直接上传 AppLovin 平台）', false);
  });

  // Initial render
  updateExportFilename();
  renderPatternInfo();
  renderMascotGrid();
  refreshPreview();
})();
</script>
</body>
</html>`;

const studioOutPath = path.resolve(distDir, 'Jewel_Bloom_Playable_Studio.html');
fs.writeFileSync(studioOutPath, studioHtml, 'utf8');

// Build AES-256-GCM password-protected online version at docs/index.html
const studioPassword = (process.env.STUDIO_PASSWORD || '').trim();
if (!studioPassword) {
  console.log('\nSkipped docs/index.html encryption (set STUDIO_PASSWORD=... to build locked online studio).');
  process.exit(0);
}
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(studioPassword, salt, 100000, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encBuf = Buffer.concat([cipher.update(studioHtml, 'utf8'), cipher.final(), cipher.getAuthTag()]);

const lockedDocsHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>Jewel Bloom 试玩工作台 · 访问验证</title>
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", Roboto, sans-serif;
    background: radial-gradient(circle at 30% 20%, #fffaf0 0%, #efe3cb 100%);
    color: #2b2116;
    display: flex; align-items: center; justify-content: center;
  }
  .card {
    width: min(380px, 90vw);
    background: #fffdf8;
    border: 1.5px solid #e5d4b3;
    border-radius: 22px;
    padding: 28px 24px 24px;
    box-shadow: 0 20px 50px rgba(72, 48, 16, 0.14);
    text-align: center;
  }
  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 52px; height: 52px; border-radius: 16px;
    background: linear-gradient(135deg, #fff3cf 0%, #f9d98c 100%);
    border: 1.5px solid #e2b95c;
    font-size: 24px; margin-bottom: 12px;
  }
  h1 { margin: 0 0 6px; font-size: 18px; font-weight: 800; color: #3a260f; }
  p { margin: 0 0 18px; font-size: 12px; color: #7a6548; }
  input {
    width: 100%; padding: 12px 14px;
    border: 1.5px solid #ddc89f; border-radius: 12px;
    font-size: 14px; background: #fff; color: #2b2116;
    outline: none; text-align: center; letter-spacing: 1px;
  }
  input:focus { border-color: #e5930b; box-shadow: 0 0 0 3px rgba(229, 147, 11, 0.16); }
  button {
    width: 100%; margin-top: 12px; border: none; border-radius: 12px;
    padding: 12px 16px; font-size: 14px; font-weight: 800; color: #fff;
    cursor: pointer;
    background: linear-gradient(180deg, #5cd62a 0%, #27a811 100%);
    box-shadow: 0 3px 0 #166b06;
  }
  button:disabled { opacity: 0.65; cursor: wait; }
  .err { margin-top: 10px; font-size: 12px; font-weight: 700; color: #be123c; min-height: 18px; }
</style>
</head>
<body>
  <form id="lockForm" class="card">
    <div class="badge">🔒</div>
    <h1>Jewel Bloom 试玩工作台</h1>
    <p>仅限内部使用，请输入访问密码解锁</p>
    <input id="pwdInput" type="password" placeholder="请输入访问密码" autocomplete="current-password" autofocus required />
    <button id="submitBtn" type="submit">验证并进入</button>
    <div id="errText" class="err"></div>
  </form>
<script>
(function(){
  const SALT_B64 = ${JSON.stringify(salt.toString('base64'))};
  const IV_B64 = ${JSON.stringify(iv.toString('base64'))};
  const DATA_B64 = ${JSON.stringify(encBuf.toString('base64'))};
  const SESSION_KEY = 'jb_studio_pwd_v1';

  function b64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function unlock(password, silent) {
    const btn = document.getElementById('submitBtn');
    const err = document.getElementById('errText');
    if (!silent) { btn.disabled = true; btn.textContent = '验证中...'; err.textContent = ''; }
    try {
      const enc = new TextEncoder();
      const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
      const aesKey = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: b64ToBytes(SALT_B64), iterations: 100000, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      const plainBuf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: b64ToBytes(IV_B64) },
        aesKey,
        b64ToBytes(DATA_B64)
      );
      const html = new TextDecoder('utf-8').decode(plainBuf);
      try { sessionStorage.setItem(SESSION_KEY, password); } catch {}
      document.open();
      document.write(html);
      document.close();
    } catch {
      try { sessionStorage.removeItem(SESSION_KEY); } catch {}
      if (!silent) {
        btn.disabled = false;
        btn.textContent = '验证并进入';
        err.textContent = '密码错误，请重新输入';
        document.getElementById('pwdInput').select();
      }
    }
  }

  document.getElementById('lockForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const pwd = document.getElementById('pwdInput').value.trim();
    if (pwd) unlock(pwd, false);
  });

  // Auto-unlock within the same browser tab session
  try {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) unlock(cached, true);
  } catch {}
})();
</script>
</body>
</html>`;

const docsDir = path.resolve(rootDir, 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(path.resolve(docsDir, 'index.html'), lockedDocsHtml, 'utf8');
const studioSizeMb = (fs.statSync(studioOutPath).size / (1024 * 1024)).toFixed(2);
const docsSizeMb = (fs.statSync(path.resolve(docsDir, 'index.html')).size / (1024 * 1024)).toFixed(2);
console.log(`\nBuilt standalone studio: ${studioOutPath} (${studioSizeMb} MB, unlocked local)`);
console.log(`Built password-protected online studio: docs/index.html (${docsSizeMb} MB, AES-256-GCM encrypted)`);
