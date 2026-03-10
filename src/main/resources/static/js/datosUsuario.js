// Sacamos el texto guardado en la memoria
const usuarioString = localStorage.getItem('usuarioLogueado');

// Verificamos que sí exista algo guardado
if (usuarioString) {
    // Lo volvemos a convertir en un objeto de JavaScript
    const usuario = JSON.parse(usuarioString);
    
    // Se accede los siguientes datos
    console.log("El ID es: " + usuario.id);
    console.log("El nombre es: " + usuario.nombre);
    console.log("El rol es: " + usuario.tipoUsuario);
    console.log("El email es: " + usuario.email);
    
    //Ocultar algo dependiendo del rol
    if (usuario.tipoUsuario !== 'ADMIN') {
        
    }
}

// botón de cerrar sesión
document.getElementById('btnLogout').addEventListener('click', function() {
    
    // Borramos los datos de este usuario y le avise a Spring Security que destruya la sesión en el backend.
    localStorage.removeItem('usuarioLogueado');
    
    // O borrar TODO lo que haya guardado
    // localStorage.clear();

    console.log("Datos locales borrados. Cerrando sesión en el servidor...");

});