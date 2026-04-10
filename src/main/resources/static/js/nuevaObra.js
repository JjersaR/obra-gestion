document.addEventListener('DOMContentLoaded', () => {
  let idObra = "";
  //Prohibicion de caracteres
  // Seleccionamos todos los campos de texto y el textarea
  const camposTexto = document.querySelectorAll('input[type="text"], textarea');

  camposTexto.forEach(campo => {
    campo.addEventListener('input', function () {
      // permite letras, acentos, ñ, números, espacios, puntos, comas y guiones
      // lo demás ($, %, &, <, >, {, }) lo borra
      this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,-]/g, '');
    });
  });

  // contar las semanas
  document.getElementById("fechaInicio")
    .addEventListener("change", calcularSemanas);

  document.getElementById("fechaTerminacion")
    .addEventListener("change", calcularSemanas);


  // Enviar datos sin archivos
  const form = document.getElementById('formNuevaObra');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Extraemos los valores primero para validarlos
    const fechaInicioVal = document.getElementById('fechaInicio').value;
    const fechaFinVal = document.getElementById('fechaTerminacion').value;
    const semanasVal = document.getElementById('numeroSemanas').value;
    const montoVal = document.getElementById('monto').value;

    // solo datos del texto
    const obraData = {
      nombre: document.getElementById('nombreObra').value,
      cliente: document.getElementById('cliente').value,
      // Validación: Si está vacío, mandamos 0 en lugar de NaN
      montoAntesIva: montoVal ? parseFloat(montoVal) : 0,
      // Si no hay fecha, enviamos null para que la BD lo acepte sin problemas
      fechaInicio: fechaInicioVal ? fechaInicioVal : null,
      fechaFin: fechaFinVal ? fechaFinVal : null,
      noSemanas: semanasVal ? parseInt(semanasVal) : null,
      gerente: document.getElementById('gerente').value,
      residente: document.getElementById('residente').value,
      observaciones: document.getElementById('observaciones').value,
      status: document.getElementById('status').value
    };

    try {
      // Mandamos el JSON limpiecito a tu backend
      const response = await fetch('/api/v1/obras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obraData)
      });

      if (response.status === 201) {
        // guardamos la obra
        idObra = await response.text();

        // Subir archivos con su propio control de errores
        let mensajeArchivos = 'Los datos se registraron correctamente en el sistema.';
        let iconoAlerta = 'success';

        try {
          await subirArchivosObra(idObra);
        } catch (errorArchivos) {
          console.error("Error al subir documentos:", errorArchivos);
          mensajeArchivos = 'La obra se guardó, pero hubo un problema al subir los documentos. Puedes agregarlos después editando la obra.';
          iconoAlerta = 'warning';
        }

        Swal.fire({
          title: '¡Obra Guardada!',
          text: 'Los datos se registraron correctamente en el sistema',
          icon: 'success',
          confirmButtonText: 'Ir al Panel de Obras',
          confirmButtonColor: '#2c3e50',
          allowOutsideClick: false // Obliga al usuario a darle al botón
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirigimos hasta que el usuario le da clic a aceptar
            window.location.href = '/obras';
          }
        });
      } else {
        Swal.fire({
          title: 'Error ' + response.status,
          text: 'Hubo un problema al intentar guardar la obra.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#e74c3c'
        });
      }

    } catch (error) {
      console.error("Error de conexión:", error);
      Swal.fire({
        title: 'Error de Conexión',
        text: 'No pudimos conectar con el servidor. Revisa tu conexión.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#f39c12'
      });
    }

  });

  // aqui se empiezan a guardar los archivos
});

function calcularSemanas() {
  const fechaInicioInput = document.getElementById("fechaInicio").value;
  const fechaFinInput = document.getElementById("fechaTerminacion").value;

  //Si alguno de los campos está vacío, limpiamos el input de no semanas  y se detiene la ejecución
  if (!fechaInicioInput || !fechaFinInput) {
    document.getElementById("numeroSemanas").value = "";
    return;
  }

  // Extraemos el año de ambas fechas
  const añoInicio = parseInt(fechaInicioInput.split('-')[0]);
  const añoFin = parseInt(fechaFinInput.split('-')[0]);

  //Validamos que ambos años tengan un valor lógico
  if (añoInicio < 2000 || añoFin < 2000) {
    return;
  }

  //tienes la fecha completa y
  const inicio = new Date(fechaInicioInput);
  const fin = new Date(fechaFinInput);

  if (fin < inicio) {
    Swal.fire({
      title: 'Error en fechas',
      text: 'La fecha de terminación no puede ser menor que la fecha de inicio',
      icon: 'warning',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#f39c12'
    });
    // Limpiamos el campo de semanas porque hay un error
    document.getElementById("numeroSemanas").value = "";
    return;
  }
  //Si todo está bien, calculamos las semanas
  const diferenciaMs = fin - inicio;
  const semanas = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24 * 7)) + 1;

  document.getElementById("numeroSemanas").value = semanas;
}

async function subirArchivo(tipoEntidad, movobraId, categoria, file) {

  const formData = new FormData();

  formData.append("tipoEntidad", tipoEntidad);
  formData.append("movobraId", movobraId);
  formData.append("categoria", categoria);
  formData.append("file", file);

  const response = await fetch("/api/v1/archivos", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Error subiendo archivo");
  }

}

const archivosConfig = [
  { id: "ordenCompra", categoria: "ORDEN_COMPRA" },
  { id: "presupuesto", categoria: "PRESUPUESTO" },
  { id: "explosionInsumos", categoria: "EXPLOSION_INSUMOS" },
  { id: "proyectoDoc", categoria: "PROYECTO" },
  { id: "programaDoc", categoria: "PROGRAMA" },
  { id: "memorias", categoria: "MEMORIAS" },
  { id: "OrdenExtra1", categoria: "ORDEN_COMPRA_EXT1" },
  { id: "OrdenExtra2", categoria: "ORDEN_COMPRA_EXT2" }
];

async function subirArchivosObra(idObra) {
  const promesas = [];

  for (const config of archivosConfig) {
    const input = document.getElementById(config.id);
    if (input.files.length > 0) {
      const file = input.files[0];
      promesas.push(
        subirArchivo("REQUERIMIENTOS", idObra, config.categoria, file)
      );
    }
  }
  await Promise.all(promesas);
}
