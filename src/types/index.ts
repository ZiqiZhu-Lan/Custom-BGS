export interface Sound {
  id: number;
  name: string;
  name_cn?: string;
  category: string;
  icon: string;
  volume: number;
  audioUrl: string;
  isPlaying: boolean;
}

export interface User {
  id: string;
  username: string;
}

export type PresetType = 'focus' | 'relax' | 'nature' | 'random';

export interface AppState {
  sounds: Sound[];
  globalVolume: number;
  isGlobalPlaying: boolean;
  timerDuration: number;
  isTimerActive: boolean;
  user: User | null;
  isLoggedIn: boolean;
  isLoginModalOpen: boolean;
  toggleSound: (id: number) => void;
  updateSoundVolume: (id: number, vol: number) => void;
  toggleGlobalPlay: () => void;
  updateGlobalVolume: (vol: number) => void;
  setTimerDuration: (m: number) => void;
  toggleTimer: () => void;
  login: (username: string) => void;
  logout: () => void;
  toggleLoginModal: (isOpen?: boolean) => void;
  resetAllVolumes: () => void;
  applyPreset: (type: PresetType) => void;
  mixSounds: () => void;
}