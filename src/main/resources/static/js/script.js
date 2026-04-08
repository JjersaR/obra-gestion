// --- FUNCIONES AUXILIARES ---
function cerrarModalOlvido() {
    document.getElementById('modalTemporal').style.display = 'none';
}

// --- LÓGICA DE RECUPERACIÓN (OLVIDÓ CONTRASEÑA) ---
document.getElementById('olvidePass').addEventListener('click', async (e) => {
    e.preventDefault();
    const correoInput = document.getElementById('correo');
    const mensajeDiv = document.getElementById('mensaje');

    if (!correoInput.value || !correoInput.value.includes('@')) {
        mensajeDiv.textContent = 'Escriba su correo en el campo de email para mostrarle su contraseña temporal.';
        mensajeDiv.className = 'error';
        correoInput.focus();
        return;
    }

    try {
        const resp = await fetch('/api/v1/usuarios/olvidado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: correoInput.value })
        });

        if (resp.ok) {
            const uuidRecibido = await resp.text(); 
            
            // Inyectamos el UUID en el modal y lo mostramos
            document.getElementById('uuidTemporal').textContent = uuidRecibido;
            document.getElementById('modalTemporal').style.display = 'flex';
            
            mensajeDiv.textContent = 'Copia tu clave temporal e ingresa.';
            mensajeDiv.className = 'success';
        } else {
            mensajeDiv.textContent = 'El correo no existe en el sistema.';
            mensajeDiv.className = 'error';
        }
    } catch (err) {
        console.error("Error:", err);
        mensajeDiv.textContent = 'Error de conexión con el servidor.';
    }
});

// --- LÓGICA DE LOGIN ---
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const contrasenaInput = document.getElementById('contrasena');
    const correoInput = document.getElementById('correo');
    const mensajeDiv = document.getElementById('mensaje');

    if (!validarDatos(correoInput.value, contrasenaInput.value)) {
        mensajeDiv.textContent = 'Formato de correo inválido o contraseña muy corta (mín. 6).';
        mensajeDiv.className = 'error';
        return;
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

            if (datosUsuario.cambioPassword === true) {
                // Si requiere cambio, abrimos el modal y NO limpiamos inputs aún
                document.getElementById('modalCambioObligatorio').style.display = 'flex';
                mensajeDiv.textContent = 'Acceso temporal detectado.';
                mensajeDiv.className = 'success';
                return; // Salimos para evitar que el código de abajo limpie el foco
            } else {
                window.location.href = '/obras';
                return;
            }
        } 
        
        if (response.status === 204) {
            mensajeDiv.textContent = 'Correo o contraseña incorrectos.';
        } else {
            mensajeDiv.textContent = 'Error del servidor. Código: ' + response.status;
        }

    } catch (error) {
        mensajeDiv.textContent = 'Error de conexión con el servidor.';
    }

    // Si llegamos aquí es porque falló el login
    mensajeDiv.className = 'error';
    contrasenaInput.value = '';
    contrasenaInput.focus();
});

// --- GUARDAR NUEVA CONTRASEÑA (MODAL) ---
document.getElementById('btnGuardarCambio').addEventListener('click', async () => {
    const nuevaPass = document.getElementById('nuevaPassword').value;
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));

    if (nuevaPass.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    try {
        const resp = await fetch('/api/v1/usuarios/cambio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: usuario.id, 
                password: nuevaPass 
            })
        });

        const success = await resp.json();

        if (success === true) {
            alert("¡Contraseña actualizada correctamente!");
            window.location.href = '/obras';
        } else {
            alert("No se pudo actualizar la contraseña. Reintente.");
        }
    } catch (err) {
        alert("Error de comunicación con el servidor.");
    }
});

// --- VALIDACIÓN LOCAL ---
function validarDatos(correo, password) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const correoValido = correo && regex.test(correo.trim());
    const passwordValida = password && password.trim().length >= 6;
    return correoValido && passwordValida;
}