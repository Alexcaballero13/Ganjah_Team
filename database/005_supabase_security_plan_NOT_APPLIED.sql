-- PLAN PREPARADO, NO APLICADO. Revisar y autorizar antes de usar en Supabase.
-- Arquitectura prevista: navegador -> Next.js -> Spring Boot -> JDBC.
-- La Data API no necesita acceso público a estas tablas.
begin;

revoke all on table public.jugadores from anon, authenticated;
revoke all on table public.matchday from anon, authenticated;
revoke all on table public.matchday_jugadores from anon, authenticated;

alter table public.jugadores enable row level security;
alter table public.matchday enable row level security;
alter table public.matchday_jugadores enable row level security;

-- Intencionalmente no se crean políticas: anon/authenticated quedan sin acceso.
-- El runtime Java debe usar un rol JDBC dedicado de mínimo privilegio, nunca
-- una clave service_role en el frontend ni NEXT_PUBLIC_*.

commit;
