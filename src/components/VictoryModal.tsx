import React from 'react';
import { RotateCcw } from 'lucide-react';
import { t } from '../utils/i18n';

interface VictoryModalProps {
  onPlayNow: () => void;
  onReplay: () => void;
  victoryImageSrc?: string | null;
}

const CONFETTI_PIECES = [
  { left: '8%', delay: '0s', color: '#ffd93d', size: 'w-2.5 h-2.5 rounded-sm' },
  { left: '20%', delay: '0.45s', color: '#ff5c77', size: 'w-2 h-3 rounded-xs' },
  { left: '34%', delay: '0.9s', color: '#4ee669', size: 'w-2.5 h-2 rounded-sm' },
  { left: '52%', delay: '0.2s', color: '#38bdf8', size: 'w-2 h-2.5 rounded-full' },
  { left: '68%', delay: '0.7s', color: '#ffd93d', size: 'w-3 h-2 rounded-sm' },
  { left: '82%', delay: '0.35s', color: '#ff6b9d', size: 'w-2 h-2.5 rounded-xs' },
  { left: '91%', delay: '1.1s', color: '#a78bfa', size: 'w-2.5 h-2.5 rounded-full' },
];

const RoyalStar: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={`drop-shadow-[0_4px_5px_rgba(91,26,6,0.45)] ${className}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="rm-star-gold" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="#fff7a8" />
        <stop offset="38%" stopColor="#ffd426" />
        <stop offset="78%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#c96b04" />
      </linearGradient>
    </defs>
    <path
      d="M32 4 L39.8 20.4 L58 22.8 L44.6 35.4 L48 53.5 L32 44.6 L16 53.5 L19.4 35.4 L6 22.8 L24.2 20.4 Z"
      fill="url(#rm-star-gold)"
      stroke="#7c3405"
      strokeWidth="3.8"
      strokeLinejoin="round"
    />
    <path
      d="M32 10 L37.2 21.5 L24.5 23.2 L16.2 31.2 L19 24.5 Z"
      fill="#ffffff"
      opacity="0.5"
    />
  </svg>
);

export const VictoryModal: React.FC<VictoryModalProps> = ({
  onPlayNow,
  onReplay,
  victoryImageSrc = '/assets/aistudio/level_200220_hamster_f3b8ee93.png',
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Level Complete"
      onClick={onPlayNow}
      className="absolute inset-0 z-40 flex items-center justify-center p-5 bg-[#101c3a]/72 backdrop-blur-[3px] overflow-hidden cursor-pointer"
    >
      {/* Celebratory falling confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {CONFETTI_PIECES.map((c, idx) => (
          <span
            key={idx}
            className={`absolute top-4 animate-rm-confetti ${c.size}`}
            style={{
              left: c.left,
              backgroundColor: c.color,
              animationDelay: c.delay,
            }}
          />
        ))}
      </div>

      {/* Royal Match Style Center Modal */}
      <div className="relative w-full max-w-[310px] animate-rm-modal-pop pt-14">
        {/* Top Floating 3-Star Arch perched cleanly above the red ribbon */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-30 flex items-end justify-center gap-1">
          <div className="translate-y-2 -rotate-12 animate-rm-star-1">
            <RoyalStar size={42} />
          </div>
          <div className="-translate-y-1.5 z-10 animate-rm-star-2">
            <RoyalStar size={56} />
          </div>
          <div className="translate-y-2 rotate-12 animate-rm-star-3">
            <RoyalStar size={42} />
          </div>
        </div>

        {/* Ornate Royal Blue + Metallic Gold Outer Frame */}
        <div
          className="relative rounded-[28px] p-[6px] shadow-[0_18px_40px_rgba(9,16,42,0.65)]"
          style={{
            background: 'linear-gradient(180deg, #ffe97d 0%, #f5b316 42%, #b86804 100%)',
          }}
        >
          {/* Royal Blue Bezel */}
          <div
            className="relative rounded-[23px] p-[7px]"
            style={{
              background: 'linear-gradient(180deg, #3b7ef6 0%, #1d4ed8 48%, #13318c 100%)',
              boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.45), inset 0 -3px 5px rgba(8,19,58,0.6)',
            }}
          >
            {/* Curved Royal Red Ribbon Header */}
            <div className="relative -mt-4 mb-2.5 flex items-center justify-center z-20">
              {/* Left & right ribbon tails */}
              <div
                className="absolute -left-2 top-2.5 w-8 h-7 rounded-l-md -skew-y-6"
                style={{
                  background: 'linear-gradient(180deg, #b91c1c 0%, #7f1d1d 100%)',
                  border: '2px solid #fbbf24',
                }}
                aria-hidden="true"
              />
              <div
                className="absolute -right-2 top-2.5 w-8 h-7 rounded-r-md skew-y-6"
                style={{
                  background: 'linear-gradient(180deg, #b91c1c 0%, #7f1d1d 100%)',
                  border: '2px solid #fbbf24',
                }}
                aria-hidden="true"
              />
              {/* Main glossy ribbon banner */}
              <div
                className="relative px-7 py-2 rounded-2xl shadow-[0_5px_10px_rgba(66,17,3,0.45)]"
                style={{
                  background: 'linear-gradient(180deg, #ff5e57 0%, #e11d2a 55%, #a80d19 100%)',
                  border: '2.5px solid #ffd95a',
                  boxShadow:
                    'inset 0 2px 2px rgba(255,255,255,0.45), 0 4px 10px rgba(32, 10, 4, 0.45)',
                }}
              >
                <h2 className="font-display font-black text-xl sm:text-[22px] tracking-wide uppercase royal-text-stroke leading-none whitespace-nowrap">
                  {t.victoryTitle}
                </h2>
              </div>
            </div>

            {/* Warm Ivory Inner Card Showcase */}
            <div
              className="relative rounded-[18px] px-4 pt-3 pb-4 flex flex-col items-center overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #fffdf5 0%, #faeccb 100%)',
                border: '2px solid #f6c959',
                boxShadow: 'inset 0 3px 8px rgba(133, 89, 18, 0.18)',
              }}
            >
              {/* Completed Hamster Artwork Medallion with Rotating Golden Sunburst */}
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center my-1">
                {/* Rotating golden sunburst rays */}
                <div
                  className="pointer-events-none absolute -inset-4 rounded-full opacity-55 animate-rm-sunburst"
                  style={{
                    background:
                      'repeating-conic-gradient(from 0deg, rgba(255, 211, 77, 0.55) 0deg 15deg, rgba(255, 248, 220, 0) 15deg 30deg)',
                    maskImage: 'radial-gradient(circle, black 35%, transparent 72%)',
                    WebkitMaskImage: 'radial-gradient(circle, black 35%, transparent 72%)',
                  }}
                  aria-hidden="true"
                />

                {/* Soft glowing pedestal halo */}
                <div
                  className="pointer-events-none absolute inset-3 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 232, 152, 0.55) 55%, rgba(255, 232, 152, 0) 75%)',
                  }}
                  aria-hidden="true"
                />

                {/* Completed Pixel-Bead Portrait */}
                <img
                  src={victoryImageSrc || '/assets/aistudio/level_200220_hamster_f3b8ee93.png'}
                  alt="Completed bead puzzle"
                  referrerPolicy="no-referrer"
                  className="relative z-10 w-36 h-36 sm:w-40 sm:h-40 object-contain drop-shadow-[0_10px_14px_rgba(68,42,10,0.3)] animate-rm-hamster-float select-none"
                />
              </div>

              {/* Juicy 3D Glossy Royal Match Primary Button */}
              <button
                type="button"
                onClick={onPlayNow}
                className="relative w-full mt-2 py-3 px-6 rounded-2xl cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                style={{
                  background: 'linear-gradient(180deg, #74eb3b 0%, #38b814 54%, #228e08 100%)',
                  border: '2.5px solid #e7ff9e',
                  boxShadow:
                    '0 5px 0 #156604, 0 8px 16px rgba(21, 102, 4, 0.42), inset 0 2px 3px rgba(255, 255, 255, 0.6)',
                }}
              >
                <span
                  className="pointer-events-none absolute top-1 left-4 right-4 h-2.5 rounded-full bg-white/30"
                  aria-hidden="true"
                />
                <span className="relative font-display font-black text-lg sm:text-xl tracking-wide royal-btn-stroke">
                  {t.playNow}
                </span>
              </button>

              {/* Subtle Royal Blue Secondary Replay Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReplay();
                }}
                className="mt-3 inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-display font-bold text-[#1d4ed8] hover:text-[#1e3a8a] hover:bg-[#f2dfb4]/70 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.replay}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
