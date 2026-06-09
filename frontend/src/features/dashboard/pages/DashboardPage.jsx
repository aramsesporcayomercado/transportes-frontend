import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../../shared/context/AuthContext'
import { PageWrapper } from '../../../shared/components/layout/PageWrapper'
import { useDashboard } from '../hooks/useDashboard'
import '../styles/dashboard.css'

// Paleta de status — igual que en ViajeDetailPage para consistencia
const STATUS_CONFIG = {
  cargado_en_transito: { label: 'En tránsito',  color: '#16A34A', bg: 'rgba(22,163,74,0.12)'  },
  cargando:            { label: 'Cargando',      color: '#EA580C', bg: 'rgba(234,88,12,0.12)'  },
  pendiente:           { label: 'Pendiente',     color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  en_destino:          { label: 'En destino',    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  descargando:         { label: 'Descargando',   color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  completado:          { label: 'Completado',    color: '#6B7280', bg: 'rgba(107,114,128,0.12)'},
  cancelado:           { label: 'Cancelado',     color: '#991B1B', bg: 'rgba(153,27,27,0.12)'  },
  incidencia:          { label: 'Incidencia',    color: '#EF4444', bg: 'rgba(239,68,68,0.12)'  },
}

function StatusBadge({ status, label }) {
  const cfg = STATUS_CONFIG[status] ?? { label: label ?? status, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' }
  return (
    <span
      className="dash-badge"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  )
}

function MetricCard({ label, value, sub, subColor, loading }) {
  return (
    <div className="dash-metric-card">
      <span className="dash-metric-label">{label}</span>
      {loading
        ? <div className="dash-metric-skeleton" />
        : <span className={`dash-metric-value${value === 0 ? ' danger' : ''}`}>
            {value ?? '—'}
          </span>
      }
      {sub && (
        <span className="dash-metric-sub" style={{ color: subColor }}>
          {sub}
        </span>
      )}
    </div>
  )
}

export function DashboardPage() {
  const { user }    = useContext(AuthContext)
  const navigate    = useNavigate()
  const { viajes, metrics, loading, error } = useDashboard()

  const hora        = new Date().getHours()
  const saludo      = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const nombreCorto = user?.nombre?.split(' ')[0] || 'bienvenido'

  const fechaHoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <PageWrapper title="Dashboard">
      <div className="dash-page">

        {/* Saludo */}
        <div className="dash-greeting">
          <div>
            <h2 className="dash-greeting-title">
              {saludo}, {nombreCorto} 👋
            </h2>
            <p className="dash-greeting-sub">
              Aquí tienes el resumen de hoy.
            </p>
          </div>
          <div className="dash-date-badge">{fechaHoy}</div>
        </div>

        {/* Métricas */}
        <div className="dash-metrics-grid">
          <MetricCard
            label="Viajes activos"
            value={metrics?.viajesActivos ?? 0}
            sub="↑ en curso hoy"
            subColor="var(--color-cyan)"
            loading={loading}
          />
          <MetricCard
            label="Operadores"
            value={metrics?.operadores}
            sub="registrados"
            subColor="var(--color-blue-400)"
            loading={loading}
          />
          <MetricCard
            label="Flotilla"
            value={metrics?.flotilla}
            sub="unidades totales"
            subColor="var(--color-blue-400)"
            loading={loading}
          />
          <MetricCard
            label="Incidencias abiertas"
            value={metrics?.incidencias ?? 0}
            sub={metrics?.incidencias > 0 ? 'Requieren atención' : 'Todo en orden'}
            subColor={metrics?.incidencias > 0 ? '#EF4444' : '#16A34A'}
            loading={loading}
          />
        </div>

        {/* Tabla viajes recientes */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Viajes recientes</span>
            <button className="dash-ver-todos" onClick={() => navigate('/viajes')}>
              Ver todos →
            </button>
          </div>

          {error ? (
            <p className="dash-empty">{error}</p>
          ) : loading ? (
            <div>
              {[1, 2, 3].map(i => (
                <div key={i} className="dash-skeleton-row" />
              ))}
            </div>
          ) : viajes.length === 0 ? (
            <p className="dash-empty">No hay viajes registrados aún.</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  {['Folio', 'Cliente', 'Operador', 'Unidad', 'Estado'].map(col => (
                    <th key={col} className="dash-th">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viajes.map(viaje => (
                  <tr
                    key={viaje.id}
                    className="dash-tr"
                    onClick={() => navigate(`/viajes/${viaje.id}`)}
                  >
                    <td className="dash-td">
                      <span className="dash-folio">{viaje.folio || '—'}</span>
                    </td>
                    <td className="dash-td">{viaje.cliente_nombre  || '—'}</td>
                    <td className="dash-td">{viaje.operador_nombre || '—'}</td>
                    <td className="dash-td">{viaje.unidad_codigo   || '—'}</td>
                    <td className="dash-td">
                      <StatusBadge status={viaje.status} label={viaje.status_label} />
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