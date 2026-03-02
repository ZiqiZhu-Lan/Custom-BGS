// 文件路径: src/stores/useSoundStore.ts
import { create } from 'zustand';
import { Howl } from 'howler';
import SHA256 from 'crypto-js/sha256';

import rainFile  from '../sounds/rain-on-grasst.mp3';
import wavesFile from '../sounds/waves.mp3';
import fireFile  from '../sounds/bonfire.mp3';
import windFile  from '../sounds/wind.mp3';
import birdFile  from '../sounds/bird.mp3';

export interface SoundState { id: number; volume: number; isPlaying: boolean; }
export interface UserPreferences { globalVolume: number; timerDuration: number; soundStates: SoundState[]; lastActiveIds: number[]; }
export interface Sound extends SoundState { name: string; name_es: string; name_ca: string; category: string; icon: string; audioUrl: string; }
export interface User { id: string; username: string; password?: string; preferences?: UserPreferences; }
export type PresetType = 'focus' | 'relax' | 'sleep';

export interface AppState {
  sounds: Sound[]; globalVolume: number; isGlobalPlaying: boolean;
  timerDuration: number; isTimerActive: boolean;
  user: User | null; isLoggedIn: boolean; isLoginModalOpen: boolean; lastActiveIds: number[];
  lang: 'ca' | 'es';
  _savePreferences: () => void; tick: () => void;
  rehydrateAudio:      () => void;
  toggleSound:         (id: number) => void;
  updateSoundVolume:   (id: number, vol: number) => void;
  toggleGlobalPlay:    () => void;
  updateGlobalVolume:  (vol: number) => void;
  setTimerDuration:    (m: number) => void;
  toggleTimer:         () => void;
  applyPreset:         (type: PresetType) => void;
  applyUrlMix:         (queryString: string) => void;
  resetMix:            () => void;
  login:               (u: string, p?: string) => boolean;
  register:            (u: string, p?: string) => boolean;
  logout:              () => void;
  deleteAccount:       () => void;
  toggleLoginModal:    (isOpen?: boolean) => void;
  setLang:             (lang: 'ca' | 'es') => void;
}

const SK_USERS = 'silence_users_db';
const SK_CURR  = 'silence_curr_user';
const SK_LANG  = 'silence_global_lang';

// 更新了双语支持的音频元数据
const BASE: Omit<Sound, 'isPlaying' | 'volume'>[] = [
  { id: 1, name: 'Rain',  name_es: 'LLUVIA DE LA PRADERA', name_ca: 'PLUJA DE LA PRADERIA', category: 'nature', icon: '🌿', audioUrl: rainFile  },
  { id: 3, name: 'Waves', name_es: 'MAREA SERENA',         name_ca: 'MAREA SERENA',       category: 'nature', icon: '🌊', audioUrl: wavesFile },
  { id: 5, name: 'Fire',  name_es: 'HOGUERA INVERNAL',     name_ca: 'FOGUERA HIVERNAL',   category: 'nature', icon: '🔥', audioUrl: fireFile  },
  { id: 6, name: 'Wind',  name_es: 'BRISA DEL VALLE',      name_ca: 'BRISA DE LA VALL',   category: 'nature', icon: '💨', audioUrl: windFile  },
  { id: 7, name: 'Birds', name_es: 'CANTO DEL ALBA',       name_ca: 'CANT DE L\'ALBA',    category: 'nature', icon: '🕊️', audioUrl: birdFile  },
];

const PRESETS: Record<PresetType, { vols: Record<number, number>; time: number }> = {
  focus: { vols: { 1: 65, 6: 35 }, time: 60 },
  relax: { vols: { 3: 50, 7: 40 }, time: 30 },
  sleep: { vols: { 5: 45, 1: 30 }, time: 60 },
};

const howlCache: Record<number, Howl> = {};

const safeParse = <T,>(key: string, fb: T): T => {
  try { return JSON.parse(localStorage.getItem(key)!) || fb; } catch { return fb; }
};

const hashPwd     = (p: string): string => SHA256(p).toString();
const freshSounds = (): Sound[] => BASE.map((s: Omit<Sound, 'isPlaying' | 'volume'>) => ({ ...s, volume: 50, isPlaying: false }));
const stopAll     = (): void => { Object.values(howlCache).forEach((h: Howl) => h.stop()); };
const mixVol      = (s: number, g: number): number => s * g / 10000;

const getOrCreateHowl = (id: number, url: string, vol: number, gVol: number): Howl => {
  if (!howlCache[id]) howlCache[id] = new Howl({ src: [url], html5: false, loop: true, volume: mixVol(vol, gVol) });
  return howlCache[id];
};

const fromPrefs = (prefs: UserPreferences) => {
  const sounds: Sound[] = BASE.map((def: Omit<Sound, 'isPlaying' | 'volume'>) => {
    const saved = prefs.soundStates?.find((s: SoundState) => s.id === def.id);
    return saved ? { ...def, ...saved } : { ...def, volume: 50, isPlaying: false };
  });
  return {
    globalVolume: prefs.globalVolume,
    timerDuration: prefs.timerDuration || 15,
    sounds,
    isGlobalPlaying: sounds.some((s: Sound) => s.isPlaying),
    lastActiveIds: prefs.lastActiveIds || [],
  };
};

const restoreState = () => {
  const user = safeParse<User | null>(SK_CURR, null);
  const lang = safeParse<'ca' | 'es'>(SK_LANG, 'ca');
  return user?.preferences
    ? { user, isLoggedIn: true, lang, ...fromPrefs(user.preferences) }
    : { user, isLoggedIn: !!user, lang, globalVolume: 80, timerDuration: 15, sounds: freshSounds(), isGlobalPlaying: false, lastActiveIds: [] as number[] };
};

const persistUser = (user: User): void => {
  const users: User[] = safeParse(SK_USERS, []);
  const idx = users.findIndex((u: User) => u.username === user.username);
  if (idx === -1) return;
  users[idx] = user;
  localStorage.setItem(SK_USERS, JSON.stringify(users));
  localStorage.setItem(SK_CURR,  JSON.stringify(user));
};

export const useSoundStore = create<AppState>((set, get) => ({
  ...restoreState(),
  isTimerActive: false,
  isLoginModalOpen: false,

  _savePreferences: (): void => {
    const { user, sounds, globalVolume, timerDuration, isLoggedIn, lastActiveIds } = get();
    if (!isLoggedIn || !user) return;
    persistUser({
      ...user,
      preferences: {
        globalVolume, timerDuration, lastActiveIds,
        soundStates: sounds.map(({ id, volume, isPlaying }: Sound): SoundState => ({ id, volume, isPlaying })),
      },
    });
  },

  tick: (): void => {
    const { timerDuration, isTimerActive, sounds } = get();
    if (!isTimerActive) return;
    if (timerDuration <= 1 / 60) {
      stopAll();
      set({ timerDuration: 0, isTimerActive: false, isGlobalPlaying: false, sounds: sounds.map((s: Sound) => ({ ...s, isPlaying: false })) });
    } else {
      set({ timerDuration: timerDuration - 1 / 60 });
    }
  },

  rehydrateAudio: (): void => {
    const { sounds, globalVolume } = get();
    sounds.forEach((s: Sound) => {
      if (s.isPlaying && s.audioUrl) {
        const h = getOrCreateHowl(s.id, s.audioUrl, s.volume, globalVolume);
        if (!h.playing()) h.play();
      }
    });
  },

  toggleSound: (id: number): void => {
    const { sounds, globalVolume } = get();
    if (!sounds.find((s: Sound) => s.id === id)?.audioUrl) return;
    set((state: AppState) => {
      const upd = state.sounds.map((s: Sound) => {
        if (s.id !== id) return s;
        const playing = !s.isPlaying;
        playing ? getOrCreateHowl(id, s.audioUrl, s.volume, globalVolume).play() : howlCache[id]?.stop();
        return { ...s, isPlaying: playing };
      });
      return { sounds: upd, isGlobalPlaying: upd.some((s: Sound) => s.isPlaying) };
    });
    get()._savePreferences();
  },

  updateSoundVolume: (id: number, vol: number): void => {
    if (howlCache[id]) howlCache[id].volume(mixVol(vol, get().globalVolume));
    set((state: AppState) => ({ sounds: state.sounds.map((s: Sound) => s.id === id ? { ...s, volume: vol } : s) }));
    get()._savePreferences();
  },

  updateGlobalVolume: (vol: number): void => {
    set({ globalVolume: vol });
    get().sounds.forEach((s: Sound) => { howlCache[s.id]?.volume(mixVol(s.volume, vol)); });
    get()._savePreferences();
  },

  setTimerDuration: (m: number): void => {
    set({ timerDuration: m, isTimerActive: m > 0 });
    get()._savePreferences();
  },

  toggleTimer: (): void => {
    const { isTimerActive, timerDuration } = get();
    set({ isTimerActive: !isTimerActive && timerDuration > 0 });
  },

  toggleGlobalPlay: (): void => {
    const { isGlobalPlaying, sounds, lastActiveIds } = get();
    if (isGlobalPlaying) {
      const curr = sounds.filter((s: Sound) => s.isPlaying).map((s: Sound) => s.id);
      stopAll();
      set({ isGlobalPlaying: false, isTimerActive: false, sounds: sounds.map((s: Sound) => ({ ...s, isPlaying: false })), lastActiveIds: curr.length ? curr : lastActiveIds });
    } else {
      const ids = lastActiveIds?.length ? lastActiveIds : [1];
      set({ isGlobalPlaying: true, sounds: sounds.map((s: Sound) => ({ ...s, isPlaying: ids.includes(s.id) })) });
      get().rehydrateAudio();
    }
    get()._savePreferences();
  },

  applyPreset: (type: PresetType): void => {
    const conf = PRESETS[type];
    if (!conf) return;
    stopAll();
    set({
      sounds: get().sounds.map((s: Sound) => ({ ...s, isPlaying: s.id in conf.vols, volume: conf.vols[s.id] ?? s.volume })),
      isGlobalPlaying: true, isTimerActive: true, timerDuration: conf.time,
      lastActiveIds: Object.keys(conf.vols).map(Number),
    });
    get().rehydrateAudio();
    get()._savePreferences();
  },

  applyUrlMix: (queryString: string): void => {
    if (!queryString) return;
    const params = new URLSearchParams(queryString);
    const nameToId: Record<string, number> = { rain: 1, waves: 3, fire: 5, wind: 6, birds: 7 };
    const newVols: Record<number, number> = {};

    params.forEach((val, key) => {
      const id = nameToId[key.toLowerCase()];
      if (id) {
        const vol = parseInt(val, 10);
        if (!isNaN(vol) && vol >= 0 && vol <= 100) {
          newVols[id] = vol;
        }
      }
    });

    if (Object.keys(newVols).length === 0) return;

    stopAll();
    set((state: AppState) => ({
      sounds: state.sounds.map((s: Sound) => ({
        ...s,
        isPlaying: s.id in newVols,
        volume: s.id in newVols ? newVols[s.id] : s.volume
      })),
      isGlobalPlaying: true,
      lastActiveIds: Object.keys(newVols).map(Number)
    }));
    get().rehydrateAudio();
    get()._savePreferences();
  },

  resetMix: (): void => {
    stopAll();
    set((state: AppState) => ({
      sounds: state.sounds.map((s: Sound) => ({ ...s, isPlaying: false, volume: 50 })),
      globalVolume: 80,
      isGlobalPlaying: false,
      isTimerActive: false,
      timerDuration: 15,
      lastActiveIds: []
    }));
    get()._savePreferences();
  },

  login: (u: string, p?: string): boolean => {
    if (!p) return false;
    const found = safeParse<User[]>(SK_USERS, []).find(
      (user: User) => user.username === u && user.password === hashPwd(p),
    );
    if (!found) return false;
    set({ user: found, isLoggedIn: true, isLoginModalOpen: false, ...(found.preferences ? fromPrefs(found.preferences) : {}) });
    if (found.preferences) get().rehydrateAudio();
    localStorage.setItem(SK_CURR, JSON.stringify(found));
    return true;
  },

  register: (u: string, p?: string): boolean => {
    if (!p) return false;
    const users = safeParse<User[]>(SK_USERS, []);
    if (users.some((user: User) => user.username === u)) return false;
    const nu: User = { id: Date.now().toString(), username: u, password: hashPwd(p) };
    users.push(nu);
    localStorage.setItem(SK_USERS, JSON.stringify(users));
    localStorage.setItem(SK_CURR,  JSON.stringify(nu));
    set({ user: nu, isLoggedIn: true, isLoginModalOpen: false, lastActiveIds: [], timerDuration: 15 });
    return true;
  },

  logout: (): void => {
    stopAll();
    localStorage.removeItem(SK_CURR);
    set({ user: null, isLoggedIn: false, sounds: freshSounds(), globalVolume: 80, isGlobalPlaying: false, timerDuration: 15, isTimerActive: false, lastActiveIds: [] });
  },

  deleteAccount: (): void => {
    const { user, logout } = get();
    if (!user) return;
    const users = safeParse<User[]>(SK_USERS, []).filter((u: User) => u.username !== user.username);
    localStorage.setItem(SK_USERS, JSON.stringify(users));
    logout();
  },

  toggleLoginModal: (open?: boolean): void => {
    set((s: AppState) => ({ isLoginModalOpen: open ?? !s.isLoginModalOpen }));
  },

  setLang: (lang: 'ca' | 'es'): void => {
    localStorage.setItem(SK_LANG, JSON.stringify(lang));
    set({ lang });
  }
}));