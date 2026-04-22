package com.rjj.obras.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rjj.archivos.entity.Archivos;
import com.rjj.archivos.repository.IArchivosRepository;
import com.rjj.archivos.service.IStorageService;
import com.rjj.descargas.repository.ObraVisualizacionRepository;
import com.rjj.movobra.entity.Movobra;
import com.rjj.movobra.repository.IMovobraRepository;
import com.rjj.obras.repository.IObrasRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BorrarObraService {

  private final IObrasRepository obraRepository;
  private final IMovobraRepository movobraRepository;
  private final ObraVisualizacionRepository obraVisualizacionRepository;
  private final IArchivosRepository archivosRepository;
  private final IStorageService storageService;

  @Transactional(rollbackFor = Exception.class)
  public void eliminarObraCompleta(UUID obraId) {
    log.info("Iniciando eliminación completa de obra con ID: {}", obraId);

    List<String> errores = new ArrayList<>();

    // Verificar existencia
    if (!obraRepository.existsById(obraId)) {
      throw new EntityNotFoundException("No se encontró la obra con ID: " + obraId);
    }

    // Obtener todos los movimientos
    List<Movobra> movimientos = movobraRepository.findByObraId(obraId);

    // Recolectar todos los archivos a eliminar
    List<Archivos> todosLosArchivos = new ArrayList<>();
    for (Movobra movimiento : movimientos) {
      todosLosArchivos.addAll(archivosRepository.findByMovobraId(movimiento.getObraId()));
    }

    // Intentar eliminar todos los archivos
    for (Archivos archivo : todosLosArchivos) {
      try {
        storageService.eliminarArchivo(archivo.getBucket(), archivo.getUrl());
        log.debug("Archivo eliminado: {}", archivo.getId());
      } catch (Exception e) {
        String error = String.format("Error eliminando archivo %s de bucket %s: %s",
            archivo.getUrl(), archivo.getBucket(), e.getMessage());
        errores.add(error);
        log.error(error, e);
      }
    }

    // Si hubo errores, lanzar excepción para hacer rollback
    if (!errores.isEmpty()) {
      throw new RuntimeException("Error al eliminar archivos físicos: " + String.join("; ", errores));
    }

    // Si todos los archivos se eliminaron correctamente, proceder con BD
    // Eliminar registros de archivos
    for (Movobra movimiento : movimientos) {
      archivosRepository.deleteByMovobraId(movimiento.getObraId());
    }

    // Eliminar movimientos
    movobraRepository.deleteByObraId(obraId);

    // Eliminar visualizaciones
    obraVisualizacionRepository.deleteByObraId(obraId.toString());

    // Eliminar obra
    obraRepository.deleteById(obraId);

    log.info("Obra eliminada exitosamente con todos sus recursos");
  }
}
