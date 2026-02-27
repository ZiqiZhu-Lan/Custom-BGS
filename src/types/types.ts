export interface SoundState { id: number; volume: number; isPlaying: boolean; }

export interface UserPreferences { globalVolume: number; timerDuration: number; soundStates: SoundState[]; lastActiveIds: number[]; }

/** Extends SoundState to inherit id, volume, isPlaying without repetition. */
export interface Sound extends SoundState { name: string; name_cn: string; category: string; icon: string; audioUrl: string; }

export interface User { id: string; username: string; password?: string; preferences?: UserPreferences; }

/** Must match the keys defined in the PRESETS map inside useSoundStore.ts. */
export type PresetType = 'focus' | 'relax' | 'sleep';

export interface AppState {
  // ── State ──────────────────────────────────────────────────────────────────
  sounds: Sound[]; globalVolume: number; isGlobalPlaying: boolean;
  timerDuration: number; isTimerActive: boolean;
  user: User | null; isLoggedIn: boolean; isLoginModalOpen: boolean; lastActiveIds: number[];

  // ── Audio ──────────────────────────────────────────────────────────────────
  rehydrateAudio:    () => void;
  toggleSound:       (id: number) => void;
  updateSoundVolume: (id: number, vol: number) => void;
  updateGlobalVolume:(vol: number) => void;
  toggleGlobalPlay:  () => void;

  // ── Timer ──────────────────────────────────────────────────────────────────
  tick:             () => void;
  setTimerDuration: (m: number) => void;
  toggleTimer:      () => void;

  // ── Presets ────────────────────────────────────────────────────────────────
  applyPreset: (type: PresetType) => void;

  // ── Auth ───────────────────────────────────────────────────────────────────
  login:            (u: string, p?: string) => boolean;
  register:         (u: string, p?: string) => boolean;
  logout:           () => void;
  toggleLoginModal: (isOpen?: boolean) => void;

  // ── Internal ───────────────────────────────────────────────────────────────
  _savePreferences: () => void;
}