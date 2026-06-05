import { NavLink } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

const NAV_ITEMS = [
  { to: '/dashboard',   icon: '⊞',  label: 'Dashboard'   },
  { to: '/viajes',      icon: '⟶',  label: 'Viajes'      },
  { to: '/operadores',  icon: '👤', label: 'Operadores'  },
  { to: '/flotillas',   icon: '🚛', label: 'Flotillas'   },
  { to: '/clientes',    icon: '🏢', label: 'Clientes'    },
  { to: '/incidencias', icon: '⚠',  label: 'Incidencias' },
  { to: '/usuarios',    icon: '🔑', label: 'Usuarios'    },
  { to: '/reportes',    icon: '📊', label: 'Reportes'    },
  { to: '/nanobot',     icon: '🤖', label: 'Nanobot AI'  },
]

const RUTAS_SOLO_ADMIN = ['/usuarios']
const RUTAS_CLIENTE    = ['/nanobot']
const RUTAS_OPERADOR   = ['/viajes']

export function Sidebar({ role }) {
  const { isDark } = useTheme()

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (role === 'cliente')   return RUTAS_CLIENTE.includes(item.to)
    if (role === 'operador')  return RUTAS_OPERADOR.includes(item.to)
    if (role === 'logistica') return !RUTAS_SOLO_ADMIN.includes(item.to)
    return true
  })

  return (
    <aside style={s.sidebar(isDark)}>
      <div style={s.brand}>
        <div style={s.logoBox}>
          <span style={s.logoText}>TP</span>
        </div>
        <div style={s.brandText}>
          <span style={s.brandName(isDark)}>transport</span>
          <span style={s.brandAccent}>-pi</span>
        </div>
      </div>

      <div style={s.divider(isDark)} />

      <nav style={s.nav}>
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => s.navItem(isActive, isDark)}
          >
            <span style={s.navIcon}>{item.icon}</span>
            <span style={s.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={s.footer(isDark)}>
        <div style={s.footerDot} />
        <span style={s.footerText(isDark)}>v1.1</span>
      </div>
    </aside>
  )
}

const s = {
  sidebar: (isDark) => ({
    width: 220,
    minHeight: '100vh',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    background: isDark
      ? 'linear-gradient(180deg, #0A1628 0%, #0D1F3C 100%)'
      : 'linear-gradient(180deg, #1044A3 0%, #0C3880 100%)',
    borderRight: isDark
      ? '1px solid rgba(55,138,221,0.12)'
      : '1px solid rgba(8,40,100,0.2)',
  }),

  brand: {
    padding: '22px 18px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  logoBox: {
    width: 32, height: 32,
    borderRadius: 9,
    background: 'linear-gradient(135deg, #2D57EE, #2DD7EE)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(45,87,238,0.4)',
    flexShrink: 0,
  },

  logoText: {
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '0.5px',
    fontFamily: 'var(--font-display-dash)',
  },

  brandText: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 1,
  },

  brandName: (isDark) => ({
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(220,235,255,0.9)',
    letterSpacing: '-0.3px',
    fontFamily: 'var(--font-display-dash)',
  }),

  brandAccent: {
    fontSize: 14,
    fontWeight: 500,
    color: '#2DD7EE',
    letterSpacing: '-0.3px',
    fontFamily: 'var(--font-display-dash)',
  },

  divider: (isDark) => ({
    height: '1px',
    margin: '0 18px 12px',
    background: isDark
      ? 'rgba(55,138,221,0.1)'
      : 'rgba(255,255,255,0.12)',
  }),

  nav: {
    flex: 1,
    padding: '0 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },

  navItem: (isActive, isDark) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 10px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: isActive ? 500 : 400,
    color: isActive
      ? '#fff'
      : 'rgba(255,255,255,0.82)',
    background: isActive
      ? 'rgba(45,152,238,0.22)'
      : 'transparent',
    borderLeft: isActive
      ? '2px solid #2DD7EE'
      : '2px solid transparent',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-body-dash)',
  }),

  navIcon: {
    fontSize: 15,
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
    opacity: 0.85,
  },

  navLabel: {
    letterSpacing: '0.1px',
  },

  footer: (isDark) => ({
    padding: '16px 18px',
    borderTop: isDark
      ? '1px solid rgba(55,138,221,0.1)'
      : '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }),

  footerDot: {
    width: 6, height: 6,
    borderRadius: '50%',
    background: '#16A34A',
    boxShadow: '0 0 6px rgba(22,163,74,0.5)',
    flexShrink: 0,
  },

  footerText: (isDark) => ({
    fontSize: 10,
    color: 'rgba(180,210,255,0.35)',
    letterSpacing: '1px',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  }),
}