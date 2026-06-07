import { useEffect } from 'react'
import { useOperadorForm } from '../hooks/useOperadorForm'

const TIPOS_LICENCIA = ['A', 'B', 'C', 'D', 'E']

export default function OperadorForm({ abierto, onCerrar, operadorInicial, onSuccess }) {
  // El hook vive aquí adentro para que se reinicie limpio
  // cada vez que el modal se abre con un operador distinto.
  // Si prefieres que viva en la página, puedes recibirlo por props.
  const {
    form,
    errores,
    guardando,
    errorServidor,
    modoEdicion,
    handleChange,
    handleSubmit,
    resetForm,
  } = useOperadorForm({ operadorInicial, onSuccess: handleSuccess })

  function handleSuccess(operadorGuardado) {
    onSuccess?.(operadorGuardado)
    onCerrar()
  }

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCerrar])

  // Limpiar el form cuando se cierra el modal
  useEffect(() => {
    if (!abierto) resetForm()
  }, [abierto])

  if (!abierto) return null

  return (
    <div className="overlay open">
      <div className="modal">
        <div className="modal-head">
          <div className="modal-ic">👤</div>
          <div>
            <div className="modal-title">
              {modoEdicion
                ? `Editando — ${operadorInicial?.no_empleado}`
                : 'Nuevo Operador'}
            </div>
            <div className="modal-sub">Los campos con * son obligatorios.</div>
          </div>
          <button className="modal-close" onClick={onCerrar}>✕</button>
        </div>

        <div className="modal-body">
          {errorServidor && (
            <div
              style={{
                background: 'var(--danger-dim)',
                border: '1px solid rgba(220,38,38,.3)',
                borderRadius: 'var(--radius)',
                color: 'var(--danger)',
                fontSize: 12,
                padding: '8px 12px',
                marginBottom: 16,
              }}
            >
              {errorServidor}
            </div>
          )}

          <Seccion titulo="// identificación">
            <div className="fgrid c3">
              <Campo
                id="no_empleado"
                label="No. Empleado"
                requerido
                placeholder="EMP-001"
                value={form.no_empleado}
                error={errores.no_empleado}
                onChange={(v) => handleChange('no_empleado', v)}
              />
              <Campo
                id="nombre"
                label="Nombre"
                requerido
                placeholder="Juan"
                value={form.nombre}
                error={errores.nombre}
                onChange={(v) => handleChange('nombre', v)}
              />
              <Campo
                id="apellido_paterno"
                label="Ap. Paterno"
                requerido
                placeholder="García"
                value={form.apellido_paterno}
                error={errores.apellido_paterno}
                onChange={(v) => handleChange('apellido_paterno', v)}
              />
            </div>
            <div className="fgrid c3" style={{ marginTop: 10 }}>
              <Campo
                id="apellido_materno"
                label="Ap. Materno"
                placeholder="López"
                value={form.apellido_materno}
                onChange={(v) => handleChange('apellido_materno', v)}
              />
              <Campo
                id="curp"
                label="CURP"
                placeholder="18 caracteres"
                maxLength={18}
                style={{ textTransform: 'uppercase' }}
                value={form.curp}
                error={errores.curp}
                hint="18 caracteres"
                onChange={(v) => handleChange('curp', v.toUpperCase())}
              />
              <Campo
                id="rfc"
                label="RFC"
                placeholder="AABA850101AB3"
                maxLength={13}
                style={{ textTransform: 'uppercase' }}
                value={form.rfc}
                error={errores.rfc}
                hint="4 letras + 6 dígitos + 3 alfanum."
                onChange={(v) => handleChange('rfc', v.toUpperCase())}
              />
            </div>
            <div className="fgrid c3" style={{ marginTop: 10 }}>
              <Campo
                id="fecha_contratacion"
                label="F. Contratación"
                requerido
                type="date"
                value={form.fecha_contratacion}
                error={errores.fecha_contratacion}
                onChange={(v) => handleChange('fecha_contratacion', v)}
              />
              <div
                className="ff"
                style={{
                  gridColumn: 'span 2',
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  gap: 24,
                  paddingBottom: 2,
                }}
              >
                <div className="fcheck">
                  <input
                    type="checkbox"
                    id="es_permisionario"
                    checked={form.es_permisionario || false}
                    onChange={(e) => handleChange('es_permisionario', e.target.checked)}
                  />
                  <label htmlFor="es_permisionario">Es permisionario</label>
                </div>
              </div>
            </div>
          </Seccion>

          <Seccion titulo="// contacto">
            <div className="fgrid c2">
              <Campo
                id="telefono"
                label="Teléfono"
                requerido
                type="tel"
                placeholder="664 123 4567"
                value={form.telefono}
                error={errores.telefono}
                onChange={(v) => handleChange('telefono', v)}
              />
              <Campo
                id="email"
                label="Email"
                type="email"
                placeholder="operador@empresa.mx"
                value={form.email}
                error={errores.email}
                onChange={(v) => handleChange('email', v)}
              />
            </div>
          </Seccion>

          <Seccion titulo="// dirección">
            <div className="fgrid c3">
              <Campo
                id="estado"
                label="Estado"
                placeholder="Baja California"
                value={form.estado}
                onChange={(v) => handleChange('estado', v)}
              />
              <Campo
                id="ciudad"
                label="Ciudad"
                placeholder="Tijuana"
                value={form.ciudad}
                onChange={(v) => handleChange('ciudad', v)}
              />
              <Campo
                id="cp"
                label="C.P."
                placeholder="22000"
                maxLength={10}
                value={form.cp}
                onChange={(v) => handleChange('cp', v)}
              />
            </div>
            <div className="fgrid" style={{ marginTop: 10 }}>
              <Campo
                id="direccion"
                label="Dirección"
                placeholder="Av. Industrial 1234, Col. Zona Norte"
                value={form.direccion}
                onChange={(v) => handleChange('direccion', v)}
              />
            </div>
          </Seccion>

          <Seccion titulo="// licencia de conducir">
            <div className="fgrid c3">
              <Campo
                id="numero_licencia"
                label="No. Licencia"
                placeholder="LIC-123456"
                value={form.numero_licencia}
                onChange={(v) => handleChange('numero_licencia', v)}
              />
              <div className="ff">
                <label className="flbl">Tipo</label>
                <select
                  id="tipo_licencia"
                  className="fsel"
                  value={form.tipo_licencia}
                  onChange={(e) => handleChange('tipo_licencia', e.target.value)}
                >
                  <option value="">— Seleccionar —</option>
                  {TIPOS_LICENCIA.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                {errores.tipo_licencia && (
                  <span className="ferr">{errores.tipo_licencia}</span>
                )}
              </div>
              <Campo
                id="vigencia_licencia"
                label="Vencimiento"
                type="date"
                value={form.vigencia_licencia}
                error={errores.vigencia_licencia}
                onChange={(v) => handleChange('vigencia_licencia', v)}
              />
            </div>
          </Seccion>
        </div>

        <div className="modal-foot">
          <button className="btn-ghost" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={guardando}
            style={{ opacity: guardando ? 0.7 : 1 }}
          >
            {guardando
              ? 'Guardando…'
              : modoEdicion
                ? 'Actualizar Operador'
                : 'Guardar Operador'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div className="fsec">
      <div className="fsec-title">{titulo}</div>
      {children}
    </div>
  )
}

function Campo({
  id, label, requerido, type = 'text',
  placeholder, maxLength, style,
  value, error, hint,
  onChange,
}) {
  return (
    <div className="ff">
      <label className="flbl" htmlFor={id}>
        {label}
        {requerido && <span className="req"> *</span>}
      </label>
      <input
        id={id}
        className="finput"
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        style={style}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint  && !error && <span className="fhint">{hint}</span>}
      {error && <span className="ferr">{error}</span>}
    </div>
  )
}

