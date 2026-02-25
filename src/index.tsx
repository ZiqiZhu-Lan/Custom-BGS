// 文件路径: src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 如果你想测量应用的性能，可以保留这个
reportWebVitals();

// 👇 核心：激活我们在 public/sw.js 里写的离线拦截器
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('离线音频引擎已激活，范围:', registration.scope);
      },
      (err) => {
        console.log('离线引擎激活失败:', err);
      }
    );
  });
}