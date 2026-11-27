import React from 'react';
import { Plus } from 'lucide-react';
import { BEAD_PALETTE } from '../data/hamsterLevel';
import type { BeadColorKey, BeadColorMeta, BufferSlot } from '../data/levelTemplate';
import { HamsterLauncher } from './HamsterLauncher';

interface BufferDockProps {
  slots: BufferSlot[];
  maxSlots: number;
  extraSlotUnlocked: boolean;
  onUnlockExtraSlot: () => void;
  slotRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
  onHoverColor: (color: BeadColorKey | null) => void;
  isJammed: boolean;
  palette?: Record<BeadColorKey, BeadColorMeta>;
}

export const BufferDock: React.FC<BufferDockProps> = ({
  slots,
  maxSlots,
  extraSlotUnlocked,
  onUnlockExtraSlot,
  slotRefs,
  onHoverColor,
  isJammed,
  palette = BEAD_PALETTE as Record<BeadColorKey, BeadColorMeta>,
}) => {
  const occupiedCount = slots.slice(0, maxSlots).filter((s) => s.emitter !== null).length;

  return (
    <section aria-label="Buffer slots" className="w-full select-none shrink-0">
      {/* Compact centered counter */}
      <div className="flex items-center justify-center mb-1.5">
        <span
          className={`font-display text-xs sm:text-sm font-extrabold tracking-wide font-mono-tabular ${
            isJammed ? 'text-rose-500' : 'orb-number-stroke'
          }`}
        >
          {occupiedCount}/{maxSlots}
        </span>
      </div>

      {/* Clean recessed empty square buffer slots + optional +1 unlockable square slot */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 px-1">
        {slots.slice(0, maxSlots).map((slot, idx) => {
          const emitter = slot.emitter;
          const meta = emitter ? palette[emitter.color] ?? BEAD_PALETTE.K : null;
          const isFiringNow =
            emitter !== null && !slot.isWaiting && Date.now() - slot.lastFiredAt < 140;

          return (
            <div
              key={slot.slotIndex}
              ref={(el) => {
                slotRefs.current[idx] = el;
              }}
              onMouseEnter={() => onHoverColor(emitter ? emitter.color : null)}
              onMouseLeave={() => onHoverColor(null)}
              className={`relative w-[56px] h-[56px] sm:w-[60px] sm:h-[60px] rounded-2xl flex items-center justify-center transition-all duration-150 ${
                slot.isWaiting
                  ? 'ring-2 ring-amber-400/90'
                  : isJammed && emitter
                    ? 'ring-2 ring-rose-400/90'
                    : ''
              }`}
              style={{
                background: emitter
                  ? 'linear-gradient(180deg, #c9b99c 0%, #d8cab0 100%)'
                  : 'linear-gradient(180deg, #c4b394 0%, #d4c4a8 100%)',
                border: slot.isWaiting
                  ? '1.5px solid #d97706'
                  : '1.5px solid #ad9b7c',
                boxShadow:
                  'inset 0 3px 6px rgba(45, 34, 18, 0.24), inset 0 -1px 0 rgba(255, 250, 240, 0.65), 0 1px 0 rgba(255, 255, 255, 0.7)',
              }}
              title={
                emitter && meta
                  ? `${meta.name} (${emitter.ammo} left)`
                  : `Buffer Slot ${idx + 1}`
              }
            >
              {/* Active docked top-down hamster launcher sitting inside the square slot */}
              {emitter && (
                <div className="relative -mt-1 flex items-center justify-center">
                  <HamsterLauncher
                    color={emitter.color}
                    ammo={emitter.ammo}
                    palette={palette}
                    size="md"
                    isFiring={isFiringNow}
                    isWaiting={slot.isWaiting}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Unlockable +1 extra square buffer slot */}
        {!extraSlotUnlocked && (
          <button
            type="button"
            onClick={onUnlockExtraSlot}
            className="group relative w-[56px] h-[56px] sm:w-[60px] sm:h-[60px] rounded-2xl flex items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            style={{
              background: 'linear-gradient(180deg, #efe2c4 0%, #e2d0ab 100%)',
              border: '2px dashed #c8a86b',
              boxShadow: 'inset 0 2px 5px rgba(120, 86, 32, 0.14)',
            }}
            aria-label="Unlock extra buffer slot"
            title="+1"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110"
              style={{
                background: 'linear-gradient(180deg, #74eb3b 0%, #2eb312 100%)',
                border: '1.5px solid #e7ff9e',
                boxShadow: '0 2px 0 #156604',
              }}
            >
              <Plus className="w-4 h-4 text-white stroke-[3]" aria-hidden="true" />
            </div>
          </button>
        )}
      </div>
    </section>
  );
};
