import React, { useEffect } from 'react';
import { BEAD_PALETTE } from '../data/hamsterLevel';
import type { BeadColorKey, LevelRuntime } from '../data/levelTemplate';

export interface ActiveProjectile {
  id: string;
  slotIndex: number;
  color: BeadColorKey;
  targetRow: number;
  targetCol: number;
  startedAt: number;
  duration: number;
  arcDirection: number;
}

interface ProjectileOverlayProps {
  level: LevelRuntime;
  playfieldRef: React.RefObject<HTMLDivElement | null>;
  boardCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  slotRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
  projectilesRef: React.MutableRefObject<ActiveProjectile[]>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

function evalQuad(
  t: number,
  sx: number,
  sy: number,
  mx: number,
  my: number,
  ex: number,
  ey: number
): [number, number] {
  const inv = 1 - t;
  return [
    inv * inv * sx + 2 * inv * t * mx + t * t * ex,
    inv * inv * sy + 2 * inv * t * my + t * t * ey,
  ];
}

export const ProjectileOverlay: React.FC<ProjectileOverlayProps> = ({
  level,
  playfieldRef,
  boardCanvasRef,
  slotRefs,
  projectilesRef,
  overlayCanvasRef,
}) => {
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    let animId = 0;

    // Cache layout geometry to avoid 200+ forced getBoundingClientRect() reflows/sec on mobile!
    let cachedW = 0;
    let cachedH = 0;
    let cachedBoardOriginX = 0;
    let cachedBoardOriginY = 0;
    let cachedCellSize = 0;
    let cachedSlotStarts: Array<{ x: number; y: number } | null> = [];
    let layoutDirty = true;
    let lastLayoutSyncAt = 0;

    const markDirty = () => {
      layoutDirty = true;
    };
    window.addEventListener('resize', markDirty);
    window.addEventListener('orientationchange', markDirty);

    const syncLayout = (now: number) => {
      const container = playfieldRef.current;
      const boardCanvas = boardCanvasRef.current;
      if (!container || !boardCanvas) return false;

      const cRect = container.getBoundingClientRect();
      const bRect = boardCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const targetW = Math.max(1, Math.round(cRect.width * dpr));
      const targetH = Math.max(1, Math.round(cRect.height * dpr));

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const zoomScale = boardCanvas.offsetWidth > 0 ? bRect.width / boardCanvas.offsetWidth : 1;
      const pad = 2 * zoomScale;
      const innerW = bRect.width - pad * 2;
      const innerH = bRect.height - pad * 2;
      const cellSize = Math.min(innerW / level.cols, innerH / level.rows);
      const boardW = cellSize * level.cols;
      const boardH = cellSize * level.rows;

      cachedW = cRect.width;
      cachedH = cRect.height;
      cachedCellSize = cellSize;
      cachedBoardOriginX = bRect.left - cRect.left + (bRect.width - boardW) / 2;
      cachedBoardOriginY = bRect.top - cRect.top + (bRect.height - boardH) / 2;

      cachedSlotStarts = slotRefs.current.map((slotEl) => {
        if (!slotEl) return null;
        const sRect = slotEl.getBoundingClientRect();
        return {
          x: sRect.left - cRect.left + sRect.width / 2,
          y: sRect.top - cRect.top + sRect.height * 0.04,
        };
      });

      layoutDirty = false;
      lastLayoutSyncAt = now;
      return true;
    };

    let lastHadProjectiles = false;

    const render = (now: number) => {
      const list = projectilesRef.current;
      if (list.length === 0) {
        if (lastHadProjectiles) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          lastHadProjectiles = false;
        }
        animId = requestAnimationFrame(render);
        return;
      }

      // Refresh cached rects at most every 250ms while active (keeps zoomed/panned landing accurate with 0 reflow stutter)
      if (layoutDirty || !lastHadProjectiles || now - lastLayoutSyncAt > 250) {
        if (!syncLayout(now)) {
          animId = requestAnimationFrame(render);
          return;
        }
      }
      lastHadProjectiles = true;

      const ctx = canvas.getContext('2d');
      if (!ctx || cachedW <= 0 || cachedH <= 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const dpr = canvas.width / cachedW;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cachedW, cachedH);

      const cellSize = cachedCellSize;
      const boardOriginX = cachedBoardOriginX;
      const boardOriginY = cachedBoardOriginY;

      for (const p of list) {
        const rawT = Math.min(1, Math.max(0, (now - p.startedAt) / p.duration));
        const t =
          rawT < 0.35
            ? (rawT / 0.35) * 0.28
            : 0.28 + Math.pow((rawT - 0.35) / 0.65, 1.65) * 0.72;

        const start = cachedSlotStarts[p.slotIndex];
        if (!start) continue;
        const startX = start.x;
        const startY = start.y;

        const endX = boardOriginX + (p.targetCol + 0.5) * cellSize;
        const endY = boardOriginY + (p.targetRow + 0.5) * cellSize;

        const dx = endX - startX;
        const dy = endY - startY;
        const curveSwing = p.arcDirection * Math.min(54, Math.abs(dy) * 0.18 + 18);
        const midX = (startX + endX) / 2 + dx * 0.2 + curveSwing;
        const midY = (startY + endY) / 2 - 26;

        const [x, y] = evalQuad(t, startX, startY, midX, midY, endX, endY);
        const prevT = Math.max(0, t - 0.04);
        const [px, py] = evalQuad(prevT, startX, startY, midX, midY, endX, endY);
        const angle = Math.atan2(y - py, x - px);

        const meta = level.palette[p.color] ?? BEAD_PALETTE.K;
        const baseRadius = Math.max(5.8, cellSize * 0.58);
        const radius =
          rawT > 0.82
            ? baseRadius * (1.12 - ((rawT - 0.82) / 0.18) * 0.32)
            : baseRadius * (0.9 + Math.sin(t * Math.PI) * 0.36);

        if (rawT < 0.24) {
          const puffAlpha = (1 - rawT / 0.24) * 0.65;
          const puffR = baseRadius * (0.65 + rawT * 2.1);
          ctx.globalAlpha = puffAlpha;
          ctx.fillStyle = meta.light;
          ctx.beginPath();
          ctx.arc(startX, startY, puffR, 0, Math.PI * 2);
          ctx.fill();
        }

        if (rawT > 0.6) {
          const st = (rawT - 0.6) / 0.4;
          const ringR = cellSize * (1.45 - st * 1.05);
          ctx.globalAlpha = st * 0.78;
          ctx.strokeStyle = meta.light;
          ctx.lineWidth = 2.1;
          ctx.beginPath();
          ctx.arc(endX, endY, Math.max(2, ringR), 0, Math.PI * 2);
          ctx.stroke();
        }

        const steps = 4;
        ctx.strokeStyle = meta.light;
        ctx.lineCap = 'round';
        for (let s = 0; s < steps; s++) {
          const t0 = Math.max(0, t - (steps - s) * 0.05);
          const t1 = Math.max(0, t - (steps - s - 1) * 0.05);
          const [x0, y0] = evalQuad(t0, startX, startY, midX, midY, endX, endY);
          const [x1, y1] = evalQuad(t1, startX, startY, midX, midY, endX, endY);
          const ratio = (s + 1) / steps;
          ctx.globalAlpha = ratio * 0.58;
          ctx.lineWidth = radius * 1.2 * ratio;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.24)';
        ctx.beginPath();
        ctx.arc(x + 2, y + 4, radius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        const stretch = rawT > 0.35 ? 1 + Math.min(0.32, (rawT - 0.35) * 0.5) : 1;
        const squash = 1 / Math.sqrt(stretch);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(stretch, squash);

        ctx.fillStyle = meta.base;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = meta.light;
        ctx.beginPath();
        ctx.arc(-radius * 0.14, -radius * 0.16, radius * 0.64, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#151823';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.beginPath();
        ctx.arc(-radius * 0.28, -radius * 0.3, radius * 0.28, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', markDirty);
      window.removeEventListener('orientationchange', markDirty);
    };
  }, [level, boardCanvasRef, overlayCanvasRef, playfieldRef, projectilesRef, slotRefs]);

  return (
    <canvas
      ref={overlayCanvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full z-20"
      aria-hidden="true"
    />
  );
};
