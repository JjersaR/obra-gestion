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
  //cargar datos de la obra
  const obraResponse = await fetch(`/api/v1/obras/detalles/${id}`);
  if (!obraResponse.ok) {
    throw new Error("No se pudo obtener la obra");
  }

  const obra = await obraResponse.json();
  document.title = `Detalle - ${obra.nombre}`;
  pintarObra(obra);

  ///cargar archivos 
  const archivoResponse = await fetch(`/api/v1/archivos/${id}`);
  if (!archivoResponse.ok) {
    throw new Error("No se pudo obtener el archivo");
  }

  const textoArchivos = await archivoResponse.text();
  // Si Java manda en blanco, forzamos un arreglo vacío [], si trae datos los convertimos a JSON
  const archivos = textoArchivos ? JSON.parse(textoArchivos) : [];
  pintarArchivos(archivos, obra.nombre);


  actualizarGastoManoObra(id);
  // 1. REGISTRAMOS (Usa await para esperar a que se guarde)
    await registrarIngreso(id); 
    
    // 2. CARGAMOS (Traemos la lista actualizada)
    await cargarHistorialRevisiones(id);
    // Solo buscamos si hay reportes, pero NO los mostramos ni descargamos todavía
    await cargarDatosVisualizadores(id);
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

        // CORRECCIÓN: Agregamos try...catch para que, si falla en la obra 2, no detenga la pantalla
        try{
          const response =await fetch('/api/v1/visualizacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
                console.warn("El servidor no pudo registrar la visita. Código:", response.status);
            }
        } catch (error) {
            console.error("Error de red al intentar registrar la visualización:", error);
        }
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
        let fechaLimpia = "---";
        let horaFinal = "--- hrs";

        if (rev.fecha) {
            // Si la fecha de Java no indica la zona horaria, le agregamos una 'Z' (Zulu/UTC)
            // Esto le dice al navegador: "Oye, esta hora es de Londres"
            let fechaUTC = rev.fecha;
            if (!fechaUTC.endsWith('Z') && !fechaUTC.includes('+')) {
                fechaUTC += 'Z'; 
            }

            // Al crear el Date, tu navegador le resta automáticamente tus 6 horas locales
            const fechaObj = new Date(fechaUTC);

            // Extraemos el día, mes y año ya convertidos a tu zona horaria
            const dia = String(fechaObj.getDate()).padStart(2, '0');
            const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
            const anio = fechaObj.getFullYear();

            // Extraemos la hora local asegurando el formato de 24 horas (00 a 23)
            const horas = String(fechaObj.getHours()).padStart(2, '0');
            const minutos = String(fechaObj.getMinutes()).padStart(2, '0');

            fechaLimpia = `${dia}/${mes}/${anio}`;
            horaFinal = `${horas}:${minutos} hrs`;
        }

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
// --- AGREGA ESTA LÍNEA ---
  // Guardamos el estatus para que 'requerimientos.js' sepa si puede dejar subir archivos
  localStorage.setItem(`estatus_obra_${id}`, obra.status);
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


// --- LÓGICA DE VISUALIZACIÓN MIXTA ---
// Variable para guardar los datos y no pedirlos cada vez
let datosReporteAceptado = null;

async function cargarDatosVisualizadores(idObra) {
    try {
        // Buscamos el reporte en tu historial de REPORTES/REPORTES
        const res = await fetch(`/api/v1/movobra/${idObra}/REPORTES/REPORTES`);
        if (res.ok) {
            const movimientos = await res.json();
            // Buscamos el último ACEPTADO
            datosReporteAceptado = movimientos.reverse().find(m => m.estado === "ACEPTADO");
        }
    } catch (e) {
        console.error("Error al buscar reportes:", e);
    }
}

async function verPdf() {
    const visor = document.getElementById('visorPrincipal');
    
    // 1. Limpiamos el visor antes de empezar para que no se vea el viejo mientras carga
    visor.innerHTML = `<div style="text-align:center; padding-top:250px;">⏳ Cargando el reporte más reciente...</div>`;

    if (!datosReporteAceptado) {
        visor.innerHTML = `<div style="text-align:center; padding-top:250px; color:#e53e3e;">⚠️ No hay reportes aceptados.</div>`;
        return;
    }

    try {
        const urlFetch = `/api/v1/archivos/descargar?categoria=${encodeURIComponent(datosReporteAceptado.bucket)}&url=${encodeURIComponent(datosReporteAceptado.url)}`;
        const res = await fetch(urlFetch);
        const blob = await res.blob();
        
        // 2. IMPORTANTE: Creamos una URL nueva cada vez
        const urlVistaPrevia = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));

        visor.innerHTML = `<iframe src="${urlVistaPrevia}" width="100%" height="100%" style="border:none;"></iframe>`;
        
    } catch (err) {
        visor.innerHTML = `<div style="text-align:center; padding-top:250px;">❌ Error al conectar con el servidor.</div>`;
    }
}
