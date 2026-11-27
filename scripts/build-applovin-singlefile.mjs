import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const publicDir = path.resolve(rootDir, 'public');

// Read template.config.json so custom output filename and active mascot are honored automatically
const templateConfigPath = path.resolve(rootDir, 'template.config.json');
let templateConfig = {};
if (fs.existsSync(templateConfigPath)) {
  try {
    templateConfig = JSON.parse(fs.readFileSync(templateConfigPath, 'utf8'));
  } catch {
    templateConfig = {};
  }
}

const MASCOT_ASSET_BY_ID = {
  hamster: '/assets/chibi_hamster_runner.png',
  cat: '/assets/mascots/mascot_cat.png',
  shiba: '/assets/mascots/mascot_shiba.png',
  bunny: '/assets/mascots/mascot_bunny.png',
  girl: '/assets/mascots/mascot_girl.png',
};
const activeMascotId = templateConfig.mascotId || 'hamster';
const activeMascotAsset = MASCOT_ASSET_BY_ID[activeMascotId] || null;
const allMascotAssets = new Set(Object.values(MASCOT_ASSET_BY_ID));

const outputFilename =
  (typeof templateConfig.outputFilename === 'string' && templateConfig.outputFilename.trim()) ||
  'T_S_JPJB_var_Shoot-Reveal-Hamster_en_261124_Christy_AppLovin.html';
const outputHtmlPath = path.resolve(distDir, outputFilename);

const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
};

function fileToDataUri(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_BY_EXT[ext] || 'application/octet-stream';
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

// 1. Read built index.html from dist/
const distIndexPath = path.resolve(distDir, 'index.html');
if (!fs.existsSync(distIndexPath)) {
  console.error('dist/index.html not found. Run `vite build` first.');
  process.exit(1);
}

const builtHtml = fs.readFileSync(distIndexPath, 'utf8');

// 2. Collect built CSS
let inlinedCss = '';
const cssMatches = builtHtml.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*\/?>/gi);
for (const m of cssMatches) {
  const cssPath = path.resolve(distDir, m[1].replace(/^\//, ''));
  if (fs.existsSync(cssPath)) {
    inlinedCss += fs.readFileSync(cssPath, 'utf8') + '\n';
  }
}

// 3. Collect built JS and inline all referenced /assets/... media as Base64 data URIs
let inlinedJs = '';
const scriptMatches = builtHtml.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/gi);
for (const m of scriptMatches) {
  const src = m[1];
  if (src === 'mraid.js' || src.endsWith('/mraid.js')) continue;
  const jsPath = path.resolve(distDir, src.replace(/^\//, ''));
  if (!fs.existsSync(jsPath)) continue;

  let js = fs.readFileSync(jsPath, 'utf8');
  const assetRefs = new Set(
    js.match(/\/assets\/[A-Za-z0-9_.\-\/]+\.(?:png|jpg|jpeg|webp|svg|mp3|wav|ogg)/g) || []
  );
  let embeddedCount = 0;
  const assetMap = {};
  for (const ref of assetRefs) {
    // Skip unused mascot PNGs so only the selected progress-bar runner is embedded in the ad bundle
    if (allMascotAssets.has(ref) && ref !== activeMascotAsset) {
      continue;
    }
    const candidatePublic = path.resolve(publicDir, ref.replace(/^\//, ''));
    const candidateDist = path.resolve(distDir, ref.replace(/^\//, ''));
    const actualPath = fs.existsSync(candidatePublic)
      ? candidatePublic
      : fs.existsSync(candidateDist)
        ? candidateDist
        : null;
    if (!actualPath) {
      console.warn(`Warning: asset referenced in bundle not found on disk: ${ref}`);
      continue;
    }
    assetMap[ref] = fileToDataUri(actualPath);
    // Replace double-, single-, and backtick-quoted literals referencing this asset with a deduplicated lookup
    js = js.split(`"${ref}"`).join(`__A["${ref}"]`);
    js = js.split(`'${ref}'`).join(`__A["${ref}"]`);
    js = js.split('`' + ref + '`').join(`__A["${ref}"]`);
    embeddedCount++;
    const sizeKb = (fs.statSync(actualPath).size / 1024).toFixed(1);
    console.log(`  Embedded ${ref} (${sizeKb} KB raw)`);
  }
  console.log(`Total embedded media assets: ${embeddedCount}`);
  inlinedJs += `var __A=${JSON.stringify(assetMap)};\n` + js + '\n';
}

// Escape any literal "<script" or "</script" inside JS string literals so ad-network
// HTML rewriters (e.g. AppLovin ALMraid injector) NEVER misparse script boundaries!
const safeJs = inlinedJs
  .replace(/<\/script/gi, '\\x3c/script')
  .replace(/<script/gi, '\\x3cscript');

// Assemble clean, classic-script AppLovin-compatible single HTML:
// - <head> has ONLY meta, title, and <style> (zero scripts in head)
// - <body> has <div id="root"></div>, <script src="mraid.js"></script>, and classic IIFE <script>
const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>Jewel Bloom: Hamster Bead Pop</title>
<style>${inlinedCss}</style>
</head>
<body>
<div id="root"></div>
<script src="mraid.js"></script>
<script>(function(){/*__PLAYABLE_TEMPLATE_INJECT__*/${safeJs}})();</script>
</body>
</html>`;

fs.writeFileSync(outputHtmlPath, finalHtml, 'utf8');

// Sanity-check script tag balance
const openScripts = (finalHtml.match(/<script/gi) || []).length;
const closeScripts = (finalHtml.match(/<\/script>/gi) || []).length;
console.log(`Script tag balance check: <script = ${openScripts}, </script> = ${closeScripts}`);
if (openScripts !== 2 || closeScripts !== 2) {
  console.error('ERROR: Unexpected script tag count in output HTML!');
  process.exit(1);
}

const finalBytes = fs.statSync(outputHtmlPath).size;
const finalMb = (finalBytes / (1024 * 1024)).toFixed(2);
const limitBytes = 5 * 1024 * 1024;
console.log(`\nBuilt AppLovin single-file playable: ${outputHtmlPath}`);
console.log(`Final size: ${finalMb} MB (${finalBytes.toLocaleString()} bytes) / 5.00 MB limit`);
if (finalBytes > limitBytes) {
  console.error('ERROR: Single-file playable exceeds AppLovin 5 MB limit!');
  process.exit(1);
}
console.log('PASS: Size is within AppLovin <= 5 MB requirement!');
