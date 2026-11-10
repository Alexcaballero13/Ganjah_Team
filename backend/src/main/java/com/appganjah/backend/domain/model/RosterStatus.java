package com.appganjah.backend.domain.model;

/**
 * Distingue una alineación conocida de un dato histórico que la interfaz
 * original no permitió recuperar. DESCONOCIDO nunca significa equipo vacío.
 */
public enum RosterStatus {
    COMPLETO,
    DESCONOCIDO
}
