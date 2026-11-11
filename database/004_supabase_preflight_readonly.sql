-- Consultas de solo lectura para ejecutar antes de cualquier migración remota.
select 'jugadores' entidad, count(*) registros, count(distinct id) ids_unicos from jugadores
union all
select 'matchday', count(*), count(distinct id) from matchday;

select lower(btrim(nombre)) nombre_normalizado, count(*)
from jugadores
group by lower(btrim(nombre))
having count(*) > 1;

select mj.matchday_id, mj.nombre_jugador, count(*)
from matchday_jugadores mj
group by mj.matchday_id, mj.nombre_jugador
having count(*) > 1;

select distinct btrim(mj.nombre_jugador) etiqueta_pendiente
from matchday_jugadores mj
left join jugadores j on lower(btrim(j.nombre)) = lower(btrim(mj.nombre_jugador))
where j.id is null
order by 1;

select c.relname tabla, c.relrowsecurity rls_habilitado
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('jugadores','matchday','matchday_jugadores');
