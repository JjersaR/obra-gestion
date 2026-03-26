document.addEventListener("DOMContentLoaded", function () {
  inicializarPagina();
});

// --- Variables Globales ---
const usuarioString = localStorage.getItem('usuarioLogueado');
const usuario = usuarioString ? JSON.parse(usuarioString) : null;
const idObra = obtenerId();

let modoAgregar = true;
let movimientosGlobal = [];

/**
 * Función principal de inicialización.
 */
function inicializarPagina() {
  configurarBotones();
  aplicarPermisosPorRol();
  cargarMovimientos();
}

/**
 * Configura los event listeners de los botones.
 */
function configurarBotones() {
  const btnVolver = document.getElementById("btnVolver");
  if (btnVolver) {
    btnVolver.addEventListener("click", function () {
      window.location.href = `/obras/detalles/${idObra}`;
    });
  }

  const btnAgregar = document.getElementById("btnAgregar");
  if (btnAgregar) {
    btnAgregar.addEventListener("click", manejarBotonAgregar);
  }

  const btnActualizar = document.getElementById("btnActualizar");
  if (btnActualizar) {
    btnActualizar.addEventListener("click", actualizarTabla);
  }
}

// --- Funciones de Utilidad (IDs, Fechas) ---
function obtenerId() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('id')) return urlParams.get('id');
  const partes = window.location.pathname.split("/");
  return partes[partes.length - 1];
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return '-';
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// --- Lógica de Permisos y Roles ---

function aplicarPermisosPorRol() {
  if (!usuario) {
    ocultarElementosParaNoLogueado();
    return;
  }
  controlarBotonesPorRol();
}

function ocultarElementosParaNoLogueado() {
  const btnAgregar = document.getElementById("btnAgregar");
  const btnActualizar = document.getElementById("btnActualizar");
  if (btnAgregar) btnAgregar.style.display = "none";
  if (btnActualizar) btnActualizar.style.display = "none";
}

/**
 * Controla la visibilidad de los botones de acción.
 * - RESIDENTE: "Subir requerimiento"
 * - GERENTE: "Actualizar"
 * - ADMINISTRACION: Solo lectura (botones ocultos)
 */
function controlarBotonesPorRol() {
  const btnAgregar = document.getElementById("btnAgregar");
  const btnActualizar = document.getElementById("btnActualizar");

  if (btnAgregar) btnAgregar.style.display = "none";
  if (btnActualizar) btnActualizar.style.display = "none";

  if (!usuario) return;

  if (usuario.tipoUsuario === 'RESIDENTE') {
    if (btnAgregar) btnAgregar.style.display = "block";
  } else if (usuario.tipoUsuario === 'GERENTE') {
    if (btnActualizar) btnActualizar.style.display = "block";
  }
}

function puedeEditar() {
  return usuario && usuario.tipoUsuario === "GERENTE";
}

function puedeSubir() {
  return usuario && usuario.tipoUsuario === 'RESIDENTE';
}

function puedeDescargar() {
  if (!usuario) return false;
  return ['GERENTE', 'ADMINISTRACION', 'RESIDENTE'].includes(usuario.tipoUsuario);
}

// --- Lógica de Carga y Pintado de Tabla ---

async function cargarMovimientos() {
  try {
    const response = await fetch(`/api/v1/movobra/${idObra}/REPORTES/REPORTES`);
    if (!response.ok) throw new Error("Error al obtener movimientos");
    const movimientos = await response.json();
    movimientosGlobal = movimientos;
    pintarTabla(movimientos);
  } catch (error) {
    console.error("Error en cargarMovimientos:", error);
    Swal.fire('Error', 'No se pudieron cargar los movimientos', 'error');
  }
}

function pintarTabla(movimientos) {
  const tbody = document.getElementById("tablaBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!movimientos || movimientos.length === 0) return;

  const editable = puedeEditar();

  movimientos.forEach((mov, index) => {
    const fecha = formatearFecha(mov.fechasubida);
    const nombrePerfecto = `${mov.nombreobra}-${mov.nombre}`;
    const urlSegura = `/api/v1/archivos/descargar?categoria=${encodeURIComponent(mov.bucket)}&url=${encodeURIComponent(mov.url)}&nombrePersonalizado=${encodeURIComponent(nombrePerfecto)}`;

    // --- Archivo ---
    let archivoHtml = '';
    if (puedeDescargar()) {
      archivoHtml = `<a href="#" class="link-activo descargar-archivo" data-url="${urlSegura}" data-id="${mov.movobraid}" data-estado="${mov.estado}">${mov.nombre}</a>`;
    } else {
      archivoHtml = `<span class="link-deshabilitado">${mov.nombre}</span>`;
    }

    // --- Estado ---
    let estadoHtml = '';
    if (editable) {
      estadoHtml = `
        <select class="estado-select" data-id="${mov.movobraid}">
          <option value="PENDIENTE" ${mov.estado === "PENDIENTE" ? "selected" : ""} disabled>PENDIENTE</option>
          <option value="REVISADO" ${mov.estado === "REVISADO" ? "selected" : ""}>REVISADO</option>
          <option value="ACEPTADO" ${mov.estado === "ACEPTADO" ? "selected" : ""}>ACEPTADO</option>
          <option value="RECHAZADO" ${mov.estado === "RECHAZADO" ? "selected" : ""}>RECHAZADO</option>
        </select>
      `;
    } else {
      estadoHtml = `<span style="font-weight:bold;">${mov.estado || 'PENDIENTE'}</span>`;
    }

    // --- Observaciones ---
    let obsHtml = editable
      ? `<td contenteditable="true" class="observaciones" data-id="${mov.movobraid}">${mov.observaciones ?? ''}</td>`
      : `<td>${mov.observaciones ?? ''}</td>`;

    // --- Construcción de Fila y Colores ---
    const fila = document.createElement('tr');
    fila.dataset.id = mov.movobraid;

    switch (mov.estado) {
      case 'RECHAZADO': fila.style.backgroundColor = '#ffe6e6'; break;
      case 'ACEPTADO': fila.style.backgroundColor = '#e6ffe6'; break;
      case 'REVISADO': fila.style.backgroundColor = '#fffbeb'; break;
      default: fila.style.backgroundColor = ''; break;
    }

    fila.innerHTML = `
      <td>${index + 1}</td>
      <td>${fecha}</td>
      <td>${mov.tipousuarioregistra || 'RESIDENTE'}</td>
      <td class="file-cell">${archivoHtml}</td>
      <td>${estadoHtml}</td>
      ${obsHtml}
    `;

    tbody.appendChild(fila);
  });

  configurarListenersDescarga();
  aplicarPermisosPorRol();
}

/**
 * Configura los listeners para descargas.
 * El Gerente actualiza a "REVISADO" automáticamente.
 */
function configurarListenersDescarga() {
  document.querySelectorAll(".descargar-archivo").forEach(link => {
    link.addEventListener("click", async function (e) {
      e.preventDefault();

      const urlDescarga = this.dataset.url;
      const movimientoId = this.dataset.id;
      const estadoActual = this.dataset.estado;

      if (usuario && usuario.tipoUsuario === 'GERENTE' && estadoActual !== 'ACEPTADO' && estadoActual !== 'RECHAZADO') {
        try {
          await actualizarCampo(movimientoId, { estado: "REVISADO" });
          this.dataset.estado = "REVISADO";
          const selectEnFila = this.closest('tr')?.querySelector('.estado-select');
          if (selectEnFila) selectEnFila.value = "REVISADO";
        } catch (error) {
          console.error("Error al actualizar estado a REVISADO:", error);
        }
      }

      window.location.href = urlDescarga;
    });
  });
}

// --- Lógica de Actualización (GERENTE) ---

async function actualizarTabla() {
  const filas = document.querySelectorAll("#tablaBody tr");
  const updates = [];

  filas.forEach(fila => {
    const id = fila.dataset.id;
    if (!id) return;

    const estadoSelect = fila.querySelector(".estado-select");
    const observacionesTd = fila.querySelector(".observaciones");

    const estado = estadoSelect ? estadoSelect.value : null;
    const observaciones = observacionesTd ? observacionesTd.innerText.trim() : null;

    if (estado || observaciones !== null) {
      updates.push({ id, estado, observaciones });
    }
  });

  if (updates.length === 0) {
    Swal.fire('Sin cambios', 'No hay datos para actualizar', 'info');
    return;
  }

  Swal.fire({ title: 'Guardando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const promises = updates.map(item => actualizarCampo(item.id, { estado: item.estado, observaciones: item.observaciones }));
    await Promise.all(promises);

    Swal.fire({ title: 'Actualizado', text: 'Cambios guardados', icon: 'success', timer: 1500, showConfirmButton: false });
    cargarMovimientos();
  } catch (error) {
    console.error("Error en actualizarTabla:", error);
    Swal.fire('Error', 'No se pudieron guardar los cambios', 'error');
  }
}

async function actualizarCampo(id, data) {
  const response = await fetch(`/api/v1/movobra/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error(`Error al actualizar`);
}

// --- Lógica de Subida de Archivos (RESIDENTE) ---

async function manejarBotonAgregar(e) {
  e.preventDefault();

  if (!puedeSubir()) {
    Swal.fire('Acceso denegado', 'No tienes permiso para subir archivos', 'error');
    return;
  }

  if (modoAgregar) {
    agregarFila();
    document.getElementById("btnAgregar").textContent = "Guardar";
    modoAgregar = false;
  } else {
    await guardarArchivo();
  }
}

function agregarFila() {
  const tbody = document.getElementById("tablaBody");
  const numeroFila = tbody.children.length + 1;

  const fila = document.createElement('tr');
  // Se crea la fila nueva con el input file
  fila.innerHTML = `
    <td>${numeroFila}</td>
    <td>-</td>
    <td>${usuario.tipoUsuario}</td>
    <td class="file-cell">
      <input type="file" class="input-file" accept=".pdf,.csv,.xls,.xlsx">
    </td>
    <td>PENDIENTE</td>
    <td></td>
  `;

  tbody.appendChild(fila);
}

async function guardarArchivo() {
  const tbody = document.getElementById("tablaBody");
  const ultimaFila = tbody.lastElementChild;
  const input = ultimaFila.querySelector(".input-file");

  if (!input || !input.files.length) {
    Swal.fire('Aviso', 'Debe seleccionar un archivo', 'warning');
    return;
  }

  const file = input.files[0];

  if (file.size > 10 * 1024 * 1024) {
    Swal.fire('Error', 'El archivo no puede superar los 10MB', 'error');
    return;
  }

  const formData = new FormData();
  formData.append("tipoEntidad", "REPORTES");
  formData.append("movobraId", idObra);
  formData.append("categoria", "REPORTES");
  formData.append("file", file);

  Swal.fire({ title: 'Subiendo archivo...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const responseArchivo = await fetch("/api/v1/archivos", { method: "POST", body: formData });
    if (!responseArchivo.ok) throw new Error("Error al subir archivo físico");

    const archivoId = await responseArchivo.text();

    const movobraBody = {
      obraId: idObra,
      tipoMovimiento: "REPORTES",
      usuarioRegistraId: usuario.id,
      archivoId: archivoId,
      estado: "PENDIENTE"
    };

    const responseMov = await fetch("/api/v1/movobra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movobraBody)
    });

    if (!responseMov.ok) throw new Error("Error al registrar movimiento en BD");

    Swal.fire({ title: '¡Éxito!', text: 'Archivo subido correctamente', icon: 'success', timer: 1500, showConfirmButton: false });

    resetearEstadoSubida();

  } catch (error) {
    console.error("Error en guardarArchivo:", error);
    Swal.fire('Error', 'Fallo en el proceso de subida', 'error');
  }
}

function resetearEstadoSubida() {
  // Solo regresamos el botón a su estado normal y recargamos la tabla
  // cargarMovimientos() limpiará la tabla y traerá todo fresco del servidor
  const btn = document.getElementById("btnAgregar");
  btn.textContent = "Agregar Reporte";
  modoAgregar = true;
  cargarMovimientos();
}
