
export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
}

export interface AppState {
  interactionCount: number;
  isAudioEnabled: boolean;
  hasStarted: boolean;
  currentQuoteIndex: number;
  heartRate: number; // In BPM
  isFinished: boolean;
}
