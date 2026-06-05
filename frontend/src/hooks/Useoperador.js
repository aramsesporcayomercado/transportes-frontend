/**
 * 
 *
 * Estado centralizado de la tabla de operadores:
 *  - fetch con debounce de búsqueda
 *  - paginación
 *  - filtros
 *  - selección de filas
 *  - acciones de tabla (eliminar, cambiar estatus)
 *
 * Seguridad (OWASP):
 *  - A01 Broken Access Control  → errores 401/403 de axios se manejan en
 *    axiosInstance (interceptor global); aquí solo reaccionamos al estado.
 *  - A03 Injection              → parámetros de búsqueda/filtro nunca se
 *    interpolan: se pasan directamente a getOperadores() que usa buildParams.
 *  - A09 Security Logging       → los errores se loguean con contexto suficiente
 *    para auditoría sin exponer datos sensibles.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getOperadores,
  deleteOperador,
  cambiarEstatusOperador,
} from '../api/operadores';

const DEBOUNCE_MS   = 350;   // espera antes de lanzar búsqueda
const DEFAULT_LIMIT = 20;    // filas por página

const FILTROS_INICIALES = {
  search:   '',
  estatus:  '',
  licencia: '',
  sort:     'nombre',
  order:    'asc',
};

/**
 * useOperadores
 *
 * @returns {{
 *   operadores: Operador[],
 *   total: number,
 *   page: number,
 *   limit: number,
 *   loading: boolean,
 *   error: string|null,
 *   filtros: typeof FILTROS_INICIALES,
 *   selectedIds: Set<number>,
 *   setFiltros: (patch: Partial<typeof FILTROS_INICIALES>) => void,
 *   setPage: (n: number) => void,
 *   setLimit: (n: number) => void,
 *   toggleSelect: (id: number) => void,
 *   selectAll: () => void,
 *   clearSelection: () => void,
 *   refetch: () => void,
 *   handleDelete: (id: number) => Promise<void>,
 *   handleCambiarEstatus: (id: number, estatus: string) => Promise<void>,
 *   handleBulkDelete: () => Promise<void>,
 * }}
 */
export function useOperadores() {
  
  const [operadores, setOperadores] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  
  const [page,  setPage]  = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  
  const [filtros, setFiltrosState] = useState(FILTROS_INICIALES);

  
  const [selectedIds, setSelectedIds] = useState(new Set());

  
  const debounceRef = useRef(null);

  // Flag para evitar actualizar estado en componente desmontado 
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);


  const fetchOperadores = useCallback(
    async (overridePage) => {
      setLoading(true);
      setError(null);

      try {
        const result = await getOperadores({
          page:     overridePage ?? page,
          limit,
          search:   filtros.search   || undefined,
          estatus:  filtros.estatus  || undefined,
          licencia: filtros.licencia || undefined,
          sort:     filtros.sort,
          order:    filtros.order,
        });

        if (!mountedRef.current) return;

        setOperadores(result.data   ?? []);
        setTotal(     result.total  ?? 0);
      } catch (err) {
        if (!mountedRef.current) return;

        // Log estructurado sin exponer stack completo en prod (A09)
        console.error('[useOperadores] Error al cargar operadores', {
          status:  err?.response?.status,
          message: err?.message,
        });

        // Mensajes amigables según código HTTP
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setError('No tienes permiso para ver esta información.');
        } else if (status >= 500) {
          setError('Error del servidor. Intenta de nuevo en unos momentos.');
        } else {
          setError('No se pudo cargar la lista de operadores.');
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [page, limit, filtros],
  );

  // Debounce: cuando cambia `search` esperamos DEBOUNCE_MS antes de buscar.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1); // volver a página 1 en cada nueva búsqueda
      fetchOperadores(1);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.search]);

  // Sin debounce: filtros de select, paginación, orden
  useEffect(() => {
    fetchOperadores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.estatus, filtros.licencia, filtros.sort, filtros.order, page, limit]);


  /**
   * Actualiza un subconjunto de filtros y resetea la página a 1
   * (excepto cuando se cambia sort/order para no perder la posición).
   *
   * @param {Partial<typeof FILTROS_INICIALES>} patch
   */
  const setFiltros = useCallback((patch) => {
    setFiltrosState((prev) => ({ ...prev, ...patch }));
    // Si el cambio no es solo de ordenamiento, volvemos a pág 1
    const keys = Object.keys(patch);
    const soloOrden = keys.every((k) => k === 'sort' || k === 'order');
    if (!soloOrden) setPage(1);
  }, []);

  // Selección de filas 

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else              next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(operadores.map((o) => o.id)));
  }, [operadores]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Acciones sobre filas 

  /**
   * Elimina un operador y actualiza la lista optimistamente.
   * @param {number} id
   */
  const handleDelete = useCallback(async (id) => {
    // Optimistic update: quitamos de la lista antes de que el servidor confirme
    setOperadores((prev) => prev.filter((o) => o.id !== id));
    setTotal((prev) => prev - 1);
    setSelectedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });

    try {
      await deleteOperador(id);
    } catch (err) {
      // Revertimos si falla
      console.error('[useOperadores] Error al eliminar operador', {
        id,
        status: err?.response?.status,
      });
      fetchOperadores(); // re-fetch para restaurar estado real
      throw err;         // relanzamos para que el componente muestre feedback
    }
  }, [fetchOperadores]);

  /**
   * Cambia el estatus de un operador y actualiza la lista en memoria.
   * @param {number} id
   * @param {'activo'|'inactivo'|'suspendido'} estatus
   */
  const handleCambiarEstatus = useCallback(async (id, estatus) => {
    try {
      const updated = await cambiarEstatusOperador(id, estatus);
      setOperadores((prev) =>
        prev.map((o) => (o.id === id ? { ...o, estatus: updated.estatus } : o)),
      );
    } catch (err) {
      console.error('[useOperadores] Error al cambiar estatus', {
        id,
        estatus,
        status: err?.response?.status,
      });
      throw err;
    }
  }, []);

  /**
   * Elimina todos los operadores actualmente seleccionados.
   * Lanza las peticiones en paralelo con Promise.allSettled para
   * no abortar el lote si una falla.
   */
  const handleBulkDelete = useCallback(async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    const results = await Promise.allSettled(ids.map((id) => deleteOperador(id)));

    const fallidos = results
      .map((r, i) => (r.status === 'rejected' ? ids[i] : null))
      .filter(Boolean);

    const exitosos = ids.filter((id) => !fallidos.includes(id));

    // Quitamos de la lista solo los exitosos
    if (exitosos.length) {
      setOperadores((prev) => prev.filter((o) => !exitosos.includes(o.id)));
      setTotal((prev) => prev - exitosos.length);
      setSelectedIds(new Set(fallidos)); // mantenemos seleccionados los que fallaron
    }

    if (fallidos.length) {
      throw new Error(
        `No se pudieron eliminar ${fallidos.length} operador(es). Intenta de nuevo.`,
      );
    }
  }, [selectedIds]);

  //  Retorno 

  return {
    // Datos
    operadores,
    total,
    page,
    limit,
    loading,
    error,

    // Filtros
    filtros,
    setFiltros,

    // Paginación
    setPage,
    setLimit,

    // Selección
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,

    // Acciones
    refetch:             () => fetchOperadores(),
    handleDelete,
    handleCambiarEstatus,
    handleBulkDelete,
  };
}