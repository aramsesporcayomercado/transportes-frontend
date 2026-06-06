import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useTheme } from '../../hooks/useTheme'

export function PageWrapper({ title, children }) {
  const { isDark } = useTheme()
  const { user } = useContext(AuthContext)

  // Lee el rol directo del contexto — no de sessionStorage
  const role = user?.rol || 'cliente'

  return (
    <div className="dashboard-shell" style={styles.shell(isDark)}>
      <Sidebar role={role} />
      <div style={styles.body}>
        <Topbar title={title} />
        <main style={styles.main(isDark)}>
          {children}
        </main>
      </div>
    </div>
  )
}

const styles = {
  shell: (isDark) => ({
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    background: isDark ? 'var(--color-dash-bg)' : '#F1F5F9',
  }),
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },
  main: (isDark) => ({
    flex: 1,
    padding: '24px',
    background: isDark ? 'var(--color-dash-bg)' : '#F1F5F9',
    overflowY: 'auto',
  }),
}