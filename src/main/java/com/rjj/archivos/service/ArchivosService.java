package com.rjj.archivos.service;

import com.rjj.archivos.controller.utils.ExcelUtils;
import java.io.InputStream;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.rjj.archivos.controller.dto.IArchivoMapper;
import com.rjj.archivos.controller.dto.IRequerimientosActivos;
import com.rjj.archivos.controller.dto.RArchivoResponse;
import com.rjj.archivos.entity.Archivos;
import com.rjj.archivos.repository.IArchivosRepository;
import com.rjj.movobra.entity.ETipo;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArchivosService {

  private final IArchivosRepository repository;
  private final IArchivoMapper mapper;
  private final IStorageService storageService;

  @Transactional
  public UUID subirArchivo(
      ETipo tipoEntidad,
      UUID movobraId,
      ETipo categoria,
      MultipartFile file) {

    validarInmutable(tipoEntidad, movobraId, categoria);

    int newVersion = nuevaVersion(tipoEntidad, movobraId, categoria);

    String objectKey = storageService.upload(tipoEntidad, movobraId, categoria, newVersion, file);

    repository.desactivarVersionesAnteriores(
        tipoEntidad,
        movobraId,
        categoria);

    // --- AQUÍ EMPIEZA lo del excel ---
    if (categoria == ETipo.MANO_OBRA) {
      try {
        // Leemos el total directamente del archivo que acaba de llegar
        double totalExtraido = ExcelUtils.extraerTotalNomina(file.getInputStream());
        log.info("TOTAL extraido del Excel de Mano de Obra: {}", totalExtraido);

        // TODO: Aquí se llamaria al ObraService para actualizar el Gasto Total
        // obraService.actualizarGastoManoObra(movobraId, totalExtraido);

      } catch (Exception e) {
        log.error("No se pudo leer el total del Excel: {}", e.getMessage());
      }
    }
    // --- AQUÍ TERMINA LO NUEVO ---

    Archivos archivo = new Archivos();
    archivo.setBucket(determinarBucket(categoria));
    archivo.setUrl(objectKey);
    archivo.setNombre(file.getOriginalFilename());
    archivo.setTipoEntidad(tipoEntidad);
    archivo.setMovobraId(movobraId);
    archivo.setCategoria(categoria);
    archivo.setVersion(newVersion);
    archivo.setActual(true);
    archivo.setSizeBytes(file.getSize());
    archivo.setChecksum(calcularChecksum(file));
    archivo.setMimeType(file.getContentType());
    archivo.setInmutable(false);

    var guardado = repository.save(archivo);

    return guardado.getId();
  }

  // petición, vaya a MinIO por el archivo usando tu método download(), lo
  // convierta en un InputStreamResource
  // y se lo inyecte directamente al navegador para que comience la descarga.
  public InputStream descargarArchivo(String categoriaStr, String url) {
    // Convertimos el texto a tu Enum
    ETipo categoria = ETipo.valueOf(categoriaStr.toUpperCase());

    // Usamos la lógica existente para saber si es "financieros" o "documentos"
    String bucket = determinarBucket(categoria);

    // Vamos a MinIO por los bytes
    return storageService.download(bucket, url);
  }

  private void validarInmutable(ETipo tipoEntidad,
      UUID movobraId,
      ETipo categoria) {
    boolean existeInmutable = repository
        .existsByTipoEntidadAndMovobraIdAndCategoriaAndInmutableTrue(
            tipoEntidad, movobraId, categoria);

    if (existeInmutable) {
      throw new IllegalStateException("Archivo inmutable ya existe");
    }
  }

  private int nuevaVersion(ETipo tipoEntidad,
      UUID movobraId,
      ETipo categoria) {
    var maxVersion = repository.findByMaxVersion(tipoEntidad, movobraId, categoria);
    return (maxVersion == null) ? 1 : maxVersion + 1;
  }

  private String determinarBucket(ETipo categoria) {
    switch (categoria) {
      case
          ORDEN_COMPRA,
          PRESUPUESTO,
          EXPLOSION_INSUMOS,
          ORDEN_COMPRA_EXT1,
          ORDEN_COMPRA_EXT2,
          PROYECTO,
          PROGRAMA,
          MEMORIAS,
          COMENTARIOS_AD:
        return "requerimientos";
      case CONSTRUCCION, MANO_OBRA:
        return "construccion";
      default:
        return "documentos";
    }
  }

  public String calcularChecksum(MultipartFile file) {

    try (InputStream is = file.getInputStream()) {

      MessageDigest digest = MessageDigest.getInstance("SHA-256");

      DigestInputStream dis = new DigestInputStream(is, digest);

      byte[] buffer = new byte[8192];
      while (dis.read(buffer) != -1) {
        // solo leer para que el digest procese
      }

      byte[] hash = digest.digest();

      return bytesToHex(hash);

    } catch (Exception e) {
      throw new RuntimeException("Error calculando checksum", e);
    }
  }

  private String bytesToHex(byte[] bytes) {
    StringBuilder sb = new StringBuilder();
    for (byte b : bytes) {
      sb.append(String.format("%02x", b));
    }
    return sb.toString();
  }

  public List<RArchivoResponse> listarArchivos(String bucket, String tipoEntidad, String movobraId, String categoria) {
    var archivos = repository.findByBucketAndTipoEntidadAndMovobraIdAndActualTrueAndCategoriaOrderByVersionDesc(bucket,
        determinarCampo(tipoEntidad),
        movobraId, determinarCampo(categoria));

    return mapper.toDtoList(archivos);
  }

  private ETipo determinarCampo(String dato) {
    try {
      return ETipo.valueOf(dato.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new IllegalArgumentException("Tipo no válido: " + dato);
    }
  }

  public List<IRequerimientosActivos> findByRequerimientosActivos(UUID movobraId) {
    return repository.findByRequerimientosActivos(movobraId);
  }

  public double obtenerGastoTotalManoObra(UUID movobraId) {
    double totalManoObra = 0.0;
    double totalProveedores = 0.0;

    System.out.println("=== INICIO DE DIAGNÓSTICO DE GASTOS ===");

    try {
      // 1. MANO_OBRA (Esto ya te funciona perfecto)
      Archivos archivoMO = repository.findByMovobraIdAndCategoriaAndActualTrue(movobraId, ETipo.MANO_OBRA);
      if (archivoMO != null) {
        try (InputStream is = storageService.download(archivoMO.getBucket(), archivoMO.getUrl())) {
          totalManoObra = ExcelUtils.extraerTotalNomina(is);
          System.out.println("💰 Valor MO: " + totalManoObra);
        }
      }

      // 2. PAGO_PROVEEDORES (El truco: buscamos en DOCUMENTOS si el otro falla)
      Archivos archivoProv = repository.findByMovobraIdAndCategoriaAndActualTrue(movobraId, ETipo.DOCUMENTOS);

      // Si lo encontró y el nombre tiene la palabra "PROVEEDORES", lo procesamos
      if (archivoProv != null && archivoProv.getNombre().toUpperCase().contains("PROVEEDORES")) {
        System.out.println("✅ Archivo PROVEEDORES detectado en Documentos: " + archivoProv.getNombre());
        try (InputStream is = storageService.download(archivoProv.getBucket(), archivoProv.getUrl())) {
          totalProveedores = ExcelUtils.extraerTotalNomina(is);
          System.out.println("💰 Valor Proveedores: " + totalProveedores);
        }
      } else {
        System.out.println("⚠️ No se encontró archivo de proveedores con ese nombre en DOCUMENTOS");
      }

      return totalManoObra + totalProveedores;

    } catch (Exception e) {
      // Si hay un error (como que encuentre 2 archivos en docuemntos ), devolvemos al
      // menos la Mano de Obra
      System.err.println("🚨 Nota: " + e.getMessage());
      return totalManoObra;
    }
  }

}
