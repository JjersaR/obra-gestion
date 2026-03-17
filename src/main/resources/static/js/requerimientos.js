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

function cambiarBotonAGuardar() {
  const btn = document.getElementById("btnAgregar");
  btn.innerText = "Guardar";
  modoAgregar = false;
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
