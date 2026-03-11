document.addEventListener("DOMContentLoaded", function () {
  getObras();
});

async function getObras() {
  try {
    const response = await fetch("/api/v1/obras");

    if (!response.ok) {
      throw new Error(response.status);
    }

    const data = await response.json();

    generarTarjetas(data);
  } catch (error) {
    const grid = document.getElementById("obrasGrid");
    grid.innerHTML = "<p>Error al cargar las obras</p>";
  }
}

function generarTarjetas(obras) {

  const grid = document.getElementById("obrasGrid");

  grid.innerHTML = "";

  if (!obras || obras.length === 0) {
    grid.innerHTML = "<p>No hay obras registradas</p>";
    return;
  }

  obras.forEach((obra, index) => {

    const statusClass =
      obra.status === "EJECUCION"
        ? "status-execution"
        : "status-closing";

    const statusText =
      obra.status === "EJECUCION"
        ? "en proceso de ejecución"
        : "en cierre";

    const numeroObra = String(index + 1).padStart(2, "0");

    const tarjeta = `
      <div class="obra-card ${statusClass}">

        <div class="obra-card-header">
          <span class="obra-id">OBRA ${numeroObra}</span>

          <span class="obra-status">
            ${statusText}
          </span>
        </div>

        <div class="obra-card-body">

          <p class="obra-detail-pair">
            <strong>NOMBRE O NÚMERO:</strong>
            <span>${obra.nombre}</span>
          </p>

          <p class="obra-detail-pair">
            <strong>MONTO ANTES DE IVA:</strong>
            <span>$${Number(obra.montoAntesIva).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
          </p>

          <p class="obra-detail-pair">
            <strong>FECHA INICIO:</strong>
            <span>${formatearFecha(obra.fechaInicio)}</span>
          </p>

          <p class="obra-detail-pair">
            <strong>FECHA TERMINACIÓN:</strong>
            <span>${formatearFecha(obra.fechaFin)}</span>
          </p>

          <p class="obra-detail-pair">
            <strong>GERENTE:</strong>
            <span>${obra.gerente}</span>
          </p>

          <p class="obra-detail-pair">
            <strong>RESIDENTE:</strong>
            <span>${obra.residente}</span>
          </p>

          <div class="obra-actions">
            <a href="/obras/detalles/${obra.id}" class="btn-detalle">
              DETALLES DE OBRA
            </a>
          </div>

        </div>
      </div>
    `;

    grid.insertAdjacentHTML("beforeend", tarjeta);
  });
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-MX");
}
