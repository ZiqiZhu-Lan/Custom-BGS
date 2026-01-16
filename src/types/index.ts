// 声音类型定义
export interface Sound {
  id: number;
  name: string; // 加泰罗尼亚语名称
  name_cn?: string; // 中文名称（可选）
  category: string;
  icon: string;
  color: string;
  volume: number;
  audioUrl?: string; // 音频文件URL
  isPlaying?: boolean;
  howl?: any; // Howler实例
}

// 全局状态类型
export interface AppState {
  sounds: Sound[];
  globalVolume: number;
  isGlobalPlaying: boolean;
  activeSoundId: number | null;
  timerDuration: number; // 定时器时长（分钟）
  isTimerActive: boolean;
  
  // Actions
  toggleSound: (soundId: number) => void;
  updateSoundVolume: (soundId: number, volume: number) => void;
  toggleGlobalPlay: () => void;
  updateGlobalVolume: (volume: number) => void;
  resetAllVolumes: () => void;
  setTimerDuration: (minutes: number) => void;
  toggleTimer: () => void;
  mixSounds: () => void;
}