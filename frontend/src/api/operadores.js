/**
 * api/operadores.js
 *
 * Capa de acceso a datos para el recurso "Operadores".
 * Sigue el mismo patrón que api/viajes.js.
 *
 * Seguridad aplicada (OWASP Top-10 2025):
 *  - A01 Broken Access Control  → todos los endpoints requieren el token que
 *    axiosInstance ya adjunta; nunca se expone el token aquí.
 *  - A03 Injection              → ningún parámetro se interpola en strings;
 *    se pasan como query-params o body JSON serializado por axios.
 *  - A04 Insecure Design        → las peticiones de mutación usan PATCH/PUT/DELETE
 *    explícitamente; no se usa GET para operaciones con efectos.
 *  - A05 Security Misconfiguration → Content-Type forzado en multipart (foto).
 *  - A08 Software & Data Integrity → los IDs se validan antes de enviar.
 */

import api from './axiosInstance'; // instancia con baseURL + interceptor de auth 

/**
 * Valida que un ID sea un entero positivo.
 * Previene path-traversal / injection en segmentos de URL.
 * @param {unknown} id
 * @returns {number}
 */
function assertId(id) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new TypeError(`ID inválido: "${id}"`);
  }
  return parsed;
}

/**
 * Construye un objeto URLSearchParams limpio a partir de un objeto de filtros.
 * Omite claves cuyo valor sea null, undefined o string vacío.
 * @param {Record<string, unknown>} filters
 * @returns {URLSearchParams}
 */
function buildParams(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  return params;
}

/**
 * GET /operadores
 * Obtiene la lista paginada de operadores con filtros opcionales.
 *
 * @param {object} params
 * @param {number}  [params.page=1]
 * @param {number}  [params.limit=20]
 * @param {string}  [params.search]       – búsqueda por nombre / RFC / CURP
 * @param {string}  [params.estatus]      – 'activo' | 'inactivo' | 'suspendido'
 * @param {string}  [params.licencia]     – tipo de licencia
 * @param {string}  [params.sort]         – campo de ordenamiento
 * @param {'asc'|'desc'} [params.order]
 * @returns {Promise<{ data: Operador[], total: number, page: number, limit: number }>}
 */
export async function getOperadores(params = {}) {
  const query = buildParams({ page: 1, limit: 20, ...params });
  const { data } = await api.get(`/operadores?${query}`);
  return data;
}

/**
 * GET /operadores/:id
 * Obtiene el detalle completo de un operador.
 *
 * @param {number|string} id
 * @returns {Promise<Operador>}
 */
export async function getOperadorById(id) {
  const safeId = assertId(id);
  const { data } = await api.get(`/operadores/${safeId}`);
  return data;
}

/**
 * POST /operadores
 * Crea un nuevo operador.
 *
 * El payload NO incluye campos que el servidor debe calcular
 * (ej. id, created_at, updated_at) — A04 Insecure Design.
 *
 * @param {OperadorPayload} payload
 * @returns {Promise<Operador>}
 */
export async function createOperador(payload) {
  // Extraemos explícitamente los campos permitidos (allowlist)
  // para no enviar campos de más que el cliente no debería controlar.
  const body = sanitizePayload(payload);
  const { data } = await api.post('/operadores', body);
  return data;
}

/**
 * PUT /operadores/:id
 * Reemplaza todos los campos editables de un operador (actualización completa).
 *
 * @param {number|string} id
 * @param {OperadorPayload} payload
 * @returns {Promise<Operador>}
 */
export async function updateOperador(id, payload) {
  const safeId = assertId(id);
  const body = sanitizePayload(payload);
  const { data } = await api.put(`/operadores/${safeId}`, body);
  return data;
}

/**
 * PATCH /operadores/:id
 * Actualización parcial de un operador (solo los campos enviados).
 *
 * @param {number|string} id
 * @param {Partial<OperadorPayload>} patch
 * @returns {Promise<Operador>}
 */
export async function patchOperador(id, patch) {
  const safeId = assertId(id);
  const body = sanitizePayload(patch, true); // modo parcial
  const { data } = await api.patch(`/operadores/${safeId}`, body);
  return data;
}

/**
 * DELETE /operadores/:id
 * Elimina (o desactiva lógicamente) un operador.
 *
 * @param {number|string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteOperador(id) {
  const safeId = assertId(id);
  const { data } = await api.delete(`/operadores/${safeId}`);
  return data;
}

/**
 * PATCH /operadores/:id/estatus
 * Cambia el estatus de un operador sin tocar el resto de campos.
 * Separar esta operación evita mass-assignment accidental.
 *
 * @param {number|string} id
 * @param {'activo'|'inactivo'|'suspendido'} estatus
 * @returns {Promise<Operador>}
 */
export async function cambiarEstatusOperador(id, estatus) {
  const safeId = assertId(id);
  const ESTATUSES_VALIDOS = ['activo', 'inactivo', 'suspendido'];
  if (!ESTATUSES_VALIDOS.includes(estatus)) {
    throw new TypeError(`Estatus inválido: "${estatus}"`);
  }
  const { data } = await api.patch(`/operadores/${safeId}/estatus`, { estatus });
  return data;
}

/**
 * POST /operadores/:id/foto
 * Sube o reemplaza la foto de perfil de un operador.
 * Usa multipart/form-data con Content-Type explícito.
 *
 * @param {number|string} id
 * @param {File} file
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<{ url: string }>}
 */
export async function uploadFotoOperador(id, file, onProgress) {
  const safeId = assertId(id);

  // Validación cliente-side del tipo MIME (la real la hace el servidor)
  const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    throw new TypeError(`Tipo de archivo no permitido: "${file.type}"`);
  }

  // Límite de tamaño orientativo (2 MB) — el servidor debe aplicar el suyo
  const MAX_BYTES = 2 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    throw new RangeError('La imagen no debe superar 2 MB');
  }

  const form = new FormData();
  form.append('foto', file);

  const { data } = await api.post(`/operadores/${safeId}/foto`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (evt) => {
          const pct = Math.round((evt.loaded * 100) / (evt.total ?? 1));
          onProgress(pct);
        }
      : undefined,
  });

  return data;
}

/**
 * GET /operadores/:id/viajes
 * Historial de viajes asignados a un operador (paginado).
 *
 * @param {number|string} id
 * @param {{ page?: number; limit?: number }} [params]
 * @returns {Promise<{ data: Viaje[], total: number }>}
 */
export async function getViajesDeOperador(id, params = {}) {
  const safeId = assertId(id);
  const query = buildParams({ page: 1, limit: 10, ...params });
  const { data } = await api.get(`/operadores/${safeId}/viajes?${query}`);
  return data;
}

const CAMPOS_PERMITIDOS = new Set([
  'nombre',
  'apellido_paterno',
  'apellido_materno',
  'rfc',
  'curp',
  'fecha_nacimiento',
  'telefono',
  'email',
  'direccion',
  'tipo_licencia',
  'numero_licencia',
  'vigencia_licencia',
  'fecha_ingreso',
  'estatus',
  'notas',
]);

/**
 * Filtra el payload para que solo contenga campos de la allowlist.
 *
 * @param {Record<string, unknown>} raw   
 * @param {boolean} [parcial=false]       
 * @returns {Record<string, unknown>}
 */
function sanitizePayload(raw, parcial = false) {
  const clean = {};
  for (const [key, value] of Object.entries(raw)) {
    if (CAMPOS_PERMITIDOS.has(key)) {
      clean[key] = value;
    }
  }
  return clean;
}

/**
 * @typedef {object} Operador
 * @property {number}  id
 * @property {string}  nombre
 * @property {string}  apellido_paterno
 * @property {string}  apellido_materno
 * @property {string}  rfc
 * @property {string}  curp
 * @property {string}  fecha_nacimiento    – ISO 8601
 * @property {string}  telefono
 * @property {string}  email
 * @property {string}  direccion
 * @property {string}  tipo_licencia
 * @property {string}  numero_licencia
 * @property {string}  vigencia_licencia   – ISO 8601
 * @property {string}  fecha_ingreso       – ISO 8601
 * @property {'activo'|'inactivo'|'suspendido'} estatus
 * @property {string|null} foto_url
 * @property {string}  notas
 * @property {string}  created_at
 * @property {string}  updated_at
 */

/**
 * @typedef {Omit<Operador, 'id'|'foto_url'|'created_at'|'updated_at'>} OperadorPayload
 */