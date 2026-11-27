export type MascotId = 'hamster' | 'cat' | 'shiba' | 'bunny' | 'girl' | 'custom';

export interface MascotOption {
  id: Exclude<MascotId, 'custom'>;
  name: string;
  zhName: string;
  category: 'animal' | 'character';
  src: string;
  emoji: string;
}

export const MASCOT_OPTIONS: MascotOption[] = [
  {
    id: 'hamster',
    name: 'Apple Hamster',
    zhName: '苹果小仓鼠',
    category: 'animal',
    src: '/assets/chibi_hamster_runner.png',
    emoji: '🐹',
  },
  {
    id: 'cat',
    name: 'Orange Kitten',
    zhName: '橘猫小团子',
    category: 'animal',
    src: '/assets/mascots/mascot_cat.png',
    emoji: '🐱',
  },
  {
    id: 'shiba',
    name: 'Shiba Puppy',
    zhName: '柴犬小萌狗',
    category: 'animal',
    src: '/assets/mascots/mascot_shiba.png',
    emoji: '🐕',
  },
  {
    id: 'bunny',
    name: 'Strawberry Bunny',
    zhName: '草莓小白兔',
    category: 'animal',
    src: '/assets/mascots/mascot_bunny.png',
    emoji: '🐰',
  },
  {
    id: 'girl',
    name: 'Jewel Explorer',
    zhName: '宝石小女孩',
    category: 'character',
    src: '/assets/mascots/mascot_girl.png',
    emoji: '👧',
  },
];

export function getMascotSrc(mascotId: MascotId, customMascotDataUrl?: string | null): string {
  if (mascotId === 'custom' && customMascotDataUrl) {
    return customMascotDataUrl;
  }
  const found = MASCOT_OPTIONS.find((m) => m.id === mascotId);
  return found ? found.src : MASCOT_OPTIONS[0].src;
}
