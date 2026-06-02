import { useState, useEffect } from 'react'

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

const iniciales = (o) =>
  ((o?.nombre?.[0] || '') + (o?.apellido_paterno?.[0] || '')).toUpperCase()

const TABS = ['general', 'licencia', 'contacto']

export default function OperadorDrawer({ operador, abierto, onCerrar, onEditar, onCambiarEstatus }) {
  const [tabActiva, setTabActiva] = useState('general')

  // Cuando cambia el operador, volver a la tab General
  useEffect(() => {
    if (abierto) setTabActiva('general')
  }, [operador?.id, abierto])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCerrar])

  const activo = operador?.estatus === 'activo'
  const venc   = isVencida(operador?.vigencia_licencia)
  const pvenc  = isPorVencer(operador?.vigencia_licencia)

  return (
    <>
      <div
        className={`drawer-bg ${abierto ? 'open' : ''}`}
        onClick={onCerrar}
      />

      <div className={`drawer ${abierto ? 'open' : ''}`}>
        <div className="drawer-head">
          <div className="avatar">{operador ? iniciales(operador) : 'OP'}</div>
          <div>
            <div className="drawer-dname">
              {operador
                ? `${operador.nombre} ${operador.apellido_paterno} ${operador.apellido_materno || ''}`.trim()
                : '—'}
            </div>
            <div className="drawer-demp">{operador?.no_empleado || '#—'}</div>
          </div>
          <button className="drawer-close" onClick={onCerrar}>✕</button>
        </div>

        {operador && (
          <div className="drawer-body">
            <div className="tabs">
              {TABS.map((tab) => (
                <div
                  key={tab}
                  className={`tab ${tabActiva === tab ? 'on' : ''}`}
                  onClick={() => setTabActiva(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>

            {tabActiva === 'general' && (
              <>
                <SeccionDetalle titulo="// identificación">
                  <CampoDetalle label="No. Empleado" valor={operador.no_empleado} />
                  <CampoDetalle label="RFC" valor={operador.rfc} />
                  <CampoDetalle label="CURP" valor={operador.curp} estilo={{ fontSize: 10 }} />
                  <CampoDetalle label="F. Contratación" valor={fd(operador.fecha_contratacion)} />
                  <CampoDetalle
                    label="Tipo"
                    valor={
                      operador.es_permisionario
                        ? <span className="badge b-cyan">Permisionario</span>
                        : <span className="badge b-done">Empleado</span>
                    }
                  />
                  <CampoDetalle
                    label="Estado"
                    valor={
                      activo
                        ? <span className="badge b-ok">Activo</span>
                        : <span className="badge b-danger">Inactivo</span>
                    }
                  />
                </SeccionDetalle>

                <SeccionDetalle titulo="// ubicación">
                  <CampoDetalle label="Ciudad" valor={operador.ciudad} />
                  <CampoDetalle label="Estado" valor={operador.estado} />
                  <CampoDetalle label="Dirección" valor={operador.direccion} span={2} />
                </SeccionDetalle>
              </>
            )}

            {tabActiva === 'licencia' && (
              <SeccionDetalle titulo="// licencia de conducir">
                <CampoDetalle label="No. Licencia" valor={operador.no_licencia} />
                <CampoDetalle
                  label="Tipo"
                  valor={operador.tipo_licencia ? `Tipo ${operador.tipo_licencia}` : '—'}
                />
                <CampoDetalle
                  label="Vencimiento"
                  valor={fd(operador.vigencia_licencia)}
                  estilo={{ color: venc ? 'var(--danger)' : pvenc ? 'var(--pending)' : undefined }}
                />
                <CampoDetalle
                  label="Estatus"
                  valor={
                    venc
                      ? <span className="badge b-danger">Vencida</span>
                      : pvenc
                        ? <span className="badge b-pend">Por vencer</span>
                        : <span className="badge b-ok">Vigente</span>
                  }
                />
              </SeccionDetalle>
            )}

            {tabActiva === 'contacto' && (
              <SeccionDetalle titulo="// contacto">
                <CampoDetalle label="Teléfono" valor={operador.telefono} />
                <CampoDetalle label="Email" valor={operador.email} />
              </SeccionDetalle>
            )}
          </div>
        )}

        <div className="drawer-foot">
          <button
            className="btn-sm bs-ghost"
            onClick={() => { onEditar(operador); onCerrar() }}
          >
            ✎ Editar
          </button>

          {activo ? (
            <button
              className="btn-sm bs-danger"
              onClick={() => onCambiarEstatus(operador.id, 'inactivo')}
            >
              Dar de baja
            </button>
          ) : (
            <button
              className="btn-sm bs-ok"
              onClick={() => onCambiarEstatus(operador.id, 'activo')}
            >
              Reactivar
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function SeccionDetalle({ titulo, children }) {
  return (
    <div className="dsec">
      <div className="dsec-title">{titulo}</div>
      <div className="dgrid">{children}</div>
    </div>
  )
}

function CampoDetalle({ label, valor, estilo, span }) {
  return (
    <div className="ditem" style={span ? { gridColumn: `1 / -1` } : undefined}>
      <div className="lbl">{label}</div>
      <div className="val" style={estilo}>
        {valor || '—'}
      </div>
    </div>
  )
}