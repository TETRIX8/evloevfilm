class SoundEffects {
  private static instance: SoundEffects;
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private isMuted: boolean = false;

  private constructor() {
    this.sounds = {
      notification: new Audio("/loading-sound.mp3"),
      click: new Audio("/loading-sound.mp3"),
      hover: new Audio("/loading-sound.mp3"),
      save: new Audio("/loading-sound.mp3"),
      load: new Audio("/loading-sound.mp3")
    };

    // Set custom volume for each sound
    this.sounds.notification.volume = 0.2;
    this.sounds.click.volume = 0.15;
    this.sounds.hover.volume = 0.1;
    this.sounds.save.volume = 0.25;
    this.sounds.load.volume = 0.3;
  }

  public static getInstance(): SoundEffects {
    if (!SoundEffects.instance) {
      SoundEffects.instance = new SoundEffects();
    }
    return SoundEffects.instance;
  }

  public play(soundName: keyof typeof this.sounds): void {
    if (this.isMuted) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.log("Sound playback failed:", error);
      });
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }
}

export const soundEffects = SoundEffects.getInstance();