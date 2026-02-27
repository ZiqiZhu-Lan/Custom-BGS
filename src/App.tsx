// 文件路径: src/App.tsx
import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import { useSoundStore, PresetType } from './stores/useSoundStore';
import { FiPlay, FiPause, FiVolume2, FiClock, FiX, FiUser, FiLogOut, FiChevronDown, FiUserX } from 'react-icons/fi';
import { TbTrees, TbWaveSine, TbWind, TbFlame } from 'react-icons/tb';
import { GiDove } from 'react-icons/gi';
import { motion, AnimatePresence, useScroll, useTransform, Variants, useSpring, useMotionValue } from 'framer-motion';

import rainBg  from './assets/images/rain-on-grasst.png';
import wavesBg from './assets/images/waves.png';
import fireBg  from './assets/images/bonfire.png';
import windBg  from './assets/images/wind.png';
import birdBg  from './assets/images/bird.png';

// ─── Lookup maps ──────────────────────────────────────────────────────────────

const bgMap: Record<number, string> = { 1: rainBg, 3: wavesBg, 5: fireBg, 6: windBg, 7: birdBg };

const iconMap: Record<string, React.ReactNode> = {
  '🌿': <TbTrees />, '🌊': <TbWaveSine />, '🔥': <TbFlame />, '💨': <TbWind />, '🕊️': <GiDove />,
};

const authorMap: Record<number, { name: string; url: string }> = {
  1: { name: 'Mjeno',               url: 'https://freesound.org/people/Mjeno/sounds/399275/?' },
  3: { name: 'mmiron',              url: 'https://freesound.org/people/mmiron/sounds/130432/' },
  5: { name: 'amether',             url: 'https://freesound.org/people/amether/sounds/189237/' },
  6: { name: 'santiago.torres1314', url: 'https://freesound.org/people/santiago.torres1314/sounds/677563/' },
  7: { name: 'klankbeeld',          url: 'https://freesound.org/people/klankbeeld/sounds/810338/?' },
};

// ─── Animation helpers ────────────────────────────────────────────────────────

const premiumEase = [0.16, 1, 0.3, 1] as [number, number, number, number];
const sharedTrans = (delay = 0, duration = 1.5): any => ({ duration, delay, ease: premiumEase });

// ─── CustomCursor ─────────────────────────────────────────────────────────────

const CustomCursor = () => {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    let lastHover = false;
    const update = (e: MouseEvent) => {
      x.set(e.clientX - 10); y.set(e.clientY - 10);
      const isHover = !!(e.target as HTMLElement).closest('button, a, select, input, .sound-editorial-card, .vol-wrapper, .card-vol-hit-area, .preset-btn');
      if (isHover !== lastHover) setHover(lastHover = isHover);
    };
    window.addEventListener('mousemove', update, { passive: true });
    return () => window.removeEventListener('mousemove', update);
  }, [x, y]);

  return (
    <motion.div
      className="custom-cursor"
      style={{ x, y }}
      animate={{ scale: hover ? 1.5 : 1, opacity: hover ? 0.3 : 1 }}
      transition={{ duration: 0.3 }}
    />
  );
};

// ─── StatusMonitor ────────────────────────────────────────────────────────────

// 📊 南孚工业级精密 HUD
const StatusMonitor = () => {
  const { sounds, isGlobalPlaying } = useSoundStore();
  const active    = sounds.filter(s => s.isPlaying);
  const activeCount = active.length;
  const avgVolume   = activeCount > 0 ? Math.round(active.reduce((sum, s) => sum + s.volume, 0) / activeCount) : 0;

  const pill: React.CSSProperties = {
    display: 'flex', gap: '1.2rem', alignItems: 'center',
    background: 'rgba(255,255,255,0.03)', 
    border: '1px solid rgba(255,255,255,0.05)', 
    padding: '6px 18px', borderRadius: '100px',
    position: 'relative', 
  };
  const label = { fontSize: '0.6rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 } as React.CSSProperties;
  const val   = (isActive: boolean) => ({ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.5px', fontVariantNumeric: 'tabular-nums', color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' } as React.CSSProperties);

  return (
    <div className="hidden-mobile" style={pill}>
      <div style={{ position: 'absolute', top: '-1px', left: '-5px', width: '10px', height: '10px', borderTop: '2px solid rgba(255,255,255,0.4)', borderLeft: '2px solid rgba(255,255,255,0.4)' }} />
      <div style={{ position: 'absolute', bottom: '-1px', right: '-5px', width: '10px', height: '10px', borderBottom: '2px solid rgba(255,255,255,0.4)', borderRight: '2px solid rgba(255,255,255,0.4)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={label}>ESTADO</span>
        <span style={val(isGlobalPlaying)}>{isGlobalPlaying ? 'ACTIVO' : 'ESPERA'}</span>
      </div>
      
      <div style={{ width: '2px', height: '14px', background: 'rgba(255,255,255,0.1)', transform: 'rotate(20deg)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={label}>PISTAS</span>
        <span style={val(activeCount > 0)}><span style={{fontSize:'1rem',fontWeight:300,fontFamily:'monospace'}}>0{activeCount}</span>/<span style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.2)',fontFamily:'monospace'}}>0{sounds.length}</span></span>
      </div>

      <div style={{ width: '2px', height: '14px', background: 'rgba(255,255,255,0.1)', transform: 'rotate(20deg)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={label}>VOLUMEN</span>
        <span style={val(activeCount > 0)}><span style={{fontSize:'1rem',fontWeight:300,fontFamily:'monospace'}}>0{avgVolume.toString().padStart(2, '0')}</span><span style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.2)',fontFamily:'monospace'}}>%</span></span>
      </div>
    </div>
  );
};

// ─── Custom Confirm Delete Modal ──────────────────────────────────────────────

// ⚠️ 专属高级注销确认弹窗 (替代丑陋的 window.confirm)
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 200000 }}>
          <motion.div 
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            initial={{ scale: 0.9, opacity: 0, y: 30 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 30 }} 
            transition={sharedTrans(0, 0.4)}
            style={{ 
              padding: '3.5rem', 
              border: '1px solid rgba(255, 59, 48, 0.3)', 
              boxShadow: '0 20px 60px rgba(255, 59, 48, 0.15)',
              position: 'relative' 
            }}
          >
            {/* HUD 红色警告准星边框 */}
            <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '20px', height: '20px', borderTop: '2px solid #ff3b30', borderLeft: '2px solid #ff3b30' }} />
            <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '20px', height: '20px', borderBottom: '2px solid #ff3b30', borderRight: '2px solid #ff3b30' }} />

            <h2 style={{ color: '#ff3b30', margin: '0 0 1rem 0', letterSpacing: '6px', fontSize: '1.2rem' }}>ZONA DE PELIGRO</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.6, textAlign: 'center', margin: '0 0 2.5rem 0', letterSpacing: '1px' }}>
              ¿Estás seguro de que deseas eliminar tu cuenta permanentemente?
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', textTransform: 'uppercase' }}>This action cannot be undone.</span>
            </p>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                className="btn-auth-submit" 
                style={{ flex: 1, margin: 0, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} 
                onClick={onClose}
              >
                CANCELAR
              </button>
              <button 
                className="btn-auth-submit" 
                style={{ flex: 1, margin: 0, background: '#ff3b30', color: '#fff', boxShadow: '0 0 20px rgba(255,59,48,0.4)' }} 
                onClick={onConfirm}
              >
                ELIMINAR
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// ─── LoginModal ───────────────────────────────────────────────────────────────

const LoginModal = () => {
  const { isLoginModalOpen: isOpen, toggleLoginModal: toggle, login, register } = useSoundStore();
  const [f, setF] = useState({ u: '', p: '', err: '', isReg: false });
  useEffect(() => { if (isOpen) setF({ u: '', p: '', err: '', isReg: false }); }, [isOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.u || !f.p) return setF(s => ({ ...s, err: 'Por favor, introduce usuario y contraseña' }));
    if (!(f.isReg ? register(f.u, f.p) : login(f.u, f.p)))
      setF(s => ({ ...s, err: f.isReg ? 'El usuario ya existe' : 'Credenciales inválidas' }));
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
            <div className="auth-switch">
              {f.isReg ? 'Already have an account?' : 'New here?'}
              {' '}<span onClick={() => setF({ ...f, isReg: !f.isReg, err: '' })}>{f.isReg ? 'Sign In' : 'Create Account'}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── SoundCard ────────────────────────────────────────────────────────────────

const SoundCard = React.memo(({ s, i, isDim, hovered, setHovered, toggleSound, updateSoundVolume }: any) => {
  const authorInfo   = authorMap[s.id];
  const bgImageUrl   = bgMap[s.id];

  return (
    <div style={{ marginTop: i % 2 ? '120px' : 0 }}>
    <motion.div initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.15 }}>
      <motion.div variants={{ hidden: { opacity: 0, y: 100 }, show: { opacity: 1, y: 0, transition: sharedTrans(i * 0.1, 1.2) } }}>
        <motion.div
          className={`sound-editorial-card ${s.isPlaying ? 'is-playing' : ''}`}
          onMouseEnter={() => setHovered(s.id)} onMouseLeave={() => setHovered(null)}
          animate={{ opacity: isDim ? 0.55 : 1, scale: isDim ? 0.97 : 1, filter: isDim ? 'blur(2px)' : 'blur(0px)' }}
          transition={{ duration: 0.4 }}
        >
          <div className="card-bg-container">
            <motion.div
              className="card-bg-image"
              style={{ backgroundImage: `url(${bgImageUrl})` } as any}
              animate={{ scale: s.isPlaying ? 1.05 : 1, filter: s.isPlaying ? 'grayscale(0%)' : 'grayscale(100%) brightness(0.4)' }}
              transition={{ duration: 2 }}
            />
            <div className="card-overlay" />
          </div>

          <div className="card-content">
            <div className="card-top">
              <div className="icon-wrap">{iconMap[s.icon]}</div>
              <button onClick={() => toggleSound(s.id)} className="btn-circular-play">
                <motion.div animate={{ rotate: s.isPlaying ? 360 : 0 }}>
                  {s.isPlaying ? <FiPause size={20} /> : <FiPlay size={20} className="play-offset" />}
                </motion.div>
              </button>
            </div>

            <div className="card-bottom">
              <h2 className="card-title">{s.name_cn}</h2>
              <h4 className="card-eng-title">{s.name.toUpperCase()}</h4>

              {authorInfo && (
                <div style={{ marginTop: '6px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', fontWeight: 500, textTransform: 'uppercase' }}>
                  AUDIO BY{' '}
                  <a
                    href={authorInfo.url} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '2px', transition: 'color 0.3s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  >
                    {authorInfo.name}
                  </a>
                </div>
              )}

              <AnimatePresence>
                {(s.isPlaying || hovered === s.id) && (
                  <motion.div className="slider-wrapper" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 15 }} exit={{ opacity: 0, height: 0 }}>
                    <div className="card-vol-hit-area">
                      <input type="range" min="0" max="100" value={s.volume} onChange={e => updateSoundVolume(s.id, parseInt(e.target.value))} className="card-vol-slider" style={{ '--vol': `${s.volume}%` } as any} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
    </div>
  );
});

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const store = useSoundStore();
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [hovered,     setHovered]     = useState<number | null>(null);
  const [timerPreset, setTimerPreset] = useState(0);
  
  // ✅ 新增：控制注销确认弹窗的显示状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const heroY  = useTransform(smoothScroll, [0, 0.4], [0, -250]);
  const heroOp = useTransform(smoothScroll, [0, 0.3], [1, 0]);
  const heroSc = useTransform(smoothScroll, [0, 0.4], [1, 0.9]);
  const arrowOp = useTransform(smoothScroll, [0, 0.05], [1, 0]);

  useEffect(() => {
    const t = store.isTimerActive && store.timerDuration > 0 ? setInterval(store.tick, 1000) : null;
    return () => clearInterval(t as NodeJS.Timeout);
  }, [store.isTimerActive, store.timerDuration, store.tick]);

  const fmtTime = useCallback((s: number) => {
    const total = Math.max(0, Math.ceil(s * 60));
    return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
  }, []);

  const txtVar: Variants = {
    hidden: { y: '120%', rotate: 2 },
    show:   { y: '0%',   rotate: 0, transition: sharedTrans(0, 1.2) },
  };

  const handleTimerChange = (m: number) => {
    setTimerPreset(m);
    store.setTimerDuration(m);
  };

  return (
    <div className="page-wrapper">
      <CustomCursor />
      <LoginModal />
      
      {/* ✅ 挂载注销弹窗 */}
      <ConfirmDeleteModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={() => {
          store.deleteAccount();
          setShowDeleteConfirm(false);
        }} 
      />

      <motion.nav className="navbar" initial={{ y: -100 }} animate={{ y: 0 }} transition={sharedTrans()}>
        <span className="logo">SILENCE <span style={{ opacity: 0.3 }}>/ 01</span></span>

        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <StatusMonitor />
        </div>

        <div className="nav-right">
          {store.isLoggedIn ? (
            <div className="user-profile">
              <span><FiUser /> {store.user?.username}</span>
              <button onClick={store.logout} className="btn-icon" title="Cerrar sesión (Logout)">
                <FiLogOut />
              </button>
              {/* 触发高级注销弹窗 */}
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="btn-icon" 
                title="Eliminar cuenta (Delete Account)"
                style={{ color: 'rgba(255, 59, 48, 0.6)', transition: 'color 0.3s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ff3b30')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 59, 48, 0.6)')}
              >
                <FiUserX />
              </button>
            </div>
          ) : (
            <button onClick={() => store.toggleLoginModal(true)} className="btn-login">LOGIN</button>
          )}
        </div>
      </motion.nav>

      <main className="main-content">
        <motion.section className="hero-section" style={{ y: heroY, opacity: heroOp, scale: heroSc } as any}>
          {['MOLD YOUR', 'ATMOSPHERE'].map((txt, i) => (
            <div key={i} className="hero-text-mask">
              <motion.h1 variants={txtVar} initial="hidden" animate="show" transition={{ delay: i * 0.1 }}>{txt}</motion.h1>
            </div>
          ))}
          <motion.p className="hero-subtitle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sharedTrans(0.4)}>
            Desliza para explorar tu espacio inmersivo
          </motion.p>
          <motion.div className="preset-modes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sharedTrans(0.6)}>
            {(['focus', 'relax', 'sleep'] as PresetType[]).map(p => (
              <button key={p} onClick={() => store.applyPreset(p)} className="preset-btn">{p.toUpperCase()}</button>
            ))}
          </motion.div>
          <motion.div className="scroll-indicator" style={{ opacity: arrowOp } as any} animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <FiChevronDown size={32} />
          </motion.div>
        </motion.section>

        <div className="sounds-gallery">
          {store.sounds.map((s, i) => (
            <SoundCard
              key={s.id} s={s} i={i}
              isDim={hovered !== null && hovered !== s.id}
              hovered={hovered} setHovered={setHovered}
              toggleSound={store.toggleSound}
              updateSoundVolume={store.updateSoundVolume}
            />
          ))}
        </div>
      </main>

      <motion.div className="dynamic-island-wrapper" initial={{ y: 150, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={sharedTrans(0.8)}>
        <div className="dynamic-pill">
          <div className="pill-left">
            <div className="master-play-wrap">
              <button onClick={store.toggleGlobalPlay} className={`pill-master-btn ${store.isGlobalPlaying ? 'active' : ''}`}>
                {store.isGlobalPlaying ? <FiPause size={18} /> : <FiPlay size={18} className="play-offset" />}
              </button>
            </div>
            
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minWidth: '85px',
                position: 'relative', 
                height: '44px'
              }}
              className="pill-status"
            >
              {store.isTimerActive && (
                <>
                  <div style={{ position: 'absolute', top: '0px', left: '-5px', width: '6px', height: '6px', borderTop: '1px solid rgba(255,255,255,0.4)', borderLeft: '1px solid rgba(255,255,255,0.4)' }} />
                  <div style={{ position: 'absolute', bottom: '0px', right: '-5px', width: '6px', height: '6px', borderBottom: '1px solid rgba(255,255,255,0.4)', borderRight: '1px solid rgba(255,255,255,0.4)' }} />
                </>
              )}

              <span
                style={{
                  fontSize: '0.6rem',
                  letterSpacing: '2px',
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  textAlign: 'center',
                  marginTop: store.isTimerActive ? '0' : '0', 
                  transition: 'all 0.3s ease'
                }}
                className="pill-label"
              >
                {store.isGlobalPlaying || store.isTimerActive ? 'ACTIVE' : 'STANDBY'}
              </span>

              {store.isTimerActive && (
                <span
                  style={{
                    fontSize: '1rem', 
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                    marginTop: '6px',
                    color: '#fff',
                    textAlign: 'center'
                  }}
                  className="pill-time"
                >
                  {fmtTime(store.timerDuration)}
                </span>
              )}
            </div>
          </div>

          <div className="pill-divider" />

          <div className="pill-center">
            <FiClock size={16} color="rgba(255,255,255,0.4)" />
            <select value={timerPreset} onChange={e => handleTimerChange(parseInt(e.target.value))} className="clean-select">
              <option value={0}>TIMER</option>
              {[1, 5, 15, 30, 60].map(m => <option key={m} value={m}>{m} MIN</option>)}
            </select>
          </div>

          <div className="pill-divider hidden-mobile" />
          <div className="pill-right hidden-mobile">
            <FiVolume2 size={18} color="rgba(255,255,255,0.6)" className="vol-icon" />
            <div className="vol-wrapper">
              <input type="range" min="0" max="100" value={store.globalVolume} onChange={e => store.updateGlobalVolume(parseInt(e.target.value))} className="vol-slider" style={{ '--vol': `${store.globalVolume}%` } as any} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}