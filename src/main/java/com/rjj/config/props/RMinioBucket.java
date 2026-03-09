package com.rjj.config.props;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "external-server.minio.buckets")
public record RMinioBucket(String especial, String comun) {

}
