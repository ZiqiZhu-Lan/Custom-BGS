import React from 'react';
import { SoundProvider } from './contexts/SoundContext';
import Mixer from './components/Mixer/Mixer';
import './App.css';

function App() {
  return (
    <SoundProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
        <Mixer />
        
        {/* 简易页脚 */}
        <footer className="mt-10 text-center text-gray-500 text-sm">
          <p>🚀 简易混音器原型 | 开发时间: 1小时40分钟挑战</p>
          <p className="mt-1">技术支持: React + Howler.js + Tailwind CSS | 状态管理: Context API</p>
        </footer>
      </div>
    </SoundProvider>
  );
}

export default App;