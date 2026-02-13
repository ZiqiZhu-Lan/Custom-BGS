import { create } from 'zustand';
import { Howl } from 'howler';
import { AppState, Sound } from '../types';

// ✅ 只导入目前存在的这一个文件
import rainOnGrassFile from '../sounds/rain-on-grasst.wav';

const howlCache: Record<number, Howl> = {};

const mockSounds: Sound[] = [
  { id: 1, name: 'Rain on Grass', name_cn: '草地雨声', category: 'nature', icon: '🌿', volume: 70, audioUrl: rainOnGrassFile, isPlaying: false },
  // 以下标签保留，但先不导入文件，audioUrl 暂时设为空，防止编译报错
  { id: 2, name: 'Coffee Shop', name_cn: '午后咖啡馆', category: 'urban', icon: '☕', volume: 40, audioUrl: '', isPlaying: false },
  { id: 3, name: 'Ocean Waves', name_cn: '冥想海浪', category: 'nature', icon: '🌊', volume: 60, audioUrl: '', isPlaying: false },
  { id: 4, name: 'White Noise', name_cn: '深度白噪音', category: 'focus', icon: '📡', volume: 70, audioUrl: '', isPlaying: false },
  { id: 5, name: 'Campfire', name_cn: '冬日篝火', category: 'nature', icon: '🔥', volume: 50, audioUrl: '', isPlaying: false },
  { id: 6, name: 'Mountain Wind', name_cn: '山谷微风', category: 'nature', icon: '💨', volume: 45, audioUrl: '', isPlaying: false },
];

export const useSoundStore = create<AppState>((set, get) => ({
  sounds: mockSounds,
  globalVolume: 80,
  isGlobalPlaying: false,
  timerDuration: 15,
  isTimerActive: false,
  user: null,
  isLoggedIn: false,
  isLoginModalOpen: false,

  toggleSound: (id) => {
    const sound = get().sounds.find(s => s.id === id);
    if (!sound || !sound.audioUrl) {
        alert("该音频文件尚未添加，请先保留草地雨声测试。");
        return;
    }

    const { globalVolume } = get();
    set((state) => {
      const updatedSounds = state.sounds.map(s => {
        if (s.id === id) {
          const nextState = !s.isPlaying;
          let howl = howlCache[id];
          if (!howl) {
            howl = new Howl({
              src: [s.audioUrl],
              html5: true,
              loop: true,
              volume: (s.volume / 100) * (globalVolume / 100),
            });
            howlCache[id] = howl;
          }
          nextState ? howl.play() : howl.stop();
          return { ...s, isPlaying: nextState };
        }
        return s;
      });
      return { sounds: updatedSounds, isGlobalPlaying: updatedSounds.some(s => s.isPlaying) };
    });
  },

  updateSoundVolume: (id, vol) => {
    const { globalVolume } = get();
    if (howlCache[id]) howlCache[id].volume((vol / 100) * (globalVolume / 100));
    set((state) => ({ sounds: state.sounds.map(s => s.id === id ? { ...s, volume: vol } : s) }));
  },

  toggleGlobalPlay: () => {
    const { isGlobalPlaying, sounds } = get();
    if (isGlobalPlaying) {
      Object.values(howlCache).forEach(h => h.stop());
      set({ isGlobalPlaying: false, sounds: sounds.map(s => ({ ...s, isPlaying: false })) });
    } else {
      get().toggleSound(1); // 默认开启存在的雨声
    }
  },

  updateGlobalVolume: (vol) => {
    const { sounds } = get();
    set({ globalVolume: vol });
    sounds.forEach(s => {
      if (howlCache[s.id]) howlCache[s.id].volume((s.volume / 100) * (vol / 100));
    });
  },

  setTimerDuration: (m) => set({ timerDuration: m }),
  toggleTimer: () => set((state) => ({ isTimerActive: !state.isTimerActive })),
  login: (username) => set({ user: { id: '1', username }, isLoggedIn: true, isLoginModalOpen: false }),
  logout: () => set({ user: null, isLoggedIn: false }),
  toggleLoginModal: (isOpen) => set({ isLoginModalOpen: isOpen ?? !get().isLoginModalOpen }),
  resetAllVolumes: () => {},
  applyPreset: () => {},
  mixSounds: () => {}
}));