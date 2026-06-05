import { useState } from 'react'
import { useOperadores } from '../hooks/Useoperador'
import OperadoresTable from '../components/OperadoresTable'
import OperadorDrawer from '../components/OperadorDrawer'
import OperadorForm from '../components/OperadorForm'

export default function OperadoresPage() {
  const {
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
    refetch,
    handleDelete,
    handleCambiarEstatus,
  } = useOperadores()

  // Drawer
  const [operadorActivo, setOperadorActivo] = useState(null)
  const [drawerAbierto,  setDrawerAbierto]  = useState(false)

  // Modal form
  const [operadorEdicion, setOperadorEdicion] = useState(null)
  const [formAbierto,     setFormAbierto]     = useState(false)

  // Confirm modal
  const [confirm, setConfirm] = useState(null)

  // Toast
  const [toast, setToast] = useState(null)
  let toastTimer
  function mostrarToast(msg, tipo = 'ok') {
    setToast({ msg, tipo })
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => setToast(null), 3000)
  }

  // Métricas
  const totalActivos   = operadores.filter((o) => o.estatus === 'activo').length
  const totalInactivos = operadores.filter((o) => o.estatus === 'inactivo').length
  const enViaje        = operadores.filter((o) => o.en_viaje).length

  // Drawer handlers
  function abrirDrawer(operador) {
    setOperadorActivo(operador)
    setDrawerAbierto(true)
  }
  function cerrarDrawer() {
    setDrawerAbierto(false)
    setTimeout(() => setOperadorActivo(null), 260)
  }

  // Form handlers
  function abrirFormNuevo() {
    setOperadorEdicion(null)
    setFormAbierto(true)
  }
  function abrirFormEdicion(operador) {
    setOperadorEdicion(operador)
    setFormAbierto(true)
  }
  function cerrarForm() {
    setFormAbierto(false)
    setTimeout(() => setOperadorEdicion(null), 260)
  }
  function handleFormSuccess(operadorGuardado) {
    refetch()
    cerrarForm()
    mostrarToast(
      operadorEdicion
        ? `Operador ${operadorGuardado.no_empleado} actualizado.`
        : `Operador ${operadorGuardado.no_empleado} creado.`
    )
  }

  // Confirm handlers
  function pedirConfirmCambioEstatus(operador) {
    if (operador.estatus === 'activo' && operador.en_viaje) {
      mostrarToast(`${operador.no_empleado} tiene un viaje activo.`, 'warn')
      return
    }
    const bajando = operador.estatus === 'activo'
    setConfirm({
      titulo:   bajando ? `Dar de baja a ${operador.no_empleado}` : `Reactivar a ${operador.no_empleado}`,
      cuerpo:   bajando
        ? `${operador.nombre} ${operador.apellido_paterno} quedará inactivo.`
        : `${operador.nombre} ${operador.apellido_paterno} volverá a estar disponible.`,
      variante: bajando ? 'danger' : 'ok',
      onConfirmar: async () => {
        await handleCambiarEstatus(operador.id, bajando ? 'inactivo' : 'activo')
        cerrarDrawer()
        mostrarToast(bajando ? `${operador.no_empleado} dado de baja.` : `${operador.no_empleado} reactivado.`)
      },
    })
  }

  function pedirConfirmDelete(id) {
    const op = operadores.find((o) => o.id === id)
    if (!op) return
    setConfirm({
      titulo:   `Eliminar a ${op.no_empleado}`,
      cuerpo:   'Esta acción no se puede deshacer.',
      variante: 'danger',
      onConfirmar: async () => {
        await handleDelete(id)
        mostrarToast(`${op.no_empleado} eliminado.`)
      },
    })
  }

  return (
    <div className="body-layout">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-eyebrow">// módulo</div>
          <div className="page-title">Operadores</div>
          <div className="page-sub">Conductores y permisionarios de flota activa</div>
        </div>

        <div className="metrics">
          <div className="metric">
            <span className="metric-val blue">{total}</span>
            <div className="metric-lbl">TOTAL</div>
          </div>
          <div className="metric">
            <span className="metric-val ok">{totalActivos}</span>
            <div className="metric-lbl">ACTIVOS</div>
          </div>
          <div className="metric">
            <span className="metric-val pend">{enViaje}</span>
            <div className="metric-lbl">EN VIAJE</div>
          </div>
          <div className="metric">
            <span className="metric-val muted">{totalInactivos}</span>
            <div className="metric-lbl">INACTIVOS</div>
          </div>
        </div>

        <button className="btn-primary" onClick={abrirFormNuevo}>
          + Nuevo Operador
        </button>
      </div>

      {/* TABLA */}
      <OperadoresTable
        operadores={operadores}
        total={total}
        loading={loading}
        error={error}
        filtros={filtros}
        setFiltros={setFiltros}
        selectedIds={selectedIds}
        toggleSelect={toggleSelect}
        selectAll={selectAll}
        clearSelection={clearSelection}
        onVerDetalle={abrirDrawer}
        onEditar={abrirFormEdicion}
        onCambiarEstatus={(id) => {
          const op = operadores.find((o) => o.id === id)
          if (op) pedirConfirmCambioEstatus(op)
        }}
        onDelete={pedirConfirmDelete}
      />

      {/* DRAWER */}
      <OperadorDrawer
        operador={operadorActivo}
        abierto={drawerAbierto}
        onCerrar={cerrarDrawer}
        onEditar={abrirFormEdicion}
        onCambiarEstatus={(id) => {
          const op = operadores.find((o) => o.id === id)
          if (op) pedirConfirmCambioEstatus(op)
        }}
      />

      {/* FORM MODAL */}
      <OperadorForm
        abierto={formAbierto}
        onCerrar={cerrarForm}
        operadorInicial={operadorEdicion}
        onSuccess={handleFormSuccess}
      />

      {/* CONFIRM MODAL */}
      {confirm && (
        <ConfirmModal
          titulo={confirm.titulo}
          cuerpo={confirm.cuerpo}
          variante={confirm.variante}
          onConfirmar={async () => {
            await confirm.onConfirmar()
            setConfirm(null)
          }}
          onCancelar={() => setConfirm(null)}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div className={`toast show ${toast.tipo === 'warn' ? 'tw' : toast.tipo === 'danger' ? 'td' : ''}`}>
          {toast.msg}
        </div>
      )}

    </div>
  )
}

// Vive aquí por ahora. Al migrar a features → components/ui/ConfirmModal.jsx
function ConfirmModal({ titulo, cuerpo, variante, onConfirmar, onCancelar }) {
  return (
    <div className="overlay open">
      <div className="confirm-box">
        <div className="conf-title">{titulo}</div>
        <div className="conf-body">{cuerpo}</div>
        <div className="conf-acts">
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancelar}>
            Cancelar
          </button>
          <button
            className={`btn-sm ${variante === 'danger' ? 'bs-danger' : 'bs-ok'}`}
            style={{ flex: 1 }}
            onClick={onConfirmar}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}