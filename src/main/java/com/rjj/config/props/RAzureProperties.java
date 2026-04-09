package com.rjj.config.props;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "external-server.azure.storage")
public record RAzureProperties(String url) {

}
