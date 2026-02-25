// 文件路径: src/App.tsx
import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import { useSoundStore } from './stores/useSoundStore';
import { FiPlay, FiPause, FiVolume2, FiClock, FiX, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { TbTrees, TbWaveSine, TbWind, TbFlame } from 'react-icons/tb';
import { motion, AnimatePresence, useScroll, useTransform, Variants, useSpring, useMotionValue } from 'framer-motion';

// 🕊️ 极简 SVG 飞鸟
const LinearBirdIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 10c1 -1.5 2 -2.5 4 -2.5s4 1.5 4 4c0 2.5 -2 4.5 -4 4.5h-2 M13 10c-1.5 -2 -3.5 -3 -6 -3c-2.5 0 -4.5 2 -4.5 4.5c0 2 1.5 3.5 3.5 4 M13 10l-2 5 M21 11.5l2 -0.5" />
  </svg>
);

const iconMap: Record<string, React.ReactNode> = { '🌿': <TbTrees />, '🌊': <TbWaveSine />, '🔥': <TbFlame />, '💨': <TbWind />, '🕊️': <LinearBirdIcon /> };

// ✅ 严格类型定义
const premiumEase = [0.16, 1, 0.3, 1] as [number, number, number, number];
const sharedTrans = (delay = 0, duration = 1.5): any => ({ duration, delay, ease: premiumEase });

// 🚀 高性能鼠标跟手
const CustomCursor = () => {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    let lastHover = false;
    const update = (e: MouseEvent) => {
      x.set(e.clientX - 10); y.set(e.clientY - 10);
      const isHover = !!(e.target as HTMLElement).closest('button, select, input, .sound-editorial-card, .vol-wrapper, .card-vol-hit-area, .preset-btn');
      if (isHover !== lastHover) setHover(lastHover = isHover);
    };
    window.addEventListener('mousemove', update, { passive: true });
    return () => window.removeEventListener('mousemove', update);
  }, [x, y]);

  return <motion.div className="custom-cursor" style={{ x, y }} animate={{ scale: hover ? 1.5 : 1, opacity: hover ? 0.3 : 1 }} transition={{ duration: 0.3 }} />;
};

// 🔒 登录弹窗
const LoginModal = () => {
  const { isLoginModalOpen: isOpen, toggleLoginModal: toggle, login, register } = useSoundStore();
  const [f, setF] = useState({ u: '', p: '', err: '', isReg: false });
  useEffect(() => { if (isOpen) setF({ u: '', p: '', err: '', isReg: false }); }, [isOpen]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.u || !f.p) return setF(s => ({ ...s, err: '请输入账号和密码' }));
    if (!(f.isReg ? register(f.u, f.p) : login(f.u, f.p))) setF(s => ({ ...s, err: f.isReg ? '用户名已存在' : '账号或密码错误' }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-overlay" onClick={() => toggle(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} transition={sharedTrans(0, 0.6)}>
            <button className="modal-close" onClick={() => toggle(false)}><FiX size={24} /></button>
            <h2>{f.isReg ? 'JOIN US' : 'WELCOME BACK'}</h2>
            <form className="auth-form" onSubmit={submit}>
              <div className="input-group"><input autoFocus value={f.u} onChange={e => setF({ ...f, u: e.target.value })} placeholder="USERNAME" /></div>
              <div className="input-group"><input type="password" value={f.p} onChange={e => setF({ ...f, p: e.target.value })} placeholder="PASSWORD" /></div>
              {f.err && <div className="error-msg">{f.err}</div>}
              <button type="submit" className="btn-auth-submit">{f.isReg ? 'REGISTER' : 'LOGIN'}</button>
            </form>
            <div className="auth-switch">{f.isReg ? 'Already have an account?' : 'New here?'} <span onClick={() => setF({ ...f, isReg: !f.isReg, err: '' })}>{f.isReg ? 'Sign In' : 'Create Account'}</span></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 🎵 声音卡片 (解耦防抖重绘)
const SoundCard = React.memo(({ s, i, isDim, hovered, setHovered, toggleSound, updateSoundVolume }: any) => (
  <motion.div style={{ marginTop: i % 2 ? '120px' : 0 }} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.15 }}>
    <motion.div variants={{ hidden: { opacity: 0, y: 100 }, show: { opacity: 1, y: 0, transition: sharedTrans(i * 0.1, 1.2) } }}>
      <motion.div className={`sound-editorial-card ${s.isPlaying ? 'is-playing' : ''}`} onMouseEnter={() => setHovered(s.id)} onMouseLeave={() => setHovered(null)} animate={{ opacity: isDim ? 0.3 : 1, scale: isDim ? 0.96 : 1, filter: isDim ? 'blur(4px)' : 'blur(0px)' }} transition={{ duration: 0.4 }}>
        <div className="card-bg-container">
          <motion.div className="card-bg-image" style={{ backgroundImage: `url(${s.backgroundImageUrl})` }} animate={{ scale: s.isPlaying ? 1.05 : 1, filter: s.isPlaying ? 'grayscale(0%)' : 'grayscale(100%) brightness(0.4)' }} transition={{ duration: 2 }} />
          <div className="card-overlay" />
        </div>
        <div className="card-content">
          <div className="card-top">
            <div className="icon-wrap">{iconMap[s.icon]}</div>
            <button onClick={() => toggleSound(s.id)} className="btn-circular-play">
              <motion.div animate={{ rotate: s.isPlaying ? 360 : 0 }}>{s.isPlaying ? <FiPause size={20} /> : <FiPlay size={20} className="play-offset" />}</motion.div>
            </button>
          </div>
          <div className="card-bottom">
            <h2 className="card-title">{s.name_cn}</h2><h4 className="card-eng-title">{s.name.toUpperCase()}</h4>
            <AnimatePresence>
              {(s.isPlaying || hovered === s.id) && (
                <motion.div className="slider-wrapper" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 15 }} exit={{ opacity: 0, height: 0 }}>
                  <div className="card-vol-hit-area"><input type="range" min="0" max="100" value={s.volume} onChange={e => updateSoundVolume(s.id, parseInt(e.target.value))} className="card-vol-slider" style={{ '--vol': `${s.volume}%` } as any} /></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </motion.div>
));

// 🌌 主程序
export default function App() {
  const store = useSoundStore();
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [hovered, setHovered] = useState<number | null>(null);

  const heroY = useTransform(smoothScroll, [0, 0.4], [0, -250]);
  const heroOp = useTransform(smoothScroll, [0, 0.3], [1, 0]);
  const heroSc = useTransform(smoothScroll, [0, 0.4], [1, 0.9]);
  const arrowOp = useTransform(smoothScroll, [0, 0.05], [1, 0]);

  useEffect(() => {
    const t = store.isTimerActive && store.timerDuration > 0 ? setInterval(store.tick, 1000) : null;
    return () => clearInterval(t as NodeJS.Timeout);
  }, [store.isTimerActive, store.timerDuration, store.tick]);
  
  const fmtTime = useCallback((m: number) => `${Math.floor(Math.max(0, m * 60) / 60)}:${(Math.max(0, Math.ceil(m * 60)) % 60).toString().padStart(2, '0')}`, []);
  const txtVar: Variants = { hidden: { y: "120%", rotate: 2 }, show: { y: "0%", rotate: 0, transition: sharedTrans(0, 1.2) } };

  return (
    <div className="page-wrapper">
      <CustomCursor /><LoginModal />
      
      <motion.nav className="navbar" initial={{ y: -100 }} animate={{ y: 0 }} transition={sharedTrans()}>
        <span className="logo">SILENCE <span style={{opacity: 0.3}}>/ 01</span></span>
        <div className="nav-right">
          {store.isLoggedIn ? <div className="user-profile"><span><FiUser /> {store.user?.username}</span><button onClick={store.logout} className="btn-icon"><FiLogOut /></button></div> : <button onClick={() => store.toggleLoginModal(true)} className="btn-login">LOGIN</button>}
        </div>
      </motion.nav>

      <main className="main-content">
        <motion.section className="hero-section" style={{ y: heroY, opacity: heroOp, scale: heroSc }}>
          {['MOLD YOUR', 'ATMOSPHERE.'].map((txt, i) => <div key={i} className="hero-text-mask"><motion.h1 variants={txtVar} initial="hidden" animate="show" transition={{ delay: i * 0.1 }}>{txt}</motion.h1></div>)}
          <motion.p className="hero-subtitle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sharedTrans(0.4)}>向下滚动，进入深度专属空间</motion.p>
          <motion.div className="preset-modes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sharedTrans(0.6)}>
            {['focus', 'relax', 'sleep'].map(p => <button key={p} onClick={() => store.applyPreset(p)} className="preset-btn">{p.toUpperCase()}</button>)}
          </motion.div>
          <motion.div className="scroll-indicator" style={{ opacity: arrowOp }} animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 2 }}><FiChevronDown size={32} /></motion.div>
        </motion.section>

        <div className="sounds-gallery">
          {store.sounds.map((s, i) => <SoundCard key={s.id} s={s} i={i} isDim={hovered !== null && hovered !== s.id} hovered={hovered} setHovered={setHovered} toggleSound={store.toggleSound} updateSoundVolume={store.updateSoundVolume} />)}
        </div>
      </main>

      {/* 底部灵动岛控制台 */}
      <motion.div className="dynamic-island-wrapper" initial={{ y: 150, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={sharedTrans(0.8)}>
        <div className="dynamic-pill">
          <div className="pill-left">
            <div className="master-play-wrap">
              <button onClick={store.toggleGlobalPlay} className={`pill-master-btn ${store.isGlobalPlaying ? 'active' : ''}`}>{store.isGlobalPlaying ? <FiPause size={18} /> : <FiPlay size={18} className="play-offset" />}</button>
            </div>
            <div className="pill-status"><span className="pill-label">{store.isGlobalPlaying || store.isTimerActive ? 'ACTIVE' : 'STANDBY'}</span><span className="pill-time">{store.isTimerActive ? fmtTime(store.timerDuration) : '∞'}</span></div>
          </div>
          <div className="pill-divider" />
          
          <div className="pill-center">
            <FiClock size={16} color="rgba(255,255,255,0.4)" />
            <select 
              value={store.isTimerActive ? store.timerPreset : 0} 
              onChange={e => store.setTimerDuration(parseInt(e.target.value))} 
              className="clean-select"
              // ✅ 修改文字为 TIMER
            >
              <option value={0}>TIMER</option>
              {[1, 5, 15, 30, 60].map(m => <option key={m} value={m}>{m} MIN</option>)}
            </select>
          </div>
          
          <div className="pill-divider hidden-mobile" />
          <div className="pill-right hidden-mobile">
            <FiVolume2 size={18} color="rgba(255,255,255,0.6)" className="vol-icon" />
            <div className="vol-wrapper"><input type="range" min="0" max="100" value={store.globalVolume} onChange={e => store.updateGlobalVolume(parseInt(e.target.value))} className="vol-slider" style={{ '--vol': `${store.globalVolume}%` } as any} /></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}