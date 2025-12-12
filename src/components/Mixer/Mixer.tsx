import React from 'react';
import SoundPlayer from '../SoundPlayer/SoundPlayer';
import { useSoundContext } from '../../contexts/SoundContext';

const Mixer: React.FC = () => {
  const { sounds } = useSoundContext();
  
  // 计算总播放状态
  const isAnyPlaying = sounds.some(s => s.isPlaying);
  const playingCount = sounds.filter(s => s.isPlaying).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 混音器标题和状态 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">简易环境音混音器</h1>
        <p className="text-gray-600 mb-4">
          已加载 {sounds.length} 个声音，当前 {playingCount} 个正在播放
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full">
          <div className={`w-2 h-2 rounded-full mr-2 ${isAnyPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm">{isAnyPlaying ? '混音播放中...' : '全部静音'}</span>
        </div>
      </div>

      {/* 声音卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
        {sounds.map(sound => (
          <SoundPlayer key={sound.id} sound={sound} />
        ))}
      </div>

      {/* 使用提示 */}
      <div className="mt-10 bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">🎧 使用提示</h3>
        <ul className="text-gray-600 text-sm space-y-1">
          <li>• 点击"播放/暂停"按钮控制单个声音</li>
          <li>• 拖动滑块调整每个声音的音量</li>
          <li>• 可以同时播放多个声音创建混音效果</li>
          <li>• 所有更改都是实时的</li>
        </ul>
      </div>
    </div>
  );
};

export default Mixer;