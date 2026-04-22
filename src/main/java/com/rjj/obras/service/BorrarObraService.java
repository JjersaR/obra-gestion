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
    log.info("Eliminando obra completa: {}", obraId);

    // Verificar que la obra existe
    var obra = obraRepository.findById(obraId)
        .orElseThrow(() -> new EntityNotFoundException("Obra no encontrada: " + obraId));

    log.info("Obra a eliminar: {}", obra.getNombre());

    // 1. Eliminar archivos físicos de Minio
    List<Archivos> archivos = archivosRepository.findByMovobraId(obraId);
    log.info("Archivos a eliminar: {}", archivos.size());

    if (!archivos.isEmpty()) {
      List<String> errores = new ArrayList<>();

      for (Archivos archivo : archivos) {
        try {
          storageService.eliminarArchivo(archivo.getBucket(), archivo.getUrl());
          log.info("✓ Archivo eliminado: {}", archivo.getUrl());
        } catch (Exception e) {
          errores.add(String.format("%s [bucket=%s, url=%s]",
              e.getMessage(), archivo.getBucket(), archivo.getUrl()));
          log.error("✗ Error eliminando archivo: {}", archivo.getUrl(), e);
        }
      }

      if (!errores.isEmpty()) {
        throw new RuntimeException("Error al eliminar archivos: " + String.join("; ", errores));
      }

      // 2. Eliminar registros de archivos
      archivosRepository.deleteByMovobraId(obraId);
      log.info("✓ Registros de archivos eliminados");
    }

    // 3. Eliminar movimientos
    movobraRepository.deleteByObraId(obraId);
    log.info("✓ Movimientos eliminados");

    // 4. Eliminar visualizaciones
    obraVisualizacionRepository.deleteByObraId(obraId.toString());
    log.info("✓ Visualizaciones eliminadas");

    // 5. Eliminar la obra
    obraRepository.delete(obra);
    log.info("✓ Obra eliminada exitosamente");
  }

}
