// 文件路径: src/App.tsx
import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import { useSoundStore } from './stores/useSoundStore';
import type { Sound, PresetType } from './stores/useSoundStore';
import { FiPlay, FiPause, FiVolume2, FiClock, FiX, FiUser, FiLogOut, FiChevronDown, FiUserX, FiGlobe, FiShare2 } from 'react-icons/fi';
import { TbTrees, TbWaveSine, TbWind, TbFlame } from 'react-icons/tb';
import { GiDove } from 'react-icons/gi';
import { motion, AnimatePresence, useScroll, useTransform, Variants, useSpring, useMotionValue } from 'framer-motion';

import rainBg  from './assets/images/rain-on-grasst.png';
import wavesBg from './assets/images/waves.png';
import fireBg  from './assets/images/bonfire.png';
import windBg  from './assets/images/wind.png';
import birdBg  from './assets/images/bird.png';

const dict = {
  ca: {
    estado: 'ESTAT', activo: 'ACTIU', espera: 'ESPERA', pistas: 'PISTES', volumen: 'VOLUM',
    hero1: 'MOLDEJA LA TEVA', hero2: 'ATMOSFERA', subtitle: 'Llisca per explorar el teu espai immersiu',
    login: 'INICIA SESSIÓ', logout: 'Tanca sessió', deleteAcc: 'Eliminar compte',
    joinUs: 'UNEIX-TE', welcomeBack: 'BENVINGUT', username: 'NOM D\'USUARI', password: 'CONTRASENYA',
    register: 'REGISTRA\'T', errCredentials: 'Credencials invàlides', errUserExists: 'L\'usuari ja existeix',
    errEmpty: 'Introdueix usuari i contrasenya', alreadyHave: 'Ja tens un compte?', newHere: 'Ets nou aquí?',
    signIn: 'Inicia sessió', createAcc: 'Crea un compte', dangerZone: 'ZONA DE PERILL',
    deleteConfirm: 'Estàs segur que vols eliminar el teu compte permanentment?', cannotUndo: 'Aquesta acció no es pot desfer.',
    cancel: 'CANCEL·LAR', delete: 'ELIMINAR', standby: 'EN ESPERA', timer: 'TEMPORITZADOR', min: 'MIN',
    share: 'COMPARTIR', copied: 'ENLLAÇ COPIAT', noActive: 'CAP SO ACTIU',
    reset: 'RESTABLIR'
  },
  es: {
    estado: 'ESTADO', activo: 'ACTIVO', espera: 'ESPERA', pistas: 'PISTAS', volumen: 'VOLUMEN',
    hero1: 'MOLDEA TU', hero2: 'ATMÓSFERA', subtitle: 'Desliza para explorar tu espacio inmersivo',
    login: 'INICIAR SESIÓN', logout: 'Cerrar sesión', deleteAcc: 'Eliminar cuenta',
    joinUs: 'ÚNETE', welcomeBack: 'BIENVENIDO', username: 'USUARIO', password: 'CONTRASEÑA',
    register: 'REGISTRARSE', errCredentials: 'Credenciales inválidas', errUserExists: 'El usuario ya existe',
    errEmpty: 'Por favor, introduce usuario y contraseña', alreadyHave: '¿Ya tienes cuenta?', newHere: '¿Nuevo aquí?',
    signIn: 'Inicia sesión', createAcc: 'Crear cuenta', dangerZone: 'ZONA DE PELIGRO',
    deleteConfirm: '¿Estás seguro de que deseas eliminar tu cuenta permanentemente?', cannotUndo: 'Esta acción no se puede deshacer.',
    cancel: 'CANCELAR', delete: 'ELIMINAR', standby: 'ESPERA', timer: 'TEMPORIZADOR', min: 'MIN',
    share: 'COMPARTIR', copied: 'ENLACE COPIADO', noActive: 'NINGÚN SONIDO ACTIVO',
    reset: 'REINICIAR'
  }
};

const bgMap: Record<number, string> = { 1: rainBg, 3: wavesBg, 5: fireBg, 6: windBg, 7: birdBg };
const iconMap: Record<string, React.ReactNode> = { '🌿': <TbTrees />, '🌊': <TbWaveSine />, '🔥': <TbFlame />, '💨': <TbWind />, '🕊️': <GiDove /> };
const authorMap: Record<number, { name: string; url: string }> = {
  1: { name: 'Mjeno', url: 'https://freesound.org/people/Mjeno/sounds/399275/?' },
  3: { name: 'mmiron', url: 'https://freesound.org/people/mmiron/sounds/130432/' },
  5: { name: 'amether', url: 'https://freesound.org/people/amether/sounds/189237/' },
  6: { name: 'santiago.torres1314', url: 'https://freesound.org/people/santiago.torres1314/sounds/677563/' },
  7: { name: 'klankbeeld', url: 'https://freesound.org/people/klankbeeld/sounds/810338/?' }
};

const premiumEase = [0.16, 1, 0.3, 1] as [number, number, number, number];
const sharedTrans = (delay = 0, duration = 1.5): any => ({ duration, delay, ease: premiumEase });
const txtVar: Variants = { hidden: { y: '120%', rotate: 2 }, show: { y: '0%', rotate: 0, transition: sharedTrans(0, 1.2) } };

interface SoundCardProps {
  s: Sound; i: number; isDim: boolean; hovered: number | null;
  setHovered: (id: number | null) => void; toggleSound: (id: number) => void; updateSoundVolume: (id: number, vol: number) => void;
  lang: 'ca' | 'es';
}

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

  return <motion.div className="custom-cursor" aria-hidden="true" style={{ x, y }} animate={{ scale: hover ? 1.5 : 1, opacity: hover ? 0.3 : 1 }} transition={{ duration: 0.3 }} />;
};

const StatusMonitor = () => {
  const { sounds, isGlobalPlaying, lang } = useSoundStore();
  const d = dict[lang];
  const active = sounds.filter((s: Sound) => s.isPlaying);
  const activeCount = active.length;
  const avgVolume = activeCount > 0 ? Math.round(active.reduce((acc: number, s: Sound) => acc + s.volume, 0) / activeCount) : 0;
  const valClass = (on: boolean) => `hud-val ${on ? 'hud-val--on' : 'hud-val--off'}`;

  return (
    <div className="hidden-mobile hud-pill" aria-live="polite" aria-atomic="true">
      <div className="hud-corner hud-corner--tl" aria-hidden="true" />
      <div className="hud-corner hud-corner--br" aria-hidden="true" />

      <div className="hud-cell">
        <span className="hud-label">{d.estado}</span>
        <span className={valClass(isGlobalPlaying)}>{isGlobalPlaying ? d.activo : d.espera}</span>
      </div>
      <div className="hud-sep" aria-hidden="true" />
      <div className="hud-cell">
        <span className="hud-label">{d.pistas}</span>
        <span className={valClass(activeCount > 0)}>
          <span className="hud-big">0{activeCount}</span>/<span className="hud-sub">0{sounds.length}</span>
        </span>
      </div>
      <div className="hud-sep" aria-hidden="true" />
      <div className="hud-cell">
        <span className="hud-label">{d.volumen}</span>
        <span className={valClass(activeCount > 0)}>
          <span className="hud-big">0{avgVolume.toString().padStart(2, '0')}</span><span className="hud-sub">%</span>
        </span>
      </div>
    </div>
  );
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
  const { lang } = useSoundStore();
  const d = dict[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 200000 }}>
          <motion.div 
            className="modal-content confirm-delete-modal" 
            onClick={(e: React.MouseEvent) => e.stopPropagation()} 
            initial={{ scale: 0.9, opacity: 0, y: 30 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 30 }} 
            transition={sharedTrans(0, 0.4)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="danger-zone-title"
          >
            <div className="danger-corner danger-corner--tl" aria-hidden="true" />
            <div className="danger-corner danger-corner--br" aria-hidden="true" />
            <h2 id="danger-zone-title">{d.dangerZone}</h2>
            <p className="confirm-delete-body">
              {d.deleteConfirm}
              <span className="confirm-delete-sub">{d.cannotUndo}</span>
            </p>
            <div className="confirm-delete-actions">
              <button className="btn-auth-submit btn-cancel" onClick={onClose} aria-label={d.cancel}>{d.cancel}</button>
              <button className="btn-auth-submit btn-danger" onClick={onConfirm} aria-label={d.delete}>{d.delete}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const LoginModal = () => {
  const { isLoginModalOpen: isOpen, toggleLoginModal: toggle, login, register, lang } = useSoundStore();
  const d = dict[lang];
  const [f, setF] = useState({ u: '', p: '', err: '', isReg: false });
  
  useEffect(() => { if (isOpen) setF({ u: '', p: '', err: '', isReg: false }); }, [isOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.u || !f.p) return setF((s: typeof f) => ({ ...s, err: d.errEmpty }));
    if (!(f.isReg ? register(f.u, f.p) : login(f.u, f.p)))
      setF((s: typeof f) => ({ ...s, err: f.isReg ? d.errUserExists : d.errCredentials }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-overlay" onClick={() => toggle(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div 
            className="modal-content" 
            onClick={(e: React.MouseEvent) => e.stopPropagation()} 
            initial={{ scale: 0.9, opacity: 0, y: 50 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 50 }} 
            transition={sharedTrans(0, 0.6)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
          >
            <button className="modal-close" onClick={() => toggle(false)} aria-label="Close modal"><FiX size={24} aria-hidden="true" /></button>
            <h2 id="login-title">{f.isReg ? d.joinUs : d.welcomeBack}</h2>
            <form className="auth-form" onSubmit={submit}>
              <div className="input-group"><input autoFocus value={f.u} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, u: e.target.value })} placeholder={d.username} aria-label={d.username} /></div>
              <div className="input-group"><input type="password" value={f.p} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, p: e.target.value })} placeholder={d.password} aria-label={d.password} /></div>
              {f.err && <div className="error-msg" role="alert">{f.err}</div>}
              <button type="submit" className="btn-auth-submit">{f.isReg ? d.register : d.login}</button>
            </form>
            <div className="auth-switch">
              {f.isReg ? d.alreadyHave : d.newHere}
              {' '}<button style={{background:'none', border:'none', padding:0, font:'inherit'}} onClick={() => setF({ ...f, isReg: !f.isReg, err: '' })}><span>{f.isReg ? d.signIn : d.createAcc}</span></button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SoundCard = React.memo(({ s, i, isDim, hovered, setHovered, toggleSound, updateSoundVolume, lang }: SoundCardProps) => {
  const localizedName = lang === 'ca' ? s.name_ca : s.name_es;

  return (
    <div style={{ marginTop: i % 2 ? 120 : 0 }}>
      <motion.div initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.15 }}>
        <motion.div variants={{ hidden: { opacity: 0, y: 100 }, show: { opacity: 1, y: 0, transition: sharedTrans(i * 0.1, 1.2) } }}>
          <motion.div className={`sound-editorial-card ${s.isPlaying ? 'is-playing' : ''}`} onMouseEnter={() => setHovered(s.id)} onMouseLeave={() => setHovered(null)} animate={{ opacity: isDim ? 0.55 : 1, scale: isDim ? 0.97 : 1, filter: isDim ? 'blur(2px)' : 'blur(0px)' }} transition={{ duration: 0.4 }}>
            <div className="card-bg-container" aria-hidden="true">
              <motion.div className="card-bg-image" style={{ backgroundImage: `url(${bgMap[s.id]})` } as any} animate={{ scale: s.isPlaying ? 1.05 : 1, filter: s.isPlaying ? 'grayscale(0%)' : 'grayscale(100%) brightness(0.4)' }} transition={{ duration: 2 }} />
              <div className="card-overlay" />
            </div>
            <div className="card-content">
              <div className="card-top">
                <div className="icon-wrap" aria-hidden="true">{iconMap[s.icon]}</div>
                <button 
                  onClick={() => toggleSound(s.id)} 
                  className="btn-circular-play"
                  aria-label={s.isPlaying ? `Pause ${localizedName}` : `Play ${localizedName}`}
                  aria-pressed={s.isPlaying}
                >
                  <motion.div animate={{ rotate: s.isPlaying ? 360 : 0 }}>{s.isPlaying ? <FiPause size={20} aria-hidden="true" /> : <FiPlay size={20} className="play-offset" aria-hidden="true" />}</motion.div>
                </button>
              </div>
              <div className="card-bottom">
                <h2 className="card-title">{localizedName}</h2>
                <h4 className="card-eng-title" aria-hidden="true">{s.name.toUpperCase()}</h4>
                {authorMap[s.id] && (
                  <div className="card-credit">
                    AUDIO BY{' '}
                    <a href={authorMap[s.id].url} target="_blank" rel="noopener noreferrer" aria-label={`Audio credit to ${authorMap[s.id].name}`}>{authorMap[s.id].name}</a>
                  </div>
                )}
                <AnimatePresence>
                  {(s.isPlaying || hovered === s.id) && (
                    <motion.div className="slider-wrapper" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 15 }} exit={{ opacity: 0, height: 0 }}>
                      <div className="card-vol-hit-area">
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={s.volume} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSoundVolume(s.id, parseInt(e.target.value))} 
                          className="card-vol-slider" 
                          style={{ '--vol': `${s.volume}%` } as any} 
                          aria-label={`Volume for ${localizedName}`}
                        />
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

export default function App() {
  const store = useSoundStore();
  const d = dict[store.lang];
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [hovered, setHovered] = useState<number | null>(null);
  const [timerPreset, setTimerPreset] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const heroY  = useTransform(smoothScroll, [0, 0.4], [0, -250]);
  const heroOp = useTransform(smoothScroll, [0, 0.3], [1, 0]);
  const heroSc = useTransform(smoothScroll, [0, 0.4], [1, 0.9]);
  const arrowOp = useTransform(smoothScroll, [0, 0.05], [1, 0]);

  useEffect(() => {
    if (window.location.search) {
      store.applyUrlMix(window.location.search);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = store.isTimerActive && store.timerDuration > 0 ? setInterval(store.tick, 1000) : null;
    return () => { if (t) clearInterval(t); };
  }, [store.isTimerActive, store.timerDuration, store.tick]);

  const fmtTime = useCallback((s: number) => {
    const total = Math.max(0, Math.ceil(s * 60));
    return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
  }, []);

  const handleTimerChange = (m: number) => { setTimerPreset(m); store.setTimerDuration(m); };

  const handleShare = () => {
    const active = store.sounds.filter(s => s.isPlaying);
    if (active.length === 0) {
      setToastMsg(d.noActive);
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    const params = new URLSearchParams();
    active.forEach(s => {
      params.set(s.name.toLowerCase(), s.volume.toString());
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      setToastMsg(d.copied);
      setTimeout(() => setToastMsg(''), 3000);
    });
  };

  return (
    <div className="page-wrapper">
      <CustomCursor />
      <LoginModal />
      <ConfirmDeleteModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={() => { store.deleteAccount(); setShowDeleteConfirm(false); }} />

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="toast-msg"
            role="status"
            aria-live="polite"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav className="navbar" initial={{ y: -100 }} animate={{ y: 0 }} transition={sharedTrans()} aria-label="Main Navigation">
        <span className="logo" aria-hidden="true">SILENCE <span className="logo-sub">/ 01</span></span>
        <div className="nav-center"><StatusMonitor /></div>
        
        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          
          <button onClick={handleShare} className="btn-icon" aria-label={d.share} title={d.share}>
            <FiShare2 size={18} aria-hidden="true" />
          </button>

          <button 
            onClick={() => store.setLang(store.lang === 'ca' ? 'es' : 'ca')} 
            className="btn-icon" 
            aria-label="Change Language"
            title="Change Language"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}
          >
            <FiGlobe size={16} aria-hidden="true" /> {store.lang === 'ca' ? 'CA' : 'ES'}
          </button>

          {store.isLoggedIn ? (
            <div className="user-profile">
              <span aria-label={`Logged in as ${store.user?.username}`}><FiUser aria-hidden="true" /> {store.user?.username}</span>
              <button onClick={store.logout} className="btn-icon" aria-label={d.logout} title={d.logout}><FiLogOut aria-hidden="true" /></button>
              <button onClick={() => setShowDeleteConfirm(true)} className="btn-icon btn-icon-danger" aria-label={d.deleteAcc} title={d.deleteAcc}><FiUserX aria-hidden="true" /></button>
            </div>
          ) : (
            <button onClick={() => store.toggleLoginModal(true)} className="btn-login" aria-label={d.login}>{d.login}</button>
          )}
        </div>
      </motion.nav>

      <main className="main-content" role="main">
        <motion.section className="hero-section" style={{ y: heroY, opacity: heroOp, scale: heroSc } as any} aria-labelledby="hero-heading">
          <div aria-hidden="true">
            {[d.hero1, d.hero2].map((txt: string, i: number) => (
              <div key={i} className="hero-text-mask">
                <motion.h1 variants={txtVar} initial="hidden" animate="show" transition={{ delay: i * 0.1 }}>{txt}</motion.h1>
              </div>
            ))}
          </div>
          <h1 id="hero-heading" className="sr-only" style={{ display: 'none' }}>{d.hero1} {d.hero2}</h1>
          
          <motion.p className="hero-subtitle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sharedTrans(0.4)}>
            {d.subtitle}
          </motion.p>

          <motion.div className="preset-modes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sharedTrans(0.6)} aria-label="Preset Modes">
            {(['focus', 'relax', 'sleep'] as PresetType[]).map((p: PresetType) => (
              <button key={p} onClick={() => store.applyPreset(p)} className="preset-btn" aria-label={`Preset ${p}`}>{p.toUpperCase()}</button>
            ))}
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 10px', alignSelf: 'center' }} aria-hidden="true" />
            <button onClick={store.resetMix} className="preset-btn" aria-label="Reset all volumes and tracks">
              {d.reset}
            </button>
          </motion.div>

          <motion.div className="scroll-indicator" style={{ opacity: arrowOp } as any} animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 2 }} aria-hidden="true">
            <FiChevronDown size={32} />
          </motion.div>
        </motion.section>

        <div className="sounds-gallery" aria-label="Sound Mixers">
          {store.sounds.map((s: Sound, i: number) => (
            <SoundCard key={s.id} s={s} i={i} isDim={hovered !== null && hovered !== s.id} hovered={hovered} setHovered={setHovered} toggleSound={store.toggleSound} updateSoundVolume={store.updateSoundVolume} lang={store.lang} />
          ))}
        </div>
      </main>

      <motion.div className="dynamic-island-wrapper" initial={{ y: 150, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={sharedTrans(0.8)}>
        <div className="dynamic-pill" role="region" aria-label="Global Controls">
          <div className="pill-left">
            <div className="master-play-wrap">
              <button 
                onClick={store.toggleGlobalPlay} 
                className={`pill-master-btn ${store.isGlobalPlaying ? 'active' : ''}`}
                aria-label={store.isGlobalPlaying ? 'Pause global audio' : 'Play global audio'}
                aria-pressed={store.isGlobalPlaying}
              >
                {store.isGlobalPlaying ? <FiPause size={18} aria-hidden="true" /> : <FiPlay size={18} className="play-offset" aria-hidden="true" />}
              </button>
            </div>
            <div className="pill-status" aria-live="polite">
              {store.isTimerActive && (
                <>
                  <div className="timer-corner timer-corner--tl" aria-hidden="true" />
                  <div className="timer-corner timer-corner--br" aria-hidden="true" />
                </>
              )}
              <span className="pill-label">
                {store.isGlobalPlaying || store.isTimerActive ? d.activo : d.standby}
              </span>
              {store.isTimerActive && <span className="pill-time" role="timer">{fmtTime(store.timerDuration)}</span>}
            </div>
          </div>

          <div className="pill-divider" aria-hidden="true" />

          <div className="pill-center">
            <FiClock size={16} color="rgba(255,255,255,0.4)" aria-hidden="true" />
            <select 
              value={timerPreset} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleTimerChange(parseInt(e.target.value))} 
              className="clean-select"
              aria-label={d.timer}
            >
              <option value={0}>{d.timer}</option>
              {[1, 5, 15, 30, 60].map((m: number) => <option key={m} value={m}>{m} {d.min}</option>)}
            </select>
          </div>

          <div className="pill-divider hidden-mobile" aria-hidden="true" />
          <div className="pill-right hidden-mobile">
            <FiVolume2 size={18} color="rgba(255,255,255,0.6)" className="vol-icon" aria-hidden="true" />
            <div className="vol-wrapper">
              <input 
                type="range" 
                min="0" max="100" 
                value={store.globalVolume} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateGlobalVolume(parseInt(e.target.value))} 
                className="vol-slider" 
                style={{ '--vol': `${store.globalVolume}%` } as any} 
                aria-label="Global Volume"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}