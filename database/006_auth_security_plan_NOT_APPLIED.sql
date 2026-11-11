-- PLAN LOCAL REVISABLE. NO EJECUTAR EN SUPABASE SIN AUTORIZACIÓN DEL PROPIETARIO.
-- La aplicación mantiene Spring Boot como único consumidor de PostgreSQL.
-- No modifica las tablas deportivas ni reconstruye participaciones históricas.

begin;

create table if not exists public.auth_sessions (
    session_id varchar(64) primary key,
    username varchar(80) not null,
    expires_at timestamptz not null
);
create index if not exists auth_sessions_expires_at_idx on public.auth_sessions (expires_at);

create table if not exists public.login_attempts (
    fingerprint varchar(64) primary key,
    window_started_at timestamptz not null,
    failure_count integer not null check (failure_count >= 0),
    locked_until timestamptz null
);

-- Opción recomendada si ningún consumidor legítimo necesita Data API:
-- 1. Deshabilitar Data API desde Dashboard > Integrations > Data API.
-- 2. Ejecutar las revocaciones/RLS ya revisadas en 005_supabase_security_plan_NOT_APPLIED.sql.
-- 3. Crear un rol JDBC de mínimo privilegio para Spring Boot fuera del navegador.
--
-- Si Data API debe mantenerse, diseñar políticas por rol antes de otorgar GRANT.
-- No usar `TO authenticated` sin un predicado de propiedad ni exponer service_role.

rollback;

-- Validación de solo lectura posterior a una aplicación autorizada:
-- select tablename, rowsecurity from pg_tables where schemaname = 'public'
--   and tablename in ('jugadores','matchday','matchday_jugadores','auth_sessions','login_attempts');
-- select count(*) from public.auth_sessions where expires_at <= now();
