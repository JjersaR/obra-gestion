package com.rjj;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class ObraGestionApplication {

  public static void main(String[] args) {
    SpringApplication.run(ObraGestionApplication.class, args);
  }

}
