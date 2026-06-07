import { useState, useRef, useEffect } from 'react'
import { useNanobot } from '../hooks/Usenanobot'

// Detecta si el mensaje contiene coordenadas y las extrae.
// Nanobot devuelve algo como: "Latitud: 32.5149, Longitud: -117.0382"
function extraerCoordenadas(texto) {
  const lat = texto.match(/[Ll]atitud[:\s]+(-?\d+\.?\d*)/)?.[1]
  const lng = texto.match(/[Ll]ongitud[:\s]+(-?\d+\.?\d*)/)?.[1]
  if (lat && lng) return { lat: parseFloat(lat), lng: parseFloat(lng) }
  return null
}

// Convierte saltos de línea y URLs en JSX legible.
function renderTexto(texto) {
  return texto.split('\n').map((linea, i) => {
    // detectar URLs de Google Maps
    const urlMatch = linea.match(/(https?:\/\/[^\s]+)/)
    if (urlMatch) {
      const [antes, url] = linea.split(urlMatch[0])
      return (
        <span key={i}>
          {antes}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--cyan)', textDecoration: 'underline' }}
          >
            Ver en Maps
          </a>
          {i < texto.split('\n').length - 1 && <br />}
        </span>
      )
    }
    return (
      <span key={i}>
        {linea}
        {i < texto.split('\n').length - 1 && <br />}
      </span>
    )
  })
}

export default function NanobotPage() {
  const {
    mensajes,
    conectado,
    conectando,
    error,
    escribiendo,
    enviarMensaje,
    limpiarChat,
    reconectar,
  } = useNanobot()

  const [input, setInput]     = useState('')
  const bottomRef             = useRef(null)
  const inputRef              = useRef(null)

  // scroll automático al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, escribiendo])

  function handleEnviar() {
    if (!input.trim() || !conectado) return
    enviarMensaje(input)
    setInput('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviar()
    }
  }

  return (
    <div className="body-layout" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-eyebrow">// asistente ia</div>
          <div className="page-title">Nanobot</div>
          <div className="page-sub">Consulta ubicaciones y estado de viajes en lenguaje natural</div>
        </div>

        <div className="metrics">
          <div className="metric">
            <span
              className="metric-val"
              style={{ color: conectado ? 'var(--ok)' : 'var(--danger)' }}
            >
              {conectando ? '...' : conectado ? 'ON' : 'OFF'}
            </span>
            <div className="metric-lbl">GATEWAY</div>
          </div>
          <div className="metric">
            <span className="metric-val blue">{mensajes.filter((m) => m.rol === 'user').length}</span>
            <div className="metric-lbl">CONSULTAS</div>
          </div>
        </div>

        <button
          className="btn-ghost"
          onClick={limpiarChat}
          style={{ fontSize: 11 }}
        >
          Limpiar chat
        </button>
      </div>

      {/* ÁREA DE CHAT */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* error de conexión */}
        {error && (
          <div
            style={{
              background: 'var(--danger-dim)',
              border: '1px solid rgba(220,38,38,.3)',
              borderRadius: 'var(--radius)',
              color: 'var(--danger)',
              fontSize: 12,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <span>{error}</span>
            <button
              className="btn-ghost"
              style={{ fontSize: 11, padding: '4px 10px' }}
              onClick={reconectar}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* mensaje de bienvenida */}
        {mensajes.length === 0 && !error && (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              color: 'var(--text-muted)',
              maxWidth: 400,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>◈</div>
            <div
              style={{
                fontFamily: 'var(--font-disp)',
                fontSize: 15,
                color: 'var(--text)',
                marginBottom: 6,
              }}
            >
              Nanobot listo
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.6 }}>
              Pregunta por la ubicación de una unidad, el estado de un viaje,
              o cualquier información de la flota.
            </div>
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                alignItems: 'center',
              }}
            >
              {[
                'Rastreame la unidad del viaje 42',
                '¿Dónde está el camión del viaje 15?',
                'Estado del viaje 7',
              ].map((sugerencia) => (
                <button
                  key={sugerencia}
                  className="btn-ghost"
                  style={{ fontSize: 11, padding: '5px 12px' }}
                  onClick={() => {
                    setInput(sugerencia)
                    inputRef.current?.focus()
                  }}
                >
                  {sugerencia}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* mensajes */}
        {mensajes.map((m) => (
          <BurbujaMensaje key={m.id} mensaje={m} />
        ))}

        {/* indicador de escritura */}
        {escribiendo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AvatarBot />
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '8px 14px',
                display: 'flex',
                gap: 4,
                alignItems: 'center',
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'var(--blue-400)',
                    display: 'inline-block',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          padding: '12px 24px',
          background: 'var(--card)',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={inputRef}
            className="finput"
            rows={1}
            placeholder={
              conectando
                ? 'Conectando con Nanobot…'
                : conectado
                  ? 'Escribe tu consulta… (Enter para enviar)'
                  : 'Sin conexión con el gateway'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!conectado || escribiendo}
            style={{
              resize: 'none',
              minHeight: 38,
              maxHeight: 120,
              lineHeight: 1.5,
              paddingTop: 8,
              paddingBottom: 8,
              opacity: !conectado ? 0.5 : 1,
            }}
          />
        </div>
        <button
          className="btn-primary"
          onClick={handleEnviar}
          disabled={!conectado || !input.trim() || escribiendo}
          style={{
            opacity: !conectado || !input.trim() || escribiendo ? 0.5 : 1,
            height: 38,
            padding: '0 16px',
          }}
        >
          Enviar
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

function BurbujaMensaje({ mensaje }) {
  const esUser = mensaje.rol === 'user'
  const coordenadas = !esUser ? extraerCoordenadas(mensaje.texto) : null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: esUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 8,
        maxWidth: '80%',
        alignSelf: esUser ? 'flex-end' : 'flex-start',
      }}
    >
      {!esUser && <AvatarBot />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            background: esUser
              ? 'linear-gradient(135deg, #2D57EE, #2DD7EE)'
              : 'var(--card)',
            border: esUser ? 'none' : '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '9px 14px',
            fontSize: 12,
            color: esUser ? '#fff' : 'var(--text)',
            lineHeight: 1.6,
            boxShadow: esUser ? '0 2px 12px rgba(45,87,238,.2)' : 'none',
          }}
        >
          {renderTexto(mensaje.texto)}
          {mensaje.enProgreso && (
            <span
              style={{
                display: 'inline-block',
                width: 2,
                height: 12,
                background: 'var(--cyan)',
                marginLeft: 2,
                verticalAlign: 'middle',
                animation: 'pulse 0.8s ease-in-out infinite',
              }}
            />
          )}
        </div>

        {/* mini mapa si hay coordenadas */}
        {coordenadas && (
          <a
            href={`https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              textDecoration: 'none',
            }}
          >
            <img
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${coordenadas.lat},${coordenadas.lng}&zoom=14&size=280x120&markers=color:red%7C${coordenadas.lat},${coordenadas.lng}&key=TU_API_KEY`}
              alt="Ubicación en mapa"
              style={{ width: '100%', display: 'block' }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <div
              style={{
                padding: '6px 10px',
                fontSize: 10,
                color: 'var(--cyan)',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              Ver ubicación completa en Google Maps →
            </div>
          </a>
        )}
      </div>
    </div>
  )
}

function AvatarBot() {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(45,87,238,.3), rgba(45,215,238,.3))',
        border: '1px solid rgba(45,215,238,.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        flexShrink: 0,
        color: 'var(--blue-100)',
        fontFamily: 'var(--font-disp)',
        fontWeight: 700,
      }}
    >
      N
    </div>
  )
}