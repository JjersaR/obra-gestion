const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
document.addEventListener("DOMContentLoaded", function () {
  getObras();

  // Activamos el filtro por status
  const selectFiltro = document.getElementById('filtroStatus');

  // 


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
// 2. Definimos quiénes tienen permiso de ver el botón de cierre
  const rolesAutorizados = ['JEFE', 'GERENTE'];
  const puedeCerrar = usuarioLogueado && rolesAutorizados.includes(usuarioLogueado.tipoUsuario);

  obras.forEach((obra, index) => {
    // 1. Mantenemos tus clases de estatus originales
    const statusClass = obra.status === "EJECUCION" ? "status-execution" : "status-closing";
    const statusText = obra.status === "EJECUCION" ? "en proceso de ejecución" : "en cierre";

    // 2. NUEVO: Obtenemos la clase del semáforo calculada en Java (status-rojo, status-amarillo, status-verde)
    const semaforoClass = `status-${obra.semaforo.toLowerCase()}`;

    const numeroObra = String(index + 1).padStart(2, "0");

    // 3. Aplicamos AMBAS clases a la tarjeta: la de ejecución y la del semáforo de tiempo
    const tarjeta = `
      <div class="obra-card ${statusClass} ${semaforoClass}" data-status="${obra.status}">
        <div class="obra-card-header">
          <span class="obra-id">OBRA ${numeroObra}</span>
          <span class="obra-status">${statusText}</span>
        </div>

        <div class="obra-card-body">
          <p class="obra-detail-pair"><strong>NOMBRE O NÚMERO:</strong> <span>${obra.nombre}</span></p>
          <p class="obra-detail-pair"><strong>CLIENTE:</strong> <span>${obra.cliente}</span></p>
          <p class="obra-detail-pair"><strong>MONTO ANTES DE IVA:</strong> <span>$${Number(obra.montoAntesIva).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></p>
          <p class="obra-detail-pair"><strong>FECHA INICIO:</strong> <span>${formatearFecha(obra.fechaInicio)}</span></p>
          <p class="obra-detail-pair"><strong>FECHA TERMINACIÓN:</strong> <span>${formatearFecha(obra.fechaFin)}</span></p>

          <div class="obra-tiempo-msg">${obra.mensajeTiempo}</div>

          <div class="obra-actions" style="display: flex; gap: 10px; margin-top: 15px;">
            <a href="/obras/detalles/${obra.id}" class="btn-detalle" style="flex: 1; text-align: center; background-color: #2c3e50; color: white; padding: 10px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              DETALLES DE OBRA
            </a>

            ${obra.status === 'EJECUCION' && puedeCerrar ? `
              <button onclick="confirmarCierreObra('${obra.id}')" class="btn-cerrar-obra" style="flex: 1; background: #e74c3c; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                CERRAR OBRA
              </button>
            ` : ''}
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


// Es para volver el Status de la obra a CIERRE
function confirmarCierreObra(idObra) {

  // 1. Validar roles permitidos: JEFE y GERENTE
    const rolesAutorizados = ['JEFE', 'GERENTE'];
    if (!usuarioLogueado || !rolesAutorizados.includes(usuarioLogueado.tipoUsuario)) {
        Swal.fire({
            title: 'Acceso Denegado',
            text: 'Solo el perfil de JEFE o GERENTE puede cerrar obras.',
            icon: 'error',
            confirmButtonColor: '#2c3e50'
        });
        return; // Detenemos la ejecución
    }

    Swal.fire({
        title: '¿Pasar obra a Cierre?',
        text: "Al confirmar, el estatus de esta obra cambiará permanentemente a CIERRE. ¿Estás seguro?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2c3e50', // Tu azul corporativo
        cancelButtonColor: '#e74c3c', // Rojo para cancelar
        confirmButtonText: 'Sí, cerrar obra',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            ejecutarCambioEstatus(idObra, 'CIERRE');
        }
    });
}

// Mandamos la orden a Java
async function ejecutarCambioEstatus(idObra, nuevoEstatus) {
    try {
        // Hacemos una petición PATCH (ideal para actualizar un solo campo)
        const response = await fetch(`/api/v1/obras/${idObra}/estatus`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            // Mandamos el nuevo estatus en formato JSON
            body: JSON.stringify({ status: nuevoEstatus }) 
        });

        if (response.ok) {
            Swal.fire({
                title: '¡Obra Cerrada!',
                text: 'El estatus se ha actualizado correctamente.',
                icon: 'success',
                confirmButtonColor: '#2c3e50'
            });
             
            // la pantalla se actualice sola sin tener que recargar el navegador
            getObras(); 
            
        } else if (response.status === 403) {
            // Si un Residente intenta hacer trampa invocando la función, Java lo bloquea
            Swal.fire('Acceso Denegado', 'Solo el perfil de GERENTE puede cerrar obras.', 'error');
        } else {
            Swal.fire('Acceso Denegado', 'No tienes los permisos suficientes (JEFE/GERENTE) para realizar esta acción.', 'error');} 
    } catch (error) {
        console.error("Error:", error);
        Swal.fire('Error de conexión', 'No pudimos comunicarnos con el servidor.', 'error');
    }
}