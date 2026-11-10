package com.appganjah.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "GANJAH_ADMIN_USER=test-admin",
        "GANJAH_ADMIN_PASSWORD=test-password",
        "GANJAH_VIEWER_USER=test-viewer",
        "GANJAH_VIEWER_PASSWORD=test-viewer-password",
        "spring.sql.init.mode=never"
})
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@WithMockUser(roles = "ADMIN")
class MatchDayIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void creaListaYActualizaUnMatchDayConSuAlineacion() throws Exception {
        crearJugador("Prueba Local", "Defensa", 4, 4);
        crearJugador("Prueba Visitante", "Delantero", 3, 3);

        Map<String, Object> local = new LinkedHashMap<>();
        local.put("nombre", "Prueba Local");
        local.put("equipo", "LOCAL");
        Map<String, Object> visitante = new LinkedHashMap<>();
        visitante.put("nombre", "Prueba Visitante");
        visitante.put("equipo", "VISITANTE");
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("jugadores", Arrays.asList(local, visitante));

        String response = mockMvc.perform(post("/api/matchdays")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jugadores.length()").value(2))
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(get("/api/matchdays"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].jugadores.length()").value(2));

        mockMvc.perform(put("/api/matchdays/{id}/marcador", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"golesLocal\":3,\"golesVisitante\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.golesLocal").value(3))
                .andExpect(jsonPath("$.golesVisitante").value(2));
    }

    private void crearJugador(String nombre, String posicion, int ataque, int defensa) throws Exception {
        Map<String, Object> jugador = new LinkedHashMap<>();
        jugador.put("nombre", nombre);
        jugador.put("posicion", posicion);
        jugador.put("nivelAtaque", ataque);
        jugador.put("nivelDefensa", defensa);
        mockMvc.perform(post("/api/jugadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jugador)))
                .andExpect(status().isOk());
    }
}
