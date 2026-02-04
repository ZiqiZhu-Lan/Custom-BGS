// 文件路径: src/types/index.ts

export interface Sound {
  id: number;
  name: string;
  name_cn?: string;
  category: string;
  icon: string;
  color?: string;
  volume: number;
  audioUrl: string;
  isPlaying: boolean;
}

// 新增：用户接口
export interface User {
  id: string;
  username: string;
  avatar?: string;
}

export type PresetType = 'focus' | 'relax' | 'nature' | 'random';

export interface AppState {
  sounds: Sound[];
  globalVolume: number;
  isGlobalPlaying: boolean;
  activeSoundId: number | null;
  timerDuration: number;
  isTimerActive: boolean;

  // 新增：登录相关状态
  user: User | null;
  isLoggedIn: boolean;
  isLoginModalOpen: boolean; // 控制弹窗显示

  toggleSound: (soundId: number) => void;
  updateSoundVolume: (soundId: number, volume: number) => void;
  toggleGlobalPlay: () => void;
  updateGlobalVolume: (volume: number) => void;
  resetAllVolumes: () => void;
  setTimerDuration: (minutes: number) => void;
  toggleTimer: () => void;
  mixSounds: () => void;
  applyPreset: (type: PresetType) => void; 
  
  // 新增：登录相关方法
  login: (username: string) => void;
  logout: () => void;
  toggleLoginModal: (isOpen?: boolean) => void;
}