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

@SpringBootTest(properties = {
        "GANJAH_ADMIN_USER=test-admin",
        "GANJAH_ADMIN_USER_ALT=test-admin-alt",
        "GANJAH_ADMIN_PASSWORD=test-password",
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
        mockMvc.perform(get("/api/jugadores").with(httpBasic("test-admin", "test-password")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/jugadores").with(httpBasic("test-admin-alt", "test-password")))
                .andExpect(status().isOk());
    }

    @Test
    void conservaLosPermisosDelPerfilDeConsulta() throws Exception {
        mockMvc.perform(get("/api/jugadores").with(httpBasic("test-viewer", "test-viewer-password")))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/jugadores").with(httpBasic("test-viewer", "test-viewer-password")))
                .andExpect(status().isForbidden());
    }

    @Test
    void rechazaCredencialesInvalidas() throws Exception {
        mockMvc.perform(get("/api/jugadores").with(httpBasic("test-admin", "incorrecta")))
                .andExpect(status().isUnauthorized());
    }
}
