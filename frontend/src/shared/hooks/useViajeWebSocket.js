import { useEffect, useRef, useState, useCallback } from 'react'

const WS_BASE = import.meta.env.VITE_WS_URL

export function useViajeWebSocket(viajeId) {
  const [ubicacion,    setUbicacion]    = useState(null)
  const [statusChange, setStatusChange] = useState(null)
  const [connected,    setConnected]    = useState(false)
  const [error,        setError]        = useState(null)

  const wsRef      = useRef(null)
  const retryRef   = useRef(0)
  const mountedRef = useRef(true)

  const connect = useCallback(() => {
    const token = sessionStorage.getItem('access_token')
    if (!token || !viajeId) return

    const ws = new WebSocket(`${WS_BASE}/ws/viajes/${viajeId}/?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      setConnected(true)
      setError(null)
      retryRef.current = 0
    }

    ws.onmessage = (event) => {
      if (!mountedRef.current) return
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'location_update') {
          setUbicacion({ lat: msg.lat, lng: msg.lng, velocidad: msg.velocidad, timestamp: msg.timestamp })
        } else if (msg.type === 'status_change') {
          setStatusChange({ anterior: msg.status_anterior, nuevo: msg.status_nuevo })
        } else if (msg.type === 'error') {
          setError(msg.detail)
        }
      } catch {
         setError('Mensaje del servidor con formato inesperado')
      }
    }

    ws.onclose = (event) => {
      if (!mountedRef.current) return
      setConnected(false)
      

      // Códigos del servidor que indican error permanente → no reconectar
      if ([4001, 4003, 4004].includes(event.code)) {
        setError(`Conexión rechazada (código ${event.code})`)
        return
      }

      // Backoff exponencial: 1s, 2s, 4s, 8s, ..., máx 30s
      const delay = Math.min(1000 * 2 ** retryRef.current, 30_000)
      retryRef.current += 1
      setTimeout(() => {
  if (mountedRef.current) connect()
}, delay)
    }

    ws.onerror = () => setError('Error de conexión WebSocket')
  }, [viajeId])

  // Keepalive — ping cada 25s
  useEffect(() => {
    if (!connected) return
    const id = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, 25_000)
    return () => clearInterval(id)
  }, [connected])

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      wsRef.current?.close()
    }
  }, [connect])

  return { ubicacion, statusChange, connected, error }
}