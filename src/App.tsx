// 文件路径: src/App.tsx
import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { useSoundStore } from './stores/useSoundStore';
import { FiPlay, FiPause, FiVolume2, FiClock, FiX, FiUser, FiLogOut } from 'react-icons/fi';
// ✅ 只保留需要的图标，去除冗余
import { TbTrees, TbWaveSine, TbWind, TbFlame } from 'react-icons/tb';
import { GiDove } from 'react-icons/gi';

// ✅ 更新后的图标映射表
const iconMap: Record<string, React.ReactNode> = { 
  '🌿': <TbTrees />, 
  '🌊': <TbWaveSine />, 
  '🔥': <TbFlame />, 
  '💨': <TbWind />,
  '🕊️': <GiDove /> 
};

class Particle {
  size = 0.8; density = Math.random() * 20 + 1; x: number; y: number; baseX: number; baseY: number;
  constructor(x: number, y: number, w: number, h: number) { this.baseX = x; this.baseY = y; this.x = Math.random() * w; this.y = Math.random() * h; }
  draw(ctx: CanvasRenderingContext2D) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
  update(m: { x: number; y: number; r: number }) {
    let dx = m.x - this.x, dy = m.y - this.y, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < m.r) {
      let f = (m.r - dist) / m.r; this.x -= (dx / dist) * f * this.density; this.y -= (dy / dist) * f * this.density;
    } else {
      if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 15;
      if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 15;
    }
  }
}

const LoginModal = () => {
  const { isLoginModalOpen, toggleLoginModal, login, register } = useSoundStore();
  const [f, setF] = useState({ u: '', p: '', err: '', isReg: false });

  useEffect(() => { if (isLoginModalOpen) setF({ u: '', p: '', err: '', isReg: false }); }, [isLoginModalOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.u || !f.p) return setF(s => ({ ...s, err: '请输入账号和密码' }));
    const success = f.isReg ? register(f.u, f.p) : login(f.u, f.p);
    if (!success) setF(s => ({ ...s, err: f.isReg ? '用户名已存在' : '账号或密码错误' }));
  };

  if (!isLoginModalOpen) return null;
  return (
    <div className="modal-overlay" onClick={() => toggleLoginModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => toggleLoginModal(false)}><FiX size={20} /></button>
        <h2>{f.isReg ? '加入旅程' : '欢迎回来'}</h2>
        <form className="auth-form" onSubmit={submit}>
          <div className="input-group"><label>用户名</label><input autoFocus value={f.u} onChange={e => setF({ ...f, u: e.target.value })} /></div>
          <div className="input-group"><label>密码</label><input type="password" value={f.p} onChange={e => setF({ ...f, p: e.target.value })} /></div>
          {f.err && <div className="error-msg">{f.err}</div>}
          <button type="submit" className="btn-auth-submit">{f.isReg ? '立即注册' : '登 录'}</button>
        </form>
        <div className="auth-switch">{f.isReg ? '已有账号?' : '还没有账号?'}<span onClick={() => setF({ ...f, isReg: !f.isReg, err: '' })}>{f.isReg ? '去登录' : '去注册'}</span></div>
      </div>
    </div>
  );
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const store = useSoundStore();

  useEffect(() => {
    const t = store.isTimerActive && store.timerDuration > 0 ? setInterval(store.tick, 1000) : null;
    return () => clearInterval(t as NodeJS.Timeout);
  }, [store.isTimerActive, store.timerDuration, store.tick]);

  useEffect(() => {
    const cvs = canvasRef.current, ctx = cvs?.getContext('2d');
    if (!cvs || !ctx) return;
    let parts: Particle[] = [], mouse = { x: 0, y: 0, r: 120 };
    const init = () => {
      cvs.width = window.innerWidth; cvs.height = window.innerHeight; parts = [];
      for (let y = 0; y < cvs.height; y += 30) for (let x = 0; x < cvs.width; x += 30) parts.push(new Particle(x, y, cvs.width, cvs.height));
    };
    const anim = () => { ctx.clearRect(0, 0, cvs.width, cvs.height); parts.forEach(p => { p.draw(ctx); p.update(mouse); }); requestAnimationFrame(anim); };
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('resize', init); init(); anim();
  }, []);

  const fmtTime = (m: number) => `${Math.floor(Math.max(0, m * 60) / 60)}:${(Math.max(0, Math.ceil(m * 60)) % 60).toString().padStart(2, '0')}`;

  return (
    <div className="page-wrapper">
      <canvas ref={canvasRef} id="webgl" />
      <LoginModal />
      <nav className="navbar">
        <span className="logo">SILENCE / 01</span>
        <div className="nav-right">
          {store.isLoggedIn ? <div className="user-profile"><span><FiUser /> {store.user?.username}</span><button onClick={store.logout} className="btn-icon"><FiLogOut /></button></div> : <button onClick={() => store.toggleLoginModal(true)} className="btn-login">登录</button>}
        </div>
      </nav>
      <main className="main-content">
        <header className="hero-header">
          <h1>混合你的独处空间</h1>
          <p className="hero-subtitle">定制专属背景音，进入深度专注状态</p>
        </header>
        <div className="sounds-grid">
          {store.sounds.map(s => (
            <div 
              key={s.id} 
              className={`sound-card ${s.isPlaying ? 'active' : ''}`}
              style={s.isPlaying && s.backgroundImageUrl ? { backgroundImage: `url(${s.backgroundImageUrl})` } : {}}
            >
              <div className="card-header">
                <div className="sound-info">
                  <div className="icon">{iconMap[s.icon]}</div>
                  <h4>{s.name_cn}</h4>
                </div>
                <button onClick={() => store.toggleSound(s.id)} className="play-toggle">
                  {s.isPlaying ? <FiPause /> : <FiPlay className="play-icon-offset" />}
                </button>
              </div>
              <input type="range" min="0" max="100" value={s.volume} onChange={e => store.updateSoundVolume(s.id, parseInt(e.target.value))} className="range-slider" />
            </div>
          ))}
        </div>
      </main>
      <footer className="global-control-panel">
        <div className="panel-inner">
          <div className="master-play">
            <button onClick={store.toggleGlobalPlay} className="btn-master-play">{store.isGlobalPlaying ? <FiPause size={24} /> : <FiPlay size={24} className="play-icon-offset" />}</button>
            <div className="status-label"><span className="label">STATUS</span><span className="value">{store.isTimerActive ? `正在沉浸 (${fmtTime(store.timerDuration)})` : (store.isGlobalPlaying ? '正在沉浸' : '静待开启')}</span></div>
          </div>
          <div className="timer-section">
            <FiClock className="timer-icon" />
            <select value={store.timerPreset} onChange={e => store.setTimerDuration(parseInt(e.target.value))} disabled={store.isTimerActive}>
              {[1, 5, 15, 30, 60].map(m => <option key={m} value={m}>{m} 分钟</option>)}
            </select>
            <button onClick={store.toggleTimer} className={`btn-timer-toggle ${store.isTimerActive ? 'active' : ''}`}>{store.isTimerActive ? 'STOP' : 'START'}</button>
          </div>
          <div className="master-volume"><FiVolume2 /><input type="range" min="0" max="100" value={store.globalVolume} onChange={e => store.updateGlobalVolume(parseInt(e.target.value))} className="range-slider" /></div>
        </div>
      </footer>
    </div>
  );
}