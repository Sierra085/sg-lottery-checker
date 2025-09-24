// A simple service to manage audio playback and haptics

// Base64 encoded audio files to prevent extra network requests
const TICK_SOUND = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='; // A very short, empty wav file as a placeholder
const WIN_SOUND = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='; // Placeholder

class AudioService {
  private tickAudio: HTMLAudioElement;
  private winAudio: HTMLAudioElement;
  private isTickReady: boolean = false;
  private isWinReady: boolean = false;

  constructor() {
    // Preload audio to avoid delay on first play
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
        this.tickAudio = new Audio(TICK_SOUND);
        this.winAudio = new Audio(WIN_SOUND);

        this.tickAudio.volume = 0.3; // Keep UI sounds subtle
        this.winAudio.volume = 0.5;

        // Use 'canplaythrough' to ensure the audio is loaded
        this.tickAudio.addEventListener('canplaythrough', () => { this.isTickReady = true; }, { once: true });
        this.winAudio.addEventListener('canplaythrough', () => { this.isWinReady = true; }, { once: true });

    } else {
        // Mock audio elements for SSR or environments without Audio API
        this.tickAudio = {} as HTMLAudioElement;
        this.winAudio = {} as HTMLAudioElement;
    }
  }

  playTickSound() {
    if (this.isTickReady && this.tickAudio.play) {
        this.tickAudio.currentTime = 0; // Rewind to start
        this.tickAudio.play().catch(e => console.error("Error playing tick sound:", e));
    }
  }

  playWinSound() {
     if (this.isWinReady && this.winAudio.play) {
        this.winAudio.currentTime = 0;
        this.winAudio.play().catch(e => console.error("Error playing win sound:", e));
    }
  }

  triggerHapticFeedback() {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(5); // A short 5ms vibration
    }
  }
}

// Export a singleton instance
export const audioService = new AudioService();
