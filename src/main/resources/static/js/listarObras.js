document.addEventListener("DOMContentLoaded", function () {
  getObras();

  // Activamos el filtro por status
  const selectFiltro = document.getElementById('filtroStatus');

  if (selectFiltro) {
    selectFiltro.addEventListener('change', function() {
      const estatusSeleccionado = this.value; // "TODOS", "EJECUCION" o "CIERRE"
      
      // Buscamos todas las tarjetas en el HTML
      const todasLasTarjetas = document.querySelectorAll('.obra-card');

      todasLasTarjetas.forEach(tarjeta => {
        const estatusObra = tarjeta.getAttribute('data-status');

        // Lógica de filtrado, si coincide-muestra; si no - ocultamos
        if (estatusSeleccionado === 'TODOS' || estatusObra === estatusSeleccionado) {
          tarjeta.style.display = ''; // Regresa a su estado visible
        } else {
          tarjeta.style.display = 'none'; // Desaparece al instante
        }
      });
    });
  }
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
    // 1. Mantenemos tus clases de estatus originales
    const statusClass = obra.status === "EJECUCION" ? "status-execution" : "status-closing";
    const statusText = obra.status === "EJECUCION" ? "en proceso de ejecución" : "en cierre";

    // 2. NUEVO: Obtenemos la clase del semáforo calculada en Java (status-rojo, status-amarillo, status-verde)
    const semaforoClass = `status-${obra.semaforo.toLowerCase()}`;

    const numeroObra = String(index + 1).padStart(2, "0");

    // 3. Aplicamos AMBAS clases a la tarjeta: la de ejecución y la del semáforo de tiempo
    const tarjeta = `
<<<<<<< HEAD
      <div class="obra-card ${statusClass} ${semaforoClass}" data-status="${obra.status}">
=======
      <div class="obra-card ${statusClass} ${semaforoClass}">
>>>>>>> 48b0bbfbe1e06883de9c16c51607f32b38744459

        <div class="obra-card-header">
          <span class="obra-id">OBRA ${numeroObra}</span>
          <span class="obra-status">${statusText}</span>
        </div>

        <div class="obra-card-body">
          <p class="obra-detail-pair">
            <strong>NOMBRE O NÚMERO:</strong>
            <span>${obra.nombre}</span>
          </p>

          <p class="obra-detail-pair">
            <strong>CLIENTE:</strong>
            <span>${obra.cliente}</span>
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

          <div class="obra-tiempo-msg">
            ${obra.mensajeTiempo}
          </div>

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
  // Usamos split para evitar problemas de zona horaria con el constructor de Date
  if(!fecha) return "---";
  const [year, month, day] = fecha.split('-');
  return `${day}/${month}/${year}`;
}