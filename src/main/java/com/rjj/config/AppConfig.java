package com.rjj.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.rjj.config.props.RMinioProperties;

import io.minio.MinioClient;

@Configuration
@EnableConfigurationProperties(RMinioProperties.class)
public class AppConfig {
  @Bean
  public MinioClient minioClient(RMinioProperties props) {
    return MinioClient.builder().endpoint(props.endpoint()).credentials(props.accessKey(), props.secretKey()).build();
  }
}
