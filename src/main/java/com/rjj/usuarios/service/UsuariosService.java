package com.rjj.usuarios.service;

import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rjj.usuarios.controller.dto.IUsuariosMapper;
import com.rjj.usuarios.controller.dto.RCambioPassword;
import com.rjj.usuarios.controller.dto.RContraOlvidada;
import com.rjj.usuarios.controller.dto.RUsuarioCredencialesRequest;
import com.rjj.usuarios.controller.dto.RUsuarioRegistrado;
import com.rjj.usuarios.controller.dto.RUsuariosRequest;
import com.rjj.usuarios.repository.IUsuariosRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.transaction.annotation.Transactional;

import com.rjj.usuarios.entity.PasswordReset;
import com.rjj.usuarios.repository.IPasswordResetRepository;

import com.rjj.usuarios.controller.dto.RCodigoRecuperacion;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuariosService {

  private final IUsuariosRepository repository;
  private final IPasswordResetRepository passwordResetRepository;
  private final EmailService emailService;
  private final IUsuariosMapper mapper;
  private final PasswordEncoder encoder;
  private final AuthenticationManager authenticationManager;

  public Boolean guardar(RUsuariosRequest request) {
    var usuario = mapper.toEntity(request);

    String password = encoder.encode(usuario.getPassword());
    usuario.setPassword(password);
    repository.save(usuario);
    return true;
  }

  public Optional<RUsuarioRegistrado> iniciarSesion(RUsuarioCredencialesRequest request) {
    try {
      log.info("Intentando autenticar a {}", request.nombre());

      // se autentica el usuario
      Authentication auth = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(
              request.nombre(),
              request.password()));

      // se le avisa a spring que el usuario se ha autenticado
      SecurityContextHolder.getContext().setAuthentication(auth);

      // se recupera los detalles del usuario
      CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

      log.info("Usuario autenticado");
      // se retorna el usuario
      return Optional.of(
          new RUsuarioRegistrado(
              userDetails.getId().toString(),
              userDetails.getUsername(),
              userDetails.getTipoUsuario(),
              userDetails.getEmail(),
              userDetails.isCambioPassword()));

    } catch (AuthenticationException ex) {
      log.warn("Error de autenticación: {}", ex.getMessage());
      return Optional.empty();
    }
  }

  @Transactional
public String contraOlvidada(RContraOlvidada request) {
  try {
    var usuario = repository.findByEmail(request.email())
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    // Invalida el código anterior, si todavía existe uno activo.
      passwordResetRepository
        .findFirstByUsuarioAndUsadoFalseOrderByCreadoEnDesc(usuario)
        .ifPresent(codigoAnterior -> {
          codigoAnterior.setUsado(true);
          passwordResetRepository.save(codigoAnterior);
        });

    // Genera un código numérico seguro de 6 dígitos.
    SecureRandom random = new SecureRandom();
    String codigo = String.format("%06d", random.nextInt(1_000_000));

    PasswordReset passwordReset = new PasswordReset();
    passwordReset.setUsuario(usuario);

    // En la base de datos se guarda cifrado.
    passwordReset.setCodigo(encoder.encode(codigo));

    passwordReset.setFechaExpiracion(LocalDateTime.now().plusMinutes(10));
    passwordReset.setUsado(false);

    passwordResetRepository.save(passwordReset);

    String mensaje = """
        Hola %s:

        Recibimos una solicitud para recuperar la contraseña de tu cuenta.

        Tu código de verificación es:

        %s

        Este código expirará en 10 minutos.

        Si no solicitaste este cambio, puedes ignorar este correo.
        """.formatted(usuario.getNombre(), codigo);

    emailService.enviarCorreo(
        usuario.getEmail(),
        "Código de recuperación - Obra Gestión",
        mensaje
    );

    log.info("Código de recuperación enviado al correo {}", usuario.getEmail());

    return "Se envió un código de recuperación a tu correo.";

  } catch (Exception e) {
    log.error("Error al solicitar recuperación de contraseña", e);
    return "";
  }
}

public boolean validarCodigo(RCodigoRecuperacion request) {
  try {
    var usuario = repository.findByEmail(request.email())
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    var passwordReset = passwordResetRepository
        .findFirstByUsuarioAndUsadoFalseOrderByCreadoEnDesc(usuario)
        .orElseThrow(() -> new RuntimeException("No existe un código activo"));

    if (passwordReset.getFechaExpiracion().isBefore(LocalDateTime.now())) {
      passwordReset.setUsado(true);
      passwordResetRepository.save(passwordReset);

      log.warn("El código de recuperación expiró para {}", request.email());
      return false;
    }

    boolean codigoValido = encoder.matches(
        request.codigo(),
        passwordReset.getCodigo()
    );

    if (!codigoValido) {
      log.warn("Código de recuperación incorrecto para {}", request.email());
      return false;
    }

    log.info("Código de recuperación válido para {}", request.email());
    return true;

  } catch (Exception e) {
    log.warn("Error al validar el código: {}", e.getMessage());
    return false;
  }
}

  public boolean cambiarPassword(RCambioPassword request) {
  try {
    var usuario = repository.findByEmail(request.email())
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    var passwordReset = passwordResetRepository
        .findFirstByUsuarioAndUsadoFalseOrderByCreadoEnDesc(usuario)
        .orElseThrow(() -> new RuntimeException("No existe un código activo"));

    if (passwordReset.getFechaExpiracion().isBefore(LocalDateTime.now())) {
      passwordReset.setUsado(true);
      passwordResetRepository.save(passwordReset);

      log.warn("El código expiró para {}", request.email());
      return false;
    }

    boolean codigoValido = encoder.matches(
        request.codigo(),
        passwordReset.getCodigo()
    );

    if (!codigoValido) {
      log.warn("Código incorrecto para {}", request.email());
      return false;
    }

    usuario.setPassword(encoder.encode(request.password()));
    usuario.setCambioPassword(false);

    passwordReset.setUsado(true);

    repository.save(usuario);
    passwordResetRepository.save(passwordReset);

    log.info("Contraseña actualizada correctamente para {}", request.email());

    return true;

  } catch (Exception e) {
    log.warn("Error al cambiar la contraseña: {}", e.getMessage());
    return false;
  }
}

}
