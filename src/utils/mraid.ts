interface MraidApi {
  getState?: () => string;
  isViewable?: () => boolean;
  addEventListener?: (event: string, listener: (...args: unknown[]) => void) => void;
  open?: (url: string) => void;
  useCustomClose?: (useCustom: boolean) => void;
}

type VisibilityCallback = (visible: boolean) => void;
type VolumeCallback = (volumePercent: number) => void;

class MraidBridge {
  private initialized = false;
  private readyCallbacks: Array<() => void> = [];
  private visibilityCallbacks = new Set<VisibilityCallback>();
  private volumeCallbacks = new Set<VolumeCallback>();

  private getMraid(): MraidApi | null {
    if (typeof window === 'undefined') return null;
    const m = (window as unknown as { mraid?: MraidApi }).mraid;
    return m && typeof m === 'object' ? m : null;
  }

  init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Browser visibility & page lifecycle hooks (always active, even outside MRAID)
    document.addEventListener('visibilitychange', () => {
      this.emitVisibility(!document.hidden);
    });
    window.addEventListener('pagehide', () => {
      this.emitVisibility(false);
    });
    window.addEventListener('blur', () => {
      this.emitVisibility(false);
    });
    window.addEventListener('focus', () => {
      if (!document.hidden) this.emitVisibility(true);
    });

    const mraid = this.getMraid();
    if (!mraid) {
      this.flushReady();
      return;
    }

    const onReady = () => {
      this.bindMraidEvents(mraid);
      this.flushReady();
    };

    if (typeof mraid.getState === 'function' && mraid.getState() === 'loading') {
      mraid.addEventListener?.('ready', onReady);
    } else {
      onReady();
    }
  }

  private bindMraidEvents(mraid: MraidApi): void {
    mraid.addEventListener?.('viewableChange', (viewable: unknown) => {
      this.emitVisibility(Boolean(viewable));
    });

    mraid.addEventListener?.('stateChange', (state: unknown) => {
      if (state === 'hidden') {
        this.emitVisibility(false);
      }
    });

    mraid.addEventListener?.('audioVolumeChange', (volume: unknown) => {
      const vol = typeof volume === 'number' ? volume : 100;
      this.volumeCallbacks.forEach((cb) => cb(vol));
    });
  }

  private flushReady(): void {
    const list = this.readyCallbacks.splice(0);
    list.forEach((cb) => cb());
  }

  private emitVisibility(visible: boolean): void {
    this.visibilityCallbacks.forEach((cb) => cb(visible));
  }

  onReady(cb: () => void): void {
    this.init();
    const mraid = this.getMraid();
    if (!mraid || (typeof mraid.getState === 'function' && mraid.getState() !== 'loading')) {
      cb();
    } else {
      this.readyCallbacks.push(cb);
    }
  }

  onVisibilityChange(cb: VisibilityCallback): () => void {
    this.init();
    this.visibilityCallbacks.add(cb);
    return () => {
      this.visibilityCallbacks.delete(cb);
    };
  }

  onAudioVolumeChange(cb: VolumeCallback): () => void {
    this.init();
    this.volumeCallbacks.add(cb);
    return () => {
      this.volumeCallbacks.delete(cb);
    };
  }

  openStore(url: string): boolean {
    const mraid = this.getMraid();
    if (mraid && typeof mraid.open === 'function') {
      mraid.open(url);
      return true;
    }
    return false;
  }
}

export const mraidBridge = new MraidBridge();
