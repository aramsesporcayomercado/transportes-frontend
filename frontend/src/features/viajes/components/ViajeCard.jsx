import { useNavigate } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'

export function ViajeCard({ viaje }) {
  const navigate = useNavigate()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/viajes/${viaje.id}`)}
      onKeyDown={e => e.key === 'Enter' && navigate(`/viajes/${viaje.id}`)}
      className="rounded-lg p-4 cursor-pointer transition-colors"
      style={{
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-semibold"
              style={{ color: 'var(--color-brand)', fontFamily: 'var(--font-body)' }}>
          {viaje.folio}
        </span>
        <StatusBadge status={viaje.status} label={viaje.status_display} />
      </div>
      <p className="text-sm" style={{ color: 'var(--color-text)' }}>
        {viaje.cliente_nombre}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
        {viaje.operador_nombre}
      </p>
    </div>
  )
}