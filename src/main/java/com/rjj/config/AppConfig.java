package com.rjj.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.rjj.config.props.RAzureProperties;

@Configuration
@EnableConfigurationProperties(RAzureProperties.class)
public class AppConfig {

  @Bean
  public BlobServiceClient blobServiceClient(RAzureProperties props) {
    return new BlobServiceClientBuilder().connectionString(props.url()).buildClient();
  }
}
