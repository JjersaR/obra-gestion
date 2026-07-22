package com.rjj.usuarios.service;

public interface EmailService {

    void enviarCorreo(
        String destinatario,
        String asunto,
        String mensaje
    );
}