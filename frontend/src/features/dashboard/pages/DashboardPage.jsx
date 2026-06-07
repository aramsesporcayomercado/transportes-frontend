import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../../shared/context/AuthContext'
import { PageWrapper } from '../../../shared/components/layout/PageWrapper'
import { useTheme } from '../../../shared/hooks/useTheme'
import api from '../../../shared/api/axiosInstance'

// Colores de status — centralizados aquí para reutilizar
const STATUS_CONFIG = {
  cargado_en_transito: { label: 'En tránsito', color: '#16A34A', bg: 'rgba(22,163,74,0.1)'  },
  cargando:            { label: 'Cargando',    color: '#EA580C', bg: 'rgba(234,88,12,0.1)'  },
  pendiente:           { label: 'Pendiente',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  en_destino:          { label: 'En destino',  color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  descargando:         { label: 'Descargando', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  completado:          { label: 'Completado',  color: '#6B7280', bg: 'rgba(107,114,128,0.1)'},
  cancelado:           { label: 'Cancelado',   color: '#991B1B', bg: 'rgba(153,27,27,0.1)'  },
  incidencia:          { label: 'Incidencia',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
}

// Componente pequeño reutilizable para el badge de status
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#6B7280', bg: 'rgba(107,114,128,0.1)' }
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 500,
      padding: '3px 8px',
      borderRadius: 20,
      color: cfg.color,
      background: cfg.bg,
      fontFamily: 'var(--font-body-dash)',
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

// Tarjeta de métrica — muestra un número grande con label y subtexto
function MetricCard({ label, value, sub, subColor, valueColor, isDark, loading }) {
  return (
    <div style={cardStyles.metric(isDark)}>
      <span style={cardStyles.metricLabel(isDark)}>{label}</span>
      {loading
        ? <div style={cardStyles.skeleton} />
        : <span style={cardStyles.metricLabel(isDark, valueColor)}>{label}</span>
      }
      {sub && (
        <span style={cardStyles.metricSub(subColor)}>{sub}</span>
      )}
    </div>
  )
}

export function DashboardPage() {
  const { user } = useContext(AuthContext)
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [metrics, setMetrics]   = useState(null)
  const [viajes,  setViajes]    = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    // Carga métricas y viajes recientes en paralelo
    Promise.all([
      api.get('/viajes/?page_size=5&ordering=-created_at'),
      api.get('/operadores/?page_size=1'),
      api.get('/flotillas/unidades/?page_size=1'),
      api.get('/incidencias/?estado=abierta&page_size=1'),
    ])
      .then(([viajesRes, opsRes, flotRes, incRes]) => {
      setViajes(viajesRes.data.slice(0, 5))
      setMetrics({
      viajes:      viajesRes.data.filter(v =>
        !['completado','cancelado'].includes(v.estado)).length,
      operadores:  opsRes.data.length,
      flotilla:    flotRes.data.length,
      incidencias: incRes.data.length,
      })
    })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Saludo según la hora
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const nombreCorto = user?.nombre?.split(' ')[0] || 'bienvenido'

  return (
    <PageWrapper title="Dashboard">
      <div style={styles.page}>

        {/* Saludo */}
        <div style={styles.greeting(isDark)}>
          <div>
            <h2 style={styles.greetingTitle(isDark)}>
              {saludo}, {nombreCorto} 👋
            </h2>
            <p style={styles.greetingSub(isDark)}>
              Aquí tienes el resumen de hoy.
            </p>
          </div>
          <div style={styles.dateBadge(isDark)}>
            {new Date().toLocaleDateString('es-MX', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </div>
        </div>

        {/* Métricas */}
        <div style={styles.metricsGrid}>
          <MetricCard
            label="Viajes activos"
            value={metrics?.viajes ?? 0}
            sub="↑ en curso hoy"
            subColor="var(--color-cyan)"
            valueColor={
            !isDark && (metrics?.viajes ?? 0) === 0
            ? '#DC2626'  // rojo en light mode cuando es 0
            : undefined  // color normal en dark o cuando hay viajes
            }
            isDark={isDark}
            loading={loading}
            />
          <MetricCard
            label="Operadores"
            value={metrics?.operadores ?? 0}
            sub="registrados"
            subColor="var(--color-blue-400)"
            isDark={isDark}
            loading={loading}
          />
          <MetricCard
            label="Flotilla"
            value={metrics?.flotilla ?? 0}
            sub="unidades totales"
            subColor="var(--color-blue-400)"
            isDark={isDark}
            loading={loading}
          />
          <MetricCard
            label="Incidencias abiertas"
            value={metrics?.incidencias ?? 0}
            sub={metrics?.incidencias > 0 ? 'Requieren atención' : 'Todo en orden'}
            subColor={metrics?.incidencias > 0 ? '#EF4444' : '#16A34A'}
            isDark={isDark}
            loading={loading}
          />
        </div>

        {/* Tabla viajes recientes */}
        <div style={styles.card(isDark)}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle(isDark)}>Viajes recientes</span>
            <button
              onClick={() => navigate('/viajes')}
              style={styles.verTodos(isDark)}
            >
              Ver todos →
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '20px 0' }}>
              {[1,2,3].map(i => (
                <div key={i} style={styles.skeletonRow} />
              ))}
            </div>
          ) : viajes.length === 0 ? (
            <div style={styles.empty(isDark)}>
              No hay viajes registrados aún.
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Folio', 'Cliente', 'Operador', 'Unidad', 'Estado'].map(col => (
                    <th key={col} style={styles.th(isDark)}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viajes.map((viaje, i) => (
                  <tr
                    key={viaje.id}
                    style={styles.tr(isDark, i)}
                    onClick={() => navigate(`/viajes/${viaje.id}`)}
                    >
                  <td style={styles.td(isDark)}>
                    {viaje.cliente_nombre || '—'}
                  </td>
                  <td style={styles.td(isDark)}>
                  {viaje.operador_nombre || '—'}
                  </td>
                  <td style={styles.td(isDark)}>
                  {viaje.unidad_codigo || '—'}
                  </td>
                    <td style={styles.td(isDark)}>
                      <StatusBadge status={viaje.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </PageWrapper>
  )
}

// Estilos
const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    maxWidth: 1100,
  },

  greeting: (isDark) => ({
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    padding: '4px 0 8px',
  }),

  greetingTitle: (isDark) => ({
    fontSize: 22,
    fontWeight: 600,
    fontFamily: 'var(--font-display-dash)',
    color: isDark ? 'var(--color-blue-50)' : 'var(--color-blue-900)',
    margin: 0,
    letterSpacing: '-0.5px',
  }),

  greetingSub: (isDark) => ({
    fontSize: 13,
    color: isDark ? 'var(--color-blue-400)' : 'var(--color-blue-400)',
    fontFamily: 'var(--font-body-dash)',
    margin: '4px 0 0',
  }),

  dateBadge: (isDark) => ({
    fontSize: 12,
    color: isDark ? 'var(--color-blue-200)' : 'var(--color-blue-600)',
    fontFamily: 'var(--font-body-dash)',
    background: isDark ? 'rgba(55,138,221,0.08)' : 'var(--color-blue-50)',
    border: isDark ? '1px solid rgba(55,138,221,0.15)' : '1px solid var(--color-blue-100)',
    padding: '6px 12px',
    borderRadius: 8,
    textTransform: 'capitalize',
  }),

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
  },

  card: (isDark) => ({
    background: isDark ? 'var(--color-dash-card)' : '#fff',
    border: isDark
      ? '1px solid rgba(55,138,221,0.15)'
      : '1px solid #E2E8F0',
    borderRadius: 12,
    padding: '16px 20px',
    overflow: 'hidden',
  }),

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  cardTitle: (isDark) => ({
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'var(--font-body-dash)',
    color: isDark ? 'var(--color-blue-400)' : '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }),

  verTodos: (isDark) => ({
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    color: 'var(--color-cyan)',
    fontFamily: 'var(--font-body-dash)',
    padding: 0,
  }),

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  th: (isDark) => ({
    fontSize: 11,
    fontWeight: 500,
    fontFamily: 'var(--font-body-dash)',
    color: isDark ? 'var(--color-blue-400)' : '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '6px 12px 10px',
    textAlign: 'left',
    borderBottom: isDark
      ? '1px solid rgba(55,138,221,0.1)'
      : '1px solid #F1F5F9',
  }),

  tr: (isDark, i) => ({
    background: i % 2 === 0
      ? 'transparent'
      : isDark ? 'rgba(55,138,221,0.03)' : 'rgba(241,245,249,0.5)',
    cursor: 'pointer',
    transition: 'background 0.12s',
  }),

  td: (isDark) => ({
    fontSize: 13,
    fontFamily: 'var(--font-body-dash)',
    color: isDark ? 'var(--color-blue-100)' : '#334155',
    padding: '10px 12px',
    borderBottom: isDark
      ? '1px solid rgba(55,138,221,0.06)'
      : '1px solid #F8FAFC',
  }),

  folio: {
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    color: 'var(--color-cyan)',
    fontWeight: 500,
  },

  empty: (isDark) => ({
    textAlign: 'center',
    padding: '32px 0',
    fontSize: 13,
    color: isDark ? 'var(--color-blue-400)' : '#94A3B8',
    fontFamily: 'var(--font-body-dash)',
  }),

  skeletonRow: {
    height: 36,
    borderRadius: 6,
    background: 'rgba(55,138,221,0.06)',
    marginBottom: 8,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  
}

const cardStyles = {
  metric: (isDark) => ({
    background: isDark ? 'var(--color-dash-card)' : '#fff',
    border: isDark
      ? '1px solid rgba(55,138,221,0.15)'
      : '1px solid #E2E8F0',
    borderRadius: 12,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }),

  metricLabel: (isDark, valueColor) => ({
  fontSize: 10,
  fontWeight: 500,
  fontFamily: 'var(--font-body-dash)',
  color: valueColor || (isDark ? 'var(--color-blue-400)' : '#94A3B8'),
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}),

  metricValue: (isDark, color) => ({
    fontSize: 28,
    fontWeight: 600,
    fontFamily: 'var(--font-display-dash)',
    color: color || (isDark ? 'var(--color-blue-100)' : 'var(--color-blue-800)'),
    letterSpacing: '-1px',
    lineHeight: 1,
  }),

  metricSub: (color) => ({
    fontSize: 11,
    fontFamily: 'var(--font-body-dash)',
    color: color || 'var(--color-cyan)',
    marginTop: 2,
  }),

  skeleton: {
    height: 32,
    borderRadius: 6,
    background: 'rgba(55,138,221,0.08)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  
}