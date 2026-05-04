const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
document.addEventListener("DOMContentLoaded", function () {
  getObras();

  // Activamos el filtro por status
  const selectFiltro = document.getElementById('filtroStatus');

  if (selectFiltro) {
    selectFiltro.addEventListener('change', function () {
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
  //PERMISO DE PRESUPUESTOS PARA EDITAR FECHA Y ARCHIVOS
  const puedeEditar = usuarioLogueado && usuarioLogueado.tipoUsuario === 'PRESUPUESTOS';

  obras.forEach((obra, index) => {
    // 1. Mantenemos tus clases de estatus originales
    const statusClass = obra.status === "EJECUCION" ? "status-execution" : "status-closing";
    const statusText = obra.status === "EJECUCION" ? "en proceso de ejecución" : "en cierre";

    // 2. NUEVO: Obtenemos la clase del semáforo calculada en Java (status-rojo, status-amarillo, status-verde)
    const semaforoClass = `status-${obra.semaforo.toLowerCase()}`;
    const numeroObra = String(index + 1).padStart(2, "0");

    // Preparamos las fechas por si vienen nulas
    const fechaInicioValida = obra.fechaInicio ? obra.fechaInicio : '';
    const fechaFinValida = obra.fechaFin ? obra.fechaFin : '';

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

            ${puedeEditar ? `
              <button onclick="abrirModalEdicion('${obra.id}', '${obra.nombre}','${obra.montoAntesIva}','${fechaInicioValida}', '${fechaFinValida}', '${obra.residente}')" class="btn-editar-obra" style="flex: 1; min-width: 120px; background: #f39c12; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                EDITAR OBRA
              </button>
            ` : ''}

            ${obra.status === 'EJECUCION' && puedeCerrar ? `
              <button onclick="confirmarCierreObra('${obra.id}')" class="btn-cerrar-obra" style="flex: 1; background: #e74c3c; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                CERRAR OBRA
              </button>
            ` : ''}

            ${puedeEditar ? `
              <button onclick="confirmarEliminarObra('${obra.id}')" class="btn-eliminar-obra" style="flex: 1; min-width: 120px; background: #c0392b; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                ELIMINAR
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
  if (!fecha) return "---";
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

async function confirmarEliminarObra(idObra) {
  const result = await Swal.fire({
    title: '¿Eliminar obra?',
    html: `¿Estás seguro de que deseas eliminar la obra esta obra?<br><br>
               <span style="color: #e74c3c;">⚠️ Esta acción es irreversible y eliminará todos los datos asociados a la obra (movimientos, archivos, etc.).</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#c0392b',
    cancelButtonColor: '#2c3e50',
    confirmButtonText: 'Sí, eliminar obra',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  });

  if (result.isConfirmed) {
    await eliminarObra(idObra);
  }
}

// Función para eliminar la obra
async function eliminarObra(idObra) {
  // Mostrar loading
  Swal.fire({
    title: 'Eliminando obra...',
    text: 'Por favor espere',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const response = await fetch(`/api/v1/obras?id=${idObra}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = 'Error al eliminar la obra';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Éxito al eliminar
    Swal.fire({
      title: '¡Eliminada!',
      text: `La obra ha sido eliminada correctamente`,
      icon: 'success',
      confirmButtonColor: '#2c3e50',
      timer: 2000,
      showConfirmButton: true
    });

    // Recargar la lista de obras
    getObras(); // Tu función para cargar las obras

  } catch (error) {
    console.error('Error al eliminar obra:', error);
    Swal.fire({
      title: 'Error',
      text: error.message || 'No se pudo eliminar la obra',
      icon: 'error',
      confirmButtonColor: '#e74c3c'
    });
  }
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
      Swal.fire('Acceso Denegado', 'No tienes los permisos suficientes (JEFE/GERENTE) para realizar esta acción.', 'error');
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire('Error de conexión', 'No pudimos comunicarnos con el servidor.', 'error');
  }
}



// --- LÓGICA DE EDICIÓN MODAL  PARA PRESUPUESTOS ---

document.addEventListener("DOMContentLoaded", () => {
  // Escuchar cambios en las fechas del modal para calcular semanas
  const inputInicio = document.getElementById("editFechaInicio");
  const inputFin = document.getElementById("editFechaTerminacion");

  if (inputInicio && inputFin) {
    inputInicio.addEventListener("change", calcularSemanasModal);
    inputFin.addEventListener("change", calcularSemanasModal);
  }

  // Manejar el envío del formulario de edición
  const formEdicion = document.getElementById("formEdicionObra");
  if (formEdicion) {
    formEdicion.addEventListener("submit", guardarEdicionObra);
  }
});

function abrirModalEdicion(idObra, nombre, monto, fechaInicio, fechaFin, residente) {
  document.getElementById("editIdObra").value = idObra;

  document.getElementById("editNombreObra").value = nombre !== 'null' ? nombre : "";
  document.getElementById("editMontoObra").value = monto !== 'null' ? monto : "";
  document.getElementById("editFechaInicio").value = fechaInicio;
  document.getElementById("editFechaTerminacion").value = fechaFin;
  document.getElementById("editResidenteObra").value = (residente && residente !== 'null' && residente !== 'undefined') ? residente : "";
  document.getElementById("editArchivoDoc").value = "";
  document.getElementById("editCategoriaDoc").value = "";

  calcularSemanasModal();
  document.getElementById("modalEdicion").style.display = "flex";
}

function cerrarModalEdicion() {
  document.getElementById("modalEdicion").style.display = "none";
}

function calcularSemanasModal() {
  const fechaInicioInput = document.getElementById("editFechaInicio").value;
  const fechaFinInput = document.getElementById("editFechaTerminacion").value;

  if (!fechaInicioInput || !fechaFinInput) {
    document.getElementById("editNumeroSemanas").value = "";
    return;
  }
  // NUEVO: Extraemos los años para saber si el usuario ya terminó de escribir
  const añoInicio = parseInt(fechaInicioInput.split('-')[0]);
  const añoFin = parseInt(fechaFinInput.split('-')[0]);

  // Si está tecleando y el año es menor a 2000 (ej. "202"), nos detenemos y no alertamos nada aún
  if (añoInicio < 2000 || añoFin < 2000) {
    return;
  }

  const inicio = new Date(fechaInicioInput);
  const fin = new Date(fechaFinInput);

  if (fin < inicio) {
    Swal.fire('Error', 'La fecha final no puede ser menor a la inicial', 'warning');
    document.getElementById("editNumeroSemanas").value = "";
    document.getElementById("editFechaTerminacion").value = "";
    return;
  }

  const diferenciaMs = fin - inicio;
  const semanas = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24 * 7)) + 1;
  document.getElementById("editNumeroSemanas").value = semanas;
}

// Constantes
const LIMITE_SUBIDA_DIRECTA = 100 * 1024 * 1024; // 100MB

// Función central — decide qué flujo usar
async function subirArchivo(tipoEntidad, movobraId, categoria, file, version = 1) {
  const esManoObra = categoria === "MANO_OBRA";
  const esGrande = file.size > LIMITE_SUBIDA_DIRECTA;

  if (esGrande && !esManoObra) {
    return await subirArchivoGrande(tipoEntidad, movobraId, categoria, file, version);
  } else {
    return await subirArchivoPequeno(tipoEntidad, movobraId, categoria, file);
  }
}

// Flujo original — no cambia nada del backend
async function subirArchivoPequeno(tipoEntidad, movobraId, categoria, file) {
  const formData = new FormData();
  formData.append("tipoEntidad", tipoEntidad);
  formData.append("movobraId", movobraId);
  formData.append("categoria", categoria);
  formData.append("file", file);

  const response = await fetch("/api/v1/archivos", {
    method: "POST",
    body: formData
  });

  if (!response.ok) throw new Error("Error subiendo archivo");
  return await response.text();
}

// Flujo SAS — para archivos grandes
async function subirArchivoGrande(tipoEntidad, movobraId, categoria, file, version) {
  try {
    // Paso 1 — pedir SAS URL
    const params = new URLSearchParams({
      tipoEntidad: tipoEntidad,
      movobraId: movobraId,
      categoria: categoria,
      version: version,
      filename: file.name,
      contentType: file.type
    });

    const sasRes = await fetch(`/api/v1/archivos/sas-url?${params}`);
    if (!sasRes.ok) {
      const errorText = await sasRes.text();
      throw new Error(`Error obteniendo SAS URL: ${sasRes.status} ${errorText}`);
    }

    const { sasUrl, objectKey } = await sasRes.json();

    // Paso 2 — subir directo a Azure
    const uploadRes = await fetch(sasUrl, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type
      },
      body: file
    });

    if (!uploadRes.ok) {
      throw new Error(`Error subiendo archivo a Azure: ${uploadRes.status}`);
    }

    // Paso 3 — confirmar al backend
    const confirmRes = await fetch("/api/v1/archivos/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoEntidad: tipoEntidad,
        movobraId: movobraId,
        categoria: categoria,
        objectKey: objectKey,
        nombre: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
        version: version
      })
    });

    if (!confirmRes.ok) {
      const errorText = await confirmRes.text();
      throw new Error(`Error confirmando archivo: ${confirmRes.status} ${errorText}`);
    }

    return objectKey;

  } catch (error) {
    console.error("Error en subirArchivoGrande:", error);
    throw error;
  }
}

// Tu función guardarEdicionObra modificada
async function guardarEdicionObra(e) {
  e.preventDefault();
  const idObra = document.getElementById("editIdObra").value;

  // 1. Extraemos validando que no estén vacíos para evitar el NaN
  const nombreVal = document.getElementById("editNombreObra").value;
  const montoVal = document.getElementById("editMontoObra").value;
  const residenteVal = document.getElementById("editResidenteObra").value;

  const fechaInicioVal = document.getElementById("editFechaInicio").value;
  const fechaFinVal = document.getElementById("editFechaTerminacion").value;
  const semanasVal = document.getElementById("editNumeroSemanas").value;

  const dataFechas = {
    id: idObra,
    nombre: nombreVal,
    montoAntesIva: montoVal ? parseFloat(montoVal) : 0,
    residente: residenteVal,
    fechaInicio: fechaInicioVal ? fechaInicioVal : null,
    fechaFin: fechaFinVal ? fechaFinVal : null,
    noSemanas: semanasVal ? parseInt(semanasVal) : null
  };

  // 2. Datos del archivo
  const categoria = document.getElementById("editCategoriaDoc").value;
  const archivoInput = document.getElementById("editArchivoDoc");
  const archivo = archivoInput.files.length > 0 ? archivoInput.files[0] : null;

  if (archivo && !categoria) {
    Swal.fire('Atención', 'Si subes un archivo, debes seleccionar qué tipo de documento es.', 'warning');
    return;
  }

  // Validar tamaño de archivo para categorías específicas si es necesario
  if (archivo && categoria === "MANO_OBRA" && archivo.size > LIMITE_SUBIDA_DIRECTA) {
    Swal.fire('Atención', 'Los archivos de MANO_OBRA no pueden superar los 100MB. Por favor, comprime o divide el archivo.', 'warning');
    return;
  }

  try {
    // Enviar actualización de fechas
    const responseFechas = await fetch(`/api/v1/obras`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataFechas)
    });

    if (!responseFechas.ok) {
      const errorText = await responseFechas.text();
      throw new Error(`Error actualizando fechas: ${responseFechas.status} ${errorText}`);
    }

    // Variables para controlar qué mensaje le mostramos al usuario
    let mensajeAlerta = 'Las fechas se actualizaron correctamente.';
    let iconoAlerta = 'success';

    // Si hay archivo, lo subimos usando la nueva lógica
    if (archivo) {
      try {
        // Mostrar loading para la subida del archivo
        Swal.fire({
          title: 'Subiendo archivo...',
          text: 'Por favor espere, esto puede tomar unos momentos',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Usamos la nueva función centralizada
        const tipoEntidad = "REQUERIMIENTOS"; // o podrías hacerlo dinámico según el contexto
        const version = 1; // Puedes manejar versiones si es necesario

        await subirArchivo(tipoEntidad, idObra, categoria, archivo, version);

        mensajeAlerta = 'Las fechas y el documento se actualizaron correctamente.';

        // Cerrar el loading
        Swal.close();

      } catch (errorArchivo) {
        console.error("Error al subir documento:", errorArchivo);
        // Si falla el documento, avisamos que las fechas SÍ se guardaron
        mensajeAlerta = 'Las fechas se guardaron, pero hubo un problema al subir el documento: ' + errorArchivo.message;
        iconoAlerta = 'warning';
      }
    }

    Swal.fire('¡Proceso Terminado!', mensajeAlerta, iconoAlerta);
    cerrarModalEdicion();

    // Recargar las obras
    if (typeof getObras === 'function') {
      getObras(); // Recargar la tabla sin refrescar la página
    } else if (typeof cargarObras === 'function') {
      cargarObras();
    } else {
      location.reload(); // Fallback: recargar la página
    }

  } catch (error) {
    console.error("Error general:", error);
    Swal.fire('Error', error.message || 'Hubo un problema al comunicarse con el servidor.', 'error');
  }
}
