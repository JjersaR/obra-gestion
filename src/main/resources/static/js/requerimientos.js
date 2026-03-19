document.addEventListener("DOMContentLoaded", function () {
  permisoBoton();
  controlarColumnasPorRol();
  document.getElementById("btnAgregar")
    .addEventListener("click", manejarBoton);
});

// Sacamos el texto guardado en la memoria
const usuarioString = localStorage.getItem('usuarioLogueado');

let modoAgregar = true;

function obtenerId() {
  // Busca el ID tanto si la URL es /detalles/123 como si es /detalles?id=123
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('id')) {
    return urlParams.get('id');
  }
  const partes = window.location.pathname.split("/");
  return partes[partes.length - 1];
}

document.getElementById("btnVolver")
  .addEventListener("click", function () {
    const id = obtenerId();
    window.location.href = `/obras/detalles/${id}`;
  });

function permisoBoton() {
  const btn = document.getElementById("btnAgregar");
  btn.style.display = "none";

  // Verificamos que sí exista algo guardado
  if (usuarioString) {
    // Lo volvemos a convertir en un objeto de JavaScript
    const usuario = JSON.parse(usuarioString);

    //Ocultar algo dependiendo del rol
    if (usuario.tipoUsuario === 'RESIDENTE') {
      document.getElementById("btnAgregar").style.display = "block";
    }
  }
}

function controlarColumnasPorRol() {

  const columnasAdmin = document.querySelectorAll(".col-admin");

  // Ocultar por defecto
  columnasAdmin.forEach(col => col.style.display = "none");

  if (usuarioString) {

    const usuario = JSON.parse(usuarioString);

    if (usuario.tipoUsuario === 'ADMINISTRACION') {
      columnasAdmin.forEach(col => col.style.display = "");
    }

  }
}

function pintarTabla(datos) {

  const tbody = document.getElementById("tablaBody");
  tbody.innerHTML = "";

  datos.forEach((item, index) => {
    const fila = `
      <tr>
        <td>${index + 1}</td>
        <td>${item.fecha}</td>
        <td>${item.rol}</td>
        <td>${item.nombre}</td>
        <td>${item.aceptado ? 'X' : ''}</td>
        <td>${item.rechazado ? 'X' : ''}</td>
        <td>${item.observaciones || ''}</td>
        <td class="col-admin">${item.pago || ''}</td>
        <td class="col-admin">${item.fechaPago || ''}</td>
        <td class="col-admin">${item.ficha || ''}</td>
        <td class="col-admin">${item.factura || ''}</td>
      </tr>
    `;

    tbody.insertAdjacentHTML("beforeend", fila);
  });

  // volver a evaluar el botón
  permisoBoton();
  controlarColumnasPorRol();
}

// Subir archivos
function agregarFila() {
  const tbody = document.getElementById("tablaBody");

  const numeroFila = tbody.children.length + 1;

  const fila = `
  <tr>
    <td>${numeroFila}</td>
    <td>-</td>
    <td>-</td>

    <td class="file-cell">
      <input type="file" class="input-file">
    </td>

    <td></td>
    <td></td>
    <td></td>

    <td class="col-admin"></td>
    <td class="col-admin"></td>
    <td class="col-admin"></td>
    <td class="col-admin"></td>

  </tr>`;

  tbody.insertAdjacentHTML("beforeend", fila);

  controlarColumnasPorRol();
}

<<<<<<< HEAD
<<<<<<< HEAD
// --- Lógica de Actualización (Botón Actualizar) ---

/**
 * Recolecta todos los cambios de la tabla (estado, observaciones, pagado) y los envía al API.
 */
async function actualizarTabla() {
  const filas = document.querySelectorAll("#tablaBody tr");
  const updates = [];
  const updatesPago = [];

  filas.forEach(fila => {
    const id = fila.dataset.id;
    if (!id) return;

    const estadoSelect = fila.querySelector(".estado-select");
    const observacionesTd = fila.querySelector(".observaciones");
    const pagadoCheckbox = fila.querySelector(".pagado-checkbox");

    const estado = estadoSelect ? estadoSelect.value : null;
    const observaciones = observacionesTd ? observacionesTd.innerText.trim() : null;
    const pagado = pagadoCheckbox ? pagadoCheckbox.checked : null;

    // Para pagado, solo procesamos si existe el checkbox (solo ADMIN lo ve)
    if (pagado !== null) {
      // Solo agregamos a updatesPago si el checkbox existe
      // Nota: No podemos comparar con el valor original fácilmente,
      // así que enviaremos siempre. El backend debe manejarlo.
      updatesPago.push({
        id
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

  if (updates.length === 0 && updatesPago.length === 0) {
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
        actualizarPago(item.id)
      );
      promises.push(...pagoPromises);
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
=======
=======
>>>>>>> eaeba9703c11f32c4545a4b8ec692047fa9c78c4
function cambiarBotonAGuardar() {
  const btn = document.getElementById("btnAgregar");
  btn.innerText = "Guardar";
  modoAgregar = false;
<<<<<<< HEAD
>>>>>>> 3cff0ba (Ya agrega requerimientos construccion)
=======
>>>>>>> eaeba9703c11f32c4545a4b8ec692047fa9c78c4
}

async function manejarBoton(e) {
  e.preventDefault();
  if (modoAgregar) {
    agregarFila();
    cambiarBotonAGuardar();
    modoAgregar = false;
  } else {
    await guardarArchivo();
  }
}

async function guardarArchivo() {
  const tbody = document.getElementById("tablaBody");
  const ultimaFila = tbody.lastElementChild;
  const input = ultimaFila.querySelector(".input-file");
  const id = obtenerId();


  if (!input || !input.files.length) {
    return;
  }

  const file = input.files[0];

  const formData = new FormData();

  formData.append("tipoEntidad", "REQUERIMIENTOS");
  formData.append("movobraId", id);
  formData.append("categoria", "REQUERIMIENTOS");
  formData.append("file", file);

  try {
    const response = await fetch("/api/v1/archivos", {
      method: "POST",
      body: formData
    });
    if (response.ok) {
      alert("Archivo subido correctamente");
      // reset UI
      resetearTablaYBoton();

      // opcional: recargar datos reales
      // cargarRequerimientos();

    } else {
      alert("Error al subir archivo");
    }

  } catch (error) {
    console.error(error);
    alert("Error de conexión");
  }
}

function resetearTablaYBoton() {

  const tbody = document.getElementById("tablaBody");
  tbody.innerHTML = "";

  const btn = document.getElementById("btnAgregar");

  btn.textContent = "Subir requerimiento";

  modoAgregar = true;
}
