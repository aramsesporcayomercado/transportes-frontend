import { useState, useEffect, useRef, useCallback } from 'react'

const GATEWAY_HTTP  = 'http://127.0.0.1:8765'
const RECONNECT_MS  = 3000
const MAX_BACKOFF   = 15000

// Antes de abrir el WebSocket, el gateway nos da un token de corta duración
// y la ruta exacta del WebSocket. Sin este paso, la conexión devuelve 401.
async function fetchBootstrap() {
  const res = await fetch(`${GATEWAY_HTTP}/webui/bootstrap`, {
    method: 'GET',
    credentials: 'same-origin',
  })
  if (!res.ok) throw new Error(`bootstrap falló: HTTP ${res.status}`)
  const body = await res.json()
  if (!body.token || !body.ws_path) throw new Error('bootstrap no devolvió token o ws_path')
  return body
}

// Construye la URL del WebSocket con el token como query param.
// El gateway no acepta el token en headers, solo en la URL.
function buildWsUrl(wsPath, token) {
  const path = wsPath.startsWith('/') ? wsPath : `/${wsPath}`
  return `ws://127.0.0.1:8765${path}?token=${encodeURIComponent(token)}`
}

export function useNanobot() {
  const [mensajes,    setMensajes]    = useState([])
  const [conectado,   setConectado]   = useState(false)
  const [conectando,  setConectando]  = useState(false)
  const [streaming,   setStreaming]   = useState(false)
  const [error,       setError]       = useState(null)

  const wsRef           = useRef(null)
  const chatIdRef       = useRef(null)
  const bufferRef       = useRef(null)   // acumula chunks del delta actual
  const mountedRef      = useRef(true)
  const reconnectRef    = useRef(null)
  const intentionalRef  = useRef(false)
  const attemptsRef     = useRef(0)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      intentionalRef.current = true
      cerrarWS()
    }
  }, [])

  function cerrarWS() {
    clearTimeout(reconnectRef.current)
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.close()
      wsRef.current = null
    }
  }

  // Maneja cada frame que llega del gateway.
  // El servidor usa chat_id para multiplexar varios chats en un socket.
  function handleMessage(event) {
    let frame
    try {
      frame = JSON.parse(event.data)
    } catch {
      return
    }

    // El primer mensaje tras conectar. El servidor asigna un chat_id por defecto.
    if (frame.event === 'ready') {
      chatIdRef.current = frame.chat_id
      // Le decimos al servidor que queremos recibir eventos de este chat.
      send({ type: 'attach', chat_id: frame.chat_id })
      return
    }

    // Confirmación de que el attach fue exitoso.
    if (frame.event === 'attached') {
      chatIdRef.current = frame.chat_id
      return
    }

    // Un pedazo de texto llegando mientras el modelo genera la respuesta.
    if (frame.event === 'delta') {
      const id = bufferRef.current?.id ?? crypto.randomUUID()
      if (!bufferRef.current) {
        bufferRef.current = { id, parts: [] }
        setMensajes(prev => [
          ...prev,
          { id, rol: 'bot', texto: '', enProgreso: true },
        ])
        setStreaming(true)
      }
      bufferRef.current.parts.push(frame.text)
      const texto = bufferRef.current.parts.join('')
      const targetId = bufferRef.current.id
      setMensajes(prev =>
        prev.map(m => m.id === targetId ? { ...m, texto } : m)
      )
      return
    }

    // El segmento de texto terminó, pero el modelo puede seguir ejecutando tools.
    // No paramos el spinner aquí, solo limpiamos el buffer.
    if (frame.event === 'stream_end') {
      bufferRef.current = null
      return
    }

    // Señal definitiva de que el turno completo terminó, incluyendo tools.
    if (frame.event === 'turn_end') {
      bufferRef.current = null
      setStreaming(false)
      setMensajes(prev =>
        prev.map(m => m.enProgreso ? { ...m, enProgreso: false } : m)
      )
      return
    }

    // Mensaje completo (sin streaming) o breadcrumb de herramienta.
    if (frame.event === 'message') {
      const activeId = bufferRef.current?.id
      bufferRef.current = null

      if (frame.kind === 'tool_hint' || frame.kind === 'progress') {
        setMensajes(prev => [
          ...prev,
          { id: crypto.randomUUID(), rol: 'tool', texto: frame.text, enProgreso: false },
        ])
        return
      }

      setMensajes(prev => {
        const filtrado = activeId ? prev.filter(m => m.id !== activeId) : prev
        return [
          ...filtrado,
          { id: crypto.randomUUID(), rol: 'bot', texto: frame.text, enProgreso: false },
        ]
      })
    }
  }

  const conectar = useCallback(async () => {
    if (wsRef.current?.readyState <= 1) return
    if (!mountedRef.current) return

    setConectando(true)
    setError(null)
    intentionalRef.current = false

    let boot
    try {
      boot = await fetchBootstrap()
    } catch (err) {
      if (!mountedRef.current) return
      setError('No se pudo contactar el gateway de Nanobot. Verifica que esté corriendo.')
      setConectando(false)
      return
    }

    const url = buildWsUrl(boot.ws_path, boot.token)
    const ws  = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      attemptsRef.current = 0
      setConectado(true)
      setConectando(false)
    }

    ws.onmessage = (ev) => {
      if (!mountedRef.current) return
      handleMessage(ev)
    }

    ws.onerror = () => {
      if (!mountedRef.current) return
      setError('Error de conexión con el gateway.')
      setConectando(false)
    }

    ws.onclose = (ev) => {
      if (!mountedRef.current) return
      wsRef.current  = null
      chatIdRef.current = null
      setConectado(false)
      setStreaming(false)

      if (intentionalRef.current || ev.code === 1000) return

      // Backoff exponencial: 3s, 6s, 12s... hasta MAX_BACKOFF
      const delay = Math.min(RECONNECT_MS * 2 ** attemptsRef.current, MAX_BACKOFF)
      attemptsRef.current++
      reconnectRef.current = setTimeout(() => {
        if (mountedRef.current) conectar()
      }, delay)
    }
  }, [])

  // Envía un frame al gateway. Si la conexión no está lista, lo ignora.
  function send(frame) {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify(frame))
    }
  }

  const enviarMensaje = useCallback((texto) => {
    const limpio = texto.trim()
    if (!limpio || !chatIdRef.current) return

    setMensajes(prev => [
      ...prev,
      { id: crypto.randomUUID(), rol: 'user', texto: limpio, enProgreso: false },
    ])
    setStreaming(true)

    send({ type: 'message', chat_id: chatIdRef.current, content: limpio })
  }, [])

  const limpiarChat = useCallback(() => {
    setMensajes([])
    setError(null)
    bufferRef.current = null
  }, [])

  const reconectar = useCallback(() => {
    cerrarWS()
    attemptsRef.current = 0
    conectar()
  }, [conectar])

  useEffect(() => {
    conectar()
  }, [conectar])

  return {
    mensajes,
    conectado,
    conectando,
    streaming,
    error,
    enviarMensaje,
    limpiarChat,
    reconectar,
  }
}