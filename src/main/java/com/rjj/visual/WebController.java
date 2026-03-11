package com.rjj.visual;


import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.rjj.obras.entity.Obras;
import com.rjj.obras.repository.IObrasRepository;



@Controller
public class WebController {
    //Muestra la pantala de Login
    @GetMapping("/")
    public String mostrarLogin() {
        return "login";
    }

  @Autowired
    private IObrasRepository obrasRepository; // El tipo debe ser IObrasRepository

    // Muestra la pantalla principal
    @GetMapping("/obras")
    public String mostrarObras(Model model) {
        // Ahora sí, llamamos al método findAll() para buscar las obras
        List<Obras> listaObras = obrasRepository.findAll();
        
        model.addAttribute("obras", listaObras);
        
        return "index";
    }

    //Muestra la pantalla de nueva obra  
    @GetMapping("/obras/nueva")
    public String nuevaObraForm(){
        return "nuevaObra";
    }
    

    @GetMapping("/obras/detalles/{id}")
public String mostrarDetalles(@PathVariable UUID id, Model model) {
    // Buscamos la obra por su ID. Si no la encuentra, lanza un error.
    Obras obra = obrasRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("ID de obra no válido: " + id));
    
    // Pasamos el objeto "obra" al HTML
    model.addAttribute("obra", obra);
    
    // Para la fecha y hora actual en la tabla
    model.addAttribute("fechaActual", java.time.LocalDateTime.now());
    
    return "generales"; // regresa generales.html
}


@GetMapping("/obras/detalles/requerimientos")
public String verRequerimientos() {
    return "requerimientos";
}
      
}
