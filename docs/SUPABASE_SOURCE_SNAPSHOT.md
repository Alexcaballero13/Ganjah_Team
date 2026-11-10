# Snapshot de origen Supabase

Extracción de solo lectura realizada el 2026-11-10 sobre el único proyecto autorizado:

- Proyecto: `Alexcaballero13's Project`
- Referencia: `tpipzcwxzzqdbeqmyohg`
- Región: `us-east-2`
- No se ejecutaron escrituras, migraciones, cambios de políticas ni despliegues.

## Inventario verificado

| Entidad | Registros | Estado local |
| --- | ---: | --- |
| `jugadores` | 30 | READY: nombres, posiciones, ataque, defensa e ID de origen adaptados a H2/tarjetas |
| `matchday` | 32 | PARTIAL: IDs, fechas y único marcador disponible conservados |
| `matchday_jugadores` | 505 | PARTIAL: cuatro MatchDays tienen equipo; los anteriores conservan participantes sin lado asignado en origen |

El modelo remoto usa `jugadores(id, nombre, posicion, nivel_ataque, nivel_defensa)`,
`matchday(id, fecha_partido, goles_local, goles_visitante)` y
`matchday_jugadores(matchday_id, nombre_jugador, equipo)`. La relación de
participaciones con jugadores está basada en texto, no en `jugador_id`.

## Reglas aplicadas localmente

- Los IDs de Supabase se conservan en `legacySequence`; el `id` local sigue siendo el identificador operativo de H2.
- Se recortan conceptualmente espacios finales para comparar nombres, sin fusionar alias ni invitados.
- Ataque y defensa siguen usando la escala real de 1 a 5 estrellas.
- La categoría visual se calcula en un único punto con el promedio real `(ataque + defensa) / 2`: superior desde 3.5, regular desde 2.5 y bajo rendimiento por debajo de 2.5.
- No se inventan dorsales, fotos, goles, resultados, posiciones tácticas ni equipos históricos.
- Los cuatro MatchDays 49, 50, 51 y 52 son snapshots locales de solo lectura porque sí tienen lado LOCAL/VISITANTE verificable.

## Riesgo remoto que debe resolverse antes de integrar

Las tres tablas del esquema `public` tienen RLS desactivado, ninguna política y el propio panel indica acceso desde Data API para cualquiera. Tampoco hay usuarios visibles en Authentication. Antes de conectar el frontend a Supabase se debe diseñar autenticación, habilitar RLS y crear políticas de mínimo privilegio; nunca se debe exponer una clave `service_role` en el navegador.

## Pendientes

- Definir si los 28 MatchDays antiguos mostrarán una lista neutral de participantes o si el propietario puede recuperar el lado de cada jugador.
- Sustituir la relación textual por una referencia estable a jugador manteniendo invitados históricos diferenciados.
- Confirmar una política de deduplicación para nombres con espacios y alias antes de una migración.
- Rotar las credenciales previamente expuestas; no forman parte de este snapshot.

