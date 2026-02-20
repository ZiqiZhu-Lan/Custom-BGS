// 文件路径: src/stores/useSoundStore.ts

import { create } from 'zustand';
import { Howl } from 'howler';
import SHA256 from 'crypto-js/sha256';

// 引入音频文件
import rainFile from '../sounds/rain-on-grasst.mp3'; 
import wavesFile from '../sounds/waves.mp3';
import fireFile from '../sounds/bonfire.mp3';
import windFile from '../sounds/wind.mp3';
import birdFile from '../sounds/bird.mp3'; // ✅ 引入鸟鸣音频

// 引入本地背景图片
import rainBg from '../assets/images/rain-on-grasst.png'; 
import wavesBg from '../assets/images/waves.png';
import fireBg from '../assets/images/bonfire.png';
import windBg from '../assets/images/wind.png';
import birdBg from '../assets/images/bird.png'; // ✅ 引入鸟鸣图片

export interface SoundState { id: number; volume: number; isPlaying: boolean; }
export interface UserPreferences { globalVolume: number; timerDuration: number; soundStates: SoundState[]; lastActiveIds: number[]; }
export interface Sound extends SoundState { name: string; name_cn: string; category: string; icon: string; audioUrl: string; backgroundImageUrl?: string; }
export interface User { id: string; username: string; password?: string; preferences?: UserPreferences; }

export interface AppState {
  sounds: Sound[]; globalVolume: number; isGlobalPlaying: boolean; 
  timerDuration: number; timerPreset: number;
  isTimerActive: boolean; user: User | null; isLoggedIn: boolean; isLoginModalOpen: boolean; lastActiveIds: number[];
  _savePreferences: () => void; tick: () => void; toggleSound: (id: number) => void;
  updateSoundVolume: (id: number, vol: number) => void; toggleGlobalPlay: () => void; updateGlobalVolume: (vol: number) => void;
  setTimerDuration: (m: number) => void; toggleTimer: () => void;
  login: (u: string, p: string) => boolean; register: (u: string, p: string) => boolean;
  logout: () => void; toggleLoginModal: (isOpen?: boolean) => void;
  resetAllVolumes: () => void; applyPreset: (type: string) => void; mixSounds: () => void; rehydrateAudio: () => void;
}

const howlCache: Record<number, Howl> = {};
const STORAGE_KEY_USERS = 'silence_users_db', STORAGE_KEY_CURRENT = 'silence_curr_user';

// ✅ 更新配置：移除咖啡和白噪音，添加鸟鸣
const DEFAULT_SOUNDS_CONFIG: Omit<Sound, 'isPlaying' | 'volume'>[] = [
  { id: 1, name: 'Rain', name_cn: '草地雨声', category: 'nature', icon: '🌿', audioUrl: rainFile, backgroundImageUrl: rainBg },
  { id: 3, name: 'Waves', name_cn: '冥想海浪', category: 'nature', icon: '🌊', audioUrl: wavesFile, backgroundImageUrl: wavesBg },
  { id: 5, name: 'Fire', name_cn: '冬日篝火', category: 'nature', icon: '🔥', audioUrl: fireFile, backgroundImageUrl: fireBg },
  { id: 6, name: 'Wind', name_cn: '山谷微风', category: 'nature', icon: '💨', audioUrl: windFile, backgroundImageUrl: windBg },
  { id: 7, name: 'Birds', name_cn: '晨间鸟鸣', category: 'nature', icon: '🕊️', audioUrl: birdFile, backgroundImageUrl: birdBg },
];

const getInitialSounds = (): Sound[] => DEFAULT_SOUNDS_CONFIG.map((s: any) => ({ ...s, volume: 50, isPlaying: false }));
const hashPwd = (p: string) => SHA256(p).toString();
const safeParse = (key: string, fb: any) => { try { return JSON.parse(localStorage.getItem(key)!) || fb; } catch { return fb; } };

const initHowl = (id: number, url: string, vol: number, gVol: number) => {
  if (!howlCache[id]) howlCache[id] = new Howl({ src: [url], html5: true, loop: true, volume: (vol / 100) * (gVol / 100) });
  return howlCache[id];
};

const restoreState = () => {
  const user: User | null = safeParse(STORAGE_KEY_CURRENT, null);
  if (user?.preferences) {
    const { globalVolume, timerDuration, soundStates, lastActiveIds } = user.preferences;
    const restoredSounds = DEFAULT_SOUNDS_CONFIG.map((def: any) => {
      const saved = soundStates.find((s: SoundState) => s.id === def.id);
      return saved ? { ...def, volume: saved.volume, isPlaying: saved.isPlaying } : { ...def, volume: 50, isPlaying: false };
    });
    return { user, isLoggedIn: true, globalVolume, timerDuration: timerDuration || 15, timerPreset: timerDuration || 15, sounds: restoredSounds, isGlobalPlaying: restoredSounds.some((s: Sound) => s.isPlaying), lastActiveIds: lastActiveIds || [] };
  }
  return { user, isLoggedIn: !!user, globalVolume: 80, timerDuration: 15, timerPreset: 15, sounds: getInitialSounds(), isGlobalPlaying: false, lastActiveIds: [] };
};

export const useSoundStore = create<AppState>((set, get) => ({
  ...restoreState(), isTimerActive: false, isLoginModalOpen: false,

  _savePreferences: () => {
    const { user, sounds, globalVolume, timerPreset, isLoggedIn, lastActiveIds } = get();
    if (!isLoggedIn || !user) return;
    const prefs: UserPreferences = { globalVolume, timerDuration: timerPreset, soundStates: sounds.map((s: Sound) => ({ id: s.id, volume: s.volume, isPlaying: s.isPlaying })), lastActiveIds };
    const updatedUser = { ...user, preferences: prefs };
    const users: User[] = safeParse(STORAGE_KEY_USERS, []);
    const idx = users.findIndex((u: User) => u.username === user.username);
    if (idx !== -1) {
      users[idx] = updatedUser;
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(updatedUser));
    }
  },
  tick: () => {
    const { timerDuration, isTimerActive, sounds } = get();
    if (!isTimerActive) return;
    const next = timerDuration - (1 / 60);
    if (next <= 0) {
      Object.values(howlCache).forEach((h: Howl) => h.stop());
      set({ timerDuration: 0, isTimerActive: false, isGlobalPlaying: false, sounds: sounds.map((s: Sound) => ({ ...s, isPlaying: false })) });
    } else set({ timerDuration: next });
  },
  rehydrateAudio: () => {
    const { sounds, globalVolume } = get();
    sounds.forEach((s: Sound) => { if (s.isPlaying && s.audioUrl) { const h = initHowl(s.id, s.audioUrl, s.volume, globalVolume); if (!h.playing()) h.play(); } });
  },
  toggleSound: (id) => {
    const sound = get().sounds.find((s: Sound) => s.id === id);
    if (!sound || !sound.audioUrl) return;
    const gVol = get().globalVolume;
    set(state => {
      const updated = state.sounds.map((snd: Sound) => {
        if (snd.id === id) {
          const isPlay = !snd.isPlaying;
          const h = initHowl(id, snd.audioUrl, snd.volume, gVol);
          isPlay ? h.play() : h.stop();
          return { ...snd, isPlaying: isPlay };
        }
        return snd;
      });
      return { sounds: updated, isGlobalPlaying: updated.some((snd: Sound) => snd.isPlaying) };
    });
    get()._savePreferences();
  },
  updateSoundVolume: (id, vol) => {
    const gVol = get().globalVolume;
    if (howlCache[id]) howlCache[id].volume((vol / 100) * (gVol / 100));
    set(state => ({ sounds: state.sounds.map((s: Sound) => s.id === id ? { ...s, volume: vol } : s) }));
    get()._savePreferences();
  },
  updateGlobalVolume: (vol) => {
    set({ globalVolume: vol });
    get().sounds.forEach((s: Sound) => { if (howlCache[s.id]) howlCache[s.id].volume((s.volume / 100) * (vol / 100)); });
    get()._savePreferences();
  },
  setTimerDuration: (m) => { set({ timerDuration: m, timerPreset: m }); get()._savePreferences(); },
  
  toggleTimer: () => set(state => ({ 
    isTimerActive: !state.isTimerActive,
    timerDuration: (!state.isTimerActive && state.timerDuration <= 0) ? state.timerPreset : state.timerDuration
  })),

  toggleGlobalPlay: () => {
    const { isGlobalPlaying, sounds, lastActiveIds } = get();
    if (isGlobalPlaying) {
      const curr = sounds.filter((s: Sound) => s.isPlaying).map((s: Sound) => s.id);
      Object.values(howlCache).forEach((h: Howl) => h.stop());
      set({ isGlobalPlaying: false, isTimerActive: false, sounds: sounds.map((s: Sound) => ({ ...s, isPlaying: false })), lastActiveIds: curr.length ? curr : lastActiveIds });
    } else {
      const idsToPlay = (!lastActiveIds || !lastActiveIds.length) ? [1] : lastActiveIds;
      set({ isGlobalPlaying: true, sounds: sounds.map((s: Sound) => idsToPlay.includes(s.id) ? { ...s, isPlaying: true } : s) });
      get().rehydrateAudio();
    }
    get()._savePreferences();
  },
  login: (u, p) => {
    if (!p) return false;
    const found = safeParse(STORAGE_KEY_USERS, []).find((user: User) => user.username === u && user.password === hashPwd(p));
    if (found) {
      if (found.preferences) {
        const { globalVolume, timerDuration, soundStates, lastActiveIds } = found.preferences;
        const restored = DEFAULT_SOUNDS_CONFIG.map((def: any) => {
            const saved = soundStates.find((s: SoundState) => s.id === def.id);
            return saved ? { ...def, volume: saved.volume, isPlaying: saved.isPlaying } : { ...def, volume: 50, isPlaying: false };
        });
        set({ user: found, isLoggedIn: true, isLoginModalOpen: false, globalVolume, timerDuration: timerDuration || 15, timerPreset: timerDuration || 15, sounds: restored, isGlobalPlaying: restored.some((s: Sound) => s.isPlaying), lastActiveIds: lastActiveIds || [] });
        get().rehydrateAudio();
      } else set({ user: found, isLoggedIn: true, isLoginModalOpen: false });
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(found));
      return true;
    }
    return false;
  },
  register: (u, p) => {
    if (!p) return false;
    const users: User[] = safeParse(STORAGE_KEY_USERS, []);
    if (users.some((user: User) => user.username === u)) return false;
    const newUser: User = { id: Date.now().toString(), username: u, password: hashPwd(p) };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(newUser));
    set({ user: newUser, isLoggedIn: true, isLoginModalOpen: false, lastActiveIds: [], timerDuration: 15, timerPreset: 15 });
    return true;
  },
  logout: () => {
    Object.values(howlCache).forEach((h: Howl) => h.stop());
    localStorage.removeItem(STORAGE_KEY_CURRENT);
    set({ user: null, isLoggedIn: false, sounds: getInitialSounds(), globalVolume: 80, isGlobalPlaying: false, timerDuration: 15, timerPreset: 15, isTimerActive: false, lastActiveIds: [] });
  },
  toggleLoginModal: (open) => set(s => ({ isLoginModalOpen: open ?? !s.isLoginModalOpen })),
  resetAllVolumes: () => {}, applyPreset: () => {}, mixSounds: () => {}
}));