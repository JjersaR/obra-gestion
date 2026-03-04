package com.rjj.archivos.service.impl;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.rjj.archivos.controller.utils.NameBuilder;
import com.rjj.archivos.service.IStorageService;
import com.rjj.movobra.entity.ETipo;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@AllArgsConstructor
public class MinioStorageServiceImpl implements IStorageService {

  private MinioClient minioClient;
  private NameBuilder builder;

  @Override
  public String upload(
      ETipo tipoEntidad,
      UUID movobraId,
      ETipo categoria,
      int version,
      MultipartFile file) {
    try {
      var objectKey = builder.build(tipoEntidad, movobraId, categoria, version, file);
      var bucket = determinarBucket(categoria);

      minioClient.putObject(
          PutObjectArgs.builder()
              .bucket(bucket)
              .object(objectKey)
              .stream(
                  file.getInputStream(),
                  file.getSize(),
                  -1)
              .contentType(file.getContentType())
              .build());

      return objectKey;
    } catch (Exception e) {
      throw new RuntimeException("Error subiendo archivo a MinIO", e);
    }
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

}
