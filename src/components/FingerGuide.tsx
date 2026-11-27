import React, { useEffect, useRef } from 'react';

// Normalized atlas bounds from finger_Barehands.atlas.txt (base size: 1974 x 506)
// Sprite "2" has rotate:90 in Spine, so its atlas rect is 512w x 502h in the PNG
const ATLAS_W = 1974;
const ATLAS_H = 506;
const HAND_RECT = { x: 2 / ATLAS_W, y: 2 / ATLAS_H, w: 512 / ATLAS_W, h: 502 / ATLAS_H };
const RIPPLE_RECT = { x: 1029 / ATLAS_W, y: 84 / ATLAS_H, w: 420 / ATLAS_W, h: 420 / ATLAS_H };

let cachedAtlasImg: HTMLImageElement | null = null;
let atlasLoading = false;
const atlasListeners = new Set<() => void>();

function getFingerAtlasImage(onLoad: () => void): HTMLImageElement | null {
  if (cachedAtlasImg && cachedAtlasImg.complete && cachedAtlasImg.naturalWidth > 0) {
    return cachedAtlasImg;
  }
  atlasListeners.add(onLoad);
  if (!atlasLoading && typeof window !== 'undefined') {
    atlasLoading = true;
    const img = new Image();
    img.src = '/assets/finger/finger_Barehands.png';
    img.onload = () => {
      cachedAtlasImg = img;
      atlasListeners.forEach((cb) => cb());
      atlasListeners.clear();
    };
  }
  return null;
}

export const FingerGuide: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId = 0;
    let img = getFingerAtlasImage(() => {
      img = cachedAtlasImg;
    });

    const startTime = performance.now();
    const cycleMs = 680; // Matches Spine "click" animation (~0.6s-0.68s)

    const render = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const cssW = 116;
      const cssH = 116;
      const targetW = Math.round(cssW * dpr);
      const targetH = Math.round(cssH * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, cssW, cssH);

        const p = ((now - startTime) % cycleMs) / cycleMs;
        // Spine click curve: press down quickly (0 -> 0.42), rebound smoothly (0.42 -> 1.0)
        const press =
          p < 0.42
            ? Math.sin((p / 0.42) * (Math.PI / 2))
            : Math.cos(((p - 0.42) / 0.58) * (Math.PI / 2));

        // Fingertip contact point sits at (30, 36) inside the 116x116 overlay
        const tipX = 30;
        const tipY = 36;

        if (img && img.naturalWidth > 0) {
          const iw = img.naturalWidth;
          const ih = img.naturalHeight;

          // 1. Expanding white tap ripple (sp_1) right under the fingertip on press
          const ripplePhase = (p + 0.72) % 1;
          if (ripplePhase < 0.72) {
            const rt = ripplePhase / 0.72;
            const rippleAlpha = rt < 0.25 ? (rt / 0.25) * 0.75 : (1 - (rt - 0.25) / 0.75) * 0.75;
            const rippleSize = 18 + rt * 44;
            ctx.save();
            ctx.globalAlpha = Math.max(0, rippleAlpha);
            ctx.drawImage(
              img,
              RIPPLE_RECT.x * iw,
              RIPPLE_RECT.y * ih,
              RIPPLE_RECT.w * iw,
              RIPPLE_RECT.h * ih,
              tipX - rippleSize / 2,
              tipY - rippleSize / 2,
              rippleSize,
              rippleSize
            );
            ctx.restore();
          }

          // 2. Pointing hand (sprite "2", index fingertip at bottom-left of sprite ~ (0.04, 0.94))
          const drawW = 78;
          const drawH = 76;
          const scale = 1 - press * 0.13;
          const offsetX = 7 - press * 7;
          const offsetY = -10 + press * 10;
          const angleRad = ((-4 + press * 7) * Math.PI) / 180;

          ctx.save();
          ctx.translate(tipX + offsetX, tipY + offsetY);
          ctx.rotate(angleRad);
          ctx.scale(scale, scale);

          // Anchor sprite so its bottom-left index fingertip touches (0, 0)
          ctx.rotate((72 * Math.PI) / 180);
          ctx.drawImage(
            img,
            HAND_RECT.x * iw,
            HAND_RECT.y * ih,
            HAND_RECT.w * iw,
            HAND_RECT.h * ih,
            -drawW * 0.06,
            -drawH * 0.94,
            drawW,
            drawH
          );
          ctx.restore();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={116}
      height={116}
      aria-hidden="true"
      className="pointer-events-none absolute -right-12 -bottom-11 z-30 w-[116px] h-[116px]"
    />
  );
};
