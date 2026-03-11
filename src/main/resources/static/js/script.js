document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Guardamos el input de la contraseña en una variable para manipularlo más fácil
  const contrasenaInput = document.getElementById('contrasena');
  const mensajeDiv = document.getElementById('mensaje');
  if (validarDatos(document.getElementById('correo').value, contrasenaInput.value)) {
    try {
      const response = await fetch('/api/v1/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: document.getElementById('correo').value,
          password: contrasenaInput.value
        })
      });

      if (response.status === 200) {
        //leemos el JSON directamente
        const datosUsuario = await response.json();

        // Convertimos el objeto a texto y lo guardamos en la memoria del navegador
        localStorage.setItem('usuarioLogueado', JSON.stringify(datosUsuario));

        mensajeDiv.textContent = '¡Acceso concedido! Redirigiendo...';
        mensajeDiv.className = 'success';
        window.location.href = '/obras';

      } else if (response.status === 204) {
        // Manejo de credenciales incorrectas
        mensajeDiv.textContent = 'Correo o contraseña incorrectos.';
        mensajeDiv.className = 'error';
        contrasenaInput.value = '';
        contrasenaInput.focus();

      } else {
        mensajeDiv.textContent = 'Error inesperado del servidor. Código: ' + response.status;
        mensajeDiv.className = 'error';
      }

    } catch (error) {
      mensajeDiv.textContent = 'Error de conexión con el servidor.';
      mensajeDiv.className = 'error';
    }
  }
  mensajeDiv.textContent = 'Correo o contraseña incorrectos.';
  mensajeDiv.className = 'error';
  contrasenaInput.value = '';
  contrasenaInput.focus();
});

function validarDatos(correo, password) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const correoValido = correo && regex.test(correo.trim());
  const passwordValida = password && password.trim().length >= 6;

  return correoValido && passwordValida;
}
