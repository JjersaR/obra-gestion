document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const contrasenaInput = document.getElementById('contrasena');
  const correoInput = document.getElementById('correo');
  const mensajeDiv = document.getElementById('mensaje');

  // 1. Validar datos localmente primero
  if (!validarDatos(correoInput.value, contrasenaInput.value)) {
    mensajeDiv.textContent = 'Formato de correo inválido o contraseña muy corta.';
    mensajeDiv.className = 'error';
    return; // Detenemos la ejecución aquí
  }

  try {
    const response = await fetch('/api/v1/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: correoInput.value,
        password: contrasenaInput.value
      })
    });

    if (response.status === 200) {
      const datosUsuario = await response.json();
      localStorage.setItem('usuarioLogueado', JSON.stringify(datosUsuario));

      mensajeDiv.textContent = '¡Acceso concedido! Redirigiendo...';
      mensajeDiv.className = 'success';
      window.location.href = '/obras';
      return; // Éxito total, salimos de la función
    } 
    
    if (response.status === 204) {
      mensajeDiv.textContent = 'Correo o contraseña incorrectos.';
    } else {
      mensajeDiv.textContent = 'Error inesperado del servidor. Código: ' + response.status;
    }

  } catch (error) {
    mensajeDiv.textContent = 'Error de conexión con el servidor.';
  }

  // Si llegamos a este punto, es porque algo falló (204, 500 o error de red)
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
