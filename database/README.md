# Preparación PostgreSQL local

Estos archivos no se conectan a Supabase. Validan en una instancia PostgreSQL
local aislada el subconjunto que puede reproducirse con evidencia completa.

Orden:

1. `001_schema_local.sql`
2. `002_import_verified_snapshot_local.sql`
3. `003_validate_local.sql`

El importador se puede ejecutar repetidamente: vacía sólo las tres tablas de la
base aislada y vuelve a cargar el snapshot original. El resultado esperado es
30 jugadores, 32 MatchDays, 62 participaciones verificables, 59 relaciones
exactas y 3 etiquetas históricas pendientes (`Amigo jose`, `Amigo rolo` y
`Daniel pri olave`).

`004_supabase_preflight_readonly.sql` contiene únicamente consultas para revisar
el estado remoto antes de una migración. `005_supabase_security_plan_NOT_APPLIED.sql`
es un plan de mínimo privilegio y no debe ejecutarse sin revisión y autorización.

Para un Preview independiente y vacío, el orden preparado es:

1. `007_preprod_schema_NOT_APPLIED.sql`
2. `008_preprod_synthetic_seed_NOT_APPLIED.sql`
3. `009_preprod_validate.sql`

El seed sólo se ejecuta cuando la base empieza por `ganjah_preview_` y contiene
12 jugadores identificados como `PREVIEW TEST`; no copia datos deportivos reales.

Los 505 vínculos detectados previamente en Supabase siguen siendo la fuente
remota completa. Este repositorio no fabrica los 443 que no están íntegramente
respaldados en la extracción local.
