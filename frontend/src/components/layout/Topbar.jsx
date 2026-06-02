import { useContext } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { AuthContext } from '../../context/AuthContext'

export function Topbar({ title }) {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useContext(AuthContext)

  return (
    <header style={styles.topbar(isDark)}>
      <h1 style={styles.title(isDark)}>{title}</h1>

      <div style={styles.right}>
        <button
          onClick={toggleTheme}
          style={styles.iconBtn(isDark)}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Cambiar tema"
        >
          {isDark ? '☀' : '🌙'}
        </button>

        <div style={styles.userPill(isDark)}>
  <div style={styles.avatar}>
    {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
  </div>
  <div style={styles.userInfo}>
    <span style={styles.userName(isDark)}>
      {user?.nombre || 'Usuario'}
    </span>
    <span style={styles.userRole(isDark)}>
      {user?.rol || 'rol'}
    </span>
  </div>
</div>

        <button
          onClick={logout}
          style={styles.logoutBtn(isDark)}
          aria-label="Cerrar sesión"
        >
          Salir
        </button>
      </div>
    </header>
  )
}

const styles = {
  topbar: (isDark) => ({
    height: 56,
    background: isDark ? 'var(--color-dash-card)' : '#fff',
    borderBottom: isDark
      ? '1px solid rgba(55,138,221,0.15)'
      : '1px solid var(--color-blue-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  }),
  title: (isDark) => ({
    fontSize: 15,
    fontWeight: 500,
    fontFamily: 'var(--font-display-dash)',
    color: isDark ? 'var(--color-blue-50)' : 'var(--color-blue-900)',
    margin: 0,
    letterSpacing: '-0.3px',
  }),
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: (isDark) => ({
  background: isDark ? 'transparent' : 'rgba(12,56,128,0.08)',
  border: isDark
    ? '1px solid rgba(55,138,221,0.25)'
    : '1px solid rgba(12,56,128,0.25)',  // borde más oscuro
  borderRadius: 7,
  width: 34, height: 34,
  cursor: 'pointer',
  fontSize: 15,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: isDark ? 'var(--color-blue-200)' : '#0C3880',  // azul más oscuro
  transition: 'background 0.15s',
}),
userPill: (isDark) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '5px 14px 5px 5px',
  borderRadius: 10,
  background: isDark
    ? 'rgba(55,138,221,0.08)'
    : 'linear-gradient(135deg, #2D57EE, #2DD7EE)',
  border: isDark
    ? '1px solid rgba(55,138,221,0.15)'
    : 'none',
  boxShadow: isDark
    ? 'none'
    : '0 3px 14px rgba(45,87,238,0.38)',
  cursor: 'default',
}),

avatar: {
  width: 28,
  height: 28,
  borderRadius: 7,
  background: 'linear-gradient(135deg, #2D57EE, #2DD7EE)',
  border: '1px solid rgba(255,255,255,0.35)',
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-display-dash)',
},

userName: (isDark) => ({
  fontSize: 12,
  fontWeight: 500,
  color: isDark ? 'var(--color-blue-100)' : '#fff',
  fontFamily: 'var(--font-body-dash)',
  lineHeight: 1,
}),

userRole: (isDark) => ({
  fontSize: 10,
  color: isDark ? 'var(--color-blue-400)' : 'rgba(220,240,255,0.9)',
  fontFamily: 'var(--font-body-dash)',
  lineHeight: 1,
}),
userInfo: {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
},
  logoutBtn: (isDark) => ({
  background: 'transparent',
  border: isDark
    ? '1px solid rgba(239,68,68,0.3)'
    : '1px solid rgba(220,38,38,0.35)',  // rojo más visible
  borderRadius: 7,
  padding: '5px 12px',
  fontSize: 12,
  fontFamily: 'var(--font-body-dash)',
  color: isDark ? '#F09595' : '#B91C1C',  // rojo más oscuro en light
  cursor: 'pointer',
  transition: 'background 0.15s',
}),
}