import { useState, useEffect } from 'react'
import api from '../../../shared/api/axiosInstance'

export function useDashboard() {
  const [viajes,    setViajes]    = useState([])
  const [metrics,   setMetrics]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      try {
        // Un solo call — el backend devuelve todos los viajes
        const { data } = await api.get('/viajes/')

        if (!mounted) return

        const lista = Array.isArray(data) ? data : (data.results ?? [])

        setViajes(lista.slice(0, 5))   // tabla: solo los 5 más recientes
        setMetrics({
          viajesActivos:  lista.filter(v => v.esta_activo).length,
          operadores:     null,  // no hay endpoint aún, se deja null
          flotilla:       null,
          incidencias:    null,
        })
      } catch (err) {
        if (!mounted) return
        setError('No se pudo cargar el resumen.')
        console.error('[useDashboard]', err?.response?.status, err?.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [])

  return { viajes, metrics, loading, error }
}