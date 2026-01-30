// 文件路径: src/stores/useSoundStore.ts

import { create } from 'zustand';
import { Howl } from 'howler';
// 确保这里引入了 PresetType
import { Sound, AppState, PresetType } from '../types'; 

// 外部音频实例池
const howlCache: Record<number, Howl> = {};

const initialSounds: Sound[] = [
  { id: 1, name: 'Pluja al bosc', name_cn: '森林雨声', category: 'Naturalesa', icon: '🌧️', color: 'bg-blue-100', volume: 70, audioUrl: '/sounds/rain.mp3', isPlaying: false },
  { id: 2, name: 'Ambient de cafeteria', name_cn: '咖啡馆氛围', category: 'Ambient', icon: '☕', color: 'bg-amber-100', volume: 60, audioUrl: '/sounds/cafe.mp3', isPlaying: false },
  { id: 3, name: 'Onades a la platja', name_cn: '海浪拍岸', category: 'Naturalesa', icon: '🌊', color: 'bg-cyan-100', volume: 65, audioUrl: '/sounds/waves.mp3', isPlaying: false },
  { id: 4, name: 'Soroll blanc', name_cn: '白噪音', category: 'Concentració', icon: '📡', color: 'bg-gray-100', volume: 50, audioUrl: '/sounds/white-noise.mp3', isPlaying: false },
  { id: 5, name: 'Foc cremant', name_cn: '篝火声', category: 'Relaxació', icon: '🔥', color: 'bg-orange-100', volume: 55, audioUrl: '/sounds/fire.mp3', isPlaying: false },
  { id: 6, name: 'Vent suau', name_cn: '微风声', category: 'Naturalesa', icon: '💨', color: 'bg-sky-100', volume: 45, audioUrl: '/sounds/wind.mp3', isPlaying: false },
];

export const useSoundStore = create<AppState>((set, get) => ({
  sounds: initialSounds,
  globalVolume: 65,
  isGlobalPlaying: false,
  activeSoundId: null,
  timerDuration: 25,
  isTimerActive: false,

  toggleSound: (soundId: number) => {
    const { globalVolume } = get();
    set((state) => {
      const updatedSounds = state.sounds.map(sound => {
        if (sound.id === soundId) {
          const nextPlayingState = !sound.isPlaying;
          if (sound.audioUrl) {
            let howl = howlCache[soundId];
            if (!howl) {
              howl = new Howl({ src: [sound.audioUrl], html5: true, loop: true, volume: (sound.volume / 100) * (globalVolume / 100) });
              howlCache[soundId] = howl;
            }
            if (nextPlayingState) { if (!howl.playing()) howl.play(); } else { howl.stop(); }
          }
          return { ...sound, isPlaying: nextPlayingState };
        }
        return sound;
      });
      const isAnyPlaying = updatedSounds.some(s => s.isPlaying);
      return { sounds: updatedSounds, isGlobalPlaying: isAnyPlaying };
    });
  },

  updateSoundVolume: (soundId: number, volume: number) => {
    const { globalVolume } = get();
    set((state) => ({
      sounds: state.sounds.map(sound => {
        if (sound.id === soundId) {
          if (howlCache[soundId]) { howlCache[soundId].volume((volume / 100) * (globalVolume / 100)); }
          return { ...sound, volume };
        }
        return sound;
      })
    }));
  },

  toggleGlobalPlay: () => {
    const { sounds, isGlobalPlaying, globalVolume } = get();
    if (isGlobalPlaying) {
      sounds.forEach(sound => { if (howlCache[sound.id]) howlCache[sound.id].stop(); });
      set({ isGlobalPlaying: false, sounds: sounds.map(s => ({ ...s, isPlaying: false })) });
    } else {
      let hasStartedAny = false;
      const updatedSounds = sounds.map(sound => {
        if (sound.volume > 0 && sound.audioUrl) {
          let howl = howlCache[sound.id];
          if (!howl) {
            howl = new Howl({ src: [sound.audioUrl], loop: true, volume: (sound.volume / 100) * (globalVolume / 100) });
            howlCache[sound.id] = howl;
          }
          if (!howl.playing()) howl.play();
          hasStartedAny = true;
          return { ...sound, isPlaying: true };
        }
        return { ...sound, isPlaying: false };
      });
      set({ isGlobalPlaying: hasStartedAny, sounds: updatedSounds });
    }
  },

  updateGlobalVolume: (volume: number) => {
    const { sounds } = get();
    sounds.forEach(sound => { if (howlCache[sound.id]) { howlCache[sound.id].volume((sound.volume / 100) * (volume / 100)); } });
    set({ globalVolume: volume });
  },

  resetAllVolumes: () => {
    Object.values(howlCache).forEach(howl => howl.stop());
    set({ sounds: initialSounds.map(s => ({ ...s, isPlaying: false })), globalVolume: 65, isGlobalPlaying: false, activeSoundId: null });
  },

  setTimerDuration: (minutes: number) => set({ timerDuration: minutes }),
  
  toggleTimer: () => {
    const { isTimerActive, timerDuration } = get();
    if (!isTimerActive) {
      setTimeout(() => {
        const state = get();
        if (state.isTimerActive) {
          Object.values(howlCache).forEach(howl => howl.stop());
          set({ isGlobalPlaying: false, isTimerActive: false, sounds: state.sounds.map(s => ({ ...s, isPlaying: false })) });
          alert(`⏰ Temporitzador acabat!`);
        }
      }, timerDuration * 60 * 1000);
    }
    set({ isTimerActive: !isTimerActive });
  },

  // 实现 ApplyPreset 逻辑
  applyPreset: (type: PresetType) => {
    const { globalVolume } = get();
    set((state) => {
      const newSounds = state.sounds.map(s => {
        let shouldPlay = false;
        let targetVol = s.volume;
        if (type === 'focus') { if (s.name_cn === '白噪音') { shouldPlay = true; targetVol = 60; } if (s.name_cn === '咖啡馆氛围') { shouldPlay = true; targetVol = 40; } }
        else if (type === 'relax') { if (s.name_cn === '森林雨声') { shouldPlay = true; targetVol = 70; } if (s.name_cn === '篝火声') { shouldPlay = true; targetVol = 50; } }
        else if (type === 'nature') { if (s.name_cn === '海浪拍岸') { shouldPlay = true; targetVol = 60; } if (s.name_cn === '微风声') { shouldPlay = true; targetVol = 50; } }
        else if (type === 'random') { shouldPlay = Math.random() > 0.5; targetVol = shouldPlay ? Math.floor(Math.random() * 60 + 20) : s.volume; }
        return { ...s, isPlaying: shouldPlay, volume: targetVol };
      });

      // 同步音频播放状态
      newSounds.forEach(sound => {
         if (sound.audioUrl) {
            let howl = howlCache[sound.id];
            if (!howl) {
               howl = new Howl({ src: [sound.audioUrl], loop: true, volume: (sound.volume / 100) * (globalVolume / 100) });
               howlCache[sound.id] = howl;
            } else {
               howl.volume((sound.volume / 100) * (globalVolume / 100));
            }
            if (sound.isPlaying) { if (!howl.playing()) howl.play(); } else { howl.stop(); }
         }
      });
      return { sounds: newSounds, isGlobalPlaying: true };
    });
  },

  mixSounds: () => get().applyPreset('random'),
}));