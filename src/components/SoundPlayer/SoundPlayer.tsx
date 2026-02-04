import React, { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useSoundContext, Sound } from '../../contexts/SoundContext';

interface SoundPlayerProps {
  sound: Sound;
}

const SoundPlayer: React.FC<SoundPlayerProps> = ({ sound }) => {
  const { togglePlay, updateVolume } = useSoundContext();
  const soundRef = useRef<Howl | null>(null);

  // 初始化或更新音频
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.unload();
    }

    soundRef.current = new Howl({
      src: [sound.url],
      volume: sound.volume,
      loop: true,
      html5: true,
      onplay: () => {},
      onpause: () => {},
    });

    // 根据状态自动播放或暂停
    if (sound.isPlaying) {
      soundRef.current.play();
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [sound.url]);

  // 音量变化处理
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(sound.volume);
    }
  }, [sound.volume]);

  // 播放状态变化处理
  useEffect(() => {
    if (!soundRef.current) return;
    
    if (sound.isPlaying && !soundRef.current.playing()) {
      soundRef.current.play();
    } else if (!sound.isPlaying && soundRef.current.playing()) {
      soundRef.current.pause();
    }
  }, [sound.isPlaying]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    updateVolume(sound.id, newVolume);
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow w-64">
      {/* 标题区域 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{sound.icon}</span>
          <h3 className="text-lg font-semibold text-gray-800">{sound.name}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${sound.isPlaying ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {sound.isPlaying ? '播放中' : '已暂停'}
        </span>
      </div>

      {/* 播放按钮 */}
      <button
        onClick={() => togglePlay(sound.id)}
        className={`w-full py-3 rounded-lg mb-4 flex items-center justify-center space-x-2 ${
          sound.isPlaying
            ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
            : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'
        } text-white font-medium transition-all`}
      >
        {sound.isPlaying ? (
          <>
            <span className="mr-2">⏸️</span> <span>暂停</span>
          </>
        ) : (
          <>
            <span className="mr-2">▶️</span> <span>播放</span>
          </>
        )}
      </button>

      {/* 音量控制 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-700">
            <span className="mr-1">🔊</span>
            <span className="text-sm">音量</span>
          </div>
          <span className="font-medium">{Math.round(sound.volume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={sound.volume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default SoundPlayer;