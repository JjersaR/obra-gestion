package com.rjj.usuarios.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String remitente;
    @Override
    public void enviarCorreo(
            String destinatario,
            String asunto,
            String mensaje) {

        SimpleMailMessage correo = new SimpleMailMessage();
        correo.setFrom(remitente);
        correo.setTo(destinatario);
        correo.setSubject(asunto);
        correo.setText(mensaje);

        mailSender.send(correo);
    }
}