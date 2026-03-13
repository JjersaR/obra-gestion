// cosas a ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  permisoBoton();
  cerrarSesion();
});

// Sacamos el texto guardado en la memoria
const usuarioString = localStorage.getItem('usuarioLogueado');

function permisoBoton() {
  // Verificamos que sí exista algo guardado
  if (usuarioString) {
    // Lo volvemos a convertir en un objeto de JavaScript
    const usuario = JSON.parse(usuarioString);

    //Ocultar algo dependiendo del rol
    if (usuario.tipoUsuario === 'ADMINISTRACION' || usuario.tipoUsuario === 'PRESUPUESTOS') {
      document.querySelector(".main-header-actions").style.display = "block";
    }
  }
}

function cerrarSesion() {
  document.getElementById('btnLogout').addEventListener('click', async function () {

    await fetch('/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });

    localStorage.removeItem('usuarioLogueado');

    window.location.href = "/";
  });
}


