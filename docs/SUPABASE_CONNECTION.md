# Conexión del backend a Supabase

Proyecto autorizado: `Alexcaballero13's Project` (`tpipzcwxzzqdbeqmyohg`).

La arquitectura conserva Next.js → Spring Boot → PostgreSQL. El navegador no
se conecta directamente a Supabase ni recibe claves de base de datos.

## Variables del runtime Java

Partir de `backend/.env.example` y guardar los valores reales únicamente como
secretos del proveedor donde se aloje Spring Boot:

- `SPRING_PROFILES_ACTIVE=prod`
- `SPRING_DATASOURCE_URL`: URL JDBC obtenida desde **Connect** en Supabase,
  terminada en `?sslmode=require`.
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- credenciales internas `GANJAH_*` para la comunicación Next.js → Spring Boot.

Para un backend persistente con IPv6 puede usarse la conexión directa. Para un
host IPv4 se debe escoger el **Session pooler** mostrado por el panel de
Supabase; su host y usuario no deben construirse manualmente.

## Compatibilidad verificada

Las entidades JPA corresponden a las tablas existentes:

- `jugadores`: `id`, `nombre`, `posicion`, `nivel_ataque`, `nivel_defensa`.
- `matchday`: `id`, `fecha_partido`, `goles_local`, `goles_visitante`.
- `matchday_jugadores`: `matchday_id`, `nombre_jugador`, `equipo`.

Los campos visuales, estadísticas derivadas y estado de alineación se calculan
en la aplicación; no requieren columnas nuevas. Producción usa
`spring.jpa.hibernate.ddl-auto=validate` para impedir cambios implícitos.

## Bloqueo de seguridad previo a producción

Las tres tablas remotas tienen RLS desactivado y no existen políticas. Aunque
Spring Boot utiliza una conexión JDBC privada, la Data API continúa expuesta.
Antes de publicar la aplicación se deben definir autenticación, permisos y RLS,
o desactivar la Data API si no será utilizada. Este repositorio no aplica esos
cambios remotos automáticamente.

