# Sistema visual Cancha Eléctrica

La implementación utiliza la identidad aprobada de Ganjah Team sin reinterpretarla.

## Tokens principales

- Pitch 950 `#06110D`: fondo principal.
- Pitch 850 `#10251B`: tarjetas y superficies elevadas.
- Electric 500 `#22E36D`: acciones primarias y selección.
- Lime 300 `#C9F45B`: marcadores y cifras destacadas.
- Chalk 50 `#F4F8F5`: texto principal.
- Steel 400 `#8CA398`: texto secundario.

Tipografías: Barlow Condensed para titulares, Inter para interfaz y Roboto Mono para cifras.

Los componentes mantienen contraste WCAG AA, focus visible, objetivos táctiles de al menos 44 px y adaptación desde 320 px. Los estados nunca dependen únicamente del color.

La guía completa aprobada permanece en `outputs/GANJAH_TEAM_IDENTIDAD_VISUAL_FASE_2.md` dentro del espacio de trabajo de esta fase.

## Categorías de jugador

La función central está en `frontend/src/lib/player-tier.ts`. Prioriza el nivel
efectivo calculado por el backend, luego el nivel general y, si aún no existe
historial, usa el promedio explícito entre ataque y defensa.

- Dorado: nivel mayor o igual a 4.0.
- Plateado: nivel mayor o igual a 2.5 y menor que 4.0.
- Bronce: nivel menor que 2.5.

Los umbrales viven en `PLAYER_TIER_THRESHOLDS` y pueden ajustarse sin cambiar
los componentes. El backend no ofrece todavía fotografía, dorsal ni coordenadas
tácticas. Por ello se muestra un avatar de iniciales, se omite el dorsal y el
campo ordena las tarjetas usando el texto real de posición.
Si un jugador fue eliminado pero continúa referenciado por un MatchDay histórico,
su tarjeta se muestra neutral como “Sin datos” en lugar de inventar una categoría.

