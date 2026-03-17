package com.rjj.visual;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class WebController {
  // Muestra la pantala de Login
  @GetMapping("/")
  public String mostrarLogin() {
    return "login";
  }

  @GetMapping("/obras")
  public String mostrarObras() {
    return "index";
  }

  // Muestra la pantalla de nueva obra
  @PreAuthorize("hasAnyRole('ADMINISTRACION', 'PRESUPUESTOS')")
  @GetMapping("/obras/nueva")
  public String nuevaObraForm() {
    return "nuevaObra";
  }

  @GetMapping("/obras/detalles/{id}")
  public String mostrarDetalles(@PathVariable String id) {
    return "detallesObra"; // regresa generales.html
  }

  @GetMapping("/obras/detalles/requerimientos")
  public String verRequerimientos() {
    return "requerimientos";
  }

}
