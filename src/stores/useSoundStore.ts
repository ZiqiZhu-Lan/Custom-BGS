import { create } from 'zustand';
import { AppState, Sound, PresetType } from '../types';

// ... (保留你原有的 mockSounds 数据) ...
const mockSounds: Sound[] = [
    // ... 请保留你之前的声音数据 ...
    { id: 1, name: 'Forest Rain', name_cn: '森林细雨', category: 'nature', icon: '🌧️', volume: 50, audioUrl: '/sounds/rain.mp3', isPlaying: false },
    { id: 2, name: 'Coffee Shop', name_cn: '午后咖啡馆', category: 'urban', icon: '☕', volume: 40, audioUrl: '/sounds/coffee.mp3', isPlaying: false },
    { id: 3, name: 'Ocean Waves', name_cn: '冥想海浪', category: 'nature', icon: '🌊', volume: 60, audioUrl: '/sounds/waves.mp3', isPlaying: false },
    { id: 4, name: 'White Noise', name_cn: '深度白噪音', category: 'focus', icon: '📡', volume: 70, audioUrl: '/sounds/white.mp3', isPlaying: false },
    { id: 5, name: 'Campfire', name_cn: '冬日篝火', category: 'nature', icon: '🔥', volume: 50, audioUrl: '/sounds/fire.mp3', isPlaying: false },
    { id: 6, name: 'Mountain Wind', name_cn: '山谷微风', category: 'nature', icon: '💨', volume: 45, audioUrl: '/sounds/wind.mp3', isPlaying: false },
];

export const useSoundStore = create<AppState>((set, get) => ({
  sounds: mockSounds,
  globalVolume: 80,
  isGlobalPlaying: false,
  activeSoundId: null,
  timerDuration: 15,
  isTimerActive: false,
  
  // 新增状态初始化
  user: null,
  isLoggedIn: false,
  isLoginModalOpen: false,

  toggleSound: (id) => set((state) => ({
    sounds: state.sounds.map(s => s.id === id ? { ...s, isPlaying: !s.isPlaying } : s),
    isGlobalPlaying: true 
  })),

  updateSoundVolume: (id, vol) => set((state) => ({
    sounds: state.sounds.map(s => s.id === id ? { ...s, volume: vol } : s)
  })),

  toggleGlobalPlay: () => set((state) => ({ isGlobalPlaying: !state.isGlobalPlaying })),
  updateGlobalVolume: (vol) => set({ globalVolume: vol }),
  
  resetAllVolumes: () => set((state) => ({
    sounds: state.sounds.map(s => ({ ...s, volume: 0, isPlaying: false })),
    isGlobalPlaying: false
  })),

  setTimerDuration: (m) => set({ timerDuration: m }),
  toggleTimer: () => set((state) => ({ isTimerActive: !state.isTimerActive })),
  mixSounds: () => console.log("Mixing..."), 
  applyPreset: (t) => console.log("Preset", t),

  // 新增：登录 Mock 逻辑
  login: (username) => {
    // 模拟API调用延迟
    setTimeout(() => {
        set({ 
            user: { id: '1', username: username || 'Traveler' }, 
            isLoggedIn: true,
            isLoginModalOpen: false 
        });
    }, 500);
  },

  logout: () => set({ user: null, isLoggedIn: false }),
  
  toggleLoginModal: (isOpen) => set((state) => ({ 
      isLoginModalOpen: isOpen !== undefined ? isOpen : !state.isLoginModalOpen 
  })),
}));