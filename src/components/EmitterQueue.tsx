import React from 'react';
import { BEAD_PALETTE } from '../data/hamsterLevel';
import type { BeadColorKey, BeadColorMeta, EmitterItem } from '../data/levelTemplate';
import { FingerGuide } from './FingerGuide';
import { HamsterLauncher } from './HamsterLauncher';

interface EmitterQueueProps {
  columns: EmitterItem[][];
  exposedCounts: Record<BeadColorKey, number>;
  canDeploy: boolean;
  hintColIndex: number | null;
  onDeployColumn: (colIndex: number) => void;
  onHoverColor: (color: BeadColorKey | null) => void;
  palette?: Record<BeadColorKey, BeadColorMeta>;
}

export const EmitterQueue: React.FC<EmitterQueueProps> = ({
  columns,
  canDeploy,
  hintColIndex,
  onDeployColumn,
  onHoverColor,
  palette = BEAD_PALETTE as Record<BeadColorKey, BeadColorMeta>,
}) => {
  // Always display exactly 4 columns × 2 visible rows so the upper bead pattern stays large and clear
  const visibleColumns = columns.slice(0, 4);
  const maxVisibleDepth = 2;

  return (
    <section aria-label="Color emitter supply queue" className="w-full select-none shrink-0">
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 max-w-[292px] sm:max-w-[316px] mx-auto">
        {visibleColumns.map((col, colIdx) => {
          const front = col[0] ?? null;
          const queued = col.slice(1, maxVisibleDepth);
          const isHinted = hintColIndex === colIdx && front !== null;

          return (
            <div
              key={colIdx}
              className={`relative flex flex-col items-center ${isHinted ? 'z-40' : 'z-10'}`}
            >
              {/* Front selectable top-down hamster launcher */}
              {front ? (
                (() => {
                  const meta = palette[front.color] ?? BEAD_PALETTE.K;
                  return (
                    <button
                      type="button"
                      disabled={!canDeploy}
                      onClick={() => onDeployColumn(colIdx)}
                      onMouseEnter={() => onHoverColor(front.color)}
                      onMouseLeave={() => onHoverColor(null)}
                      onFocus={() => onHoverColor(front.color)}
                      onBlur={() => onHoverColor(null)}
                      className={`group relative z-20 rounded-2xl flex items-center justify-center transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                        canDeploy
                          ? 'cursor-pointer hover:-translate-y-0.5 hover:scale-105 active:translate-y-0.5'
                          : 'cursor-not-allowed opacity-60'
                      }`}
                      aria-label={`Deploy ${meta.name} hamster launcher with ${front.ammo} gems from column ${colIdx + 1}`}
                    >
                      <HamsterLauncher color={front.color} ammo={front.ammo} palette={palette} size="lg" />
                      {isHinted && <FingerGuide />}
                    </button>
                  );
                })()
              ) : (
                <div className="w-[60px] h-[66px] sm:w-[64px] sm:h-[70px]" aria-hidden="true" />
              )}

              {/* Second row tightly tucked behind front hamster */}
              {queued.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() => onHoverColor(item.color)}
                  onMouseLeave={() => onHoverColor(null)}
                  className="relative z-10 -mt-2 flex items-center justify-center transition-transform hover:scale-105 opacity-92"
                >
                  <HamsterLauncher color={item.color} ammo={item.ammo} palette={palette} size="md" muted />
                </div>
              ))}

              {queued.length === 0 && (
                <div className="w-[52px] h-[56px] sm:w-[56px] sm:h-[60px] -mt-2" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
