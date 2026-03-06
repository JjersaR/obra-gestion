package com.rjj.archivos.service;

import java.io.InputStream;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.rjj.archivos.entity.Archivos;
import com.rjj.archivos.repository.IArchivosRepository;
import com.rjj.movobra.entity.ETipo;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArchivosService {

  private final IArchivosRepository repository;
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

    Archivos archivo = new Archivos();
    archivo.setBucket(determinarBucket(categoria));
    archivo.setUrl(objectKey);
    archivo.setTipoEntidad(tipoEntidad);
    archivo.setMovobraId(movobraId);
    archivo.setCategoria(categoria);
    archivo.setVersion(newVersion);
    archivo.setActual(true);
    archivo.setSizeBytes(file.getSize());
    archivo.setChecksum(calcularChecksum(file));
    archivo.setMimeType(file.getContentType());
    archivo.setInmutable(esFinanciero(categoria));

    var guardado = repository.save(archivo);

    return guardado.getId();
  }

  private Boolean esFinanciero(ETipo categoria) {
    switch (categoria) {
      case REQUERIMIENTOS,
          R_FACTURA,
          PAGO_PROVEEDOR,
          PP_COMPROBANTE,
          PAGO_NOMINA,
          PN_ARCHIVO,
          PN_COMPROBANTE:
        return false;
      default:
        return true;
    }
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
      case REQUERIMIENTOS,
          R_FACTURA,
          PAGO_PROVEEDOR,
          PP_COMPROBANTE,
          PAGO_NOMINA,
          PN_ARCHIVO,
          PN_COMPROBANTE:
        return "financieros";
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
}
