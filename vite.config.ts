import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Dev-only API for 1-click saving template.config.json & exporting AppLovin single-file HTML
      {
        name: 'playable-template-export-api',
        apply: 'serve',
        configureServer(server) {
          server.middlewares.use('/api/export-applovin', (req, res, next) => {
            if (req.method !== 'POST') {
              next();
              return;
            }
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body || '{}');
                const safeName = String(payload.outputFilename || 'Playable_AppLovin.html')
                  .replace(/[\/\\:*?"<>|]/g, '_')
                  .replace(/(\.html)?$/i, '.html');
                const configToSave = {
                  mascotId: payload.mascotId || 'hamster',
                  customMascotDataUrl: payload.customMascotDataUrl ?? null,
                  levelJson: payload.levelJson ?? null,
                  victoryImageDataUrl: payload.victoryImageDataUrl ?? null,
                  outputFilename: safeName,
                };
                const configPath = path.resolve(__dirname, 'template.config.json');
                fs.writeFileSync(configPath, JSON.stringify(configToSave, null, 2), 'utf8');

                execSync('npm run build:applovin', {cwd: __dirname, stdio: 'pipe'});
                const outPath = path.resolve(__dirname, 'dist', safeName);
                const sizeMb = fs.existsSync(outPath)
                  ? (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2)
                  : '0.00';

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ok: true, outputPath: `dist/${safeName}`, sizeMb}));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    ok: false,
                    error: err instanceof Error ? err.message : 'Export failed',
                  }),
                );
              }
            });
          });
        },
      },
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
