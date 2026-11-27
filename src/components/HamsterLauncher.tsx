import React, { useId } from 'react';
import { BEAD_PALETTE } from '../data/hamsterLevel';
import type { BeadColorKey, BeadColorMeta } from '../data/levelTemplate';

interface HamsterLauncherProps {
  color: BeadColorKey;
  ammo: number;
  palette?: Record<BeadColorKey, BeadColorMeta>;
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
  isFiring?: boolean;
  isWaiting?: boolean;
}

export const HamsterLauncher: React.FC<HamsterLauncherProps> = ({
  color,
  ammo,
  palette = BEAD_PALETTE as Record<BeadColorKey, BeadColorMeta>,
  size = 'lg',
  muted = false,
  isFiring = false,
  isWaiting = false,
}) => {
  const meta = palette[color] ?? BEAD_PALETTE.K;
  const uid = useId().replace(/:/g, '');
  const bodyGradId = `hm-body-${uid}`;
  const domeSheenId = `hm-sheen-${uid}`;
  const rimBounceId = `hm-bounce-${uid}`;
  const earGradId = `hm-ear-${uid}`;
  const snoutGradId = `hm-snout-${uid}`;

  const dimClass =
    size === 'sm'
      ? 'w-11 h-12 sm:w-12 sm:h-[52px]'
      : size === 'md'
        ? 'w-[52px] h-[56px] sm:w-[56px] sm:h-[60px]'
        : 'w-[60px] h-[66px] sm:w-[64px] sm:h-[70px]';

  const textClass =
    size === 'sm'
      ? 'text-[14px] sm:text-[15px]'
      : size === 'md'
        ? 'text-[15px] sm:text-[16px]'
        : 'text-[18px] sm:text-[19px]';

  // Soft tinted colored edge instead of harsh black cartoon outline
  const edgeStroke = isWaiting ? '#f59e0b' : meta.dark;

  return (
    <div
      className={`relative ${dimClass} flex items-center justify-center select-none pointer-events-none transition-transform duration-75`}
      style={{
        transform: isFiring ? 'translateY(1.5px) scaleX(1.07) scaleY(0.92)' : 'scale(1)',
      }}
    >
      <svg
        viewBox="0 0 64 72"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Rich 3D vinyl/clay dome shading */}
          <radialGradient id={bodyGradId} cx="36%" cy="26%" r="76%">
            <stop offset="0%" stopColor={meta.light} />
            <stop offset="48%" stopColor={meta.base} />
            <stop offset="86%" stopColor={meta.dark} />
            <stop offset="100%" stopColor={meta.dark} />
          </radialGradient>

          {/* Top glossy specular dome reflection */}
          <linearGradient id={domeSheenId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Subtle warm bounce light along the rounded bottom underside */}
          <linearGradient id={rimBounceId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor={meta.light} stopOpacity="0.42" />
          </linearGradient>

          {/* Sculpted 3D ear gradient */}
          <radialGradient id={earGradId} cx="35%" cy="28%" r="75%">
            <stop offset="0%" stopColor={meta.light} />
            <stop offset="62%" stopColor={meta.base} />
            <stop offset="100%" stopColor={meta.dark} />
          </radialGradient>

          {/* Rounded 3D snout shading */}
          <radialGradient id={snoutGradId} cx="50%" cy="25%" r="75%">
            <stop offset="0%" stopColor={meta.light} />
            <stop offset="65%" stopColor={meta.base} />
            <stop offset="100%" stopColor={meta.dark} />
          </radialGradient>
        </defs>

        {/* Soft grounded contact shadow */}
        <ellipse cx="32" cy="64.5" rx="19" ry="4.5" fill="rgba(26, 20, 12, 0.24)" />

        {/* Gem-spit muzzle glow when actively firing */}
        {isFiring && (
          <g>
            <circle cx="32" cy="5.5" r="9" fill={meta.light} opacity="0.58" />
            <circle cx="32" cy="5.5" r="4.5" fill="#ffffff" opacity="0.92" />
          </g>
        )}

        {/* Cute 3D curly tail at bottom (shaded without harsh black stroke) */}
        <path
          d="M 32 61.5 C 28 64.5, 36.5 66, 31 69.2"
          fill="none"
          stroke={meta.dark}
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <path
          d="M 32 61.2 C 28.4 64.2, 36 65.7, 31.2 68.8"
          fill="none"
          stroke={meta.light}
          strokeWidth="1.9"
          strokeLinecap="round"
          opacity="0.88"
        />

        {/* Sculpted 3D top-down snout / mouth nozzle pointing upward */}
        <path
          d={
            isFiring
              ? 'M 20.5 17 C 20.5 6.5, 43.5 6.5, 43.5 17 L 40.5 22 L 23.5 22 Z'
              : 'M 21.5 17.5 C 21.5 8.2, 42.5 8.2, 42.5 17.5 L 39.5 22 L 24.5 22 Z'
          }
          fill={`url(#${snoutGradId})`}
          stroke={edgeStroke}
          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Glossy 3D pink nose bead */}
        <ellipse
          cx="32"
          cy={isFiring ? '10.8' : '12'}
          rx="3.6"
          ry="2.3"
          fill="#ff8fa3"
          stroke="#c95b70"
          strokeWidth="0.9"
        />
        <ellipse
          cx="31"
          cy={isFiring ? '10.1' : '11.3'}
          rx="1.3"
          ry="0.7"
          fill="#ffffff"
          opacity="0.85"
        />

        {/* Plump 3D rounded-squircle hamster body */}
        <rect
          x="7.5"
          y="15.5"
          width="49"
          height="47"
          rx="19.5"
          ry="19.5"
          fill={`url(#${bodyGradId})`}
          stroke={edgeStroke}
          strokeOpacity={isWaiting ? '0.95' : '0.42'}
          strokeWidth={isWaiting ? '2.2' : '1.3'}
        />

        {/* Upper glossy 3D dome sheen */}
        <path
          d="M 13.5 31 C 14 20.5, 22 18, 32 18 C 42 18, 50 20.5, 50.5 31 C 45 27.5, 38.5 26.5, 32 26.5 C 25.5 26.5, 19 27.5, 13.5 31 Z"
          fill={`url(#${domeSheenId})`}
        />

        {/* Soft underside rim bounce light for sculptural 3D volume */}
        <path
          d="M 14.5 52.5 C 19 58.2, 25 60.2, 32 60.2 C 39 60.2, 45 58.2, 49.5 52.5 C 44.5 55.8, 38.5 57.2, 32 57.2 C 25.5 57.2, 19.5 55.8, 14.5 52.5 Z"
          fill={`url(#${rimBounceId})`}
        />

        {/* Subtle ambient-occlusion ear contact shadows on head */}
        <ellipse cx="20.5" cy="21" rx="6.2" ry="3.2" fill={meta.dark} opacity="0.32" />
        <ellipse cx="43.5" cy="21" rx="6.2" ry="3.2" fill={meta.dark} opacity="0.32" />

        {/* Two plush 3D rounded hamster ears */}
        <g>
          {/* Left ear */}
          <rect
            x="14"
            y="10.2"
            width="12.4"
            height="14.2"
            rx="6.2"
            transform="rotate(-12 20.2 17.3)"
            fill={`url(#${earGradId})`}
            stroke={edgeStroke}
            strokeOpacity="0.4"
            strokeWidth="1.2"
          />
          <rect
            x="17.3"
            y="13.6"
            width="5.6"
            height="7.2"
            rx="2.8"
            transform="rotate(-12 20.2 17.3)"
            fill="#ffb3c1"
            opacity="0.72"
          />
          <ellipse
            cx="17.8"
            cy="12.6"
            rx="2.2"
            ry="1"
            transform="rotate(-25 17.8 12.6)"
            fill="#ffffff"
            opacity="0.55"
          />

          {/* Right ear */}
          <rect
            x="37.6"
            y="10.2"
            width="12.4"
            height="14.2"
            rx="6.2"
            transform="rotate(12 43.8 17.3)"
            fill={`url(#${earGradId})`}
            stroke={edgeStroke}
            strokeOpacity="0.4"
            strokeWidth="1.2"
          />
          <rect
            x="41.1"
            y="13.6"
            width="5.6"
            height="7.2"
            rx="2.8"
            transform="rotate(12 43.8 17.3)"
            fill="#ffb3c1"
            opacity="0.72"
          />
          <ellipse
            cx="41.8"
            cy="12.6"
            rx="2.2"
            ry="1"
            transform="rotate(-10 41.8 12.6)"
            fill="#ffffff"
            opacity="0.55"
          />
        </g>

        {/* Crisp glossy bead specular highlight on upper-left shoulder */}
        <ellipse
          cx="19.5"
          cy="28.5"
          rx="5.2"
          ry="2.2"
          transform="rotate(-28 19.5 28.5)"
          fill="#ffffff"
          opacity="0.46"
        />
      </svg>

      {/* Crisp ammo count centered on the hamster's back */}
      <span
        className={`absolute inset-0 flex items-center justify-center pt-2 font-display font-extrabold ${textClass} leading-none font-mono-tabular ${
          muted ? 'orb-number-muted' : 'orb-number-stroke'
        }`}
      >
        {ammo}
      </span>
    </div>
  );
};
