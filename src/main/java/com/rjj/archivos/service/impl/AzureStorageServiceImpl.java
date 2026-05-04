package com.rjj.archivos.service.impl;

import java.io.InputStream;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.models.ParallelTransferOptions;
import com.azure.storage.blob.options.BlockBlobOutputStreamOptions;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import com.azure.storage.blob.specialized.BlobOutputStream;
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

      BlockBlobOutputStreamOptions options = new BlockBlobOutputStreamOptions()
          .setHeaders(new BlobHttpHeaders()
              .setContentType(file.getContentType()))
          .setParallelTransferOptions(new ParallelTransferOptions()
              .setBlockSizeLong(50L * 1024L * 1024L)
              .setMaxConcurrency(5));

      try (InputStream inputStream = file.getInputStream();
          BlobOutputStream outputStream = blobClient.getBlockBlobClient()
              .getBlobOutputStream(options)) {

        byte[] buffer = new byte[50 * 1024 * 1024]; // buffer de 50MB
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
          outputStream.write(buffer, 0, bytesRead);
        }
      }

      return objectKey;
    } catch (Exception e) {
      throw new RuntimeException("Error subiendo archivo a Azure", e);
    }
  }

  @Override
  public String generarSasUrl(String containerName, String objectKey, String contentType) {
    BlobClient blobClient = serviceClient
        .getBlobContainerClient(containerName)
        .getBlobClient(objectKey);

    BlobSasPermission permissions = new BlobSasPermission()
        .setWritePermission(true)
        .setCreatePermission(true);

    BlobServiceSasSignatureValues values = new BlobServiceSasSignatureValues(
        OffsetDateTime.now().plusMinutes(30), // expira en 30 min
        permissions)
        .setContentType(contentType);

    String sasToken = blobClient.generateSas(values);
    return blobClient.getBlobUrl() + "?" + sasToken;
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
