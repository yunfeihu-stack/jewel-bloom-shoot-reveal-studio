import React from 'react';

interface ProgressBarProps {
  filledCount: number;
  totalBeads: number;
  isVictory: boolean;
  mascotSrc?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  filledCount,
  totalBeads,
  isVictory,
  mascotSrc = '/assets/chibi_hamster_runner.png',
}) => {
  const rawRatio = Math.min(1, Math.max(0, totalBeads > 0 ? filledCount / totalBeads : 0));
  // Front-loaded ease curve so the little hamster bounds out past the top-left badge right on the first burst!
  const visualRatio = isVictory ? 1 : rawRatio === 0 ? 0 : Math.pow(rawRatio, 0.68);
  const pct = isVictory ? 100 : Math.round(visualRatio * 100);
  const runnerLeft = Math.min(96, Math.max(6, pct));

  return (
    <header
      aria-label={`Progress ${pct}%`}
      className="w-full shrink-0 flex items-center gap-2.5 px-2 pt-2.5 pb-1 select-none"
    >
      {/* Full-width Ornate Warm-Gold Beveled Progress Track with Lively 3D Apple Hamster Runner */}
      <div className="relative flex-1 h-9 flex items-center">
        {/* Soft metallic gold outer bezel */}
        <div
          className="relative w-full h-[22px] sm:h-6 rounded-full p-[2.5px]"
          style={{
            background: 'linear-gradient(180deg, #f7df9d 0%, #d4ab58 55%, #a87e30 100%)',
            boxShadow:
              '0 2px 5px rgba(74, 49, 16, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
          }}
        >
          {/* Recessed warm cream channel */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #c6b290 0%, #dfd0b4 100%)',
              boxShadow: 'inset 0 2.5px 4px rgba(58, 42, 18, 0.28)',
            }}
          >
            {/* Glossy Honey-Gold to Lush-Emerald animated shimmer fill */}
            <div
              className="relative h-full rounded-full transition-[width] duration-150 ease-out overflow-hidden"
              style={{
                width: `${Math.max(rawRatio > 0 ? 8 : 0, pct)}%`,
                background:
                  'linear-gradient(90deg, #ffb338 0%, #f59e0b 38%, #84d628 76%, #45c420 100%)',
                boxShadow:
                  'inset 0 2px 2px rgba(255, 255, 255, 0.6), 0 0 8px rgba(132, 214, 40, 0.45)',
              }}
            >
              {/* Animated diagonal candy-gloss shimmer */}
              <div
                className="absolute inset-0 opacity-25 animate-progress-shimmer"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(-45deg, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 6px, transparent 6px, transparent 18px)',
                  backgroundSize: '36px 36px',
                }}
              />
              {/* Crisp top specular gloss streak */}
              <div className="absolute inset-x-1.5 top-0.5 h-1.5 rounded-full bg-white/45" />
            </div>
          </div>
        </div>

        {/* Radiant golden tip glow + twinkling sparkle trailing behind the hopping hamster */}
        {rawRatio > 0 && (
          <div
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-[left] duration-150 ease-out"
            style={{ left: `${runnerLeft}%` }}
            aria-hidden="true"
          >
            <div
              className="w-7 h-7 rounded-full opacity-75"
              style={{
                background:
                  'radial-gradient(circle, rgba(255, 245, 157, 0.9) 0%, rgba(251, 191, 36, 0) 70%)',
              }}
            />
            <svg
              viewBox="0 0 20 20"
              className="absolute -left-3.5 top-1 w-3.5 h-3.5 animate-praise-sparkle"
            >
              <path
                d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z"
                fill="#fff9c4"
                stroke="#b45309"
                strokeWidth="1"
              />
            </svg>
          </div>
        )}

        {/* Cute Semi-Realistic 3D Apple Hamster Runner hopping briskly along the progress head */}
        <div
          className="pointer-events-none absolute top-1/2 z-20 animate-hamster-runner transition-[left] duration-150 ease-out"
          style={{
            left: `${runnerLeft}%`,
          }}
        >
          <img
            src={mascotSrc}
            alt=""
            aria-hidden="true"
            className="h-12 sm:h-[54px] w-auto object-contain select-none"
            style={{
              filter: 'drop-shadow(0 4px 4px rgba(58, 36, 10, 0.35))',
            }}
          />
        </div>
      </div>

      {/* Warm Gold-Trimmed Percentage Pill */}
      <div
        className="shrink-0 min-w-[48px] px-2 py-1 rounded-xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #fffaf0 0%, #f1e1be 100%)',
          border: '1.5px solid #d4b472',
          boxShadow: '0 2px 3px rgba(74, 49, 16, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
        }}
      >
        <span
          className="font-display font-black text-sm sm:text-[15px] leading-none font-mono-tabular"
          style={{ color: '#6b4514' }}
        >
          {pct}%
        </span>
      </div>
    </header>
  );
};
