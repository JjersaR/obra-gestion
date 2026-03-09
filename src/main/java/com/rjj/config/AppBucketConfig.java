package com.rjj.config;

import org.springframework.context.annotation.Configuration;

import com.rjj.config.props.RMinioBucket;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@AllArgsConstructor
public class AppBucketConfig {

  private final MinioClient minioClient;
  private final RMinioBucket props;

  @PostConstruct
  public void init() {
    createBucketIfNotExists(props.especial());
    createBucketIfNotExists(props.comun());
  }

  private void createBucketIfNotExists(String bucketName) {
    try {
      boolean exists = minioClient.bucketExists(
          BucketExistsArgs.builder()
              .bucket(bucketName)
              .build());

      if (!exists) {
        minioClient.makeBucket(
            MakeBucketArgs.builder()
                .bucket(bucketName)
                .build());
        log.info("Bucket " + bucketName + " se ha creado");
      }

    } catch (Exception e) {
      throw new RuntimeException("Error creando bucket " + bucketName, e);
    }
  }
}
