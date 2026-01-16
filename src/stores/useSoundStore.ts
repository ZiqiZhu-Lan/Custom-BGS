import { create } from 'zustand';
import { Howl } from 'howler';
import { Sound, AppState } from '../types';

// 初始声音数据
const initialSounds: Sound[] = [
  { 
    id: 1, 
    name: 'Pluja al bosc', 
    name_cn: '森林雨声',
    category: 'Naturalesa', 
    icon: '🌧️', 
    color: 'bg-blue-100', 
    volume: 70,
    audioUrl: '/sounds/rain.mp3'
  },
  { 
    id: 2, 
    name: 'Ambient de cafeteria', 
    name_cn: '咖啡馆氛围',
    category: 'Ambient', 
    icon: '☕', 
    color: 'bg-amber-100', 
    volume: 60,
    audioUrl: '/sounds/cafe.mp3'
  },
  { 
    id: 3, 
    name: 'Onades a la platja', 
    name_cn: '海浪拍岸',
    category: 'Naturalesa', 
    icon: '🌊', 
    color: 'bg-cyan-100', 
    volume: 65,
    audioUrl: '/sounds/waves.mp3'
  },
  { 
    id: 4, 
    name: 'Soroll blanc', 
    name_cn: '白噪音',
    category: 'Concentració', 
    icon: '📡', 
    color: 'bg-gray-100', 
    volume: 50,
    audioUrl: '/sounds/white-noise.mp3'
  },
  { 
    id: 5, 
    name: 'Foc cremant', 
    name_cn: '篝火声',
    category: 'Relaxació', 
    icon: '🔥', 
    color: 'bg-orange-100', 
    volume: 55,
    audioUrl: '/sounds/fire.mp3'
  },
  { 
    id: 6, 
    name: 'Vent suau', 
    name_cn: '微风声',
    category: 'Naturalesa', 
    icon: '💨', 
    color: 'bg-sky-100', 
    volume: 45,
    audioUrl: '/sounds/wind.mp3'
  },
];

export const useSoundStore = create<AppState>((set, get) => ({
  sounds: initialSounds,
  globalVolume: 65,
  isGlobalPlaying: false,
  activeSoundId: null,
  timerDuration: 25, // 默认25分钟番茄钟
  isTimerActive: false,

  // 切换单个声音播放状态
  toggleSound: (soundId: number) => {
    const { sounds, activeSoundId, isGlobalPlaying } = get();
    
    set((state) => {
      const updatedSounds = state.sounds.map(sound => {
        if (sound.id === soundId) {
          // 创建或获取Howler实例
          let howl = sound.howl;
          if (!howl && sound.audioUrl) {
            howl = new Howl({
              src: [sound.audioUrl],
              volume: sound.volume / 100,
              loop: true,
              onload: () => console.log(`${sound.name} loaded`),
              onloaderror: (id, error) => console.error('加载错误:', error)
            });
          }
          
          const shouldPlay = !(sound.id === activeSoundId && isGlobalPlaying);
          
          if (howl) {
            if (shouldPlay) {
              howl.volume(sound.volume / 100);
              howl.play();
            } else {
              howl.stop();
            }
          }
          
          return { 
            ...sound, 
            howl, 
            isPlaying: shouldPlay 
          };
        }
        // 停止其他正在播放的声音
        if (sound.howl && sound.isPlaying) {
          sound.howl.stop();
          return { ...sound, isPlaying: false };
        }
        return sound;
      });
      
      return {
        sounds: updatedSounds,
        activeSoundId: shouldPlay ? soundId : null,
        isGlobalPlaying: shouldPlay,
      };
    });
  },

  // 更新单个声音音量
  updateSoundVolume: (soundId: number, volume: number) => {
    set((state) => ({
      sounds: state.sounds.map(sound => {
        if (sound.id === soundId) {
          if (sound.howl) {
            sound.howl.volume(volume / 100);
          }
          return { ...sound, volume };
        }
        return sound;
      })
    }));
  },

  // 切换全局播放
  toggleGlobalPlay: () => {
    const { sounds, isGlobalPlaying, activeSoundId } = get();
    
    if (isGlobalPlaying && activeSoundId) {
      // 停止当前播放
      const sound = sounds.find(s => s.id === activeSoundId);
      if (sound?.howl) {
        sound.howl.stop();
      }
      set({ isGlobalPlaying: false, activeSoundId: null });
    } else if (sounds.length > 0) {
      // 播放第一个声音
      const firstSound = sounds[0];
      let howl = firstSound.howl;
      if (!howl && firstSound.audioUrl) {
        howl = new Howl({
          src: [firstSound.audioUrl],
          volume: firstSound.volume / 100,
          loop: true
        });
      }
      if (howl) {
        howl.play();
      }
      set({ 
        isGlobalPlaying: true, 
        activeSoundId: firstSound.id,
        sounds: sounds.map(sound => ({
          ...sound,
          isPlaying: sound.id === firstSound.id,
          howl: sound.id === firstSound.id ? howl : sound.howl
        }))
      });
    }
  },

  // 更新全局音量
  updateGlobalVolume: (volume: number) => {
    const { sounds } = get();
    const volumeMultiplier = volume / 100;
    
    sounds.forEach(sound => {
      if (sound.howl) {
        sound.howl.volume((sound.volume / 100) * volumeMultiplier);
      }
    });
    
    set({ globalVolume: volume });
  },

  // 重置所有音量
  resetAllVolumes: () => {
    const { sounds } = get();
    
    sounds.forEach(sound => {
      if (sound.howl && sound.isPlaying) {
        sound.howl.stop();
      }
    });
    
    set({
      sounds: initialSounds.map(s => ({ ...s, isPlaying: false, howl: undefined })),
      globalVolume: 65,
      isGlobalPlaying: false,
      activeSoundId: null
    });
  },

  // 设置定时器时长
  setTimerDuration: (minutes: number) => {
    set({ timerDuration: minutes });
  },

  // 切换定时器状态
  toggleTimer: () => {
    const { isTimerActive, timerDuration } = get();
    
    if (!isTimerActive) {
      // 启动定时器
      setTimeout(() => {
        const state = get();
        if (state.isTimerActive) {
          // 定时器结束时停止所有声音
          state.sounds.forEach(sound => {
            if (sound.howl && sound.isPlaying) {
              sound.howl.stop();
            }
          });
          set({ 
            isGlobalPlaying: false, 
            activeSoundId: null,
            isTimerActive: false,
            sounds: state.sounds.map(s => ({ ...s, isPlaying: false }))
          });
          alert(`⏰ Temporitzador de ${timerDuration} minuts acabat!`);
        }
      }, timerDuration * 60 * 1000);
    }
    
    set({ isTimerActive: !isTimerActive });
  },

  // 混合声音（示例功能）
  mixSounds: () => {
    const { sounds } = get();
    const mixedSounds = sounds.map(sound => ({
      ...sound,
      volume: Math.min(100, sound.volume + 10) // 每个声音增加10%音量
    }));
    
    set({ sounds: mixedSounds });
  },
}));