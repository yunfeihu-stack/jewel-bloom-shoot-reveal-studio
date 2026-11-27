import React from 'react';
import { t } from '../utils/i18n';

export interface PraisePopup {
  id: string;
  word: 'NICE!' | 'GREAT!' | 'AMAZING!' | 'BRILLIANT!' | 'FANTASTIC!';
  combo: number;
  offsetX: number; // slight horizontal variance in %
}

interface ComboPraiseOverlayProps {
  popups: PraisePopup[];
}

const PRAISE_PALETTES: Record<
  PraisePopup['word'],
  { top: string; mid: string; bottom: string; stroke: string; badgeBg: string }
> = {
  'NICE!': {
    top: '#fff9b0',
    mid: '#ffd43b',
    bottom: '#f59f00',
    stroke: '#663000',
    badgeBg: 'linear-gradient(180deg, #ff922b 0%, #d9480f 100%)',
  },
  'GREAT!': {
    top: '#d3f9d8',
    mid: '#51cf66',
    bottom: '#2b8a3e',
    stroke: '#0b3b18',
    badgeBg: 'linear-gradient(180deg, #40c057 0%, #2b8a3e 100%)',
  },
  'AMAZING!': {
    top: '#c5f6fa',
    mid: '#3bc9db',
    bottom: '#1098ad',
    stroke: '#083344',
    badgeBg: 'linear-gradient(180deg, #22b8cf 0%, #0c8599 100%)',
  },
  'BRILLIANT!': {
    top: '#ffdeeb',
    mid: '#f06595',
    bottom: '#c2255c',
    stroke: '#590d2a',
    badgeBg: 'linear-gradient(180deg, #f06595 0%, #a61e4d 100%)',
  },
  'FANTASTIC!': {
    top: '#fff3bf',
    mid: '#ff8787',
    bottom: '#ae3ec9',
    stroke: '#3b0764',
    badgeBg: 'linear-gradient(180deg, #cc5de8 0%, #7048e8 100%)',
  },
};

const SparkleStar: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = '#fff4b8',
}) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    className={`animate-praise-sparkle drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] ${className}`}
    aria-hidden="true"
  >
    <path
      d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z"
      fill={color}
      stroke="#7c3405"
      strokeWidth="1.2"
    />
  </svg>
);

export const ComboPraiseOverlay: React.FC<ComboPraiseOverlayProps> = ({ popups }) => {
  if (popups.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-[14%] z-30 h-32 overflow-visible"
      aria-hidden="true"
    >
      {popups.map((item) => {
        const pal = PRAISE_PALETTES[item.word];
        const gradId = `praise-grad-${item.id}`;

        return (
          <div
            key={item.id}
            className="absolute top-2 flex flex-col items-center animate-praise-float"
            style={{ left: `${50 + item.offsetX}%` }}
          >
            {/* Starburst accents around praise word */}
            <SparkleStar className="absolute -left-5 -top-2 w-4 h-4" color="#fff9c4" />
            <SparkleStar className="absolute -right-5 -top-1 w-5 h-5" color="#ffd43b" />
            <SparkleStar className="absolute right-2 -bottom-2 w-3.5 h-3.5" color="#ffffff" />

            {/* Crisp SVG gradient + thick cartoon stroke typography */}
            <svg
              width="250"
              height="52"
              viewBox="0 0 250 52"
              className="overflow-visible drop-shadow-[0_5px_6px_rgba(24,18,10,0.38)]"
            >
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={pal.top} />
                  <stop offset="52%" stopColor={pal.mid} />
                  <stop offset="100%" stopColor={pal.bottom} />
                </linearGradient>
              </defs>
              <text
                x="125"
                y="38"
                textAnchor="middle"
                className="font-display font-black uppercase"
                style={{
                  fontSize: '32px',
                  letterSpacing: '0.03em',
                  paintOrder: 'stroke fill',
                  stroke: pal.stroke,
                  strokeWidth: '8px',
                  strokeLinejoin: 'round',
                  fill: `url(#${gradId})`,
                }}
              >
                {t.praise[item.word]}
              </text>
            </svg>
          </div>
        );
      })}
    </div>
  );
};
