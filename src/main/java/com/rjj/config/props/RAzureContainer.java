package com.rjj.config.props;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "external-server.azure.container")
public record RAzureContainer(String requerimiento, String construccion, String comun) {

}
