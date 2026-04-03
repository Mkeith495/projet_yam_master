import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

const AUDIO_URLS = {
  home_bgm:
    "https://opengameart.org/sites/default/files/space_ranger_seamless_loop_preview_no_watermark_0.mp3",
  queue_bgm:
    "https://opengameart.org/sites/default/files/busy_cyberworld_0.mp3",
  ingame_bgm:
    "https://opengameart.org/sites/default/files/Background%20Music.mp3",

  dice_place_sfx: "https://opengameart.org/sites/default/files/dice.ogg",
  match_start_sfx:
    "https://opengameart.org/sites/default/files/Win%20sound.mp3",
  combo_sfx: "https://opengameart.org/sites/default/files/Win%20sound.mp3",

  win_bgm: "https://opengameart.org/sites/default/files/Background%20Music.mp3",
  lose_bgm:
    "https://opengameart.org/sites/default/files/Background%20Music.mp3",
  draw_bgm:
    "https://opengameart.org/sites/default/files/Background%20Music.mp3",

  // Backward compatibility (older keys still referenced in some screens)
  home_wait_bgm:
    "https://opengameart.org/sites/default/files/space_ranger_seamless_loop_preview_no_watermark_0.mp3",
  roll_sfx: "https://opengameart.org/sites/default/files/Win%20sound.mp3",
};

class AudioManager {
  constructor() {
    this._bgm = null;
    this._bgmKey = null;
    this._bgmOp = Promise.resolve();
    this._sfxCache = new Map();
    this._ready = false;
  }

  _enqueueBgmOp(op) {
    const run = async () => op();
    this._bgmOp = this._bgmOp.then(run, run);
    return this._bgmOp;
  }

  async _stopBgmInternal() {
    if (!this._bgm) return;

    const bgmToStop = this._bgm;
    try {
      await bgmToStop.stopAsync();
    } catch (e) {
    } finally {
      try {
        await bgmToStop.unloadAsync();
      } catch (e) {}

      if (this._bgm === bgmToStop) {
        this._bgm = null;
        this._bgmKey = null;
      }
    }
  }

  async init() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });
      this._ready = true;
    } catch (e) {
      this._ready = false;
      // eslint-disable-next-line no-console
      console.warn("[audio][init] failed:", e);
    }
  }

  async playBgm(key, { volume = 0.35 } = {}) {
    return this._enqueueBgmOp(async () => {
      const url = AUDIO_URLS[key];
      if (!url) return;

      // eslint-disable-next-line no-console
      console.log("[audio][bgm] play:", key);

      if (!this._ready) {
        await this.init();
      }

      if (this._bgm && this._bgmKey === key) {
        try {
          await this._bgm.setStatusAsync({ isLooping: true, volume });
          await this._bgm.playAsync();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("[audio][bgm] resume failed:", e);
        }
        return;
      }

      const prevBgm = this._bgm;
      await this._stopBgmInternal();

      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true, isLooping: true, volume },
        );

        if (this._bgm === prevBgm) {
          this._bgm = sound;
          this._bgmKey = key;
        } else {
          try {
            await sound.unloadAsync();
          } catch (e) {}
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[audio][bgm] create failed:", key, url, e);
      }
    });
  }

  async stopBgm() {
    return this._enqueueBgmOp(async () => {
      await this._stopBgmInternal();
    });
  }

  async playSfx(key, { volume = 0.9 } = {}) {
    const url = AUDIO_URLS[key];
    if (!url) return;

    // eslint-disable-next-line no-console
    console.log("[audio][sfx] play:", key);

    if (!this._ready) {
      await this.init();
    }

    let sound = this._sfxCache.get(key);
    if (!sound) {
      try {
        const created = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: false, isLooping: false, volume },
        );
        sound = created.sound;
        this._sfxCache.set(key, sound);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[audio][sfx] create failed:", key, url, e);
        return;
      }
    }

    try {
      await sound.setVolumeAsync(volume);
      if (typeof sound.replayAsync === "function") {
        await sound.replayAsync();
      } else {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[audio][sfx] play failed:", key, e);
    }
  }

  async unloadAll() {
    await this.stopBgm();
    for (const sound of this._sfxCache.values()) {
      try {
        await sound.unloadAsync();
      } catch (e) {}
    }
    this._sfxCache.clear();
  }
}

export const audioManager = new AudioManager();
export const audioUrls = AUDIO_URLS;
