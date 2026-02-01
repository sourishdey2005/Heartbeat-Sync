
export class HeartbeatAudio {
  private ctx: AudioContext | null = null;
  private nextHeartbeat: number = 0;
  private interval: number = 1000; // in ms
  private timer: number | null = null;

  constructor() {}

  public start() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.schedule();
  }

  public setRate(bpm: number) {
    this.interval = 60000 / bpm;
  }

  private playThump(time: number, freq: number, volume: number) {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(1, time + 0.1);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  private schedule = () => {
    if (!this.ctx) return;

    const lookAhead = 0.1; // 100ms
    const currentTime = this.ctx.currentTime;

    while (this.nextHeartbeat < currentTime + lookAhead) {
      if (this.nextHeartbeat === 0) this.nextHeartbeat = currentTime;
      
      // "Lubb" - first heart sound
      this.playThump(this.nextHeartbeat, 60, 0.3);
      
      // "Dupp" - second heart sound, shortly after
      this.playThump(this.nextHeartbeat + 0.15, 50, 0.2);

      this.nextHeartbeat += this.interval / 1000;
    }

    this.timer = window.setTimeout(this.schedule, 50);
  };

  public stop() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.nextHeartbeat = 0;
  }
}
