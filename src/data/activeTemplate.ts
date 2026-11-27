import rawConfig from '../../template.config.json';
import { DEFAULT_HAMSTER_LEVEL } from './hamsterLevel';
import { parseLevelJson, type LevelJsonDefinition, type LevelRuntime } from './levelTemplate';
import { getMascotSrc, type MascotId } from './mascots';

export interface PlayableTemplateConfig {
  mascotId: MascotId;
  customMascotDataUrl?: string | null;
  levelJson?: LevelJsonDefinition | null;
  victoryImageDataUrl?: string | null;
  outputFilename?: string;
}

declare global {
  interface Window {
    __PLAYABLE_TEMPLATE__?: Partial<PlayableTemplateConfig>;
  }
}

const runtimeInjected =
  typeof window !== 'undefined' && window.__PLAYABLE_TEMPLATE__
    ? window.__PLAYABLE_TEMPLATE__
    : null;

export const INITIAL_TEMPLATE_CONFIG: PlayableTemplateConfig = {
  mascotId: (runtimeInjected?.mascotId ?? rawConfig.mascotId ?? 'hamster') as MascotId,
  customMascotDataUrl:
    runtimeInjected?.customMascotDataUrl !== undefined
      ? runtimeInjected.customMascotDataUrl
      : (rawConfig.customMascotDataUrl ?? null),
  levelJson:
    runtimeInjected?.levelJson !== undefined
      ? (runtimeInjected.levelJson as LevelJsonDefinition | null)
      : ((rawConfig.levelJson as LevelJsonDefinition | null) ?? null),
  victoryImageDataUrl:
    runtimeInjected?.victoryImageDataUrl !== undefined
      ? runtimeInjected.victoryImageDataUrl
      : (rawConfig.victoryImageDataUrl ?? null),
  outputFilename:
    runtimeInjected?.outputFilename ||
    rawConfig.outputFilename ||
    'T_S_JPJB_var_Shoot-Reveal-Hamster_en_261124_Christy_AppLovin.html',
};

export function resolveInitialLevel(): LevelRuntime {
  if (INITIAL_TEMPLATE_CONFIG.levelJson) {
    try {
      return parseLevelJson(INITIAL_TEMPLATE_CONFIG.levelJson);
    } catch {
      return DEFAULT_HAMSTER_LEVEL;
    }
  }
  return DEFAULT_HAMSTER_LEVEL;
}

export function resolveMascotSrc(
  mascotId: MascotId,
  customMascotDataUrl?: string | null
): string {
  return getMascotSrc(mascotId, customMascotDataUrl);
}
