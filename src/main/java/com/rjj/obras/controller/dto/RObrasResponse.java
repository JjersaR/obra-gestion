package com.rjj.obras.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RObrasResponse(
    String id,
    String nombre,
    String cliente,
    BigDecimal montoAntesIva,
    LocalDate fechaInicio,
    LocalDate fechaFin,
    Integer noSemanas,
    String gerente,
    String residente,
    String observaciones,
    String status,
// --- NUEVOS CAMPOS ---
    String semaforo,      // Ejemplo: "ROJO", "AMARILLO", "VERDE"
    String mensajeTiempo ) { // Ejemplo: "Faltan 5 días", "Retrasada" 

}
