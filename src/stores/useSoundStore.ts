// 文件路径: src/stores/useSoundStore.ts
import { create } from 'zustand';
import { Howl } from 'howler';
import SHA256 from 'crypto-js/sha256';

import rainFile from '../sounds/rain-on-grasst.mp3';
import wavesFile from '../sounds/waves.mp3';
import fireFile from '../sounds/bonfire.mp3';
import windFile from '../sounds/wind.mp3';
import birdFile from '../sounds/bird.mp3';

import rainBg from '../assets/images/rain-on-grasst.png';
import wavesBg from '../assets/images/waves.png';
import fireBg from '../assets/images/bonfire.png';
import windBg from '../assets/images/wind.png';
import birdBg from '../assets/images/bird.png';

export interface SoundState { id: number; volume: number; isPlaying: boolean; }
export interface UserPreferences { globalVolume: number; timerDuration: number; soundStates: SoundState[]; lastActiveIds: number[]; }
export interface Sound extends SoundState { name: string; name_cn: string; category: string; icon: string; audioUrl: string; backgroundImageUrl?: string; }
export interface User { id: string; username: string; password?: string; preferences?: UserPreferences; }
export interface AppState {
  sounds: Sound[]; globalVolume: number; isGlobalPlaying: boolean;
  timerDuration: number; timerPreset: number; isTimerActive: boolean;
  user: User | null; isLoggedIn: boolean; isLoginModalOpen: boolean; lastActiveIds: number[];
  _savePreferences: () => void; tick: () => void; toggleSound: (id: number) => void;
  updateSoundVolume: (id: number, vol: number) => void; toggleGlobalPlay: () => void;
  updateGlobalVolume: (vol: number) => void; setTimerDuration: (m: number) => void;
  login: (u: string, p: string) => boolean;
  register: (u: string, p: string) => boolean; logout: () => void;
  toggleLoginModal: (isOpen?: boolean) => void; resetAllVolumes: () => void;
  applyPreset: (type: string) => void; mixSounds: () => void; rehydrateAudio: () => void;
}

const howlCache: Record<number, Howl> = {};
const SK_USERS = 'silence_users_db', SK_CURR = 'silence_curr_user';

const BASE: Omit<Sound, 'isPlaying' | 'volume'>[] = [
  { id: 1, name: 'Rain',  name_cn: '草地雨声', category: 'nature', icon: '🌿', audioUrl: rainFile,  backgroundImageUrl: rainBg  },
  { id: 3, name: 'Waves', name_cn: '冥想海浪', category: 'nature', icon: '🌊', audioUrl: wavesFile, backgroundImageUrl: wavesBg },
  { id: 5, name: 'Fire',  name_cn: '冬日篝火', category: 'nature', icon: '🔥', audioUrl: fireFile,  backgroundImageUrl: fireBg  },
  { id: 6, name: 'Wind',  name_cn: '山谷微风', category: 'nature', icon: '💨', audioUrl: windFile,  backgroundImageUrl: windBg  },
  { id: 7, name: 'Birds', name_cn: '晨间鸟鸣', category: 'nature', icon: '🕊️', audioUrl: birdFile,  backgroundImageUrl: birdBg  },
];

const safeParse = (key: string, fb: any) => { try { return JSON.parse(localStorage.getItem(key)!) || fb; } catch { return fb; } };
const hashPwd  = (p: string) => SHA256(p).toString();
const freshSounds = (): Sound[] => BASE.map(s => ({ ...s, volume: 50, isPlaying: false }));
const stopAll  = () => Object.values(howlCache).forEach(h => h.stop());

const fromPrefs = (prefs: UserPreferences) => {
  const sounds = BASE.map(def => {
    const saved = prefs.soundStates?.find(s => s.id === def.id);
    return saved ? { ...def, volume: saved.volume, isPlaying: saved.isPlaying } : { ...def, volume: 50, isPlaying: false };
  });
  return { globalVolume: prefs.globalVolume, timerDuration: prefs.timerDuration || 15, timerPreset: prefs.timerDuration || 15, sounds, isGlobalPlaying: sounds.some(s => s.isPlaying), lastActiveIds: prefs.lastActiveIds || [] };
};

const restoreState = () => {
  const user: User | null = safeParse(SK_CURR, null);
  return user?.preferences ? { user, isLoggedIn: true, ...fromPrefs(user.preferences) } : { user, isLoggedIn: !!user, globalVolume: 80, timerDuration: 15, timerPreset: 15, sounds: freshSounds(), isGlobalPlaying: false, lastActiveIds: [] };
};

const initHowl = (id: number, url: string, vol: number, gVol: number) => {
  if (!howlCache[id]) howlCache[id] = new Howl({ src: [url], html5: false, loop: true, volume: vol * gVol / 10000 });
  return howlCache[id];
};

const PRESETS: Record<string, { vols: Record<number, number>; time: number }> = { focus: { vols: { 1: 65, 6: 35 }, time: 60 }, relax: { vols: { 3: 50, 7: 40 }, time: 30 }, sleep: { vols: { 5: 45, 1: 30 }, time: 60 } };

export const useSoundStore = create<AppState>((set, get) => ({
  ...restoreState(), isTimerActive: false, isLoginModalOpen: false,

  _savePreferences: () => {
    const { user, sounds, globalVolume, timerPreset, isLoggedIn, lastActiveIds } = get();
    if (!isLoggedIn || !user) return;
    const users: User[] = safeParse(SK_USERS, []);
    const idx = users.findIndex(u => u.username === user.username);
    if (idx === -1) return;
    const updated = { ...user, preferences: { globalVolume, timerDuration: timerPreset, soundStates: sounds.map(s => ({ id: s.id, volume: s.volume, isPlaying: s.isPlaying })), lastActiveIds } };
    users[idx] = updated;
    localStorage.setItem(SK_USERS, JSON.stringify(users));
    localStorage.setItem(SK_CURR, JSON.stringify(updated));
  },

  tick: () => {
    const { timerDuration, isTimerActive, sounds } = get();
    if (!isTimerActive) return;
    if (timerDuration <= 1/60) { stopAll(); set({ timerDuration: 0, isTimerActive: false, isGlobalPlaying: false, sounds: sounds.map(s => ({ ...s, isPlaying: false })) }); }
    else set({ timerDuration: timerDuration - 1 / 60 });
  },

  rehydrateAudio: () => {
    const { sounds, globalVolume } = get();
    sounds.forEach(s => { if (s.isPlaying && s.audioUrl) { const h = initHowl(s.id, s.audioUrl, s.volume, globalVolume); if (!h.playing()) h.play(); } });
  },

  toggleSound: (id) => {
    const { sounds, globalVolume } = get();
    if (!sounds.find(s => s.id === id)?.audioUrl) return;
    set(state => {
      const upd = state.sounds.map(s => {
        if (s.id !== id) return s;
        const isPlaying = !s.isPlaying;
        isPlaying ? initHowl(id, s.audioUrl, s.volume, globalVolume).play() : howlCache[id]?.stop();
        return { ...s, isPlaying };
      });
      return { sounds: upd, isGlobalPlaying: upd.some(s => s.isPlaying) };
    });
    get()._savePreferences();
  },

  updateSoundVolume: (id, vol) => {
    if (howlCache[id]) howlCache[id].volume(vol * get().globalVolume / 10000);
    set(state => ({ sounds: state.sounds.map(s => s.id === id ? { ...s, volume: vol } : s) }));
    get()._savePreferences();
  },

  updateGlobalVolume: (vol) => {
    set({ globalVolume: vol });
    get().sounds.forEach(s => howlCache[s.id]?.volume(s.volume * vol / 10000));
    get()._savePreferences();
  },

  // ✅ 修改点：选择时间的同时，直接启动或停止计时器
  setTimerDuration: (m) => { 
    set({ timerDuration: m, timerPreset: m, isTimerActive: m > 0 }); 
    get()._savePreferences(); 
  },

  toggleGlobalPlay: () => {
    const { isGlobalPlaying, sounds, lastActiveIds } = get();
    if (isGlobalPlaying) {
      const curr = sounds.filter(s => s.isPlaying).map(s => s.id);
      stopAll();
      set({ isGlobalPlaying: false, isTimerActive: false, sounds: sounds.map(s => ({ ...s, isPlaying: false })), lastActiveIds: curr.length ? curr : lastActiveIds });
    } else {
      const ids = lastActiveIds?.length ? lastActiveIds : [1];
      set({ isGlobalPlaying: true, sounds: sounds.map(s => ({ ...s, isPlaying: ids.includes(s.id) })) });
      get().rehydrateAudio();
    }
    get()._savePreferences();
  },

  applyPreset: (type) => {
    const conf = PRESETS[type];
    if (!conf) return;
    stopAll();
    set({ sounds: get().sounds.map(s => ({ ...s, isPlaying: s.id in conf.vols, volume: conf.vols[s.id] ?? s.volume })), isGlobalPlaying: true, isTimerActive: true, timerDuration: conf.time, timerPreset: conf.time, lastActiveIds: Object.keys(conf.vols).map(Number) });
    get().rehydrateAudio();
    get()._savePreferences();
  },

  login: (u, p) => {
    if (!p) return false;
    const found = safeParse(SK_USERS, []).find((user: User) => user.username === u && user.password === hashPwd(p));
    if (!found) return false;
    set({ user: found, isLoggedIn: true, isLoginModalOpen: false, ...(found.preferences ? fromPrefs(found.preferences) : {}) });
    if (found.preferences) get().rehydrateAudio();
    localStorage.setItem(SK_CURR, JSON.stringify(found));
    return true;
  },

  register: (u, p) => {
    if (!p) return false;
    const users = safeParse(SK_USERS, []);
    if (users.some((user: User) => user.username === u)) return false;
    const nu: User = { id: Date.now().toString(), username: u, password: hashPwd(p) };
    users.push(nu);
    localStorage.setItem(SK_USERS, JSON.stringify(users));
    localStorage.setItem(SK_CURR, JSON.stringify(nu));
    set({ user: nu, isLoggedIn: true, isLoginModalOpen: false, lastActiveIds: [], timerDuration: 15, timerPreset: 15 });
    return true;
  },

  logout: () => {
    stopAll();
    localStorage.removeItem(SK_CURR);
    set({ user: null, isLoggedIn: false, sounds: freshSounds(), globalVolume: 80, isGlobalPlaying: false, timerDuration: 15, timerPreset: 15, isTimerActive: false, lastActiveIds: [] });
  },

  toggleLoginModal: (open) => set(s => ({ isLoginModalOpen: open ?? !s.isLoginModalOpen })),
  resetAllVolumes: () => {}, mixSounds: () => {},
}));