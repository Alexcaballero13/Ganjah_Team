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
import java.util.ArrayList;
import java.util.List;
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
        List<Map<String, Object>> roster = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            String nombre = "Prueba " + i;
            crearJugador(nombre, i % 2 == 0 ? "Defensa" : "Delantero", 3 + i % 2, 3 + (i + 1) % 2);
            Map<String, Object> participante = new LinkedHashMap<>();
            participante.put("nombre", nombre);
            participante.put("equipo", i <= 6 ? "LOCAL" : "VISITANTE");
            roster.add(participante);
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("jugadores", roster);

        String response = mockMvc.perform(post("/api/matchdays")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jugadores.length()").value(12))
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(get("/api/matchdays"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].jugadores.length()").value(12));

        mockMvc.perform(put("/api/matchdays/{id}/marcador", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"golesLocal\":3,\"golesVisitante\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.golesLocal").value(3))
                .andExpect(jsonPath("$.golesVisitante").value(2));
    }

    @Test
    void rechazaMarcadorNegativoYRostersFueraDeLasReglasOriginales() throws Exception {
        Map<String, Object> local = new LinkedHashMap<>();
        local.put("nombre", "Duplicado");
        local.put("equipo", "LOCAL");
        Map<String, Object> visitante = new LinkedHashMap<>();
        visitante.put("nombre", "Duplicado");
        visitante.put("equipo", "VISITANTE");
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("jugadores", Arrays.asList(local, visitante));

        mockMvc.perform(post("/api/matchdays")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(put("/api/matchdays/{id}/marcador", 999999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"golesLocal\":-1,\"golesVisitante\":0}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rechazaJugadorSinNombreOPosicion() throws Exception {
        mockMvc.perform(post("/api/jugadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\" \",\"posicion\":\"\",\"nivelAtaque\":3,\"nivelDefensa\":3}"))
                .andExpect(status().isBadRequest());
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
