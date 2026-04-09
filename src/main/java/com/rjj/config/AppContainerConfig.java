package com.rjj.config;

import org.springframework.context.annotation.Configuration;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.rjj.config.props.RAzureContainer;

import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@AllArgsConstructor
public class AppContainerConfig {

  private final BlobServiceClient blobServiceClient;
  private final RAzureContainer props;

  @PostConstruct
  public void init() {
    createContainerIfNotExists(props.requerimiento());
    createContainerIfNotExists(props.construccion());
    createContainerIfNotExists(props.comun());
  }

  private void createContainerIfNotExists(String containerName) {
    try {
      BlobContainerClient containerClient = blobServiceClient
          .getBlobContainerClient(containerName);

      if (!containerClient.exists()) {
        containerClient.create();
        log.info("Container " + containerName + " se ha creado");
      }
    } catch (Exception e) {
      throw new RuntimeException("Error creando container " + containerName, e);
    }
  }
}
