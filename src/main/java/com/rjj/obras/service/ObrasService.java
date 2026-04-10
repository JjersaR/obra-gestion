package com.rjj.obras.service;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.rjj.obras.controller.dto.IObrasMapper;
import com.rjj.obras.controller.dto.RActualizarFecha;
import com.rjj.obras.controller.dto.RObrasRequest;
import com.rjj.obras.controller.dto.RObrasResponse;
import com.rjj.obras.entity.EStatus;
import com.rjj.obras.repository.IObrasRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ObrasService {

    private final IObrasRepository repository;
    private final IObrasMapper mapper;

    public UUID guardar(RObrasRequest request) {
        var obra = mapper.toEntity(request);
        var guardado = repository.save(obra);
        return guardado.getId();
    }

    public List<RObrasResponse> findAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .map(this::enriquecerConSemaforo) // Aplicamos lógica a la lista
                .toList();
    }

    public Optional<RObrasResponse> getById(String id) {
        return repository.findById(UUID.fromString(id))
                .map(mapper::toResponse)
                .map(this::enriquecerConSemaforo); // Aplicamos lógica al detalle
    }

    /**
     * Calcula el estado del semáforo basado en el 15% del tiempo total.
     */
    private RObrasResponse enriquecerConSemaforo(RObrasResponse r) {
        String semaforo;
        String mensaje;

        if (r.fechaInicio() == null || r.fechaFin() == null) {
            semaforo = "AMARILLO";
            mensaje = "ALERTA: Faltan asignar fechas";

            return new RObrasResponse(
                    r.id(), r.nombre(), r.cliente(), r.montoAntesIva(),
                    r.fechaInicio(), r.fechaFin(), r.noSemanas(),
                    r.gerente(), r.residente(), r.observaciones(), r.status(),
                    semaforo, mensaje);
        }

        // --- NUEVA LÓGICA DE PAUSA ---
        // Verificamos si el status es CIERRE (usando equals o comparando con tu Enum
        // EStatus)
        if ("CIERRE".equalsIgnoreCase(r.status())) {
            semaforo = "GRIS"; // Color neutro para el CSS
            mensaje = "OBRA CONCLUIDA / ETAPA DE CIERRE";
        } else {
            // --- TU LÓGICA ORIGINAL DE CÁLCULO ---
            LocalDate hoy = LocalDate.now();

            long diasTotales = ChronoUnit.DAYS.between(r.fechaInicio(), r.fechaFin());
            long diasRestantes = ChronoUnit.DAYS.between(hoy, r.fechaFin());

            double margen15 = diasTotales * 0.15;

            if (diasRestantes < 0) {
                semaforo = "ROJO";
                mensaje = "PLAZO VENCIDO (" + Math.abs(diasRestantes) + " días de retraso)";
            } else if (diasRestantes <= margen15) {
                semaforo = "AMARILLO";
                mensaje = "ALERTA: Queda menos del 15% del tiempo (" + diasRestantes + " días)";
            } else {
                semaforo = "VERDE";
                mensaje = "EN TIEMPO (" + diasRestantes + " días restantes)";
            }
        }

        // Devolvemos el Record con los datos (ya sean los calculados o los de "Pausa")
        return new RObrasResponse(
                r.id(), r.nombre(), r.cliente(), r.montoAntesIva(),
                r.fechaInicio(), r.fechaFin(), r.noSemanas(),
                r.gerente(), r.residente(), r.observaciones(), r.status(),
                semaforo, mensaje);
    }

    // para el status a CIERRE
    @Transactional
    public void actualizarEstatus(String id, String nuevoEstatus) {

        // Buscamos la obra en la base de datos usando repositorio
        var obra = repository.findById(UUID.fromString(id))
                .orElseThrow(() -> new RuntimeException("Obra no encontrada con ID: " + id));

        // Convertimos "CIERRE" a tu Enum de Java (EStatus.CIERRE)
        // Usamos toUpperCase() por seguridad, para que coincida perfectamente
        EStatus estatusEnum = EStatus.valueOf(nuevoEstatus.toUpperCase());

        // Actualizamos el valor
        obra.setStatus(estatusEnum);

        // Guardamos los cambios
        repository.save(obra);

        log.info("Estatus de la obra {} actualizado a {}", obra.getNombre(), nuevoEstatus);
    }

    public void actualizarFecha(RActualizarFecha request) {
        var obra = repository.findById(request.id()).get();

        obra.setFechaInicio(request.fechaInicio());
        obra.setFechaFin(request.fechaFin());
        obra.setNoSemanas(request.noSemanas());
        
        repository.save(obra);
    }

}