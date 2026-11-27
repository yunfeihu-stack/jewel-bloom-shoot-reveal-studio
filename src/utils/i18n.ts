import type { PraiseWord } from './sound';

export type SupportedLocale =
  | 'en'
  | 'zh-CN'
  | 'zh-TW'
  | 'ja'
  | 'ko'
  | 'es'
  | 'pt'
  | 'fr'
  | 'de'
  | 'ru'
  | 'id'
  | 'vi'
  | 'th'
  | 'tr'
  | 'ar';

export interface LocaleStrings {
  yourIqIs: string;
  victoryTitle: string;
  playNow: string;
  replay: string;
  failTitle: string;
  failLine1: string;
  failRemainingBefore: string;
  failRemainingAfter: string;
  moreLevels: string;
  tryAgain: string;
  praise: Record<PraiseWord, string>;
}

const TRANSLATIONS: Record<SupportedLocale, LocaleStrings> = {
  en: {
    yourIqIs: 'Your IQ is',
    victoryTitle: 'WELL DONE!',
    playNow: 'Play Now',
    replay: 'Replay',
    failTitle: 'OUT OF SPACE!',
    failLine1: 'All buffer slots are full!',
    failRemainingBefore: 'Only ',
    failRemainingAfter: ' beads left to finish',
    moreLevels: 'More Levels',
    tryAgain: 'Try Again',
    praise: {
      'NICE!': 'NICE!',
      'GREAT!': 'GREAT!',
      'AMAZING!': 'AMAZING!',
      'BRILLIANT!': 'BRILLIANT!',
      'FANTASTIC!': 'FANTASTIC!',
    },
  },
  'zh-CN': {
    yourIqIs: '你的智商测试',
    victoryTitle: '太棒了！',
    playNow: '立即畅玩',
    replay: '再玩一次',
    failTitle: '槽位已满！',
    failLine1: '缓冲区已全部占满！',
    failRemainingBefore: '仅差 ',
    failRemainingAfter: ' 颗豆子就能完成',
    moreLevels: '更多关卡',
    tryAgain: '再试一次',
    praise: {
      'NICE!': '真棒！',
      'GREAT!': '太赞了！',
      'AMAZING!': '惊艳！',
      'BRILLIANT!': '精彩绝伦！',
      'FANTASTIC!': '完美！',
    },
  },
  'zh-TW': {
    yourIqIs: '你的智商測試',
    victoryTitle: '太棒了！',
    playNow: '立即遊玩',
    replay: '再玩一次',
    failTitle: '欄位已滿！',
    failLine1: '緩衝區已全部佔滿！',
    failRemainingBefore: '只差 ',
    failRemainingAfter: ' 顆豆子就能完成',
    moreLevels: '更多關卡',
    tryAgain: '再試一次',
    praise: {
      'NICE!': '真棒！',
      'GREAT!': '太讚了！',
      'AMAZING!': '驚豔！',
      'BRILLIANT!': '精彩絕倫！',
      'FANTASTIC!': '完美！',
    },
  },
  ja: {
    yourIqIs: 'あなたのIQは',
    victoryTitle: 'クリア！',
    playNow: '今すぐプレイ',
    replay: 'もう一度',
    failTitle: 'スペース不足！',
    failLine1: 'スロットがいっぱいです！',
    failRemainingBefore: '完成まであと ',
    failRemainingAfter: ' 個',
    moreLevels: 'もっと遊ぶ',
    tryAgain: 'リトライ',
    praise: {
      'NICE!': 'ナイス！',
      'GREAT!': 'グレート！',
      'AMAZING!': 'すごい！',
      'BRILLIANT!': '見事！',
      'FANTASTIC!': '最高！',
    },
  },
  ko: {
    yourIqIs: '당신의 IQ는',
    victoryTitle: '성공!',
    playNow: '지금 플레이',
    replay: '다시 하기',
    failTitle: '공간 부족!',
    failLine1: '슬롯이 모두 가득 찼어요!',
    failRemainingBefore: '완성까지 ',
    failRemainingAfter: '개 남음',
    moreLevels: '더 많은 레벨',
    tryAgain: '다시 시도',
    praise: {
      'NICE!': '나이스!',
      'GREAT!': '좋아요!',
      'AMAZING!': '대단해요!',
      'BRILLIANT!': '훌륭해요!',
      'FANTASTIC!': '환상적!',
    },
  },
  es: {
    yourIqIs: 'Tu CI es',
    victoryTitle: '¡BIEN HECHO!',
    playNow: 'Jugar ahora',
    replay: 'Repetir',
    failTitle: '¡SIN ESPACIO!',
    failLine1: '¡Todas las ranuras están llenas!',
    failRemainingBefore: 'Solo faltan ',
    failRemainingAfter: ' cuentas',
    moreLevels: 'Más niveles',
    tryAgain: 'Reintentar',
    praise: {
      'NICE!': '¡BIEN!',
      'GREAT!': '¡GENIAL!',
      'AMAZING!': '¡INCREÍBLE!',
      'BRILLIANT!': '¡BRILLANTE!',
      'FANTASTIC!': '¡FANTÁSTICO!',
    },
  },
  pt: {
    yourIqIs: 'Seu QI é',
    victoryTitle: 'MUITO BEM!',
    playNow: 'Jogar agora',
    replay: 'Jogar de novo',
    failTitle: 'SEM ESPAÇO!',
    failLine1: 'Todos os espaços estão cheios!',
    failRemainingBefore: 'Faltam só ',
    failRemainingAfter: ' peças',
    moreLevels: 'Mais níveis',
    tryAgain: 'Tentar de novo',
    praise: {
      'NICE!': 'LEGAL!',
      'GREAT!': 'ÓTIMO!',
      'AMAZING!': 'INCRÍVEL!',
      'BRILLIANT!': 'BRILHANTE!',
      'FANTASTIC!': 'FANTÁSTICO!',
    },
  },
  fr: {
    yourIqIs: 'Votre QI est',
    victoryTitle: 'BIEN JOUÉ !',
    playNow: 'Jouer',
    replay: 'Rejouer',
    failTitle: 'PLUS DE PLACE !',
    failLine1: 'Tous les emplacements sont pleins !',
    failRemainingBefore: 'Plus que ',
    failRemainingAfter: ' perles',
    moreLevels: 'Plus de niveaux',
    tryAgain: 'Réessayer',
    praise: {
      'NICE!': 'BIEN !',
      'GREAT!': 'SUPER !',
      'AMAZING!': 'INCROYABLE !',
      'BRILLIANT!': 'BRILLANT !',
      'FANTASTIC!': 'FANTASTIQUE !',
    },
  },
  de: {
    yourIqIs: 'Dein IQ ist',
    victoryTitle: 'GUT GEMACHT!',
    playNow: 'Jetzt spielen',
    replay: 'Nochmal',
    failTitle: 'KEIN PLATZ!',
    failLine1: 'Alle Felder sind voll!',
    failRemainingBefore: 'Nur noch ',
    failRemainingAfter: ' Perlen',
    moreLevels: 'Mehr Level',
    tryAgain: 'Nochmal',
    praise: {
      'NICE!': 'SUPER!',
      'GREAT!': 'TOLL!',
      'AMAZING!': 'KLASSE!',
      'BRILLIANT!': 'BRILLANT!',
      'FANTASTIC!': 'FANTASTISCH!',
    },
  },
  ru: {
    yourIqIs: 'Ваш IQ',
    victoryTitle: 'ОТЛИЧНО!',
    playNow: 'Играть',
    replay: 'Заново',
    failTitle: 'НЕТ МЕСТА!',
    failLine1: 'Все ячейки заполнены!',
    failRemainingBefore: 'Осталось всего ',
    failRemainingAfter: ' шт.',
    moreLevels: 'Ещё уровни',
    tryAgain: 'Попробовать снова',
    praise: {
      'NICE!': 'КЛАСС!',
      'GREAT!': 'ОТЛИЧНО!',
      'AMAZING!': 'СУПЕР!',
      'BRILLIANT!': 'БЛЕСТЯЩЕ!',
      'FANTASTIC!': 'ФАНТАСТИКА!',
    },
  },
  id: {
    yourIqIs: 'IQ Kamu',
    victoryTitle: 'BAGUS SEKALI!',
    playNow: 'Main Sekarang',
    replay: 'Main Lagi',
    failTitle: 'RUANG PENUH!',
    failLine1: 'Semua slot sudah penuh!',
    failRemainingBefore: 'Tinggal ',
    failRemainingAfter: ' manik lagi',
    moreLevels: 'Level Lainnya',
    tryAgain: 'Coba Lagi',
    praise: {
      'NICE!': 'BAGUS!',
      'GREAT!': 'HEBAT!',
      'AMAZING!': 'LUAR BIASA!',
      'BRILLIANT!': 'BRILIAN!',
      'FANTASTIC!': 'FANTASTIS!',
    },
  },
  vi: {
    yourIqIs: 'IQ của bạn là',
    victoryTitle: 'TUYỆT VỜI!',
    playNow: 'Chơi ngay',
    replay: 'Chơi lại',
    failTitle: 'HẾT CHỖ!',
    failLine1: 'Tất cả ô chứa đã đầy!',
    failRemainingBefore: 'Chỉ còn ',
    failRemainingAfter: ' hạt nữa',
    moreLevels: 'Thêm màn chơi',
    tryAgain: 'Thử lại',
    praise: {
      'NICE!': 'TỐT LẮM!',
      'GREAT!': 'TUYỆT!',
      'AMAZING!': 'ĐỈNH QUÁ!',
      'BRILLIANT!': 'XUẤT SẮC!',
      'FANTASTIC!': 'HOÀN HẢO!',
    },
  },
  th: {
    yourIqIs: 'IQ ของคุณคือ',
    victoryTitle: 'เยี่ยมมาก!',
    playNow: 'เล่นเลย',
    replay: 'เล่นอีกครั้ง',
    failTitle: 'ช่องเต็มแล้ว!',
    failLine1: 'ช่องเก็บทั้งหมดเต็มแล้ว!',
    failRemainingBefore: 'เหลืออีกแค่ ',
    failRemainingAfter: ' เม็ด',
    moreLevels: 'ด่านเพิ่มเติม',
    tryAgain: 'ลองอีกครั้ง',
    praise: {
      'NICE!': 'ดีมาก!',
      'GREAT!': 'เยี่ยม!',
      'AMAZING!': 'สุดยอด!',
      'BRILLIANT!': 'เก่งมาก!',
      'FANTASTIC!': 'มหัศจรรย์!',
    },
  },
  tr: {
    yourIqIs: 'IQ Seviyen',
    victoryTitle: 'HARİKA!',
    playNow: 'Şimdi Oyna',
    replay: 'Tekrar Oyna',
    failTitle: 'YER KALMADI!',
    failLine1: 'Tüm yuvalar doldu!',
    failRemainingBefore: 'Sadece ',
    failRemainingAfter: ' boncuk kaldı',
    moreLevels: 'Daha Fazla Seviye',
    tryAgain: 'Tekrar Dene',
    praise: {
      'NICE!': 'GÜZEL!',
      'GREAT!': 'HARİKA!',
      'AMAZING!': 'İNANILMAZ!',
      'BRILLIANT!': 'MÜKEMMEL!',
      'FANTASTIC!': 'FANTASTİK!',
    },
  },
  ar: {
    yourIqIs: 'معدل ذكائك',
    victoryTitle: 'أحسنت!',
    playNow: 'العب الآن',
    replay: 'إعادة اللعب',
    failTitle: 'لا توجد مساحة!',
    failLine1: 'جميع الخانات ممتلئة!',
    failRemainingBefore: 'تبقى ',
    failRemainingAfter: ' خرزات فقط',
    moreLevels: 'المزيد من المراحل',
    tryAgain: 'حاول مجدداً',
    praise: {
      'NICE!': 'جميل!',
      'GREAT!': 'رائع!',
      'AMAZING!': 'مذهل!',
      'BRILLIANT!': 'عبقري!',
      'FANTASTIC!': 'خرافي!',
    },
  },
};

function resolveLocaleTag(rawTag: string): SupportedLocale {
  const tag = rawTag.trim().toLowerCase();
  if (tag.startsWith('zh')) {
    if (
      tag.includes('tw') ||
      tag.includes('hk') ||
      tag.includes('mo') ||
      tag.includes('hant')
    ) {
      return 'zh-TW';
    }
    return 'zh-CN';
  }
  const base = tag.split('-')[0];
  switch (base) {
    case 'ja':
      return 'ja';
    case 'ko':
      return 'ko';
    case 'es':
      return 'es';
    case 'pt':
      return 'pt';
    case 'fr':
      return 'fr';
    case 'de':
      return 'de';
    case 'ru':
      return 'ru';
    case 'id':
      return 'id';
    case 'vi':
      return 'vi';
    case 'th':
      return 'th';
    case 'tr':
      return 'tr';
    case 'ar':
      return 'ar';
    default:
      return 'en';
  }
}

export function detectDeviceLocale(): SupportedLocale {
  if (typeof window !== 'undefined') {
    const paramLang = new URLSearchParams(window.location.search).get('lang');
    if (paramLang) {
      return resolveLocaleTag(paramLang);
    }
  }
  if (typeof navigator !== 'undefined') {
    const preferred = navigator.languages?.[0] || navigator.language;
    if (preferred) {
      return resolveLocaleTag(preferred);
    }
  }
  return 'en';
}

export const currentLocale: SupportedLocale = detectDeviceLocale();
export const t: LocaleStrings = TRANSLATIONS[currentLocale];
