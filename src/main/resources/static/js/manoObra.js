document.addEventListener("DOMContentLoaded", function () {
  // Inicializamos después de que el DOM esté listo
  inicializarPagina();
});

// --- Variables Globales ---
const usuarioString = localStorage.getItem('usuarioLogueado');
const usuario = usuarioString ? JSON.parse(usuarioString) : null;
const idObra = obtenerId(); // Guardamos el ID de la obra para usarlo globalmente

let modoAgregar = true; // Controla si el botón "Agregar" actúa como "Agregar fila" o como "Guardar"
let movimientosGlobal = [];

/**
 * Función principal de inicialización.
 * Centraliza todas las llamadas a eventos y carga inicial.
 */
function inicializarPagina() {
  // 1. Configurar listeners de botones principales
  configurarBotones();

  // 2. Aplicar todas las reglas de permisos (visibilidad, botones, etc.)
  aplicarPermisosPorRol();

  // 3. Cargar los movimientos existentes desde el backend
  cargarMovimientos();
}

/**
 * Configura los event listeners de los botones que siempre existen.
 */
function configurarBotones() {
  // Botón Volver
  const btnVolver = document.getElementById("btnVolver");
  if (btnVolver) {
    btnVolver.addEventListener("click", function () {
      window.location.href = `/obras/detalles/${idObra}`;
    });
  }

  // Botón Agregar/Subir (maneja la lógica de agregar fila o guardar archivo)
  const btnAgregar = document.getElementById("btnAgregar");
  if (btnAgregar) {
    btnAgregar.addEventListener("click", manejarBotonAgregar);
  }

  // Botón Actualizar (para guardar cambios masivos de estado/observaciones)
  const btnActualizar = document.getElementById("btnActualizar");
  if (btnActualizar) {
    btnActualizar.addEventListener("click", actualizarTabla);
  }
}

// --- Funciones de Utilidad (IDs, Fechas) ---

/**
 * Obtiene el ID de la obra desde la URL.
 * Soporta formato /detalles/123 y /detalles?id=123.
 */
function obtenerId() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('id')) {
    return urlParams.get('id');
  }
  const partes = window.location.pathname.split("/");
  return partes[partes.length - 1];
}

/**
 * Formatea una fecha ISO a formato local mexicano (dd/mm/aaaa).
 */
function formatearFecha(fechaISO) {
  if (!fechaISO) return '-';
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

// --- Lógica de Permisos y Roles ---

/**
 * Aplica todas las reglas de visibilidad y permisos basados en el tipo de usuario.
 * Esta función se llama al inicio y cada vez que se refresca la tabla.
 */
function aplicarPermisosPorRol() {
  if (!usuario) {
    console.warn("No hay usuario logueado. Ocultando todo.");
    ocultarElementosParaNoLogueado();
    return;
  }

  // 1. Controlar visibilidad de columnas (como 'Pagado')
  controlarColumnasPorRol();

  // 2. Controlar visibilidad de botones de acción (Agregar, Actualizar)
  controlarBotonesPorRol();

  // 3. Aplicar lógica de descarga condicional (solo si hay tabla)
  // Esto se hace dentro de pintarTabla, pero podemos asegurarnos de que los listeners se actualicen.
  // La lógica de "aceptado para compras" se maneja en el evento de click de descarga.
}

/**
 * Oculta elementos críticos si no hay usuario (estado de seguridad).
 */
function ocultarElementosParaNoLogueado() {
  document.querySelectorAll(".col-admin").forEach(col => col.style.display = "none");
  const btnAgregar = document.getElementById("btnAgregar");
  if (btnAgregar) btnAgregar.style.display = "none";
  const btnActualizar = document.getElementById("btnActualizar");
  if (btnActualizar) btnActualizar.style.display = "none";
}

/**
 * Controla la visibilidad de la columna 'Pagado' (col-admin).
 * Solo visible para ADMINISTRACION.
 */
function controlarColumnasPorRol() {
  const columnasAdmin = document.querySelectorAll(".col-admin");
  const columnasJefe = document.querySelectorAll(".col-jefe");
  const rolesAutorizados = ['ADMINISTRACION', 'GERENTE', 'RESIDENTE', 'COMPRAS', 'CONTADOR'];

  columnasAdmin.forEach(col => col.style.display = "none"); // Ocultar por defecto

  if (usuario && rolesAutorizados.includes(usuario.tipoUsuario)) {
    columnasAdmin.forEach(col => col.style.display = ""); // Mostrar
    columnasJefe.forEach(col => col.style.display = ""); // Mostrar
  }
}

/**
 * Controla la visibilidad de los botones 'Subir requerimiento' y 'Actualizar'.
 * - RESIDENTE: Puede ver y usar "Subir requerimiento".
 * - GERENTE/ADMINISTRACION: Pueden ver y usar "Actualizar".
 */
function controlarBotonesPorRol() {
  const btnAgregar = document.getElementById("btnAgregar");
  const btnActualizar = document.getElementById("btnActualizar");

  // 1. Resetear estados
  if (btnAgregar) {
    btnAgregar.style.display = "none";
    btnAgregar.disabled = false;
    btnAgregar.style.backgroundColor = "";
    btnAgregar.style.cursor = "pointer";
    btnAgregar.textContent = modoAgregar ? "Subir requerimiento" : "Guardar";
  }
  if (btnActualizar) btnActualizar.style.display = "none";

  if (!usuario) return;

  const estatusObra = localStorage.getItem(`estatus_obra_${idObra}`);
  const estaCerrada = (estatusObra === "CIERRE" || estatusObra === "CERRADA");

  // Incluimos a JEFE en los que ignoran el cierre visual
  const esSuperUser = ['PRESUPUESTOS'].includes(usuario.tipoUsuario);

  // 2. FILTRO VISUAL DE OBRA CERRADA
  if (estaCerrada && !esSuperUser) {
    if (btnAgregar) {
      btnAgregar.style.display = "block";
      btnAgregar.disabled = true;
      btnAgregar.textContent = "OBRA FINALIZADA";
      btnAgregar.style.backgroundColor = "#64748b";
      btnAgregar.style.cursor = "not-allowed";
    }
    return; // Los usuarios normales no pasan de aquí si está cerrada
  }

  switch (usuario.tipoUsuario) {
    case 'RESIDENTE':
      if (btnAgregar) btnAgregar.style.display = "block";
      break;
    case 'GERENTE':
    case 'ADMINISTRACION':
      if (btnActualizar) btnActualizar.style.display = "block";
      break;
    case 'JEFE':
      // JEFE puede ver el botón Actualizar para guardar validaciones
      if (btnActualizar) btnActualizar.style.display = "block";
      break;
    case 'CONTADOR':
    case 'COMPRAS':
      if (btnAgregar && hayArchivoAceptado()) {
        btnAgregar.style.display = "block";
      }
      break;
    // CONTADOR no tiene botones de acción en esta vista, solo puede ver y descargar (si está aceptado)
    default:
      // Otros roles (como CONTADOR) no ven botones
      break;
  }
}
/**
 * Verifica si existe al menos un movimiento en estado ACEPTADO.
 * @returns {boolean} - true si hay al menos un archivo ACEPTADO.
 */
function hayArchivoAceptado() {
  if (!movimientosGlobal || movimientosGlobal.length === 0) {
    return false;
  }

  return movimientosGlobal.some(mov => mov.estado === 'ACEPTADO');
}

/**
 * Determina si un usuario puede editar (cambiar estado/observaciones) la tabla.
 * @returns {boolean}
 */
function puedeEditar() {
  // Si la obra está cerrada, ya no se debería poder editar la tabla
  const estatusObra = localStorage.getItem(`estatus_obra_${idObra}`);
  if (estatusObra === "CIERRE") return false;
  return usuario && (
    usuario.tipoUsuario === "GERENTE" ||
    usuario.tipoUsuario === "ADMINISTRACION"
  );
}

/**
 * Determina si un usuario puede subir archivos (agregar fila).
 * @returns {boolean}
 */
function puedeSubir() {
  if (!usuario) return false;

  // 1. Definir roles con superpoderes (pueden subir en cierre)
  const rolesSuperUser = ['PRESUPUESTOS'];
  const esSuperUser = rolesSuperUser.includes(usuario.tipoUsuario);

  const estatusObra = localStorage.getItem(`estatus_obra_${idObra}`);
  const estaCerrada = (estatusObra === "CIERRE" || estatusObra === "CERRADA");

  // 2. Lógica de permisos

  // SI ES SUPERUSER: Permiso total siempre
  if (esSuperUser) return true;

  // SI LA OBRA ESTÁ CERRADA: Bloqueo total para los demás roles
  if (estaCerrada) return false;

  // SI LA OBRA ESTÁ ABIERTA:
  if (usuario.tipoUsuario === 'RESIDENTE' || usuario.tipoUsuario === 'ADMINISTRACION') return true;

  if (usuario.tipoUsuario === 'COMPRAS' || usuario.tipoUsuario === 'CONTADOR') {
    return hayArchivoAceptado();
  }

  return false;
}

/**
 * Determina si un usuario puede descargar un archivo específico.
 * @param {string} estado - El estado del movimiento (ACEPTADO, RECHAZADO, REVISADO).
 * @returns {boolean}
 */
function puedeDescargar(estado) {
  if (!usuario) return false;

  // Ambos roles solo descargan lo ACEPTADO
  if (usuario.tipoUsuario === 'COMPRAS' || usuario.tipoUsuario === 'CONTADOR') {
    return estado === 'ACEPTADO';
  }

  // Roles de revisión descargan siempre
  if (['GERENTE', 'ADMINISTRACION', 'JEFE'].includes(usuario.tipoUsuario)) {
    return true;
  }

  return false;
}

// --- Lógica de Carga y Pintado de Tabla ---

/**
 * Carga los movimientos desde el API y pinta la tabla.
 */
async function cargarMovimientos() {
  try {
    const response = await fetch(`/api/v1/movobra/${idObra}/MANO_OBRA/REQUERIMIENTOS`);

    if (!response.ok) {
      throw new Error("Error al obtener movimientos");
    }

    const movimientos = await response.json();
    movimientosGlobal = movimientos;
    pintarTabla(movimientos);

  } catch (error) {
    console.error("Error en cargarMovimientos:", error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron cargar los movimientos',
      icon: 'error'
    });
  }
}

/**
 * Pinta la tabla de movimientos en el DOM, aplicando toda la lógica de permisos.
 * @param {Array} movimientos - Lista de movimientos desde la API.
 */
function pintarTabla(movimientos) {
  const tbody = document.getElementById("tablaBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!movimientos || movimientos.length === 0) {
    // Podrías mostrar una fila de "No hay movimientos"
    return;
  }

  const editable = puedeEditar();

  movimientos.forEach((mov, index) => {
    const fecha = formatearFecha(mov.fechasubida);
    // Creamos un nombre personalizado para la descarga: "NombreObra-NombreArchivo"
    const nombrePerfecto = `${mov.nombreobra}-${mov.nombre}`;
    const urlSegura = `/api/v1/archivos/descargar?categoria=${encodeURIComponent(mov.bucket)}&url=${encodeURIComponent(mov.url)}&nombrePersonalizado=${encodeURIComponent(nombrePerfecto)}`;

    // --- Lógica para la celda de Archivo (Descarga) ---
    let archivoHtml = '';
    if (puedeDescargar(mov.estado)) {
      // Si puede descargar, es un link activo con evento personalizado
      archivoHtml = `<a href="#" class="link-activo descargar-archivo" data-url="${urlSegura}" data-id="${mov.movobraid}" data-estado="${mov.estado}">${mov.nombre}</a>`;
    } else {
      // Si no puede descargar, es texto plano
      archivoHtml = `<span class="link-deshabilitado">${mov.nombre}</span>`;
    }

    // --- Lógica para la celda de Estado (Select o Texto) ---
    let estadoHtml = '';
    if (editable) {
      // Usuarios con permiso de edición ven un select
      estadoHtml = `
        <select class="estado-select" data-id="${mov.movobraid}">
          <option value="REVISADO" ${mov.estado === "REVISADO" ? "selected" : ""}>REVISADO</option>
          <option value="ACEPTADO" ${mov.estado === "ACEPTADO" ? "selected" : ""}>ACEPTADO</option>
          <option value="RECHAZADO" ${mov.estado === "RECHAZADO" ? "selected" : ""}>RECHAZADO</option>
        </select>
      `;
    } else {
      // Otros roles solo ven el texto del estado
      estadoHtml = `<span>${mov.estado}</span>`;
    }

    // --- Lógica para la celda de Observaciones (Editable o no) ---
    let obsHtml = '';
    if (editable) {
      obsHtml = `<td contenteditable="true" class="observaciones" data-id="${mov.movobraid}">${mov.observaciones ?? ''}</td>`;
    } else {
      obsHtml = `<td>${mov.observaciones ?? ''}</td>`;
    }

    // --- Lógica para la celda de Pagado (Checkbox) ---
    // Solo se pinta si el usuario es ADMINISTRACION. La columna se oculta/muestra con CSS,
    // pero podemos no poner el checkbox si no es admin para ahorrar DOM.
    // --- Lógica para la celda de Pagado (Checkbox) ---
    // Solo se pinta si el usuario es ADMINISTRACION. La columna se oculta/muestra con CSS,
    // pero podemos no poner el checkbox si no es admin para ahorrar DOM.
    // --- Lógica para la celda de Pagado (Checkbox o Solo Lectura) ---
    let pagadoHtml = '<td class="col-admin"></td>'; // Celda vacía por defecto

    if (usuario) {
      // Verificamos si el movimiento está RECHAZADO
      const estaRechazado = mov.estado === "RECHAZADO";

      if (usuario.tipoUsuario === 'ADMINISTRACION') {
        // Si es ADMIN: Puede editar SIEMPRE Y CUANDO no esté rechazado
        if (estaRechazado) {
          // Si está rechazado, el Admin lo ve pero NO puede marcarlo (disabled)
          // Le quitamos la clase 'pagado-checkbox' para que 'actualizarTabla' no lo intente guardar
          pagadoHtml = `<td class="col-admin"><input type="checkbox" disabled ${mov.pagado ? "checked" : ""} title="No se puede pagar un requerimiento rechazado"></td>`;
        } else {
          // Si NO está rechazado, funciona normal
          pagadoHtml = `<td class="col-admin"><input type="checkbox" class="pagado-checkbox" data-id="${mov.movobraid}" ${mov.pagado ? "checked" : ""}></td>`;
        }
      } else {
        // OTROS ROLES (GERENTE, RESIDENTE, COMPRAS): Solo lectura siempre
        // Mostramos si está pagado o no, pero bloqueado
        pagadoHtml = `<td class="col-admin"><input type="checkbox" disabled ${mov.pagado ? "checked" : ""}></td>`;
      }
    }

    // --- Validación para JEFE ---
    let validacionHtml = '<td class="col-jefe"></td>';
    if (usuario) {
      const estaRechazado = mov.estado === "RECHAZADO";

      if (usuario.tipoUsuario === 'JEFE') {
        // Si es JEFE: Puede editar SIEMPRE Y CUANDO no esté rechazado
        if (estaRechazado) {
          validacionHtml = `<td class="col-jefe"><input type="checkbox" disabled ${mov.jefe ? "checked" : ""} title="No se puede validar un requerimiento rechazado"></td>`;
        } else {
          validacionHtml = `<td class="col-jefe"><input type="checkbox" class="validacion-checkbox" data-id="${mov.movobraid}" ${mov.jefe ? "checked" : ""}></td>`;
        }
      } else {
        // OTROS ROLES: Solo lectura
        validacionHtml = `<td class="col-jefe"><input type="checkbox" disabled ${mov.jefe ? "checked" : ""}></td>`;
      }
    }

    // Construcción de la fila
    const fila = document.createElement('tr');
    fila.dataset.id = mov.movobraid;
    fila.innerHTML = `
      <td>${index + 1}</td>
      <td>${fecha}</td>
      <td>${mov.tipousuarioregistra}</td>
      <td class="file-cell">${archivoHtml}</td>
      <td>${estadoHtml}</td>
      ${obsHtml}
      ${pagadoHtml}
      ${validacionHtml}
    `;

    tbody.appendChild(fila);
  });

  // Después de pintar, necesitamos re-aplicar los listeners:
  // 1. Para descargas (maneja la lógica de actualizar estado a REVISADO y la descarga en sí)
  configurarListenersDescarga();

  // 2. Asegurar que los permisos de botones y columnas se apliquen (por si acaso)
  aplicarPermisosPorRol();
}

/**
 * Configura los listeners para los enlaces de descarga.
 * Al hacer click, si el usuario es GERENTE o ADMIN, se actualiza el estado a REVISADO automáticamente.
 * Luego, inicia la descarga.
 */
function configurarListenersDescarga() {
  document.querySelectorAll(".descargar-archivo").forEach(link => {
    link.addEventListener("click", async function (e) {
      e.preventDefault(); // Prevenir la navegación del href="#"

      const urlDescarga = this.dataset.url;
      const movimientoId = this.dataset.id;

      // Solo Gerente y Admin actualizan el estado al descargar
      if (usuario && (usuario.tipoUsuario === 'GERENTE' || usuario.tipoUsuario === 'ADMINISTRACION')) {
        // Mostrar un loading opcional
        try {
          // Llamar al API para actualizar el estado a REVISADO
          await actualizarCampo(movimientoId, { estado: "REVISADO" });
          // No recargamos toda la tabla para no interrumpir la descarga, pero sí actualizamos el data-estado del link
          this.dataset.estado = "REVISADO";
          // Opcional: actualizar el select de estado si existe en la misma fila
          const selectEnFila = this.closest('tr')?.querySelector('.estado-select');
          if (selectEnFila) {
            selectEnFila.value = "REVISADO";
          }
        } catch (error) {
          console.error("Error al actualizar estado a REVISADO:", error);
          // Continuamos con la descarga aunque falle la actualización
        }
      }

      // Iniciar la descarga (para todos los que tienen permiso)
      window.location.href = urlDescarga;
    });
  });
}

// --- Lógica de Actualización (Botón Actualizar) ---

/**
 * Recolecta todos los cambios de la tabla (estado, observaciones, pagado) y los envía al API.
 */
async function actualizarTabla() {
  const filas = document.querySelectorAll("#tablaBody tr");
  const updates = [];
  const updatesPago = [];
  const updatesValidacion = [];

  filas.forEach(fila => {
    const id = fila.dataset.id;
    if (!id) return;

    const estadoSelect = fila.querySelector(".estado-select");
    const observacionesTd = fila.querySelector(".observaciones");
    const pagadoCheckbox = fila.querySelector(".pagado-checkbox");
    const validacionCheckbox = fila.querySelector(".validacion-checkbox");

    const estado = estadoSelect ? estadoSelect.value : null;
    const observaciones = observacionesTd ? observacionesTd.innerText.trim() : null;

    // Para pagado, solo procesamos si existe el checkbox (solo ADMIN lo ve)
    if (pagadoCheckbox) {

      const pagado = pagadoCheckbox.checked;

      // Solo agregamos a updatesPago si el checkbox existe
      // Nota: No podemos comparar con el valor original fácilmente,
      // así que enviaremos siempre. El backend debe manejarlo.
      updatesPago.push({
        id: id,
        pagado: pagado
      });
    }

    // Para validación (JEFE)
    if (validacionCheckbox) {
      const jefeValidacion = validacionCheckbox.checked;
      updatesValidacion.push({
        id: id,
        jefe: jefeValidacion
      });
    }

    // Solo agregamos a la lista si hay al menos un campo que haya cambiado (opcional, pero eficiente)
    // Por simplicidad, enviaremos todos los que tengan datos. El backend debe manejar qué campos actualizar.
    if (estado || observaciones !== null) {
      updates.push({
        id,
        estado,
        observaciones
      });
    }
  });

  if (updates.length === 0 && updatesPago.length === 0 && updatesValidacion.length === 0) {
    Swal.fire({
      title: 'Sin cambios',
      text: 'No hay datos para actualizar',
      icon: 'info'
    });
    return;
  }

  // Mostrar loading
  Swal.fire({
    title: 'Guardando...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    // Ejecutamos todas las actualizaciones en paralelo para mejor rendimiento
    const promises = [];
    if (updates.length > 0) {
      const genericPromises = updates.map(item =>
        actualizarCampo(item.id, {
          estado: item.estado,
          observaciones: item.observaciones,
        })
      );
      promises.push(...genericPromises);
    }
    if (updatesPago.length > 0) {
      const pagoPromises = updatesPago.map(item =>
        actualizarPago(item.id, item.pagado)
      );
      promises.push(...pagoPromises);
    }

    if (updatesValidacion.length > 0) {
      const validacionPromises = updatesValidacion.map(item =>
        actualizarValidacion(item.id, item.jefe)
      );
      promises.push(...validacionPromises);
    }

    await Promise.all(promises);

    Swal.fire({
      title: 'Actualizado',
      text: 'Cambios guardados correctamente',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });

    // Recargar la tabla para reflejar los cambios más recientes
    cargarMovimientos();

  } catch (error) {
    console.error("Error en actualizarTabla:", error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron guardar los cambios',
      icon: 'error'
    });
  }
}

/**
 * Función genérica para actualizar un campo específico de un movimiento.
 * @param {string|number} id - ID del movimiento.
 * @param {object} data - Objeto con los campos a actualizar (estado, observaciones, pagado).
 */
async function actualizarCampo(id, data) {
  const response = await fetch(`/api/v1/movobra/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al actualizar: ${response.status} ${errorText}`);
  }
}

/**
 * Actualiza SOLO el estado de pagado en el endpoint específico.
 * @param {string|number} id - ID del movimiento.
 */
async function actualizarPago(id, pagado) {
  const response = await fetch(`/api/v1/movobra/pago`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: id, pagado: pagado })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al actualizar pago: ${response.status} ${errorText}`);
  }
}

/**
 * Actualiza la validación del JEFE en el endpoint específico.
 * @param {string|number} id - ID del movimiento.
 * @param {boolean} jefeValidacion - Nuevo estado de validación.
 */
async function actualizarValidacion(id, jefe) {
  const response = await fetch(`/api/v1/movobra/jefecito`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: id, jefe: jefe })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al actualizar validación: ${response.status} ${errorText}`);
  }
}

// --- Lógica de Subida de Archivos (RESIDENTE o COMPRAS) ---

/**
 * Maneja el clic en el botón "Subir requerimiento" / "Guardar".
 * Si está en modo agregar, añade una fila con un input file.
 * Si está en modo guardar, ejecuta la subida del archivo.
 */
async function manejarBotonAgregar(e) {
  e.preventDefault();

  // Verificar que el usuario sea RESIDENTE (seguridad extra)
  if (!puedeSubir()) {
    Swal.fire({
      title: 'Acceso denegado',
      text: 'No tienes permiso para subir archivos',
      icon: 'error'
    });
    return;
  }

  if (modoAgregar) {
    agregarFila();
    // Cambiar el texto del botón a "Guardar"
    const btn = document.getElementById("btnAgregar");
    btn.textContent = "Guardar";
    modoAgregar = false;
  } else {
    await guardarArchivo();
  }
}

/**
 * Agrega una nueva fila a la tabla con un campo de tipo file para que el residente suba un archivo.
 */
function agregarFila() {
  const tbody = document.getElementById("tablaBody");
  const numeroFila = tbody.children.length + 1;

  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td>${numeroFila}</td>
    <td>-</td>
    <td>-</td>
    <td class="file-cell">
      <input type="file" class="input-file">
    </td>
    <td></td>
    <td></td>
    <td class="col-admin"></td>
    <td class="col-jefe"></td>
  `;

  tbody.appendChild(fila);
  aplicarPermisosPorRol(); // Re-aplicar permisos para que la columna admin se oculte si es necesario
}

/**
 * Guarda el archivo seleccionado en la última fila, subiéndolo primero al servicio de archivos
 * y luego registrando el movimiento.
 */
async function guardarArchivo() {
  const tbody = document.getElementById("tablaBody");
  const ultimaFila = tbody.lastElementChild;
  const input = ultimaFila.querySelector(".input-file");

  if (!input || !input.files.length) {
    Swal.fire({
      title: 'Aviso',
      text: 'Debe seleccionar un archivo',
      icon: 'warning',
      confirmButtonColor: '#f39c12'
    });
    return;
  }

  const file = input.files[0];

  const formData = new FormData();
  formData.append("tipoEntidad", "REQUERIMIENTOS");
  formData.append("movobraId", idObra);
  formData.append("categoria", "MANO_OBRA");
  formData.append("file", file);

  // Mostrar loading
  Swal.fire({
    title: 'Subiendo archivo...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    // 1. Subir archivo
    const responseArchivo = await fetch("/api/v1/archivos", {
      method: "POST",
      body: formData
    });

    if (!responseArchivo.ok) {
      throw new Error("Error al subir archivo");
    }

    const archivoId = await responseArchivo.text(); // Asumimos que devuelve el ID como texto

    // 2. Registrar movimiento
    const movobraBody = {
      obraId: idObra, // Esto debe coincidir con lo que espera tu backend
      tipoMovimiento: "REQUERIMIENTOS",
      usuarioRegistraId: usuario.id,
      archivoId: archivoId
    };

    const responseMov = await fetch("/api/v1/movobra", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(movobraBody)
    });

    if (!responseMov.ok) {
      // Si falla el movimiento, deberíamos eliminar el archivo subido? (opcional)
      throw new Error("Error al registrar movimiento");
    }

    // Éxito
    Swal.fire({
      title: '¡Éxito!',
      text: 'Archivo subido correctamente',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });

    // Resetear la tabla y el botón
    resetearEstadoSubida();

  } catch (error) {
    console.error("Error en guardarArchivo:", error);
    Swal.fire({
      title: 'Error',
      text: 'Fallo en el proceso de subida',
      icon: 'error'
    });
  }
}

/**
 * Resetea la tabla a su estado normal después de una subida exitosa.
 */
function resetearEstadoSubida() {
  const tbody = document.getElementById("tablaBody");
  tbody.innerHTML = ""; // Limpiar la fila temporal

  const btn = document.getElementById("btnAgregar");
  btn.textContent = "Subir requerimiento";
  modoAgregar = true;

  // Recargar los movimientos actualizados
  cargarMovimientos();
}
