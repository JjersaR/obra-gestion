document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Evitamos que la página se recargue al enviar el formulario

    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;
    const mensajeDiv = document.getElementById('mensaje');

    // Aquí hacemos la petición al backend en Spring Boot
    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, contrasena })
        });

        const data = await response.text();

        if (response.ok) {
            mensajeDiv.textContent = '¡Acceso concedido! Redirigiendo...';
            mensajeDiv.className = 'success';
            // Ruta del controlador pantalla de obras 
            window.location.href = '/obras'; 
        } else {
            mensajeDiv.textContent = 'Correo o contraseña incorrectos.';
            mensajeDiv.className = 'error';
        }
    } catch (error) {
        mensajeDiv.textContent = 'Error al conectar con el servidor. Verifica que el backend esté corriendo.';
        mensajeDiv.className = 'error';
    }
});