-- Falla de forma explícita si la importación local pierde integridad.
\set ON_ERROR_STOP on

do $$
begin
  if (select count(*) from jugadores) <> 30 then
    raise exception 'Conteo de jugadores distinto de 30';
  end if;
  if (select count(distinct id) from jugadores) <> 30 then
    raise exception 'IDs de jugadores duplicados';
  end if;
  if exists (select 1 from jugadores where nivel_ataque not between 1 and 5 or nivel_defensa not between 1 and 5) then
    raise exception 'Estrellas fuera del rango 1-5';
  end if;
  if (select count(*) from matchday) <> 32 then
    raise exception 'Conteo de MatchDays distinto de 32';
  end if;
  if (select count(*) from matchday_jugadores) <> 62 then
    raise exception 'Conteo verificable de participaciones distinto de 62';
  end if;
  if (select count(*) from matchday_jugadores where jugador_id is not null) <> 59 then
    raise exception 'Relaciones exactas a jugadores distintas de 59';
  end if;
  if (select count(*) from matchday_jugadores where jugador_id is null) <> 3 then
    raise exception 'Etiquetas históricas pendientes distintas de 3';
  end if;
  if exists (
    select 1 from matchday_jugadores mj
    left join matchday m on m.id = mj.matchday_id
    where m.id is null
  ) then
    raise exception 'Participaciones huérfanas de MatchDay';
  end if;
end $$;

select
  (select count(*) from jugadores) as jugadores,
  (select count(*) from matchday) as matchdays,
  (select count(*) from matchday_jugadores) as participaciones_verificadas,
  (select count(*) from matchday_jugadores where jugador_id is not null) as relaciones_exactas,
  (select count(*) from matchday_jugadores where jugador_id is null) as etiquetas_pendientes,
  (select count(*) from matchday where goles_local is not null) as marcadores_completos;
