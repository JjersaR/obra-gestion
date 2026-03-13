document.addEventListener('DOMContentLoaded', () => {
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

    // solo datos del texto
    const obraData = {
      nombre: document.getElementById('nombreObra').value,
      cliente: document.getElementById('cliente').value,
      montoAntesIva: parseFloat(document.getElementById('monto').value),
      fechaInicio: document.getElementById('fechaInicio').value,
      fechaFin: document.getElementById('fechaTerminacion').value,
      noSemanas: parseInt(document.getElementById('numeroSemanas').value),
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
});

function calcularSemanas() {

  const fechaInicio = document.getElementById("fechaInicio").value;
  const fechaFin = document.getElementById("fechaTerminacion").value;

  if (!fechaInicio || !fechaFin) return;

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  const diferenciaMs = fin - inicio;

  const semanas = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24 * 7)) + 1;

  if (fin < inicio) {
    Swal.fire({
      title: 'Error en semanas',
      text: 'La fecha de terminación no puede ser menor que la fecha de inicio',
      icon: 'warning',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#f39c12'
    });
    return;
  }

  document.getElementById("numeroSemanas").value = semanas;
}
