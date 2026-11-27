import React from 'react';

interface PlayableCtaBarProps {
  onPlayNow: () => void;
}

export const PlayableCtaBar: React.FC<PlayableCtaBarProps> = ({ onPlayNow }) => {
  return (
    <div
      className="w-full bg-[#fdf6e8] border-t border-[#e5d5b6] px-4 pt-2.5 flex items-center justify-between gap-3"
      style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
    >
      {/* Left: Jewel Bloom square icon + crisp vector title & 5 stars */}
      <div className="flex items-center gap-2.5 min-w-0 shrink">
        <img
          src="/assets/aistudio/jewel_bloom_icon.png"
          alt="Jewel Bloom"
          referrerPolicy="no-referrer"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain shrink-0 select-none shadow-xs"
        />
        <div className="flex flex-col justify-center min-w-0">
          <span className="font-display font-black text-[15px] sm:text-base leading-tight text-[#1e1912] tracking-tight truncate">
            Jewel Bloom
          </span>
          <div className="flex items-center gap-0.5 mt-0.5" aria-label="5 out of 5 stars">
            {[0, 1, 2, 3, 4].map((idx) => (
              <svg
                key={idx}
                viewBox="0 0 20 20"
                className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_1px_0_rgba(180,83,9,0.45)]"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10 1.4l2.58 5.23 5.77.84-4.18 4.07.99 5.75L10 14.58l-5.16 2.71.99-5.75-4.18-4.07 5.77-.84L10 1.4z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Provided green button asset with "Play Now" label */}
      <button
        type="button"
        onClick={onPlayNow}
        className="relative shrink-0 h-11 sm:h-12 inline-flex items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 rounded-xl"
        aria-label="Play Now"
      >
        <img
          src="/assets/aistudio/u_009_4778df67.png"
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="h-full w-auto object-contain select-none pointer-events-none"
        />
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-white text-base sm:text-lg tracking-tight whitespace-nowrap pointer-events-none"
          style={{
            textShadow: '0 1.5px 2px rgba(20, 70, 5, 0.75)',
          }}
        >
          Play Now
        </span>
      </button>
    </div>
  );
};
