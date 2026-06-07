import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getViaje } from '../api/viajes'
import { useViajeWebSocket } from '../../../shared/hooks/useViajeWebSocket'
import { MapaViaje } from '../components/MapaViaje'
import { StatusBadge } from '../components/StatusBadge'

export function ViajeDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [viaje,   setViaje]   = useState(null)
  const [loading, setLoading] = useState(true)

  const { ubicacion, statusChange, connected, error } = useViajeWebSocket(id)

  useEffect(() => {
    getViaje(id)
      .then(setViaje)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  // Refleja cambios de status que llegan por WebSocket
  useEffect(() => {
    if (statusChange && viaje) {
      setViaje(v => ({ ...v, status: statusChange.nuevo }))
    }
  }, [statusChange])  // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen"
           style={{ background: 'var(--color-surface)' }}>
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Cargando viaje...</span>
      </div>
    )
  }

  if (!viaje) return null

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>

      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4"
              style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
        <button
          onClick={() => navigate('/')}
          className="text-sm hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          ← Volver
        </button>
        <span className="font-semibold text-sm"
              style={{ color: 'var(--color-brand)', fontFamily: 'var(--font-body)' }}>
          {viaje.folio}
        </span>
        <StatusBadge status={viaje.status} label={viaje.status_display} />
        <span className="ml-auto text-xs px-2 py-1 rounded"
              style={{
                background: connected ? '#0F2A1A' : 'var(--color-surface-3)',
                color:      connected ? 'var(--color-ok)' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
              }}>
          {connected ? '● GPS en vivo' : '○ Desconectado'}
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-4">

        {error && (
          <div className="px-4 py-3 rounded text-sm"
               style={{ background: '#2A0F0F', border: '1px solid var(--color-danger)', color: '#FCA5A5' }}>
            {error}
          </div>
        )}

        <MapaViaje ubicacion={ubicacion} />

        {ubicacion && (
          <div className="px-4 py-3 rounded text-xs"
               style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                        color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            <span style={{ color: 'var(--color-text)' }}>
              {ubicacion.lat.toFixed(6)}, {ubicacion.lng.toFixed(6)}
            </span>
            {ubicacion.velocidad != null && (
              <span className="ml-3">{ubicacion.velocidad} km/h</span>
            )}
            <span className="ml-3">{ubicacion.timestamp}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 p-4 rounded"
             style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          {[
            ['Cliente',  viaje.cliente_nombre],
            ['Operador', viaje.operador_nombre],
            ['Unidad',   viaje.unidad_placas],
            ['Carga',    viaje.tipo_carga || '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                {label}
              </span>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
                {value}
              </p>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}