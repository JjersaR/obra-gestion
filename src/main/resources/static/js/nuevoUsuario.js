document.addEventListener("DOMContentLoaded", function () {
  inicializarFormulario();
});

function inicializarFormulario() {
  const form = document.getElementById("formNuevoUsuario");

  if (form) {
    form.addEventListener("submit", manejarSubmit);
  }

  // Validación de contraseñas en tiempo real
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  if (password && confirmPassword) {
    confirmPassword.addEventListener("input", function () {
      validarContrasenias();
    });
    password.addEventListener("input", function () {
      validarContrasenias();
    });
  }
}

function validarContrasenias() {
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const passwordHint = document.querySelector(".password-hint");

  if (password.value !== confirmPassword.value) {
    confirmPassword.setCustomValidity("Las contraseñas no coinciden");
    if (confirmPassword.value.length > 0) {
      passwordHint.style.color = "#e74c3c";
      passwordHint.textContent = "⚠️ Las contraseñas no coinciden";
    }
  } else {
    confirmPassword.setCustomValidity("");
    if (password.value.length >= 6) {
      passwordHint.style.color = "#27ae60";
      passwordHint.textContent = "✓ Contraseña válida";
    } else {
      passwordHint.style.color = "#718096";
      passwordHint.textContent = "La contraseña debe tener al menos 6 caracteres";
    }
  }
}

async function manejarSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Validaciones adicionales
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    Swal.fire({
      title: 'Error',
      text: 'Las contraseñas no coinciden',
      icon: 'error',
      confirmButtonColor: '#e74c3c'
    });
    return;
  }

  if (password.length < 6) {
    Swal.fire({
      title: 'Error',
      text: 'La contraseña debe tener al menos 6 caracteres',
      icon: 'error',
      confirmButtonColor: '#e74c3c'
    });
    return;
  }

  // Construir el objeto de usuario
  const usuarioData = {
    nombre: formData.get("nombre"),
    tipoUsuario: formData.get("rol"),
    email: formData.get("email"),
    password: formData.get("password"),
    cambioPassword: false,
    isEnabled: true,
    accountNoExpired: true,
    accountNoLocked: true,
    credentialNoExpired: true
  };

  // Mostrar loading
  Swal.fire({
    title: 'Guardando usuario...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const response = await fetch("/api/v1/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(usuarioData)
    });

    if (!response.ok) {
      throw new Error("Error al guardar el usuario");
    }

    Swal.fire({
      title: '¡Éxito!',
      text: `Usuario creado correctamente`,
      icon: 'success',
      confirmButtonColor: '#1e5d88',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      // Redirigir a la lista de usuarios o al dashboard
      window.location.href = "/obras";
    });

  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      title: 'Error',
      text: error.message || 'No se pudo crear el usuario',
      icon: 'error',
      confirmButtonColor: '#e74c3c'
    });
  }
}
