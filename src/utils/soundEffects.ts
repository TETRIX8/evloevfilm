class SoundEffects {
  private static instance: SoundEffects;
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private isMuted: boolean = false;

  private constructor() {
    this.sounds = {
      notification: new Audio("/loading-sound.mp3"),
      click: new Audio("/loading-sound.mp3"),
      hover: new Audio("/loading-sound.mp3")
    };

    // Set volume for all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.2;
    });
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