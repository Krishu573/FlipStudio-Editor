/**
 * Procedural Web Audio API sound generator for realistic paper page turning
 */
class PaperAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playPageTurn(isForward: boolean = true) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const sampleRate = this.ctx.sampleRate;
      const duration = 0.32; // seconds
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate soft filtered pink/brownian noise burst simulating paper sliding
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.08;
        b2 = 0.85 * b2 + white * 0.12;
        data[i] = (b0 + b1 + b2) * 0.45;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Filter: sweeps downward for natural paper landing
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      const startFreq = isForward ? 1200 : 1400;
      const endFreq = 420;
      filter.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
      filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      // Envelope: quick attack, textured body, fast decay
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.09, this.ctx.currentTime + 0.18);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      noiseSource.start();
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playCoverClose() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Ignore
    }
  }
}

export const audioEngine = new PaperAudioEngine();
