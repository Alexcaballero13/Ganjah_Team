package com.appganjah.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest(properties = {
        "GANJAH_ADMIN_USER=test-admin",
        "GANJAH_ADMIN_USER_ALT=test-admin-alt",
        "GANJAH_ADMIN_PASSWORD=test-password",
        "GANJAH_ADMIN_PASSWORD_ALT=test-password-alt",
        "GANJAH_VIEWER_USER=test-viewer",
        "GANJAH_VIEWER_PASSWORD=test-viewer-password",
        "spring.sql.init.mode=never"
})
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void aceptaAmbosAdministradoresConfigurados() throws Exception {
        mockMvc.perform(get("/api/auth/me").with(httpBasic("test-admin", "test-password")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
        mockMvc.perform(get("/api/auth/me").with(httpBasic("test-admin-alt", "test-password-alt")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void conservaLosPermisosDelPerfilDeConsulta() throws Exception {
        mockMvc.perform(get("/api/jugadores").with(httpBasic("test-viewer", "test-viewer-password")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/auth/me").with(httpBasic("test-viewer", "test-viewer-password")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("VIEWER"));
        mockMvc.perform(post("/api/jugadores").with(httpBasic("test-viewer", "test-viewer-password")))
                .andExpect(status().isForbidden());
    }

    @Test
    void rechazaCredencialesInvalidas() throws Exception {
        mockMvc.perform(get("/api/jugadores").with(httpBasic("test-admin", "incorrecta")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rechazaUsuariosAnonimos() throws Exception {
        mockMvc.perform(get("/api/jugadores"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
