// ======================================================
// VARIABLES DEL PROCESO DE RECUPERACIÓN
// ======================================================

let correoRecuperacion = '';
let codigoRecuperacion = '';


// ======================================================
// RECUPERAR CONTRASEÑA: ENVIAR CÓDIGO
// ======================================================

document.getElementById('olvidePass').addEventListener('click', async (event) => {
    event.preventDefault();

    const correoInput = document.getElementById('correo');
    const correo = correoInput.value.trim();

    if (!validarCorreo(correo)) {
        await Swal.fire({
            icon: 'warning',
            title: 'Correo requerido',
            text: 'Escribe un correo electrónico válido.',
            confirmButtonColor: '#f39c12'
        });

        correoInput.focus();
        return;
    }

    try {
        const response = await fetch('/api/v1/usuarios/olvidado', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: correo
            })
        }); 

        if (!response.ok) {
            await Swal.fire({
                icon: 'error',
                title: 'No se pudo continuar',
                text: 'Verifica el correo e inténtalo nuevamente.',
                confirmButtonColor: '#e74c3c'
            });
            return;
        }

        correoRecuperacion = correo;
        codigoRecuperacion = '';

        await Swal.fire({
            icon: 'success',
            title: 'Código enviado',
            text: 'Revisa tu correo electrónico. El código expira en 10 minutos.',
            confirmButtonColor: '#2c3e50'
        });

        const codigoInput = document.getElementById('codigoRecuperacion');

        codigoInput.value = '';
        document.getElementById('modalCodigo').style.display = 'flex';
        codigoInput.focus();

    } catch (error) {
        console.error('Error al solicitar recuperación:', error);

        await Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No fue posible comunicarse con el servidor.',
            confirmButtonColor: '#e74c3c'
        });
    }
});


// ======================================================
// VALIDAR CÓDIGO
// ======================================================

document.getElementById('btnValidarCodigo').addEventListener('click', async () => {
    const codigoInput = document.getElementById('codigoRecuperacion');
    const codigo = codigoInput.value.trim();

    if (!/^\d{6}$/.test(codigo)) {
        await Swal.fire({
            icon: 'warning',
            title: 'Código inválido',
            text: 'El código debe contener exactamente 6 números.',
            confirmButtonColor: '#f39c12'
        });

        codigoInput.focus();
        return;
    }

    try {
        const response = await fetch('/api/v1/usuarios/validar-codigo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: correoRecuperacion,
                codigo: codigo
            })
        });

        if (!response.ok) {
            throw new Error(`Respuesta HTTP ${response.status}`);
        }

        const codigoValido = await response.json();

        if (!codigoValido) {

        document.getElementById("modalCodigo").style.display = "none";

        await Swal.fire({
            icon: "error",
            title: "Código incorrecto",
            text: "El código es incorrecto, expiró o ya fue utilizado.",
            confirmButtonColor: "#e74c3c"
        });

            document.getElementById("modalCodigo").style.display = "flex";

            codigoInput.select();
            codigoInput.focus();

            return;
        }

        codigoRecuperacion = codigo;

        document.getElementById('modalCodigo').style.display = 'none';

        document.getElementById('nuevaPassword').value = '';
        document.getElementById('confirmarPassword').value = '';
        document.getElementById('modalNuevaPassword').style.display = 'flex';
        document.getElementById('nuevaPassword').focus();

    } catch (error) {
        console.error('Error al validar código:', error);

        await Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No fue posible validar el código.',
            confirmButtonColor: '#e74c3c'
        });
    }
});


// ======================================================
// CAMBIAR CONTRASEÑA
// ======================================================

document.getElementById('btnGuardarCambio').addEventListener('click', async () => {
    const nuevaPasswordInput = document.getElementById('nuevaPassword');
    const confirmarPasswordInput = document.getElementById('confirmarPassword');

    const nuevaPassword = nuevaPasswordInput.value;
    const confirmarPassword = confirmarPasswordInput.value;

    if (nuevaPassword.length < 6) {
        await Swal.fire({
            icon: 'warning',
            title: 'Contraseña muy corta',
            text: 'La contraseña debe tener al menos 6 caracteres.',
            confirmButtonColor: '#f39c12'
        });

        nuevaPasswordInput.focus();
        return;
    }

    if (nuevaPassword !== confirmarPassword) {
        await Swal.fire({
            icon: 'warning',
            title: 'Las contraseñas no coinciden',
            text: 'Escribe la misma contraseña en ambos campos.',
            confirmButtonColor: '#f39c12'
        });

        confirmarPasswordInput.focus();
        return;
    }

    if (!correoRecuperacion || !codigoRecuperacion) {
        await Swal.fire({
            icon: 'error',
            title: 'Proceso inválido',
            text: 'Solicita nuevamente un código de recuperación.',
            confirmButtonColor: '#e74c3c'
        });

        cerrarModalNuevaPassword();
        return;
    }

    try {
        const response = await fetch('/api/v1/usuarios/cambio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: correoRecuperacion,
                codigo: codigoRecuperacion,
                password: nuevaPassword
            })
        });

        if (!response.ok) {
            throw new Error(`Respuesta HTTP ${response.status}`);
        }

        const cambioExitoso = await response.json();

        if (!cambioExitoso) {
            await Swal.fire({
                icon: 'error',
                title: 'No se pudo cambiar la contraseña',
                text: 'El código expiró, ya fue utilizado o no es válido.',
                confirmButtonColor: '#e74c3c'
            });
            return;
        }

        cerrarModalNuevaPassword();

        correoRecuperacion = '';
        codigoRecuperacion = '';

        document.getElementById('contrasena').value = '';

        await Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: 'Ya puedes iniciar sesión con tu nueva contraseña.',
            confirmButtonColor: '#2c3e50',
            allowOutsideClick: false
        });

        document.getElementById('contrasena').focus();

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);

        await Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No fue posible cambiar la contraseña.',
            confirmButtonColor: '#e74c3c'
        });
    }
});


// ======================================================
// BOTONES PARA CANCELAR MODALES
// ======================================================

document.getElementById('btnCancelarCodigo').addEventListener('click', () => {
    document.getElementById('modalCodigo').style.display = 'none';
    document.getElementById('codigoRecuperacion').value = '';

    correoRecuperacion = '';
    codigoRecuperacion = '';
});

document.getElementById('btnCancelarCambio').addEventListener('click', () => {
    cerrarModalNuevaPassword();

    correoRecuperacion = '';
    codigoRecuperacion = '';
});

function cerrarModalNuevaPassword() {
    document.getElementById('modalNuevaPassword').style.display = 'none';
    document.getElementById('nuevaPassword').value = '';
    document.getElementById('confirmarPassword').value = '';
}


// ======================================================
// LOGIN NORMAL
// ======================================================

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const correoInput = document.getElementById('correo');
    const contrasenaInput = document.getElementById('contrasena');
    const mensajeDiv = document.getElementById('mensaje');

    const correo = correoInput.value.trim();
    const password = contrasenaInput.value;

    mensajeDiv.textContent = '';
    mensajeDiv.className = '';

    if (!validarDatos(correo, password)) {
        mensajeDiv.textContent =
            'Formato de correo inválido o contraseña muy corta (mínimo 6 caracteres).';
        mensajeDiv.className = 'error';
        return;
    }

    try {
        const response = await fetch('/api/v1/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: correo,
                password: password
            })
        });

        if (response.status === 200) {
            const datosUsuario = await response.json();

            localStorage.setItem(
                'usuarioLogueado',
                JSON.stringify(datosUsuario)
            );

            window.location.href = '/obras';
            return;
        }

        if (response.status === 204) {
            mensajeDiv.textContent = 'Correo o contraseña incorrectos.';
        } else {
            mensajeDiv.textContent =
                `Error del servidor. Código: ${response.status}`;
        }

    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        mensajeDiv.textContent = 'Error de conexión con el servidor.';
    }

    mensajeDiv.className = 'error';
    contrasenaInput.value = '';
    contrasenaInput.focus();
});


// ======================================================
// VALIDACIONES LOCALES
// ======================================================

function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return Boolean(correo && regex.test(correo.trim()));
}

function validarDatos(correo, password) {
    const correoValido = validarCorreo(correo);
    const passwordValida =
        Boolean(password && password.trim().length >= 6);

    return correoValido && passwordValida;
}