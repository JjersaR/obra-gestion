document.addEventListener("DOMContentLoaded", function () {
  cargarObra();
});

let id = "";

function obtenerId() {
  // Busca el ID tanto si la URL es /detalles/123 como si es /detalles?id=123
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('id')) {
      return urlParams.get('id');
  }
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
  pintarArchivos(archivos, obra.nombre);
}

function pintarObra(obra) {
  document.getElementById("nombreObra").textContent = obra.nombre.toUpperCase();
  document.getElementById("fechaInicio").textContent = formatearFecha(obra.fechaInicio);
  document.getElementById("fechaFin").textContent = formatearFecha(obra.fechaFin);

  document.getElementById("monto").textContent = "$" + Number(obra.montoAntesIva)
      .toLocaleString("es-MX", { minimumFractionDigits: 2 });

  document.getElementById("gerente").textContent = obra.gerente;
  document.getElementById("residente").textContent = obra.residente;
  document.getElementById("status").textContent = obra.status;

  // --- LÓGICA DEL SEMÁFORO (Indicador de Programa) ---
  const alertaPrograma = document.getElementById("indicadorPrograma");
  
  if (alertaPrograma) {
    // 1. Limpiamos clases previas
    alertaPrograma.classList.remove("det-status-rojo", "det-status-amarillo", "det-status-verde");
    
    // 2. Aplicamos la nueva clase de color
    alertaPrograma.classList.add(`det-status-${obra.semaforo.toLowerCase()}`);
    
    // 3. Cambiamos el texto por el mensaje que viene de Java
    let emoji = obra.semaforo === "ROJO" ? "🚨 " : (obra.semaforo === "AMARILLO" ? "⚠️ " : "✅ ");
    alertaPrograma.innerHTML = `<span>${emoji} ${obra.mensajeTiempo}</span>`;
  }
}


function pintarArchivos(archivos, nombreObra) {
  const grid = document.getElementById("documentosGrid");
  grid.innerHTML = "";
  // Si la obra es nueva y no tiene archivos, mostramos un mensajito
  if (!archivos || archivos.length === 0) {
      grid.innerHTML = "<p style='color: #7f8c8d; font-size: 0.9rem;'>Aún no hay documentos subidos para esta obra.</p>";
      return;
  }

  // Quitamos los espacios del nombre de la obra para que el archivo se vea profesional
  const obraLimpia = nombreObra.replace(/\s+/g, '_');

  archivos.forEach(archivo => {
    // Armamos el nombre perfecto: Ej. Hospital_Sur-Cotizacion_Acero.pdf
    const nombrePerfecto = `${obraLimpia}-${archivo.nombre}`;

    // Agregamos el &nombrePersonalizado a la ruta
    const urlSegura = `/api/v1/archivos/descargar?categoria=${encodeURIComponent(archivo.categoria)}&url=${encodeURIComponent(archivo.url)}&nombrePersonalizado=${encodeURIComponent(nombrePerfecto)}`;
    
    const tarjeta = `
      <div class="doc-item">
        <span class="doc-icon">📄</span>
        <div class="doc-info">
          <span class="doc-name"> ${archivo.categoria} </span>
          <a href="${urlSegura}" class="btn-download"> Descargar </a>
        </div>
      </div>
    `;
    grid.insertAdjacentHTML("beforeend", tarjeta);
  });
}

function formatearFecha(fecha) {
//Agregamos el "T00:00:00" para evitar que la zona horaria le reste un día a tu fecha
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-MX");
}
