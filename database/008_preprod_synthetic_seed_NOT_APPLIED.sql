-- DATOS FICTICIOS EXCLUSIVOS PARA PREVIEW.
-- La guarda impide ejecutarlo si el nombre de la base no empieza por
-- ganjah_preview_. No contiene jugadores ni resultados históricos.
\set ON_ERROR_STOP on

do $$
begin
  if current_database() not like 'ganjah_preview_%' then
    raise exception 'Base no autorizada para datos sintéticos: %', current_database();
  end if;
end $$;

begin;
delete from jugadores where nombre like 'PREVIEW TEST %';

insert into jugadores (nombre, posicion, nivel_ataque, nivel_defensa) values
  ('PREVIEW TEST 01', 'PORTERO', 2, 5),
  ('PREVIEW TEST 02', 'PORTERO', 2, 4),
  ('PREVIEW TEST 03', 'DEFENSA', 2, 5),
  ('PREVIEW TEST 04', 'DEFENSA', 3, 4),
  ('PREVIEW TEST 05', 'DEFENSA', 3, 3),
  ('PREVIEW TEST 06', 'DEFENSA', 2, 3),
  ('PREVIEW TEST 07', 'MEDIOCAMPISTA', 4, 3),
  ('PREVIEW TEST 08', 'MEDIOCAMPISTA', 4, 4),
  ('PREVIEW TEST 09', 'MEDIOCAMPISTA', 3, 3),
  ('PREVIEW TEST 10', 'DELANTERO', 5, 2),
  ('PREVIEW TEST 11', 'DELANTERO', 4, 2),
  ('PREVIEW TEST 12', 'DELANTERO', 3, 2);
commit;
