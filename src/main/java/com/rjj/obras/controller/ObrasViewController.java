/*package com.rjj.obras.controller; 

//import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller 
@RequestMapping("/obras")
public class ObrasViewController {

    //
    @GetMapping
    public String mostrarPanelPrincipal() {
        return "index.html"; 
    }

    // seguridad extra 
    //@PreAuthorize("hasAnyRole('ADMINISTRACION', 'PRESUPUESTOS')")
    @GetMapping("/nuevaObra")
    public String mostrarFormularioNuevaObra() {
        // Esto busca tu archivo "nueva-obra.html" en la carpeta templates
        return "nuevaObra"; 
    }
}

*/