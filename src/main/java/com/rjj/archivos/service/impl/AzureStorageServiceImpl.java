package com.rjj.archivos.service.impl;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobServiceClient;
import com.rjj.archivos.controller.utils.NameBuilder;
import com.rjj.archivos.service.IStorageService;
import com.rjj.movobra.entity.ETipo;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@AllArgsConstructor
public class AzureStorageServiceImpl implements IStorageService {

  private BlobServiceClient serviceClient;
  private NameBuilder builder;

  @Override
  public String upload(ETipo tipoEntidad, UUID movobraId, ETipo categoria, int version, MultipartFile file) {
    try {
      var objectKey = builder.build(tipoEntidad, movobraId, categoria, version, file);
      var bucket = determinarBucket(categoria);

      BlobClient blobClient = serviceClient
          .getBlobContainerClient(bucket)
          .getBlobClient(objectKey);

      blobClient.upload(file.getInputStream(), file.getSize(), true);

      return objectKey;
    } catch (Exception e) {
      throw new RuntimeException("Error subiendo archivo a MinIO", e);
    }
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
          ALMACEN,
          COMENTARIOS_AD:
        return "requerimientos";
      case CONSTRUCCION, MANO_OBRA:
        return "construccion";
      default:
        return "documentos";
    }
  }

  @Override
  public InputStream download(String bucket, String objectKey) {
    try {
      return serviceClient
          .getBlobContainerClient(bucket)
          .getBlobClient(objectKey)
          .openInputStream();
    } catch (Exception e) {
      throw new RuntimeException("Error descargando archivo", e);
    }
  }

  @Override
  public void eliminarArchivo(String bucket, String url) {
    try {
      serviceClient
          .getBlobContainerClient(bucket)
          .getBlobClient(url)
          .delete();
      log.info("Archivo eliminado de Azure: container={}, object={}",
          bucket, url);

    } catch (Exception e) {
      log.error("Error inesperado eliminando archivo de Minio: bucket={}, url={}", bucket, url, e);
    }
  }

}
