import React from 'react';
import './App.css';
import { useSoundStore } from './stores/useSoundStore';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiRotateCcw, FiClock, FiMixer } from 'react-icons/fi';
import { TbTrees, TbCoffee, TbWaveSine, TbWind, TbFire } from 'react-icons/tb';
import { GiSoundWaves } from 'react-icons/gi';

// 图标映射
const iconComponents: Record<string, React.ReactNode> = {
  '🌧️': <TbTrees className="text-3xl text-blue-500" />,
  '☕': <TbCoffee className="text-3xl text-amber-500" />,
  '🌊': <TbWaveSine className="text-3xl text-cyan-500" />,
  '📡': <GiSoundWaves className="text-3xl text-gray-500" />,
  '🔥': <TbFire className="text-3xl text-orange-500" />,
  '💨': <TbWind className="text-3xl text-sky-500" />,
};

function App() {
  const {
    sounds,
    globalVolume,
    isGlobalPlaying,
    activeSoundId,
    timerDuration,
    isTimerActive,
    toggleSound,
    updateSoundVolume,
    toggleGlobalPlay,
    updateGlobalVolume,
    resetAllVolumes,
    setTimerDuration,
    toggleTimer,
    mixSounds,
  } = useSoundStore();

  // 计算平均音量
  const calculateAverageVolume = () => {
    if (sounds.length === 0) return 0;
    const total = sounds.reduce((acc, sound) => acc + sound.volume, 0);
    return Math.round(total / sounds.length);
  };

  // 获取当前播放的声音
  const getActiveSoundName = () => {
    if (!activeSoundId) return null;
    const activeSound = sounds.find(s => s.id === activeSoundId);
    return activeSound?.name;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">CBS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">CBS</h1>
                <p className="text-xs text-gray-500 font-medium">Custom Background Sounds</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="text-indigo-600 hover:text-indigo-800 font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200">
                Iniciar sessió
              </button>
              <button className="bg-gradient-to-r from-indigo-500 to-emerald-500 text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all duration-200 font-medium shadow-sm">
                Registra't
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 欢迎区域 */}
          <div className="mb-10 text-center">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent mb-4 tracking-tight">
              Inclini
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Personalitza els teus sons de fons per a concentració, relaxació o son. 
              Crea l'ambient perfecte per a cada moment del dia.
            </p>
          </div>

          {/* 预设分类标题 */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">Predefinit</h3>
              <p className="text-gray-500">Sons predeterminats per a diferents situacions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={resetAllVolumes}
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
              >
                <FiRotateCcw />
                <span className="font-medium">Restablir</span>
              </button>
              <button 
                onClick={mixSounds}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium shadow-sm"
              >
                <FiMixer />
                <span className="font-medium">Barrejar</span>
              </button>
            </div>
          </div>

          {/* 声音卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {sounds.map((sound) => {
              const isActive = activeSoundId === sound.id && isGlobalPlaying;
              return (
                <div 
                  key={sound.id}
                  className={`${sound.color} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent backdrop-blur-sm ${
                    isActive 
                      ? 'ring-2 ring-indigo-500 border-indigo-200 shadow-md transform -translate-y-1' 
                      : 'hover:-translate-y-1'
                  }`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                        {iconComponents[sound.icon] || <span className="text-3xl">{sound.icon}</span>}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-800">{sound.name}</h4>
                        {sound.name_cn && (
                          <p className="text-sm text-gray-500 italic">{sound.name_cn}</p>
                        )}
                        <span className="inline-block mt-1 px-3 py-1 text-xs font-medium bg-white/70 rounded-full text-gray-700">
                          {sound.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSound(sound.id)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                        isActive 
                          ? 'bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
                          : 'bg-gradient-to-br from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600'
                      } text-white`}
                      aria-label={isActive ? 'Aturar so' : 'Reproduir so'}
                    >
                      {isActive ? <FiPause size={20} /> : <FiPlay size={20} />}
                    </button>
                  </div>

                  {/* 音量控制区域 */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <FiVolume2 className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Volum</span>
                      </div>
                      <span className="font-bold text-gray-800 text-lg">{sound.volume}%</span>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sound.volume}
                      onChange={(e) => updateSoundVolume(sound.id, parseInt(e.target.value))}
                      className="w-full h-2.5 bg-gray-300 rounded-full appearance-none cursor-pointer 
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:h-6 
                      [&::-webkit-slider-thumb]:w-6 
                      [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:bg-gradient-to-r 
                      [&::-webkit-slider-thumb]:from-indigo-500 
                      [&::-webkit-slider-thumb]:to-emerald-500
                      [&::-webkit-slider-thumb]:border-2 
                      [&::-webkit-slider-thumb]:border-white 
                      [&::-webkit-slider-thumb]:shadow-lg"
                    />
                    
                    {/* 进度条 */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>0:00</span>
                        <span>∞</span>
                      </div>
                      <div className="h-1.5 bg-gray-300 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                          style={{ width: `${sound.volume}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 全局控制面板 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <FiMixer className="mr-3 text-indigo-500" />
              Control Global
            </h3>
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* 主播放控制 */}
              <div className="flex items-center space-x-6">
                <button 
                  onClick={toggleGlobalPlay}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300 hover:scale-105 ${
                    isGlobalPlaying 
                      ? 'bg-gradient-to-br from-red-500 to-orange-500 hover:shadow-red-200' 
                      : 'bg-gradient-to-br from-indigo-500 to-emerald-500 hover:shadow-indigo-200'
                  } text-white`}
                  aria-label={isGlobalPlaying ? 'Aturar tots els sons' : 'Reproduir tots els sons'}
                >
                  {isGlobalPlaying ? <FiPause size={28} /> : <FiPlay size={28} />}
                </button>
                <div>
                  <p className="font-bold text-gray-800 text-xl mb-1">
                    {isGlobalPlaying 
                      ? `Reproduint: ${getActiveSoundName() || 'So seleccionat'}`
                      : 'Premeu play per començar'
                    }
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className={`px-3 py-1 rounded-full ${isGlobalPlaying ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {isGlobalPlaying ? '● En viu' : '○ Pausat'}
                    </span>
                    <span className="flex items-center">
                      <FiVolume2 className="mr-1" />
                      {calculateAverageVolume()}% volum mitjà
                    </span>
                  </div>
                </div>
              </div>

              {/* 定时器控制 */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FiClock className="text-indigo-500" />
                    <span className="font-medium text-gray-700">Temporitzador</span>
                  </div>
                  <select 
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value={5}>5 minuts</option>
                    <option value={15}>15 minuts</option>
                    <option value={25}>25 minuts</option>
                    <option value={45}>45 minuts</option>
                    <option value={60}>60 minuts</option>
                  </select>
                  <button 
                    onClick={toggleTimer}
                    className={`px-4 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                      isTimerActive
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-red-200'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-indigo-200'
                    } shadow-sm hover:shadow-md`}
                  >
                    {isTimerActive ? 'Aturar' : 'Iniciar'}
                  </button>
                </div>
                {isTimerActive && (
                  <p className="mt-2 text-sm text-indigo-600 font-medium">
                    ⏱️ Temporitzador actiu: {timerDuration} minuts
                  </p>
                )}
              </div>

              {/* 全局音量控制 */}
              <div className="w-full lg:w-auto lg:min-w-[300px]">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2">
                    {globalVolume > 0 ? <FiVolume2 className="text-indigo-500" /> : <FiVolumeX className="text-gray-500" />}
                    <span className="font-medium text-gray-700">Volum total del sistema</span>
                  </div>
                  <span className="font-bold text-2xl text-gray-800">{globalVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={globalVolume}
                  onChange={(e) => updateGlobalVolume(parseInt(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-gray-300 to-gray-300 rounded-full appearance-none cursor-pointer 
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:h-7 
                  [&::-webkit-slider-thumb]:w-7 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-gradient-to-r 
                  [&::-webkit-slider-thumb]:from-emerald-500 
                  [&::-webkit-slider-thumb]:to-indigo-500
                  [&::-webkit-slider-thumb]:border-2 
                  [&::-webkit-slider-thumb]:border-white 
                  [&::-webkit-slider-thumb]:shadow-xl"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span className="flex items-center">
                    <FiVolumeX className="mr-1" />
                    Silenci
                  </span>
                  <span className="flex items-center">
                    <FiVolume2 className="mr-1" />
                    Màxim
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 状态信息和提示 */}
          <div className="bg-gradient-to-r from-indigo-50/80 to-emerald-50/80 rounded-2xl p-6 border border-indigo-100/50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg mb-2">Consell d'ús</h4>
                  <p className="text-gray-600">
                    Podeu barrejar diferents sons per crear el vostre ambient personalitzat. 
                    Per exemple, combineu "Pluja al bosc" amb "Soroll blanc" per a una millor concentració.
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/70 rounded-xl p-3 shadow-sm">
                    <p className="text-sm text-gray-500">Sons actius</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {sounds.filter(s => s.isPlaying).length}<span className="text-lg">/{sounds.length}</span>
                    </p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3 shadow-sm">
                    <p className="text-sm text-gray-500">Volum mitjà</p>
                    <p className="text-2xl font-bold text-emerald-600">{calculateAverageVolume()}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">CBS</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">Custom Background Sounds</p>
                  <p className="text-sm text-gray-500">Crea l'ambient perfecte per a cada moment</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                © 2024 CBS - Custom Background Sounds. Tots els drets reservats.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Privacitat</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Termes</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Suport</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Contacte</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;