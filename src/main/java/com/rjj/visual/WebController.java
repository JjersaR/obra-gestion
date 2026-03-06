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
      
}
//logicaaaaaaaaaaaaaaaaaaa de login 