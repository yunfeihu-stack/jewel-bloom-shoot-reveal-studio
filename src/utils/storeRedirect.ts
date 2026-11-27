import { mraidBridge } from './mraid';

export const ANDROID_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.ashita.jewel.bloom.color';
export const IOS_STORE_URL = 'https://apps.apple.com/us/app/id6793837878';

export function getStoreUrl(): string {
  if (typeof navigator === 'undefined') return ANDROID_STORE_URL;
  const ua = navigator.userAgent || '';
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return IOS_STORE_URL;
  if (/Android/i.test(ua)) return ANDROID_STORE_URL;
  if (/Macintosh|Mac OS X/i.test(ua)) return IOS_STORE_URL;
  return ANDROID_STORE_URL;
}

export function openStoreUrl(): void {
  const url = getStoreUrl();

  // AppLovin MRAID v2.0 required click-through method
  if (mraidBridge.openStore(url)) {
    return;
  }

  const win = window as unknown as {
    ExitApi?: { exit?: () => void };
    FbPlayableAd?: { onCTAClick?: () => void };
  };

  if (typeof win.FbPlayableAd?.onCTAClick === 'function') {
    win.FbPlayableAd.onCTAClick();
    return;
  }
  if (typeof win.ExitApi?.exit === 'function') {
    win.ExitApi.exit();
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
