import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { useSoundStore } from './stores/useSoundStore';
import { FiPlay, FiPause, FiVolume2, FiClock, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { TbTrees, TbCoffee, TbWaveSine, TbWind, TbFlame } from 'react-icons/tb';
import { GiSoundWaves } from 'react-icons/gi';

const iconComponents: Record<string, React.ReactNode> = {
  '🌧️': <TbTrees />, '🌿': <TbTrees />, '☕': <TbCoffee />, 
  '🌊': <TbWaveSine />, '📡': <GiSoundWaves />, '🔥': <TbFlame />, '💨': <TbWind />,
};

class Particle {
  x: number; y: number; baseX: number; baseY: number; size: number; density: number;
  constructor(x: number, y: number, canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.baseX = x; this.baseY = y;
    this.size = 0.8;
    this.density = (Math.random() * 20) + 1;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
  }
  update(mouse: { x: number; y: number; radius: number }) {
    let dx = mouse.x - this.x; let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < mouse.radius) {
      let force = (mouse.radius - distance) / mouse.radius;
      this.x -= (dx / distance) * force * this.density;
      this.y -= (dy / distance) * force * this.density;
    } else {
      if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 15;
      if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 15;
    }
  }
}

const LoginModal = () => {
  const { isLoginModalOpen, toggleLoginModal, login } = useSoundStore();
  const [username, setUsername] = useState('');
  if (!isLoginModalOpen) return null;
  return (
    <div className="modal-overlay" onClick={() => toggleLoginModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => toggleLoginModal(false)}><FiX size={20} /></button>
        <h2>欢迎回来</h2>
        <form onSubmit={(e) => { e.preventDefault(); login(username); }}>
          <div className="input-group">
            <label>用户名</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="你的称呼" autoFocus />
          </div>
          <button type="submit" className="btn-auth-submit">开启沉浸</button>
        </form>
      </div>
    </div>
  );
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    sounds, globalVolume, isGlobalPlaying, timerDuration, isTimerActive,
    toggleSound, updateSoundVolume, toggleGlobalPlay, updateGlobalVolume,
    setTimerDuration, toggleTimer, user, isLoggedIn, toggleLoginModal, logout
  } = useSoundStore();

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let particles: Particle[] = [];
    const mouse = { x: 0, y: 0, radius: 120 };
    const init = () => {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      particles = [];
      for (let y = 0; y < canvas.height; y += 30) {
        for (let x = 0; x < canvas.width; x += 30) {
          particles.push(new Particle(x, y, canvas.width, canvas.height));
        }
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.draw(ctx); p.update(mouse); });
      requestAnimationFrame(animate);
    };
    const onMouseMove = (e: any) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', init);
    init(); animate();
    return () => { 
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', init); 
    };
  }, []);

  return (
    <div className="page-wrapper">
      <canvas ref={canvasRef} id="webgl" style={{ position: 'fixed', zIndex: 0, pointerEvents: 'none', background: '#0a0a0a' }} />
      <LoginModal />
      <nav className="navbar">
        <span className="logo">SILENCE / 01</span>
        <div className="nav-right">
          {isLoggedIn ? (
            <div className="user-profile">
              <span><FiUser /> {user?.username}</span>
              <button onClick={logout} className="btn-icon"><FiLogOut /></button>
            </div>
          ) : (
            <button onClick={() => toggleLoginModal(true)} className="btn-login">登录</button>
          )}
        </div>
      </nav>
      <main className="main-content">
        <header className="hero-header"><h1>混合你的<br />独处空间</h1></header>
        <div className="sounds-grid">
          {sounds.map((sound) => (
            <div key={sound.id} className={`sound-card ${sound.isPlaying ? 'active' : ''}`}>
              <div className="card-header">
                <div className="sound-info">
                  <div className="icon">{iconComponents[sound.icon]}</div>
                  <h4>{sound.name_cn || sound.name}</h4>
                </div>
                <button onClick={() => toggleSound(sound.id)} className="play-toggle">
                  {sound.isPlaying ? <FiPause /> : <FiPlay />}
                </button>
              </div>
              <input type="range" min="0" max="100" value={sound.volume} onChange={(e) => updateSoundVolume(sound.id, parseInt(e.target.value))} className="range-slider" />
            </div>
          ))}
        </div>
      </main>
      <footer className="global-control-panel">
        <div className="panel-inner">
          <div className="master-play">
            <button onClick={toggleGlobalPlay} className="btn-master-play">{isGlobalPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}</button>
            <div className="status-label"><span className="label">STATUS</span><span className="value">{isGlobalPlaying ? '正在沉浸' : '静待开启'}</span></div>
          </div>
          <div className="timer-section">
            <FiClock />
            <select value={timerDuration} onChange={(e) => setTimerDuration(parseInt(e.target.value))}>
              {[15, 30, 45, 60].map(m => <option key={m} value={m}>{m} 分钟</option>)}
            </select>
            <button onClick={toggleTimer} className="btn-timer-toggle">{isTimerActive ? 'STOP' : 'START'}</button>
          </div>
          <div className="master-volume"><FiVolume2 /><input type="range" min="0" max="100" value={globalVolume} onChange={(e) => updateGlobalVolume(parseInt(e.target.value))} className="range-slider" /></div>
        </div>
      </footer>
    </div>
  );
}

export default App;