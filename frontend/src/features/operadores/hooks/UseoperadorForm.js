/**
 * hooks/useOperadorForm.js
 *
 * Maneja el estado y las validaciones del formulario de operadores.
 * Sirve tanto para crear un nuevo operador como para editar uno existente.
 * Si recibes un `operadorInicial`, el form arranca en modo edición.
 */

import { useState, useCallback } from 'react';
import { createOperador, updateOperador } from '../api/operadores';

// Valores por defecto del form, uno por uno para que el reset sea predecible.
const FORM_VACIO = {
  nombre:            '',
  apellido_paterno:  '',
  apellido_materno:  '',
  rfc:               '',
  curp:              '',
  fecha_nacimiento:  '',
  telefono:          '',
  email:             '',
  direccion:         '',
  tipo_licencia:     '',
  numero_licencia:   '',
  vigencia_licencia: '',
  fecha_ingreso:     '',
  estatus:           'activo',
  notas:             '',
};

// Expresiones regulares compiladas una sola vez, no dentro del render.
const RE_RFC   = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;
const RE_CURP  = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_PHONE = /^\+?[\d\s\-()]{8,15}$/;


export function useOperadorForm({ operadorInicial = null, onSuccess } = {}) {

  // Si nos pasan un operador existente arrancamos con sus datos; si no, form vacío.
  const [form, setForm] = useState(
    operadorInicial
      ? { ...FORM_VACIO, ...operadorInicial }
      : { ...FORM_VACIO },
  );

  // Errores de validación, uno por campo.
  const [errores, setErrores] = useState({});

  // Estado de la petición HTTP.
  const [guardando, setGuardando] = useState(false);
  const [errorServidor, setErrorServidor] = useState(null);

  const modoEdicion = operadorInicial !== null;


  // Actualiza un campo del form y borra su error si lo había.
  const handleChange = useCallback((campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => {
      if (!prev[campo]) return prev;
      const siguientes = { ...prev };
      delete siguientes[campo];
      return siguientes;
    });
  }, []);


  // Devuelve un objeto con los errores encontrados.
  // Si el objeto está vacío, el form es válido.
  function validar(datos) {
    const e = {};

    if (!datos.nombre?.trim())
      e.nombre = 'El nombre es obligatorio.';

    if (!datos.apellido_paterno?.trim())
      e.apellido_paterno = 'El apellido paterno es obligatorio.';

    if (!datos.rfc?.trim()) {
      e.rfc = 'El RFC es obligatorio.';
    } else if (!RE_RFC.test(datos.rfc.trim())) {
      e.rfc = 'El RFC no tiene el formato correcto (ej. LOEM800101AA1).';
    }

    if (!datos.curp?.trim()) {
      e.curp = 'El CURP es obligatorio.';
    } else if (!RE_CURP.test(datos.curp.trim())) {
      e.curp = 'El CURP no tiene el formato correcto.';
    }

    if (!datos.email?.trim()) {
      e.email = 'El correo es obligatorio.';
    } else if (!RE_EMAIL.test(datos.email.trim())) {
      e.email = 'El correo no tiene un formato válido.';
    }

    if (!datos.telefono?.trim()) {
      e.telefono = 'El teléfono es obligatorio.';
    } else if (!RE_PHONE.test(datos.telefono.trim())) {
      e.telefono = 'El teléfono debe tener entre 8 y 15 dígitos.';
    }

    if (!datos.fecha_nacimiento)
      e.fecha_nacimiento = 'La fecha de nacimiento es obligatoria.';

    if (!datos.tipo_licencia?.trim())
      e.tipo_licencia = 'El tipo de licencia es obligatorio.';

    if (!datos.numero_licencia?.trim())
      e.numero_licencia = 'El número de licencia es obligatorio.';

    if (!datos.vigencia_licencia)
      e.vigencia_licencia = 'La vigencia de la licencia es obligatoria.';

    if (!datos.fecha_ingreso)
      e.fecha_ingreso = 'La fecha de ingreso es obligatoria.';

    // Validación cruzada: la licencia no puede estar vencida al registrar.
    if (datos.vigencia_licencia) {
      const hoy      = new Date();
      const vigencia = new Date(datos.vigencia_licencia);
      hoy.setHours(0, 0, 0, 0);
      if (vigencia < hoy) {
        e.vigencia_licencia = 'La licencia está vencida.';
      }
    }

    return e;
  }


  // Limpia el form y lo deja como si acabaras de abrirlo nuevo.
  const resetForm = useCallback(() => {
    setForm(operadorInicial ? { ...FORM_VACIO, ...operadorInicial } : { ...FORM_VACIO });
    setErrores({});
    setErrorServidor(null);
  }, [operadorInicial]);


  // El submit:
  //  1. Valida el form.
  //  2. Si hay errores, los pone en pantalla y para.
  //  3. Si no, manda la petición al backend.
  //  4. Llama a onSuccess con el operador guardado para que el padre
  //     pueda cerrar el modal o refrescar la tabla.
  const handleSubmit = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();

    const erroresEncontrados = validar(form);
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados);
      // Hacemos scroll al primer campo con error para no dejar al usuario buscando.
      const primerCampo = Object.keys(erroresEncontrados)[0];
      document.getElementById(primerCampo)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setGuardando(true);
    setErrorServidor(null);

    try {
      const payload = prepararPayload(form);
      const operadorGuardado = modoEdicion
        ? await updateOperador(operadorInicial.id, payload)
        : await createOperador(payload);

      onSuccess?.(operadorGuardado);
    } catch (err) {
      // Los errores de validación del servidor (422) tienen mensajes de campo.
      // Los de servidor (500) los mostramos genéricos para no exponer internals.
      if (err?.response?.status === 422) {
        const camposServidor = err.response.data?.errors ?? {};
        setErrores((prev) => ({ ...prev, ...camposServidor }));
      } else if (err?.response?.status === 409) {
        setErrorServidor('Ya existe un operador con ese RFC o CURP.');
      } else {
        setErrorServidor('No se pudo guardar. Intenta de nuevo.');
      }
    } finally {
      setGuardando(false);
    }
  }, [form, modoEdicion, operadorInicial, onSuccess]);


  return {
    form,
    errores,
    guardando,
    errorServidor,
    modoEdicion,
    handleChange,
    handleSubmit,
    resetForm,
  };
}


// Prepara el payload antes de enviarlo:
//  - Trim en strings para no guardar espacios accidentales.
//  - RFC y CURP a mayúsculas (el backend debería hacerlo también, pero
//    mejor que llegue limpio desde aquí).
function prepararPayload(form) {
  const p = { ...form };

  const camposTexto = ['nombre', 'apellido_paterno', 'apellido_materno',
    'direccion', 'numero_licencia', 'notas', 'email', 'telefono'];

  camposTexto.forEach((campo) => {
    if (typeof p[campo] === 'string') p[campo] = p[campo].trim();
  });

  if (p.rfc)  p.rfc  = p.rfc.trim().toUpperCase();
  if (p.curp) p.curp = p.curp.trim().toUpperCase();

  return p;
}