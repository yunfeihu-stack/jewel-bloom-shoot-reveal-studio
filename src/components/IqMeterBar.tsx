import React from 'react';
import { t } from '../utils/i18n';

interface IqMeterBarProps {
  filledCount: number;
  totalBeads: number;
  isVictory: boolean;
}

function lerp(a: number, b: number, tVal: number): number {
  return Math.round(a + (b - a) * tVal);
}

function rgb(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Harmonized Jewel Bloom warm palette ramp (0 -> 100):
 * Warm Cherry Coral -> Warm Honey Amber -> Play-Now Emerald Green
 */
function getHarmonizedPalette(ratio: number) {
  const c = Math.min(1, Math.max(0, ratio));
  if (c <= 0.5) {
    const k = c / 0.5;
    return {
      numFill: rgb(lerp(224, 240, k), lerp(74, 152, k), lerp(72, 24, k)),
      barTop: rgb(lerp(245, 255, k), lerp(118, 206, k), lerp(108, 92, k)),
      barMid: rgb(lerp(218, 236, k), lerp(68, 150, k), lerp(66, 20, k)),
      barBot: rgb(lerp(176, 186, k), lerp(44, 104, k), lerp(46, 10, k)),
      glow: `rgba(${lerp(224, 240, k)}, ${lerp(74, 152, k)}, ${lerp(72, 24, k)}, 0.32)`,
    };
  }
  const k = (c - 0.5) / 0.5;
  return {
    numFill: rgb(lerp(240, 74, k), lerp(152, 188, k), lerp(24, 40, k)),
    barTop: rgb(lerp(255, 134, k), lerp(206, 232, k), lerp(92, 82, k)),
    barMid: rgb(lerp(236, 68, k), lerp(150, 184, k), lerp(20, 34, k)),
    barBot: rgb(lerp(186, 44, k), lerp(104, 138, k), lerp(10, 18, k)),
    glow: `rgba(${lerp(240, 74, k)}, ${lerp(152, 188, k)}, ${lerp(24, 40, k)}, 0.32)`,
  };
}

export const IqMeterBar: React.FC<IqMeterBarProps> = ({ filledCount, totalBeads, isVictory }) => {
  const ratio = Math.min(1, Math.max(0, totalBeads > 0 ? filledCount / totalBeads : 0));
  const iqValue = isVictory ? 100 : Math.round(ratio * 100);
  const pct = iqValue;
  const isGenius = iqValue >= 85;
  const pal = getHarmonizedPalette(ratio);

  const barGradient = `linear-gradient(180deg, ${pal.barTop} 0%, ${pal.barMid} 58%, ${pal.barBot} 100%)`;

  return (
    <header
      aria-label={`${t.yourIqIs} ${iqValue}`}
      className="w-full shrink-0 flex flex-col items-center px-1.5 pt-0.5 pb-0.5 select-none"
    >
      {/* Prominent "Your IQ is" caption directly above the meter */}
      <div className="mb-1 flex items-center justify-center">
        <span
          className="font-display font-black text-sm sm:text-[15px] tracking-wide"
          style={{
            color: '#6e4c1e',
            textShadow: '0 1px 0 rgba(255, 252, 244, 0.9)',
          }}
        >
          {t.yourIqIs}
        </span>
      </div>

      {/* Cohesive warm-toned IQ meter row: big live number (0-100) -> recessed warm bar -> Einstein */}
      <div className="w-full flex items-center gap-2.5">
        {/* Left: Extra-large live IQ number shifting from warm cherry red -> honey gold -> emerald green */}
        <div className="shrink-0 min-w-[54px] sm:min-w-[62px] flex items-center justify-center">
          <span
            className="font-display font-black text-[30px] sm:text-[34px] leading-none font-mono-tabular transition-colors duration-200"
            style={{
              color: pal.numFill,
              textShadow:
                '-1.8px -1.8px 0 #472a0e, 1.8px -1.8px 0 #472a0e, -1.8px 1.8px 0 #472a0e, 1.8px 1.8px 0 #472a0e, 0 2.5px 0 #3a2109, 0 4px 6px rgba(62, 38, 12, 0.25)',
            }}
          >
            {iqValue}
          </span>
        </div>

        {/* Center: Warm recessed progress track matching the buffer dock material */}
        <div className="relative flex-1 h-6 flex items-center">
          <div
            className="relative w-full h-5 sm:h-[22px] rounded-full overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #cbb99a 0%, #dfd0b4 100%)',
              border: '2px solid #b5a17e',
              boxShadow:
                'inset 0 3px 5px rgba(58, 42, 18, 0.24), 0 1.5px 0 rgba(255, 252, 244, 0.85)',
            }}
          >
            <div
              className="relative h-full rounded-full transition-[width,background] duration-200 ease-out"
              style={{
                width: `${Math.max(ratio > 0 ? 6 : 0, pct)}%`,
                background: barGradient,
                boxShadow: `inset 0 2px 2px rgba(255, 255, 255, 0.55), 0 0 8px ${pal.glow}`,
              }}
            >
              {/* Soft glossy highlight streak */}
              <div className="absolute inset-x-1.5 top-1 h-1.5 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* Right Finish Line: Refined semi-realistic 3D Albert Einstein Avatar in warm gold frame */}
        <div
          className={`relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full p-[2.5px] transition-transform duration-300 ${
            isGenius ? 'scale-110' : 'scale-100'
          }`}
          style={{
            background: isGenius
              ? 'linear-gradient(180deg, #fff59d 0%, #f59e0b 55%, #b45309 100%)'
              : 'linear-gradient(180deg, #f3d58d 0%, #cca04b 60%, #8f6823 100%)',
            boxShadow: isGenius
              ? '0 0 14px rgba(251, 191, 36, 0.7), 0 4px 8px rgba(58, 42, 18, 0.28)'
              : '0 3px 7px rgba(58, 42, 18, 0.24)',
          }}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-[#1d4ed8]">
            <img
              src="/assets/einstein_avatar.jpg"
              alt="Albert Einstein"
              className="w-full h-full object-cover object-top select-none pointer-events-none"
            />
          </div>
          {isGenius && (
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute -top-1.5 -right-1 w-5 h-5 drop-shadow"
              aria-hidden="true"
            >
              <path
                d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z"
                fill="#fde047"
                stroke="#92400e"
                strokeWidth="1.2"
              />
            </svg>
          )}
        </div>
      </div>
    </header>
  );
};
