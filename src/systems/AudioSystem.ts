// Global declaration for Safari's prefixed AudioContext
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

/**
 * Web Audio API-based SFX system for medieval sounds.
 * Creates and resumes the AudioContext lazily on first interaction.
 */
export class AudioSystem {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (this.ctx) {
      return this.ctx;
    }

    const Ctor: typeof AudioContext | undefined =
      typeof window !== 'undefined'
        ? window.AudioContext || window.webkitAudioContext
        : undefined;

    if (!Ctor) {
      return null;
    }

    this.ctx = new Ctor();
    return this.ctx;
  }

  private triggerResume(): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'suspended') {
      return;
    }
    ctx.resume().then(
      () => {
        /* resumed successfully */
      },
      () => {
        /* resume failed; audio policy or hardware unavailable */
      }
    );
  }

  async resume(): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) {
      return;
    }
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  playShoot(): void {
    const ctx = this.getContext();
    if (!ctx) {
      return;
    }
    this.triggerResume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playHit(): void {
    const ctx = this.getContext();
    if (!ctx) {
      return;
    }
    this.triggerResume();

    const now = ctx.currentTime;
    const duration = 0.15;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);
    source.stop(now + duration);
  }

  playCoin(): void {
    const ctx = this.getContext();
    if (!ctx) {
      return;
    }
    this.triggerResume();

    const now = ctx.currentTime;
    const duration = 0.2;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + duration);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playLevelUp(): void {
    const ctx = this.getContext();
    if (!ctx) {
      return;
    }
    this.triggerResume();

    const now = ctx.currentTime;
    const totalDuration = 0.5;
    const noteDuration = totalDuration / 3;
    const frequencies = [400, 600, 800];

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);
    gain.connect(ctx.destination);

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      const startTime = now + index * noteDuration;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + noteDuration + 0.05);
    });
  }

  playGameOver(): void {
    const ctx = this.getContext();
    if (!ctx) {
      return;
    }
    this.triggerResume();

    const now = ctx.currentTime;
    const duration = 1.0;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + duration);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }
}
