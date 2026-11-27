import React from 'react';
import { RotateCcw } from 'lucide-react';
import { t } from '../utils/i18n';

interface FailModalProps {
  remainingBeads: number;
  onMoreLevels: () => void;
  onTryAgain: () => void;
}

export const FailModal: React.FC<FailModalProps> = ({
  remainingBeads,
  onMoreLevels,
  onTryAgain,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Level Failed"
      className="absolute inset-0 z-40 flex items-center justify-center p-5 bg-[#101c3a]/72 backdrop-blur-[3px]"
    >
      {/* Royal Match Style Center Fail Modal */}
      <div className="relative w-full max-w-[310px] animate-rm-modal-pop pt-7">
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
            {/* Curved Royal Crimson Ribbon Header */}
            <div className="relative -mt-6 mb-2.5 flex items-center justify-center z-20">
              <div
                className="absolute -left-2 top-2.5 w-8 h-7 rounded-l-md -skew-y-6"
                style={{
                  background: 'linear-gradient(180deg, #991b1b 0%, #6b1111 100%)',
                  border: '2px solid #fbbf24',
                }}
                aria-hidden="true"
              />
              <div
                className="absolute -right-2 top-2.5 w-8 h-7 rounded-r-md skew-y-6"
                style={{
                  background: 'linear-gradient(180deg, #991b1b 0%, #6b1111 100%)',
                  border: '2px solid #fbbf24',
                }}
                aria-hidden="true"
              />
              <div
                className="relative px-6 py-2 rounded-2xl shadow-[0_5px_10px_rgba(66,17,3,0.45)]"
                style={{
                  background: 'linear-gradient(180deg, #ff5e57 0%, #dc1c2a 55%, #9b0c18 100%)',
                  border: '2.5px solid #ffd95a',
                  boxShadow:
                    'inset 0 2px 2px rgba(255,255,255,0.45), 0 4px 10px rgba(32, 10, 4, 0.45)',
                }}
              >
                <h2 className="font-display font-black text-lg sm:text-[21px] tracking-wide uppercase royal-text-stroke leading-none whitespace-nowrap">
                  {t.failTitle}
                </h2>
              </div>
            </div>

            {/* Warm Ivory Inner Card */}
            <div
              className="relative rounded-[18px] px-4 pt-4 pb-5 flex flex-col items-center text-center overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #fffdf5 0%, #faeccb 100%)',
                border: '2px solid #f6c959',
                boxShadow: 'inset 0 3px 8px rgba(133, 89, 18, 0.18)',
              }}
            >
              {/* Glossy Royal Match Broken-Heart / Out-of-Moves Emblem */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-2.5 shadow-[0_6px_12px_rgba(153,27,27,0.3)]"
                style={{
                  background: 'linear-gradient(180deg, #ff7a75 0%, #e11d48 58%, #9f1239 100%)',
                  border: '3px solid #fde047',
                  boxShadow:
                    'inset 0 2px 4px rgba(255,255,255,0.5), 0 6px 12px rgba(127, 29, 29, 0.35)',
                }}
                aria-hidden="true"
              >
                <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                  <path
                    d="M18 30.5C18 30.5 5 22.2 5 12.6C5 8.4 8.3 5 12.4 5C14.9 5 17 6.3 18 8.2C19 6.3 21.1 5 23.6 5C27.7 5 31 8.4 31 12.6C31 22.2 18 30.5 18 30.5Z"
                    fill="#fff1f2"
                    stroke="#7f1d1d"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.5 8.5L15.2 15.2L20.5 18.2L16.8 26.5"
                    stroke="#be123c"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p className="font-display font-bold text-sm text-[#5c3d12] mb-4 leading-snug">
                {t.failLine1}
                <br />
                <span className="text-xs font-semibold text-[#8c6223]">
                  {t.failRemainingBefore}
                  <span className="font-mono-tabular font-extrabold text-[#c2410c]">
                    {remainingBeads}
                  </span>
                  {t.failRemainingAfter}
                </span>
              </p>

              {/* Primary 3D Glossy Green CTA: More Levels (redirects to store) */}
              <button
                type="button"
                onClick={onMoreLevels}
                className="relative w-full py-3 px-6 rounded-2xl cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
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
                <span className="relative font-display font-black text-lg tracking-wide royal-btn-stroke">
                  {t.moreLevels}
                </span>
              </button>

              {/* Secondary 3D Glossy Royal Blue Button: Try Again */}
              <button
                type="button"
                onClick={onTryAgain}
                className="relative w-full mt-3 py-2.5 px-6 rounded-2xl cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 inline-flex items-center justify-center gap-1.5"
                style={{
                  background: 'linear-gradient(180deg, #56a8ff 0%, #2563eb 54%, #1d4ed8 100%)',
                  border: '2.5px solid #bfdbfe',
                  boxShadow:
                    '0 4px 0 #1e3a8a, 0 6px 12px rgba(30, 58, 138, 0.35), inset 0 2px 3px rgba(255, 255, 255, 0.55)',
                }}
              >
                <span
                  className="pointer-events-none absolute top-1 left-4 right-4 h-2 rounded-full bg-white/30"
                  aria-hidden="true"
                />
                <RotateCcw className="relative w-4 h-4 text-white drop-shadow" aria-hidden="true" />
                <span className="relative font-display font-black text-base tracking-wide text-white drop-shadow-[0_2px_0_rgba(15,35,95,0.85)]">
                  {t.tryAgain}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
