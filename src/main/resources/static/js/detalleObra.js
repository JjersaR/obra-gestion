document.addEventListener("DOMContentLoaded", function () {
  cargarObra();
});

let id = "";

function obtenerId() {
  const partes = window.location.pathname.split("/");
  return partes[partes.length - 1];
}

async function cargarObra() {

  id = obtenerId();

  const obraResponse = await fetch(`/api/v1/obras/detalles/${id}`);

  if (!obraResponse.ok) {
    throw new Error("No se pudo obtener la obra");
  }

  const obra = await obraResponse.json();

  document.title = `Detalle - ${obra.nombre}`;

  pintarObra(obra);

  const archivoResponse = await fetch(`/api/v1/archivos/${id}`);

  if (!archivoResponse.ok) {
    throw new Error("No se pudo obtener el archivo");
  }

  const archivos = await archivoResponse.json();

  pintarArchivos(archivos);
}

function pintarObra(obra) {

  document.getElementById("nombreObra").textContent =
    obra.nombre.toUpperCase();

  document.getElementById("fechaInicio").textContent =
    formatearFecha(obra.fechaInicio);

  document.getElementById("fechaFin").textContent =
    formatearFecha(obra.fechaFin);

  document.getElementById("monto").textContent =
    "$" + Number(obra.montoAntesIva)
      .toLocaleString("es-MX", { minimumFractionDigits: 2 });

  document.getElementById("gerente").textContent = obra.gerente;

  document.getElementById("residente").textContent = obra.residente;

  document.getElementById("status").textContent = obra.status;

}

function pintarArchivos(archivos) {
  const grid = document.getElementById("documentosGrid");
  grid.innerHTML = "";

  archivos.forEach(archivo => {
    const tarjeta = `
      <div class="doc-item">
        <span class="doc-icon">📄</span>
        <div class="doc-info">
          <span class="doc-name">
            ${archivo.categoria}
          </span>
          <a href="${archivo.url}"
             target="_blank"
             class="btn-download">
            Descargar
          </a>
        </div>
      </div>
    `;

    grid.insertAdjacentHTML("beforeend", tarjeta);
  });
}

function formatearFecha(fecha) {
  return new Date(fecha)
    .toLocaleDateString("es-MX");
}
