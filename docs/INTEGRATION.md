# Integración local y arquitectura futura

## Comunicación local

El navegador consume rutas del mismo origen bajo `/api/backend/*`. Un Route Handler de Next.js valida la ruta solicitada y la reenvía al backend Java. La URL del backend se lee exclusivamente de una variable del servidor:

- `GANJAH_BACKEND_URL`

La sesión cifrada HTTP-only conserva temporalmente las credenciales presentadas por el usuario para que el proxy invoque Spring Boot con su identidad y rol reales. Spring Boot recibe sus cuentas locales por `GANJAH_ADMIN_USER`, `GANJAH_ADMIN_USER_ALT`, `GANJAH_ADMIN_PASSWORD`, `GANJAH_ADMIN_PASSWORD_ALT`, `GANJAH_VIEWER_USER` y `GANJAH_VIEWER_PASSWORD`.
No se conserva ninguna cuenta o contraseña dentro del código fuente.

Esta solución permite revisar el sistema local sin exponer credenciales en el bundle del navegador ni debilitar Spring Security. No constituye una estrategia de autenticación pública.

## Futuro GitHub, Vercel y Supabase

- GitHub: crear un remoto nuevo para el monorepo solo después de aprobación y mantener protección de secretos.
- Vercel: desplegar únicamente `frontend/`, conservando las variables servidoras fuera del cliente.
- Backend Java: alojar en un runtime JVM o contenedor independiente; Supabase no ejecuta Spring Boot.
- Supabase: usar PostgreSQL con credenciales rotadas, un rol de mínimo privilegio, migraciones versionadas y esquema privado o políticas RLS deliberadas.
- Autenticación: reemplazar el proxy Basic compartido por identidad real y autorización verificable antes de cualquier exposición pública.

No se configuró ningún servicio externo en esta fase.

