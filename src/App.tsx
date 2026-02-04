import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { useSoundStore } from './stores/useSoundStore';
import { 
  FiPlay, FiPause, FiVolume2, FiClock, FiX, FiUser, FiLogOut 
} from 'react-icons/fi';
import { TbTrees, TbCoffee, TbWaveSine, TbWind, TbFlame } from 'react-icons/tb';
import { GiSoundWaves } from 'react-icons/gi';

// ------------------------------------------------------------------
// 子组件：登录弹窗 (LoginModal)
// ------------------------------------------------------------------
const LoginModal = () => {
  const { isLoginModalOpen, toggleLoginModal, login } = useSoundStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // 模拟简单验证
    if (username) {
        login(username);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={() => toggleLoginModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => toggleLoginModal(false)}>
            <FiX size={24} />
        </button>
        
        <h2 style={{ fontWeight: 300, letterSpacing: '2px', marginBottom: '2rem', textAlign: 'center' }}>
            欢迎回来
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
                <label>用户名 / 邮箱</label>
                <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    autoFocus
                
                />
            </div>
            <div className="input-group">
                <label>密码</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••"
                />
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '登录中...' : '进入空间'}
            </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
            还没有账号？ <span style={{ color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}>立即加入</span>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 主组件：App
// ------------------------------------------------------------------

const iconComponents: Record<string, React.ReactNode> = {
  '🌧️': <TbTrees />,
  '☕': <TbCoffee />,
  '🌊': <TbWaveSine />,
  '📡': <GiSoundWaves />,
  '🔥': <TbFlame />,
  '💨': <TbWind />,
};

class Particle {
  x: number; y: number; baseX: number; baseY: number; size: number; density: number;
  constructor(x: number, y: number) {
    this.x = x; this.y = y; this.baseX = x; this.baseY = y;
    this.size = 0.6;
    this.density = (Math.random() * 20) + 1;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
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
      if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 20;
      if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 20;
    }
  }
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    sounds, globalVolume, isGlobalPlaying, timerDuration, isTimerActive,
    toggleSound, updateSoundVolume, toggleGlobalPlay, updateGlobalVolume,
    setTimerDuration, toggleTimer,
    // 新增
    user, isLoggedIn, toggleLoginModal, logout
  } = useSoundStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles: Particle[] = [];
    const mouse = { x: 0, y: 0, radius: 100 };

    const init = () => {
      particles = [];
      for (let i = 0; i < 600; i++) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.draw(ctx); p.update(mouse); });
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('resize', handleResize);
    handleResize(); animate();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="page-wrapper">
      <canvas ref={canvasRef} id="webgl" style={{ position: 'fixed', zIndex: 0, pointerEvents: 'none' }} />
      
      {/* 插入登录弹窗 */}
      <LoginModal />

      <nav className="navbar">
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 200, letterSpacing: '0.4rem', opacity: 0.6 }}>SILENCE / 01</span>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {isLoggedIn ? (
                // 登录后显示状态
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 300 }}>
                        <FiUser /> {user?.username}
                    </span>
                    <button 
                        onClick={logout}
                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display:'flex', alignItems:'center' }}
                        title="退出登录"
                    >
                        <FiLogOut size={18} />
                    </button>
                </div>
            ) : (
                // 未登录显示按钮
                <>
                    <button 
                        onClick={() => toggleLoginModal(true)}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                    >
                        登录
                    </button>
                    <button 
                        style={{ background: '#fff', color: '#000', border: 'none', padding: '0.5rem 1.5rem', fontWeight: 500, cursor: 'pointer' }}
                    >
                        加入
                    </button>
                </>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <header className="hero-header">
          <h1>混合你的<br />独处空间</h1>
        </header>

        <div className="sounds-grid">
          {sounds.map((sound) => (
            <div key={sound.id} className={`sound-card ${sound.isPlaying ? 'active' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: sound.isPlaying ? '#fff' : '#444' }}>
                    {iconComponents[sound.icon]}
                  </div>
                  <h4 style={{ margin: 0, fontWeight: 300, letterSpacing: '1px' }}>{sound.name}</h4>
                </div>
                <button 
                  onClick={() => toggleSound(sound.id)} 
                  style={{ 
                    width: '44px', height: '44px', borderRadius: '50%', 
                    background: sound.isPlaying ? '#fff' : 'transparent',
                    color: sound.isPlaying ? '#000' : '#fff',
                    border: '1px solid #fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s'
                  }}
                >
                  {sound.isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
                </button>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={sound.volume} 
                onChange={(e) => updateSoundVolume(sound.id, parseInt(e.target.value))} 
                className="range-slider" 
              />
            </div>
          ))}
        </div>
      </main>

      <section className="global-control-panel">
        <div className="panel-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: '200px' }}>
            <button 
              onClick={toggleGlobalPlay} 
              style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isGlobalPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
            </button>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#666', letterSpacing: '1px', marginBottom: '4px' }}>STATUS</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 300 }}>{isGlobalPlaying ? '正在沉浸' : '静待开启'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', borderLeft: '1px solid #222', paddingLeft: '3rem' }}>
            <FiClock color="#444" />
            <select 
              value={timerDuration} 
              onChange={(e) => setTimerDuration(parseInt(e.target.value))}
              style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', outline: 'none', fontSize: '1rem' }}
            >
              {[15, 30, 45, 60].map(m => (
                <option 
                  key={m} 
                  value={m} 
                  style={{ backgroundColor: '#111', color: '#fff' }}
                >
                  {m} 分钟
                </option>
              ))}
            </select>
            <button onClick={toggleTimer} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>
              {isTimerActive ? 'STOP' : 'START'}
            </button>
          </div>

          <div style={{ flexGrow: 0, width: '200px', display: 'flex', alignItems: 'center', gap: '1.2rem', borderLeft: '1px solid #222', paddingLeft: '3rem' }}>
            <FiVolume2 color="#444" />
            <input 
              type="range" min="0" max="100" 
              value={globalVolume} 
              onChange={(e) => updateGlobalVolume(parseInt(e.target.value))} 
              className="range-slider" 
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;