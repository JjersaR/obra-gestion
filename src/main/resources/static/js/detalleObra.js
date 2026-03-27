document.addEventListener("DOMContentLoaded", function () {
  cargarObra();
});

let id = "";
let montoAcordadoGlobal = 0;

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
  actualizarGastoManoObra(id);
  // 1. REGISTRAMOS (Usa await para esperar a que se guarde)
    await registrarIngreso(id); 
    
    // 2. CARGAMOS (Traemos la lista actualizada)
    await cargarHistorialRevisiones(id);
}

async function registrarIngreso(idObra) {
    // 1. Recuperamos el objeto del usuario que se guarda en el Login
    const sesion = localStorage.getItem('usuarioLogueado');
    
    if (sesion) {
        // 2. Lo convertimos de texto a un objeto real
        const usuario = JSON.parse(sesion);
        
        // 3. Extraemos el nombre y el rol
        const payload = {
            obraId: idObra,
            rol: usuario.tipoUsuario || "SIN_ROL", 
            usuarioId: usuario.nombre || "ANÓNIMO"
        };

        // 4. Enviamos el registro real a Java
        await fetch('/api/v1/visualizacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } else {
        console.warn("No hay sesión iniciada. No se registrará la visualización.");
    }
}  

async function cargarHistorialRevisiones(idObra) {
    try {
        const response = await fetch(`/api/v1/visualizacion/${idObra}`);
        if (!response.ok) throw new Error("Error al obtener historial");

        const revisiones = await response.json(); // Aquí se recibe la lista de Java

        // --- AQUÍ ES DONDE SE MANDA A LLAMAR ---
        pintarHistorial(revisiones); 

    } catch (error) {
        console.error("Fallo al cargar historial:", error);
    }
}

function pintarHistorial(revisiones) {
    const tbody = document.getElementById("tablaRevisiones");
    if (!tbody) return; // Seguridad por si el elemento no existe

    tbody.innerHTML = ""; // Limpiamos el nadie ha revisado

    if (revisiones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="texto-centro" style="padding: 20px; color: #718096;">Sin registros previos.</td></tr>`;
        return;
    }

    revisiones.forEach(rev => {
      //Fecha y hora
        const fechaObj = new Date(rev.fecha);
        // Extraemos día, mes y año forzando 2 dígitos (ej. 05 en vez de 5)
        const dia = String(fechaObj.getDate()).padStart(2, '0');
        const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const anio = fechaObj.getFullYear();

        // Extraemos la hora directamente en formato 24 hrs
        const horas = String(fechaObj.getHours()).padStart(2, '0');
        const minutos = String(fechaObj.getMinutes()).padStart(2, '0');
        // Armamos los textos limpios
        const fechaLimpia = `${dia}/${mes}/${anio}`;
        const horaFinal = `${horas}:${minutos} hrs`; // Le agregamos "hrs"

        //Inyección del html
        const fila = `
            <tr>
                <td><strong> ${rev.usuarioId} </strong></td>
                <td><span class="rol-etiqueta"> ${rev.rol} </span></td>
                <td>${fechaLimpia} a las ${horaFinal}</td>
                <td class="texto-centro">
                    <span class="badge-estado badge-visto">Visto</span>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", fila);
    });
}


function pintarObra(obra) {
  document.getElementById("nombreObra").textContent = obra.nombre.toUpperCase();
  document.getElementById("fechaInicio").textContent = formatearFecha(obra.fechaInicio);
  document.getElementById("fechaFin").textContent = formatearFecha(obra.fechaFin);
  montoAcordadoGlobal = Number(obra.montoAntesIva);
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

document.addEventListener("DOMContentLoaded", function () {
  const botones = document.querySelectorAll("[data-ruta]");

  botones.forEach(btn => {
    const ruta = btn.dataset.ruta;
    btn.href = `/obras/detalles/${ruta}/${id}`;
  });

});
async function actualizarGastoManoObra(movobraId) {
    const url = `/api/v1/archivos/gasto-mano-obra/${movobraId}`;

    try {
        const response = await fetch(url);
        const totalGasto = await response.json(); // Aquí recibimos los gastos
        
        // 1. Ponemos el monto en el cuadro de "GASTOS TOTALES"
        const elementoGasto = document.getElementById('totalGastoManoObra');
        if (elementoGasto) {
            elementoGasto.innerText = new Intl.NumberFormat('es-MX', { 
                style: 'currency', 
                currency: 'MXN' 
            }).format(totalGasto);
        }

        // 2. BUSCAMOS EL CUADRO DE ALERTA PARA PINTARLO
        //  id="indicadorCostoDirecto" en html 
        const elementoAlerta = document.getElementById('indicadorCostoDirecto');
        
        if (elementoAlerta) {
            // COMPARA Lo gastado es más que el presupuesto
            if (totalGasto > montoAcordadoGlobal) {
                // CASO ROJO: Te pasaste 
                elementoAlerta.textContent = "🚨 INDICADOR FUERA DE COSTO DIRECTO";
                elementoAlerta.style.backgroundColor = "#ff4d4d"; 
                elementoAlerta.style.color = "white";
                elementoAlerta.style.border = "2px solid #b30000";
            } else {
                // CASO VERDE: Todo bajo control 
                elementoAlerta.textContent = "✅ COSTO DENTRO DE PRESUPUESTO";
                elementoAlerta.style.backgroundColor = "#2ecc71"; 
                elementoAlerta.style.color = "white";
                elementoAlerta.style.border = "2px solid #1d8348";
            }
        }

    } catch (error) {
        console.error("Error al traer la lana del Excel:", error);
    }
}