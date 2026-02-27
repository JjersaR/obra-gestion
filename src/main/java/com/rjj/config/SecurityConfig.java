package com.rjj.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) {
    http.csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/img/**", "/css/**", "/js/**").permitAll()
            .requestMatchers("").hasRole("")
            .anyRequest().authenticated())
        .formLogin(form -> form
            .loginPage("/") // Página JSP para el formulario de login
            .loginProcessingUrl("api/login") // URL donde se procesan las credenciales del formulario de login
            .defaultSuccessUrl("/index", true) // Redirigir a /index tras login exitoso
            .permitAll() // Permitir acceso sin autenticación a la página de login
        )
        .logout(logout -> logout
            .deleteCookies("JSESSIONID"))
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

    return http.build();
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config) {
    return config.getAuthenticationManager();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }
}
