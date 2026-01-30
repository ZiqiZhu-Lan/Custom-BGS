// 文件路径: src/types/index.ts

// 1. 定义单个声音的结构
export interface Sound {
  id: number;
  name: string;
  name_cn?: string;
  category: string;
  icon: string;
  color?: string;
  volume: number;
  audioUrl: string; // 必填，不能有问号
  isPlaying: boolean;
}

// 2. 导出预设类型
export type PresetType = 'focus' | 'relax' | 'nature' | 'random';

// 3. 定义 Store 的状态接口
export interface AppState {
  sounds: Sound[];
  globalVolume: number;
  isGlobalPlaying: boolean;
  activeSoundId: number | null;
  timerDuration: number;
  isTimerActive: boolean;

  toggleSound: (soundId: number) => void;
  updateSoundVolume: (soundId: number, volume: number) => void;
  toggleGlobalPlay: () => void;
  updateGlobalVolume: (volume: number) => void;
  resetAllVolumes: () => void;
  setTimerDuration: (minutes: number) => void;
  toggleTimer: () => void;
  
  // ★★★ 必须包含这两个方法，否则 App.tsx 会报错 ★★★
  mixSounds: () => void;
  applyPreset: (type: PresetType) => void; 
}