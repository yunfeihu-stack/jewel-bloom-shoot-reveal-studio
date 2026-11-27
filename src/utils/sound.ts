import { mraidBridge } from './mraid';

type SampleKey = 'pick' | 'bloom_loop' | 'settled' | 'victory';

export type PraiseWord = 'NICE!' | 'GREAT!' | 'AMAZING!' | 'BRILLIANT!' | 'FANTASTIC!';

const SAMPLE_URLS: Record<SampleKey, string> = {
  pick: '/assets/audio/bead_raise.wav',
  bloom_loop: '/assets/audio/bead_cascade_loop.wav',
  settled: '/assets/audio/bead_settled.wav',
  victory: '/assets/audio/victory_popup.mp3',
};

const BGM_URL = '/assets/audio/bgm.mp3';
const BGM_VOLUME = 0.6;

function toFastBlobUrl(url: string): string {
  if (!url.startsWith('data:') || typeof window === 'undefined' || typeof URL === 'undefined') {
    return url;
  }
  try {
    const commaIdx = url.indexOf(',');
    if (commaIdx === -1) return url;
    const header = url.slice(5, commaIdx);
    const mime = header.split(';')[0] || 'audio/mpeg';
    const b64 = url.slice(commaIdx + 1);
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  } catch {
    return url;
  }
}

/**
 * Zero-Latency 5-Channel HTMLAudioElement Engine:
 * - BGM + bloomLoopEl run continuously once started on Tap 1.
 * - bloomLoopEl stays silently running (muted = true) and simply unmutes (muted = false)
 *   for the exact duration beads are landing -> 0.00ms audio-visual sync, ZERO race conditions,
 *   ZERO repeated .play()/.pause() calls during gameplay, ZERO stutter on iOS!
 */
class SoundEngine {
  private muted = false;
  private hiddenMuted = false;
  private systemMuted = false;
  private coreUnlocked = false;

  private bgmEl: HTMLAudioElement | null = null;
  private pickEl: HTMLAudioElement | null = null;
  private bloomLoopEl: HTMLAudioElement | null = null;
  private settledEl: HTMLAudioElement | null = null;
  private victoryEl: HTMLAudioElement | null = null;

  private bgmPlaying = false;
  private bgmPausedByHide = false;
  private bloomLoopRunning = false;
  private bloomAudible = false;
  private bloomStopTimer: number | null = null;
  private lastSettledSoundAt = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initElements();

      mraidBridge.onVisibilityChange((visible) => {
        this.handleVisibilityChange(visible);
      });
      mraidBridge.onAudioVolumeChange((volPercent) => {
        this.systemMuted = volPercent <= 0;
        this.syncMuteState();
      });
    }
  }

  private createAudio(url: string, volume: number, loop = false): HTMLAudioElement {
    const el = new Audio(toFastBlobUrl(url));
    el.preload = 'auto';
    el.loop = loop;
    el.volume = volume;
    el.muted = true;
    return el;
  }

  private initElements(): void {
    this.bgmEl = this.createAudio(BGM_URL, BGM_VOLUME, true);
    this.pickEl = this.createAudio(SAMPLE_URLS.pick, 0.95);
    this.bloomLoopEl = this.createAudio(SAMPLE_URLS.bloom_loop, 0.9, true);
    this.settledEl = this.createAudio(SAMPLE_URLS.settled, 0.95);
    this.victoryEl = this.createAudio(SAMPLE_URLS.victory, 1.0);
  }

  private isEffectivelyMuted(): boolean {
    return this.muted || this.hiddenMuted || this.systemMuted;
  }

  private syncMuteState(): void {
    const muteNow = this.isEffectivelyMuted();
    if (this.bgmEl) this.bgmEl.muted = muteNow;
    if (this.pickEl) this.pickEl.muted = muteNow;
    if (this.settledEl) this.settledEl.muted = muteNow;
    if (this.victoryEl) this.victoryEl.muted = muteNow;
    if (this.bloomLoopEl) {
      this.bloomLoopEl.muted = muteNow || !this.bloomAudible;
    }
  }

  private silenceBloom(): void {
    if (this.bloomStopTimer !== null) {
      window.clearTimeout(this.bloomStopTimer);
      this.bloomStopTimer = null;
    }
    this.bloomAudible = false;
    if (this.bloomLoopEl) {
      this.bloomLoopEl.muted = true;
    }
  }

  private handleVisibilityChange(visible: boolean): void {
    this.hiddenMuted = !visible;
    if (!visible) {
      this.silenceBloom();
      if (this.bgmEl && this.bgmPlaying && !this.bgmEl.paused) {
        this.bgmEl.pause();
        this.bgmPausedByHide = true;
      }
      if (this.bloomLoopEl && !this.bloomLoopEl.paused) {
        this.bloomLoopEl.pause();
        this.bloomLoopRunning = false;
      }
    } else {
      if (this.bgmEl && this.bgmPlaying && this.bgmPausedByHide && !this.isEffectivelyMuted()) {
        this.bgmPausedByHide = false;
        void this.bgmEl.play().catch(() => {});
      }
      if (this.bloomLoopEl && this.bgmPlaying && !this.bloomLoopRunning) {
        this.bloomLoopEl.muted = true;
        this.bloomLoopRunning = true;
        void this.bloomLoopEl.play().catch(() => {
          this.bloomLoopRunning = false;
        });
      }
    }
    this.syncMuteState();
  }

  private primeOneShot(el: HTMLAudioElement | null): void {
    if (!el) return;
    el.muted = true;
    const p = el.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        el.pause();
        try {
          el.currentTime = 0;
        } catch {
          // Ignore
        }
        el.muted = this.isEffectivelyMuted();
      }).catch(() => {
        el.muted = this.isEffectivelyMuted();
      });
    } else {
      el.muted = this.isEffectivelyMuted();
    }
  }

  private unlockCore(): void {
    if (this.coreUnlocked || typeof window === 'undefined') return;
    this.coreUnlocked = true;

    // Start bloomLoopEl continuously in muted standby so playBloom() is an instant 0ms unmute!
    if (this.bloomLoopEl && !this.bloomLoopRunning) {
      this.bloomLoopEl.muted = true;
      this.bloomLoopEl.loop = true;
      this.bloomLoopEl.volume = 0.9;
      this.bloomLoopRunning = true;
      void this.bloomLoopEl.play().catch(() => {
        this.bloomLoopRunning = false;
      });
    }

    this.primeOneShot(this.settledEl);
    this.primeOneShot(this.victoryEl);
  }

  startBgm(): void {
    if (typeof window === 'undefined') return;
    if (!this.bgmPlaying && this.bgmEl) {
      this.bgmEl.volume = BGM_VOLUME;
      this.bgmEl.loop = true;
      this.bgmEl.muted = this.isEffectivelyMuted();
      this.bgmPlaying = true;
      this.bgmPausedByHide = false;
      void this.bgmEl.play().catch(() => {
        this.bgmPlaying = false;
      });
    }
    this.unlockCore();
  }

  stopBgm(): void {
    this.silenceBloom();
    this.bgmPlaying = false;
    this.bgmPausedByHide = false;
    if (this.bgmEl) {
      this.bgmEl.pause();
      try {
        this.bgmEl.currentTime = 0;
      } catch {
        // Ignore
      }
    }
    if (this.bloomLoopEl && !this.bloomLoopEl.paused) {
      this.bloomLoopEl.pause();
      this.bloomLoopRunning = false;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.silenceBloom();
    this.syncMuteState();
  }

  isMuted(): boolean {
    return this.muted;
  }

  resetCombo(): void {
    this.silenceBloom();
  }

  private playOneShot(el: HTMLAudioElement | null, volume: number): void {
    if (!el || this.isEffectivelyMuted()) return;
    try {
      el.volume = volume;
      el.muted = false;
      if (!el.ended && el.currentTime > 0) {
        el.currentTime = 0;
      }
      void el.play().catch(() => {});
    } catch {
      // Ignore
    }
  }

  playPick(): void {
    this.unlockCore();
    this.playOneShot(this.pickEl, 0.95);
  }

  /**
   * 0ms-latency synced bead cascade: unmutes the already-running cascade loop the exact
   * millisecond a bead lands, and re-mutes 110ms after the last bead lands.
   */
  playBloom(): void {
    if (this.isEffectivelyMuted() || !this.bloomLoopEl) return;

    this.bloomAudible = true;
    this.bloomLoopEl.volume = 0.9;
    this.bloomLoopEl.muted = false;

    if (!this.bloomLoopRunning || this.bloomLoopEl.paused) {
      this.bloomLoopRunning = true;
      void this.bloomLoopEl.play().catch(() => {
        this.bloomLoopRunning = false;
      });
    }

    if (this.bloomStopTimer !== null) {
      window.clearTimeout(this.bloomStopTimer);
    }
    this.bloomStopTimer = window.setTimeout(() => {
      this.bloomStopTimer = null;
      this.bloomAudible = false;
      if (this.bloomLoopEl) {
        this.bloomLoopEl.muted = true;
      }
    }, 110);
  }

  playReveal(): void {
    // Silent
  }

  playSlotClear(): void {
    if (this.isEffectivelyMuted()) return;
    const nowMs = performance.now();
    if (nowMs - this.lastSettledSoundAt < 220) return;
    this.lastSettledSoundAt = nowMs;
    this.playOneShot(this.settledEl, 0.95);
  }

  playBlocked(): void {
    this.playPick();
  }

  playUndo(): void {
    this.playPick();
  }

  playPraiseVoice(_word: PraiseWord): void {
    // Voiceovers disabled for lean mobile performance
  }

  playVictory(): void {
    this.silenceBloom();
    this.playOneShot(this.victoryEl, 1.0);
  }
}

export const soundEngine = new SoundEngine();
