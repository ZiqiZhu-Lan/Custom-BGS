// 文件路径: src/App.tsx

import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { useSoundStore } from './stores/useSoundStore';
import { 
  FiPlay, FiPause, FiVolume2, FiVolumeX, FiClock, FiActivity, 
  FiLayers, FiChevronDown, FiX, FiUser, FiMail, FiLock 
} from 'react-icons/fi';
import { TbTrees, TbCoffee, TbWaveSine, TbWind, TbFlame } from 'react-icons/tb';
import { GiSoundWaves } from 'react-icons/gi';
import { PresetType } from './types'; // 引入 PresetType 以便类型检查

// 1. 图标映射
const iconComponents: Record<string, React.ReactNode> = {
  '🌧️': <TbTrees className="icon-blue" />,
  '☕': <TbCoffee className="icon-amber" />,
  '🌊': <TbWaveSine className="icon-cyan" />,
  '📡': <GiSoundWaves className="icon-gray" />,
  '🔥': <TbFlame className="icon-orange" />,
  '💨': <TbWind className="icon-sky" />,
};

// 2. 粒子类
class Particle {
  x: number; y: number; baseX: number; baseY: number; size: number; density: number;
  constructor(x: number, y: number) {
    this.x = x; this.y = y; this.baseX = x; this.baseY = y;
    this.size = 1.2; this.density = (Math.random() * 30) + 1;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
  }
  update(mouse: { x: number; y: number; radius: number }) {
    let dx = mouse.x - this.x; let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < mouse.radius) {
      let force = (mouse.radius - distance) / mouse.radius;
      let power = 20; 
      this.x -= (dx / distance) * force * this.density * (power / 10);
      this.y -= (dy / distance) * force * this.density * (power / 10);
    } else {
      if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 20;
      if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 20;
    }
  }
}

// 3. 登录/注册模态框组件
const AuthModal = ({ isOpen, onClose, initialMode = 'login' }: { isOpen: boolean; onClose: () => void; initialMode?: 'login' | 'signup' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  useEffect(() => { setMode(initialMode); }, [initialMode]);
  if (!isOpen) return null;

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}><FiX /></button>
        
        <h2 className="auth-title">{mode === 'login' ? 'Benvingut' : 'Crea un compte'}</h2>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Accedeix als teus paisatges sonors.' : 'Uneix-te a CBS i personalitza la teva experiència.'}
        </p>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          {mode === 'signup' && (
            <div style={{ position: 'relative' }}>
              <FiUser style={{ position: 'absolute', left: '15px', top: '14px', color: '#888' }} />
              <input type="text" placeholder="Nom d'usuari" className="auth-input" style={{ paddingLeft: '40px' }} />
            </div>
          )}
          
          <div style={{ position: 'relative' }}>
            <FiMail style={{ position: 'absolute', left: '15px', top: '14px', color: '#888' }} />
            <input type="email" placeholder="Correu electrònic" className="auth-input" style={{ paddingLeft: '40px' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: '15px', top: '14px', color: '#888' }} />
            <input type="password" placeholder="Contrasenya" className="auth-input" style={{ paddingLeft: '40px' }} />
          </div>

          <button className="auth-submit-btn">
            {mode === 'login' ? 'Iniciar Sessió' : "Registra't"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? "No tens compte?" : "Ja tens compte?"}
          <span onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? "Registra't ara" : "Inicia sessió"}
          </span>
        </div>
      </div>
    </div>
  );
};

// 4. 主 App 组件
function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 状态：预设菜单开关 & 登录窗口开关
  const [isPresetOpen, setPresetOpen] = useState(false);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const {
    sounds, globalVolume, isGlobalPlaying, timerDuration, isTimerActive,
    toggleSound, updateSoundVolume, toggleGlobalPlay, updateGlobalVolume,
    setTimerDuration, toggleTimer, applyPreset
  } = useSoundStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles: Particle[] = [];
    const mouse = { x: 0, y: 0, radius: 150 };
    const init = () => {
      particles = [];
      const spacing = 8;
      for (let j = 0; j < 60; j++) {
        for (let i = 0; i < 60; i++) {
          if (Math.abs(i - 30) < j * 0.5 || (j > 45 && Math.abs(i - 30) < 20)) {
            particles.push(new Particle(i * spacing + (window.innerWidth / 2 - 240), j * spacing + 100));
          }
        }
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.draw(ctx); p.update(mouse); });
      requestAnimationFrame(animate);
    };
    const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    handleResize(); animate();
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('resize', handleResize); };
  }, []);

  const playingSounds = sounds.filter(s => s.isPlaying);
  const playingCount = playingSounds.length;
  const averageVolume = playingCount > 0 ? Math.round(playingSounds.reduce((acc, s) => acc + s.volume, 0) / playingCount) : 0;

  const handlePresetClick = (type: PresetType) => {
    applyPreset(type);
    setPresetOpen(false);
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className="page-wrapper" style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#000', color: 'white' }}>
      <canvas ref={canvasRef} id="webgl" style={{ position: 'fixed', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }} />

      {/* 挂载登录组件 */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />

      {/* 左上角状态标签 + 预设菜单 */}
      <div style={{ position: 'fixed', top: '100px', left: '20px', zIndex: 100, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(15px)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
        <div style={{ padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <FiActivity className={playingCount > 0 ? "text-emerald-400 animate-pulse" : "text-gray-500"} />
            <span style={{ fontSize: '13px' }}>Sons Actius: <strong style={{color: '#34d399'}}>{playingCount}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiVolume2 className="text-indigo-400" />
            <span style={{ fontSize: '13px' }}>Volum Mix: <strong style={{color: '#818cf8'}}>{averageVolume}%</strong></span>
            </div>
        </div>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
        
        <div style={{ position: 'relative' }}>
            <button onClick={() => setPresetOpen(!isPresetOpen)} style={{ width: '100%', background: isPresetOpen ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255,255,255,0.05)', border: isPresetOpen ? '1px solid #4f46e5' : '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiLayers /> <span>Prefets</span></div>
                <FiChevronDown style={{ transform: isPresetOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}/>
            </button>
            {isPresetOpen && (
                <div style={{ position: 'absolute', top: '110%', left: 0, width: '100%', background: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                    <button onClick={() => handlePresetClick('focus')} style={menuItemStyle}>🧘 Concentració</button>
                    <button onClick={() => handlePresetClick('relax')} style={menuItemStyle}>☕ Relax Cafè</button>
                    <button onClick={() => handlePresetClick('nature')} style={menuItemStyle}>🌲 Naturalesa</button>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <button onClick={() => handlePresetClick('random')} style={menuItemStyle}>🎲 Mix Aleatori</button>
                </div>
            )}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <nav className="navbar">
          <div className="container nav-content">
            <div className="logo-section">
              <div className="logo-box"><span className="logo-text">CBS</span></div>
              <div className="brand-info"><h1 className="brand-name">CBS</h1><p className="brand-tagline">Multilayer Soundscapes</p></div>
            </div>
            <div className="nav-actions" style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-text" onClick={() => openAuth('login')}>Log In</button>
              <button className="btn-primary" onClick={() => openAuth('signup')}>Join</button>
            </div>
          </div>
        </nav>

        <main className="container main-content">
          <div className="content-wrapper">
            <header className="hero-section" style={{ marginBottom: '40px' }}>
              <h2 className="hero-title">Ambient Mix</h2>
              <p className="hero-desc">Combina múltiples sons per crear la teva atmosfera perfecta.</p>
            </header>

            <div className="sounds-grid">
              {sounds.map((sound) => {
                const isActive = sound.isPlaying; 
                return (
                  <div key={sound.id} className={`sound-card ${isActive ? 'active' : ''}`}>
                    <div className="card-top">
                      <div className="card-info">
                        <div className="icon-wrapper">{iconComponents[sound.icon] || <span>{sound.icon}</span>}</div>
                        <h4 className="sound-name">{sound.name}</h4>
                      </div>
                      <button onClick={() => toggleSound(sound.id)} className={`play-btn ${isActive ? 'stop' : 'start'}`}>
                        {isActive ? <FiPause /> : <FiPlay />}
                      </button>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginBottom: '5px' }}>
                        <span>Intensitat</span><span>{sound.volume}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={sound.volume} onChange={(e) => updateSoundVolume(sound.id, parseInt(e.target.value))} className="range-slider" />
                    </div>
                  </div>
                );
              })}
            </div>

            <section className="global-control-panel">
              <div className="panel-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="play-control-group" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <button onClick={toggleGlobalPlay} className={`global-play-btn ${isGlobalPlaying ? 'stop' : 'start'}`} style={{ width: '50px', height: '50px' }}>
                    {isGlobalPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
                  </button>
                  <div className="playing-status">
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>
                      {isGlobalPlaying ? `Reproduint ${playingCount} pistes` : 'Tot en pausa'}
                    </p>
                  </div>
                </div>

                <div className="timer-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '8px 15px', borderRadius: '10px' }}>
                  <FiClock className={isTimerActive ? 'text-indigo animate-pulse' : ''} />
                  <select value={timerDuration} onChange={(e) => setTimerDuration(parseInt(e.target.value))} style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', cursor: 'pointer' }}>
                    {[5, 15, 30, 45, 60].map(min => <option key={min} value={min} style={{color: 'black'}}>{min} {min === 60 ? 'hora' : 'min'}</option>)}
                  </select>
                  <button onClick={toggleTimer} className={`btn-timer ${isTimerActive ? 'active' : ''}`}>{isTimerActive ? 'STOP' : 'START'}</button>
                </div>

                <div style={{ width: '180px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}><FiVolumeX size={12} /> <FiVolume2 size={12} /></div>
                  <input type="range" min="0" max="100" value={globalVolume} onChange={(e) => updateGlobalVolume(parseInt(e.target.value))} className="range-slider large" />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#ddd',
    padding: '10px 12px',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background 0.2s',
    width: '100%',
    display: 'block'
};

export default App;