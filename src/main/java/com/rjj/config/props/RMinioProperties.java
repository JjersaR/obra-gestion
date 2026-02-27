package com.rjj.config.props;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "external-server.minio")
public record RMinioProperties(
    String endpoint,
    String accessKey,
    String secretKey) {

}
