/* Hallmark · macrostructure: Centered Auth · theme: Custom (brand blues) · variant: UNIFIED
 * accent: #2D57EE→#2D98EE→#2DD7EE
 * Integrates: AuthContext · React Router redirect por rol
 * FIX: full-bleed background, responsive layout
 */

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { login as apiLogin } from "../api/auth"

const GRADIENT   = "linear-gradient(90deg, #2D57EE 0%, #2D98EE 51%, #2DD7EE 100%)"
const HOVER_BLUE = "#2DB4EE"

const ROLE_REDIRECT = {
  superadmin: "/dashboard",
  logistica:  "/dashboard",
  operador:   "/viajes",
  cliente:    "/nanobot",
}

const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="1" y="8" width="13" height="10" rx="1.5" fill="rgba(255,255,255,0.95)" />
    <path d="M14 11l2.5-3H21a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-7V11z" fill="rgba(255,255,255,0.75)" />
    <circle cx="5"  cy="19" r="2" fill="rgba(45,87,238,0.85)" />
    <circle cx="17" cy="19" r="2" fill="rgba(45,87,238,0.85)" />
    <rect x="2" y="12" width="5" height="3" rx="0.5" fill="rgba(45,152,238,0.5)" />
    <rect x="15" y="12" width="4" height="3" rx="0.5" fill="rgba(45,215,238,0.45)" />
  </svg>
)

const SunIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>  <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/>  <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const EyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeClosed = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const navigate  = useNavigate()

  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [mounted,  setMounted]  = useState(false)

  const getInitialTheme = () => {
    try {
      const saved = localStorage.getItem("tp-theme")
      if (saved) return saved
    } catch {}
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light"
  }

  const [theme, setTheme] = useState(getInitialTheme)
  const isDark = theme === "dark"

  useEffect(() => {
    try { localStorage.setItem("tp-theme", theme) } catch {}
    document.documentElement.setAttribute("data-tp-theme", theme)
  }, [theme])

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  const handleLogin = async () => {
    if (loading) return
    if (!email.trim() || !password.trim()) {
      setError("Por favor ingresa tu correo y contraseña.")
      return
    }
    setError("")
    setLoading(true)
    try {
      const data = await apiLogin(email.trim(), password)
      login(data.user)
      const rol = data.user?.rol ?? "cliente"
      navigate(ROLE_REDIRECT[rol] ?? "/dashboard", { replace: true })
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.message ||
        "No se pudo conectar con el servidor."
      )
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin() }
  const clearError = () => setError("")

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Sora:wght@300;400;500&display=swap');

        /* ── Global reset — ensures full bleed ── */
        html, body, #root {
          margin: 0; padding: 0;
          width: 100%; min-height: 100%;
          box-sizing: border-box;
        }
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Root wrapper ── */
        .lr {
          width: 100vw;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Sora', sans-serif;
          transition: background 0.45s ease;
          /* safe-area for notched devices */
          padding: env(safe-area-inset-top) env(safe-area-inset-right)
                   env(safe-area-inset-bottom) env(safe-area-inset-left);
        }
        .lr.light { background: #EDF2FF; }
        .lr.dark  { background: #020A17; }

        /* ── Background layers ── */
        .bg-layer {
          position: absolute; inset: 0;
          pointer-events: none; width: 100%; height: 100%;
        }
        .aurora {
          background:
            radial-gradient(ellipse 90% 55% at 50% -5%,  rgba(45,87,238,0.13)  0%, transparent 65%),
            radial-gradient(ellipse 60% 45% at 92% 92%,  rgba(45,215,238,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 6%  78%,  rgba(45,152,238,0.09) 0%, transparent 58%);
          opacity: 0; transition: opacity 0.45s ease;
        }
        .lr.light .aurora { opacity: 1; }

        .cosmos {
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%,  rgba(45,87,238,0.14)  0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(45,215,238,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 50% 50% at 20% 60%, rgba(45,152,238,0.09) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.45s ease;
        }
        .lr.dark .cosmos { opacity: 1; }

        .stars {
          background-image:
            radial-gradient(1px 1px at 8%  12%, rgba(180,210,255,0.55) 0%, transparent 100%),
            radial-gradient(1px 1px at 22% 38%, rgba(160,200,255,0.42) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 48% 6%,  rgba(200,225,255,0.52) 0%, transparent 100%),
            radial-gradient(1px 1px at 67% 28%, rgba(170,210,255,0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 84% 14%, rgba(190,220,255,0.50) 0%, transparent 100%),
            radial-gradient(1px 1px at 5%  68%, rgba(160,195,255,0.38) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 38% 62%, rgba(200,228,255,0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 62% 80%, rgba(170,205,255,0.40) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 55%, rgba(180,215,255,0.40) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 88%, rgba(165,200,255,0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 74% 92%, rgba(175,208,255,0.33) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 16% 52%, rgba(210,230,255,0.44) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 44%, rgba(165,200,255,0.36) 0%, transparent 100%),
            radial-gradient(1px 1px at 95% 30%, rgba(185,215,255,0.38) 0%, transparent 100%);
          opacity: 0; transition: opacity 0.5s ease;
          animation: twinkle 6s ease-in-out infinite alternate;
        }
        .lr.dark .stars { opacity: 1; }
        @keyframes twinkle { from { opacity: 0.65; } to { opacity: 1; } }

        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(65px); pointer-events: none;
          animation: drift 13s ease-in-out infinite alternate;
          transition: opacity 0.4s ease;
        }
        .orb1 { width: 35vw; max-width:380px; height:280px; top:-80px;    left:-60px;  background: rgba(45,87,238,0.09);  animation-delay: 0s;  }
        .orb2 { width: 30vw; max-width:300px; height:320px; bottom:-60px; right:-40px; background: rgba(45,215,238,0.08); animation-delay: -4s; }
        .orb3 { width: 25vw; max-width:220px; height:200px; top:42%;      left:62%;    background: rgba(45,152,238,0.07); animation-delay: -8s; }
        .lr.dark .orb { opacity: 0; }
        @keyframes drift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(22px,16px) scale(1.07); }
        }

        /* ── Brand ── */
        .brand {
          position: absolute; top: clamp(16px,3vw,28px); left: clamp(16px,3vw,36px);
          display: flex; align-items: center; gap: 10px;
          animation: fadeDown 0.6s ease forwards;
        }
        @keyframes fadeDown {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .brand-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: ${GRADIENT};
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 18px rgba(45,152,238,0.32);
          flex-shrink: 0;
        }
        .brand-name {
          font-size: 14px; font-weight: 500; letter-spacing: 0.04em;
          transition: color 0.35s ease;
          white-space: nowrap;
        }
        .lr.light .brand-name { color: #2340A0; }
        .lr.dark  .brand-name { color: rgba(210,228,255,0.85); }

        /* ── Theme toggle ── */
        .theme-toggle {
          position: absolute; top: clamp(16px,3vw,28px); right: clamp(16px,3vw,36px);
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: 1.5px solid; background: transparent;
          transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.18s ease;
        }
        .theme-toggle:hover { transform: rotate(12deg) scale(1.05); }
        .lr.light .theme-toggle {
          background: rgba(220,230,255,0.6); border-color: rgba(100,150,235,0.3); color: #2340A0;
        }
        .lr.light .theme-toggle:hover { background: rgba(200,218,255,0.85); border-color: ${HOVER_BLUE}; }
        .lr.dark  .theme-toggle {
          background: rgba(45,100,200,0.12); border-color: rgba(70,130,210,0.22); color: rgba(160,195,245,0.85);
        }
        .lr.dark  .theme-toggle:hover { background: rgba(45,180,238,0.18); border-color: rgba(45,180,238,0.40); color: ${HOVER_BLUE}; }

        /* ── Content ── */
        .content {
          position: relative; z-index: 10;
          width: 100%; max-width: 460px;
          padding: clamp(80px,12vw,104px) clamp(16px,5vw,24px) clamp(60px,8vw,80px);
          display: flex; flex-direction: column; align-items: center;
        }

        /* ── Heading ── */
        .heading-wrap {
          text-align: center; margin-bottom: clamp(24px,4vw,36px);
          animation: fadeUp 0.7s ease 0.1s both;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .h1 {
          font-family: 'Cormorant Garamond', serif; font-weight: 300;
          font-size: clamp(40px, 8.5vw, 62px); line-height: 1.04;
          letter-spacing: -0.015em; display: block;
          transition: color 0.35s ease;
        }
        .lr.light .h1 { color: #0D1B3E; }
        .lr.dark  .h1 { color: #EEF4FF; }
        .h2 {
          font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
          font-size: clamp(40px, 8.5vw, 62px); line-height: 1.04;
          letter-spacing: -0.015em; display: block;
          background: ${GRADIENT};
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Card ── */
        .card {
          width: 100%; border-radius: 20px;
          padding: clamp(24px,5vw,36px) clamp(20px,5vw,32px) clamp(22px,4vw,30px);
          transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
          animation: fadeUp 0.75s ease 0.2s both;
        }
        .lr.light .card {
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(32px) saturate(1.5);
          -webkit-backdrop-filter: blur(32px) saturate(1.5);
          border: 1px solid rgba(180,205,255,0.55);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.82) inset, 0 20px 60px rgba(30,60,140,0.10), 0 4px 20px rgba(45,87,238,0.08);
        }
        .lr.dark .card {
          background: rgba(8,20,48,0.72);
          backdrop-filter: blur(28px) saturate(1.4);
          -webkit-backdrop-filter: blur(28px) saturate(1.4);
          border: 1px solid rgba(90,140,220,0.18);
          box-shadow: 0 0 0 1px rgba(45,152,238,0.06) inset, 0 24px 64px rgba(2,8,22,0.55), 0 4px 24px rgba(45,87,238,0.12);
        }

        /* ── Field ── */
        .field { margin-bottom: 18px; }
        .field-label {
          display: block; font-size: 10.5px; font-weight: 500;
          letter-spacing: 0.13em; margin-bottom: 8px;
          text-transform: uppercase; transition: color 0.35s ease;
        }
        .lr.light .field-label { color: rgba(30,65,155,0.58); }
        .lr.dark  .field-label { color: rgba(160,190,240,0.65); }

        .input-wrap { position: relative; }
        .input {
          width: 100%; height: 52px; border-radius: 12px;
          border: 1.5px solid; padding: 0 18px;
          font-family: 'Sora', sans-serif; font-size: 14.5px; font-weight: 300;
          outline: none; letter-spacing: 0.01em;
          -webkit-appearance: none; appearance: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, color 0.25s ease;
        }
        .lr.light .input { background: rgba(238,244,255,0.70); border-color: rgba(120,165,235,0.28); color: #0D1B3E; }
        .lr.dark  .input { background: rgba(15,30,65,0.65);    border-color: rgba(70,120,200,0.18);  color: #D8EAFF; }
        .lr.light .input::placeholder { color: rgba(60,100,190,0.28); }
        .lr.dark  .input::placeholder { color: rgba(140,175,230,0.32); }
        .lr.light .input:hover { border-color: rgba(45,180,238,0.50); background: rgba(232,242,255,0.85); }
        .lr.dark  .input:hover { border-color: rgba(45,180,238,0.45); background: rgba(18,36,78,0.70);   }
        .input:focus {
          border-color: ${HOVER_BLUE};
          box-shadow: 0 0 0 3.5px rgba(45,180,238,0.12), 0 0 20px rgba(45,180,238,0.06);
        }
        .lr.light .input:focus { background: rgba(248,251,255,0.95); }
        .lr.dark  .input:focus { background: rgba(12,28,64,0.75); }
        .input-pass { padding-right: 52px; }
        .input.input-error { border-color: #EF4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.10) !important; }

        /* ── Eye button ── */
        .eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 4px;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .lr.light .eye-btn { color: rgba(60,110,210,0.45); }
        .lr.dark  .eye-btn { color: rgba(140,185,240,0.55); }
        .eye-btn:hover { color: ${HOVER_BLUE}; }

        /* ── Error message ── */
        .error-msg {
          display: flex; align-items: flex-start; gap: 7px;
          padding: 11px 14px; border-radius: 10px;
          margin-bottom: 16px;
          font-size: 12.5px; font-weight: 400; line-height: 1.5;
          animation: fadeInMsg 0.25s ease;
        }
        .error-icon { margin-top: 2px; flex-shrink: 0; }
        .lr.light .error-msg { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.18); color: #991B1B; }
        .lr.dark  .error-msg { background: rgba(239,68,68,0.10); border: 1px solid rgba(239,68,68,0.22); color: #FCA5A5; }
        @keyframes fadeInMsg {
          from { opacity:0; transform:translateY(-4px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── Recover link ── */
        .recover-row { display: flex; justify-content: flex-end; margin-top: 10px; margin-bottom: 4px; }
        .recover-link {
          font-size: 12.5px; font-weight: 400; background: none; border: none;
          cursor: pointer; letter-spacing: 0.01em; transition: color 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .lr.light .recover-link { color: rgba(45,100,220,0.55); }
        .lr.dark  .recover-link { color: rgba(100,160,235,0.65); }
        .recover-link:hover { color: ${HOVER_BLUE}; }

        /* ── Divider ── */
        .divider {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(45,152,238,0.18), transparent);
          margin: 22px 0 0;
        }

        /* ── Login button ── */
        .btn-wrap { margin-top: 22px; }
        .btn-login {
          width: 100%; height: 54px; border-radius: 14px;
          border: 1.5px solid transparent;
          background: ${GRADIENT};
          cursor: pointer;
          font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 500;
          letter-spacing: 0.06em; color: #fff;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          position: relative; overflow: hidden;
          transition: box-shadow 0.3s ease, transform 0.18s ease;
          box-shadow: 0 4px 22px rgba(45,87,238,0.26), 0 1px 6px rgba(45,87,238,0.14);
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .btn-login::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0) 100%);
          opacity: 0; transition: opacity 0.3s ease;
        }
        .btn-login:hover::before { opacity: 1; }
        .btn-login:hover {
          box-shadow: 0 0 0 2px rgba(45,215,238,0.50), 0 8px 30px rgba(45,152,238,0.35), 0 2px 8px rgba(45,87,238,0.20);
          transform: translateY(-1px);
        }
        .btn-login:active  { transform: translateY(0) scale(0.994); }
        .btn-login:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.30); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Version ── */
        .version {
          position: absolute;
          bottom: clamp(12px,2vw,20px); left: clamp(16px,3vw,24px);
          display: flex; align-items: center; gap: 7px; opacity: 0.58;
          animation: fadeDown 0.8s ease 0.5s both;
        }
        .version-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #2D98EE;
          box-shadow: 0 0 8px rgba(45,152,238,0.60);
          animation: pulse 2.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity:1; box-shadow: 0 0 8px rgba(45,152,238,0.60); }
          50%      { opacity:0.45; box-shadow: 0 0 3px rgba(45,152,238,0.30); }
        }
        .version-text {
          font-size: 10px; font-weight: 500; letter-spacing: 0.16em;
          text-transform: uppercase; transition: color 0.35s ease;
        }
        .lr.light .version-text { color: rgba(30,70,180,0.55); }
        .lr.dark  .version-text { color: rgba(140,185,240,0.70); }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .orb, .stars, .version-dot, .theme-toggle { animation: none !important; transition: none !important; }
        }

        /* ── Responsive breakpoints ── */
        @media (max-width: 480px) {
          .card { border-radius: 16px; }
          .input { height: 48px; font-size: 14px; }
          .btn-login { height: 50px; font-size: 13.5px; }
          .h1, .h2 { font-size: clamp(36px, 11vw, 46px); }
          .brand-icon { width: 34px; height: 34px; border-radius: 9px; }
          .theme-toggle { width: 34px; height: 34px; border-radius: 9px; }
        }

        @media (max-width: 360px) {
          .brand-name { display: none; }
          .content { padding-top: 72px; }
        }

        /* Tall phones — add extra breathing room */
        @media (min-height: 800px) {
          .heading-wrap { margin-bottom: 40px; }
        }
      `}</style>

      <div className={`lr ${isDark ? "dark" : "light"}`}>

        {/* Background layers */}
        <div className="bg-layer aurora" />
        <div className="bg-layer cosmos" />
        <div className="bg-layer stars" />
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />

        {/* Brand */}
        <div className="brand">
          <div className="brand-icon"><TruckIcon /></div>
          <span className="brand-name">transport-pi</span>
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Main content */}
        <div className="content">
          <div className="heading-wrap">
            <span className="h1">Bienvenido</span>
            <span className="h2">de vuelta.</span>
          </div>

          <div className="card">
            {/* Error */}
            {error && (
              <div className="error-msg" role="alert">
                <svg className="error-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="field">
              <label className="field-label" htmlFor="tp-email">Correo electrónico</label>
              <div className="input-wrap">
                <input
                  id="tp-email" type="email"
                  className={`input${error ? " input-error" : ""}`}
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError() }}
                  onKeyDown={handleKeyDown}
                  autoComplete="email" autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label className="field-label" htmlFor="tp-pass">Contraseña</label>
              <div className="input-wrap">
                <input
                  id="tp-pass" type={showPass ? "text" : "password"}
                  className={`input input-pass${error ? " input-error" : ""}`}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError() }}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                />
                <button
                  type="button" className="eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPass ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Recover */}
            <div className="recover-row">
              <button type="button" className="recover-link">Recuperar acceso</button>
            </div>

            <div className="divider" />

            {/* Submit */}
            <div className="btn-wrap">
              <button type="button" className="btn-login" onClick={handleLogin} disabled={loading}>
                {loading ? (
                  <><div className="spinner" /><span>Verificando...</span></>
                ) : (
                  <>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    <span>Iniciar sesión</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className="version">
          <div className="version-dot" />
          <span className="version-text">Transport-PI v1.1</span>
        </div>

      </div>
    </>
  )
}