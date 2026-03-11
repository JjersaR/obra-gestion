package com.rjj.visual;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {
    //Muestra la pantala de Login
    @GetMapping("/")
    public String mostrarLogin() {
        return "login";
    }

    //Muestra la pantalla principal 
    @GetMapping("/obras")
    public String mostrarObras() {
        return "index";
    }

    //Muestra la pantalla de nueva obra  
    @GetMapping("/obras/nueva")
    public String nuevaObraForm(){
        return "nuevaObra";
    }
    // Dentro de tu WebController.java

    @GetMapping("/obras/detalles")
    public String mostrarDetalles() {
    return "generales"; // Esto busca templates/generales.html
}
@GetMapping("/obras/detalles/requerimientos")
public String verRequerimientos() {
    return "requerimientos";
}
      
}
