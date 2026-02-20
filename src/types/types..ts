export interface SoundState { id: number; volume: number; isPlaying: boolean; }
export interface UserPreferences { globalVolume: number; timerDuration: number; soundStates: SoundState[]; lastActiveIds: number[]; }
// 优化：直接继承 SoundState，避免重复写 id, volume, isPlaying
export interface Sound extends SoundState { name: string; name_cn: string; category: string; icon: string; audioUrl: string; }
export interface User { id: string; username: string; password?: string; preferences?: UserPreferences; }
export type PresetType = 'focus' | 'relax' | 'nature' | 'random';

export interface AppState {
  sounds: Sound[]; globalVolume: number; isGlobalPlaying: boolean; timerDuration: number;
  isTimerActive: boolean; user: User | null; isLoggedIn: boolean; isLoginModalOpen: boolean; lastActiveIds: number[];
  _savePreferences: () => void; tick: () => void; toggleSound: (id: number) => void;
  updateSoundVolume: (id: number, vol: number) => void; toggleGlobalPlay: () => void; updateGlobalVolume: (vol: number) => void;
  setTimerDuration: (m: number) => void; toggleTimer: () => void;
  login: (u: string, p?: string) => boolean; register: (u: string, p?: string) => boolean;
  logout: () => void; toggleLoginModal: (isOpen?: boolean) => void;
  resetAllVolumes: () => void; applyPreset: (type: PresetType) => void; mixSounds: () => void; rehydrateAudio: () => void;
}