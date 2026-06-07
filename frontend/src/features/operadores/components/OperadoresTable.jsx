import { useRef } from 'react'
import { useTheme } from '../../../shared/hooks/useTheme'


const fd = (s) => {
  if (!s) return '—'
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}

const isVencida   = (f) => f && new Date(f) < new Date()
const isPorVencer = (f) => {
  if (!f || isVencida(f)) return false
  return (new Date(f) - new Date()) / 864e5 <= 90
}

export default function OperadoresTable({
  operadores,
  total,
  loading,
  error,
  filtros,
  setFiltros,
  selectedIds,
  toggleSelect,
  selectAll,
  clearSelection,
  onVerDetalle,
  onEditar,
  onCambiarEstatus,
}) {
  const { isDark } = useTheme()
  const searchRef = useRef(null)

  if (error) {
    return (
      <div className="table-area">
        <div className="empty">
          <div className="empty-ic">!</div>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            ref={searchRef}
            className="search-input"
            type="text"
            placeholder="Buscar nombre, no. empleado, licencia…"
            value={filtros.search}
            onChange={(e) => setFiltros({ search: e.target.value })}
          />
        </div>

        <select
          className="filter-select"
          value={filtros.estatus}
          onChange={(e) => setFiltros({ estatus: e.target.value })}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>

        <select
          className="filter-select"
          value={filtros.licencia}
          onChange={(e) => setFiltros({ licencia: e.target.value })}
        >
          <option value="">Tipo licencia</option>
          {['A', 'B', 'C', 'D', 'E'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filtros.tipo}
          onChange={(e) => setFiltros({ tipo: e.target.value })}
        >
          <option value="">Empleado / Permisionario</option>
          <option value="empleado">Empleado</option>
          <option value="permisionario">Permisionario</option>
        </select>

        {selectedIds.size > 0 && (
          <button
            className="btn-ghost"
            style={{ marginLeft: 4, fontSize: 11 }}
            onClick={clearSelection}
          >
            Limpiar selección ({selectedIds.size})
          </button>
        )}

        <span className="count">
          {loading ? 'Cargando…' : `${total} operador${total !== 1 ? 'es' : ''}`}
        </span>
      </div>

      <div className="table-area">
        {loading && operadores.length === 0 ? (
          <div className="empty">
            <p style={{ color: 'var(--text-muted)' }}>Cargando operadores…</p>
          </div>
        ) : operadores.length === 0 ? (
          <div className="empty">
            <div className="empty-ic">👥</div>
            <p>Sin resultados con los filtros aplicados.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 32 }}>
                  <input
                    type="checkbox"
                    style={{ accentColor: 'var(--blue-400)', cursor: 'pointer' }}
                    checked={selectedIds.size === operadores.length}
                    onChange={selectedIds.size === operadores.length ? clearSelection : selectAll}
                  />
                </th>
                <SortTh
                  campo="no_empleado"
                  label="No. Empleado"
                  filtros={filtros}
                  setFiltros={setFiltros}
                />
                <SortTh
                  campo="apellido_paterno"
                  label="Operador"
                  filtros={filtros}
                  setFiltros={setFiltros}
                />
                <th>Estado</th>
                <th>Unidad</th>
                <th>Licencia</th>
                <SortTh
                  campo="vigencia_licencia"
                  label="Vence"
                  filtros={filtros}
                  setFiltros={setFiltros}
                />
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {operadores.map((o) => (
                <FilaOperador
                  key={o.id}
                  operador={o}
                  selected={selectedIds.has(o.id)}
                  onToggleSelect={() => toggleSelect(o.id)}
                  onVerDetalle={() => onVerDetalle(o)}
                  onEditar={() => onEditar(o)}
                  onCambiarEstatus={() =>
                    onCambiarEstatus(o.id, o.estatus === 'activo' ? 'inactivo' : 'activo')
                  }
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

function SortTh({ campo, label, filtros, setFiltros }) {
  const activo = filtros.sort === campo
  const handleClick = () => {
    if (activo) {
      setFiltros({ order: filtros.order === 'asc' ? 'desc' : 'asc' })
    } else {
      setFiltros({ sort: campo, order: 'asc' })
    }
  }
  return (
    <th
      className={activo ? 'sorted' : ''}
      onClick={handleClick}
      style={{ userSelect: 'none', cursor: 'pointer' }}
    >
      {label}
      <span className="sort-ic" style={{ marginLeft: 3, opacity: activo ? 1 : 0.35 }}>
        {activo ? (filtros.order === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </th>
  )
}

function FilaOperador({ operador: o, selected, onToggleSelect, onVerDetalle, onEditar, onCambiarEstatus }) {
  const venc  = isVencida(o.vigencia_licencia)
  const pvenc = isPorVencer(o.vigencia_licencia)
  const activo = o.activo === true

  return (
    <tr
      onClick={onVerDetalle}
      style={{ background: selected ? 'rgba(55,138,221,.08)' : undefined }}
    >
      <td onClick={(e) => { e.stopPropagation(); onToggleSelect() }}>
        <input
          type="checkbox"
          style={{ accentColor: 'var(--blue-400)', cursor: 'pointer' }}
          checked={selected}
          onChange={onToggleSelect}
        />
      </td>

      <td>
        <span className="cell-emp">{o.no_empleado}</span>
      </td>

      <td>
      <div className="cell-name">
        {o.nombre_completo || `${o.nombre || ''} ${o.apellido_paterno || ''}`.trim() || '—'}
      </div>
      <div className="cell-sub">{o.no_empleado || ''}</div>      
      </td>
      <td>
        {activo ? (
          <span className="badge b-ok">
            <span className="dot d-ok" /> Activo
          </span>
        ) : (
          <span className="badge b-danger">
            <span className="dot d-danger" /> Inactivo
          </span>
        )}
      </td>

      <td>
        {o.unidad_actual_codigo ? (
          <span className="unidad-pill">{o.unidad_actual_codigo}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
        )}
      </td>

      <td>
        {o.tipo_licencia ? `Tipo ${o.tipo_licencia}` : '—'}{' '}
        {venc ? (
          <span className="badge b-danger">Vencida</span>
        ) : pvenc ? (
          <span className="badge b-pend">Por vencer</span>
        ) : (
          <span className="badge b-ok">Vigente</span>
        )}
      </td>

      <td style={{ color: venc ? 'var(--danger)' : pvenc ? 'var(--pending)' : undefined }}>
        {fd(o.vigencia_licencia)}
      </td>

      <td>
        {o.es_permisionario ? (
          <span className="badge b-cyan">Permisionario</span>
        ) : (
          <span className="badge b-done">Empleado</span>
        )}
      </td>

      <td>
        <div className="act">
          <button
            className="btn-ic"
            title="Ver detalle"
            onClick={(e) => { e.stopPropagation(); onVerDetalle() }}
          >
            👁
          </button>
          <button
            className="btn-ic"
            title="Editar"
            onClick={(e) => { e.stopPropagation(); onEditar() }}
          >
            ✎
          </button>
          {activo ? (
            <button
              className="btn-ic ic-danger"
              title="Dar de baja"
              onClick={(e) => { e.stopPropagation(); onCambiarEstatus() }}
            >
              ↓
            </button>
          ) : (
            <button
              className="btn-ic ic-ok"
              title="Reactivar"
              onClick={(e) => { e.stopPropagation(); onCambiarEstatus() }}
            >
              ↑
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}