-- Validación reproducible del esquema y seed sintético de Preview.
\set ON_ERROR_STOP on

do $$
declare
  tabla text;
begin
  foreach tabla in array array[
    'jugadores', 'matchday', 'matchday_jugadores',
    'auth_sessions', 'login_attempts'
  ] loop
    if to_regclass('public.' || tabla) is null then
      raise exception 'Falta la tabla %', tabla;
    end if;
  end loop;

  if (select count(*) from jugadores where nombre like 'PREVIEW TEST %') <> 12 then
    raise exception 'El seed de Preview no contiene 12 jugadores sintéticos';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name in ('jugadores', 'matchday')
      and column_name in ('nivel_ataque', 'nivel_defensa', 'goles_local', 'goles_visitante')
      and data_type <> 'integer'
  ) then
    raise exception 'Los niveles o marcadores no usan integer';
  end if;

  if exists (
    select 1 from jugadores
    where nivel_ataque not between 1 and 5 or nivel_defensa not between 1 and 5
  ) then
    raise exception 'Hay niveles fuera del rango 1-5';
  end if;
end $$;
