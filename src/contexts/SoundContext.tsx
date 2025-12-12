import React, { createContext, useContext, useState, ReactNode } from 'react';

// 定义单个声音的类型
export interface Sound {
  id: string;
  name: string;
  url: string;
  icon: string;
  volume: number;
  isPlaying: boolean;
}

// 定义Context的类型
interface SoundContextType {
  sounds: Sound[];
  togglePlay: (id: string) => void;
  updateVolume: (id: string, volume: number) => void;
}

// 创建Context
const SoundContext = createContext<SoundContextType | undefined>(undefined);

// 定义初始的两个声音
const initialSounds: Sound[] = [
  {
    id: 'rain',
    name: '细声',
    url: 'https://assets.mixkit.co/sfx/preview/mixkit-rain-loop-1249.mp3',
    icon: '🌧️',
    volume: 0.3,
    isPlaying: false,
  },
  {
    id: 'wind',
    name: '微风',
    url: 'https://assets.mixkit.co/sfx/preview/mixkit-wind-loop-1001.mp3',
    icon: '🍃',
    volume: 0.4,
    isPlaying: false,
  },
];

// Context Provider组件
export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sounds, setSounds] = useState<Sound[]>(initialSounds);

  const togglePlay = (id: string) => {
    setSounds(prevSounds =>
      prevSounds.map(sound =>
        sound.id === id ? { ...sound, isPlaying: !sound.isPlaying } : sound
      )
    );
  };

  const updateVolume = (id: string, volume: number) => {
    setSounds(prevSounds =>
      prevSounds.map(sound =>
        sound.id === id ? { ...sound, volume } : sound
      )
    );
  };

  return (
    <SoundContext.Provider value={{ sounds, togglePlay, updateVolume }}>
      {children}
    </SoundContext.Provider>
  );
};

// 自定义Hook，方便使用Context
export const useSoundContext = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext必须在SoundProvider内部使用');
  }
  return context;
};