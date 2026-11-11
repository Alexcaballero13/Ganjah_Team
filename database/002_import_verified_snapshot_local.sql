-- Importación local repetible del subconjunto completamente verificable.
-- Conserva 30 jugadores, 32 encabezados y las 62 participaciones visibles
-- de los MatchDays 49-52. Los 443 vínculos restantes no se inventan.
\set ON_ERROR_STOP on

begin;
truncate table matchday_jugadores, matchday, jugadores restart identity cascade;
\ir ../backend/src/main/resources/dev-data.sql

-- Relación legítima: sólo nombres que coinciden exactamente con el plantel.
update matchday_jugadores mj
set jugador_id = j.id
from jugadores j
where lower(btrim(j.nombre)) = lower(btrim(mj.nombre_jugador));

select setval(pg_get_serial_sequence('jugadores','id'), (select max(id) from jugadores), true);
select setval(pg_get_serial_sequence('matchday','id'), (select max(id) from matchday), true);
commit;
