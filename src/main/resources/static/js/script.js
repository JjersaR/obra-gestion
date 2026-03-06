document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;
    const mensajeDiv = document.getElementById('mensaje');

    try {
        // 1. Apuntamos a tu Controller real
        const response = await fetch('/api/v1/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                nombre: correo, 
                password: contrasena
            })
        });

        // Evaluamos los códigos exactos que devuelve tu UsuariosController
        if (response.status === 200) {
            
            // Primero leemos la respuesta como texto crudo para evitar que explote
            const textoRespuesta = await response.text();
            
            try {
                // Intentamos convertirlo a JSON
                const datosUsuario = JSON.parse(textoRespuesta);
                console.log("Usuario logueado:", datosUsuario);
            } catch (e) {
                // Si falla, significa que Java nos mandó un HTML
                console.error("El servidor no devolvió JSON. Devolvió esto:", textoRespuesta);
            }

            mensajeDiv.textContent = '¡Acceso concedido! Redirigiendo...';
            mensajeDiv.className = 'success';
            window.location.href = '/obras'; 

        } else if (response.status === 204) {
            // Login fallido: El backend devolvió ResponseEntity.noContent()
            mensajeDiv.textContent = 'Correo o contraseña incorrectos.';
            mensajeDiv.className = 'error';

        } else {
            // Cualquier otro error (500, 400, etc.)
            mensajeDiv.textContent = 'Error inesperado del servidor. Código: ' + response.status;
            mensajeDiv.className = 'error';
        }

    } catch (error) {
        mensajeDiv.textContent = 'Error de conexión con el servidor.';
        mensajeDiv.className = 'error';
        console.error("Error en el fetch:", error);
    }
});