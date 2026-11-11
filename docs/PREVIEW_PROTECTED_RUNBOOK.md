# Runbook del Preview protegido

Estado: preparado localmente, sin proyecto creado, despliegue, push ni cambios
remotos. Revisado el 11 de noviembre de 2026.

## Topología preparada

- `frontend`: Next.js público, única superficie HTTP externa.
- `backend`: Spring Boot en Container Runtime, privado y accesible únicamente
  mediante el binding `GANJAH_BACKEND_URL` del frontend.
- `database`: PostgreSQL de Preview independiente; nunca la base histórica.
- El backend escucha el `PORT` inyectado y se ejecuta como usuario no root.

Vercel Services y Container Runtime están en beta para todos los planes. El
manifiesto usa un binding privado y no incluye una reescritura pública al
backend. Con Fluid Compute, la memoria se elige en el panel; `vercel.json`
limita a 60 segundos las invocaciones del contenedor.

Referencias vigentes:

- https://vercel.com/kb/guide/vercel-services
- https://vercel.com/docs/services/config-reference
- https://vercel.com/kb/guide/docker

## Matriz de variables

| Variable | Development | Preview | Production | Servicio |
| --- | --- | --- | --- | --- |
| `GANJAH_BACKEND_URL` | URL local | Binding automático | Binding automático | frontend |
| `GANJAH_SESSION_SECRET` | secreto local | secreto sensible exclusivo | secreto sensible distinto | frontend |
| `SPRING_PROFILES_ACTIVE` | `dev` | `prod` | `prod` | backend |
| `SPRING_DATASOURCE_*` | PostgreSQL local | base Preview | base histórica autorizada | backend |
| `DB_POOL_SIZE` / `DB_MIN_IDLE` | 3 / 1 | 3 / 1 inicial | medir antes de aumentar | backend |
| `GANJAH_*_USER/PASSWORD` | cuentas de prueba | cuentas Preview | credenciales rotadas | backend |

Ninguna variable anterior usa `NEXT_PUBLIC_`. En Preview y Production deben
marcarse como sensibles. Los logs no deben imprimir cabeceras `Authorization`,
cookies, URL JDBC ni valores de entorno.

## Protección antes del primer despliegue

1. Crear el proyecto manualmente sin Git Integration ni auto-deploy.
2. Configurar Vercel Authentication con alcance **All Deployments** antes de
   publicar la primera URL.
3. Autorizar sólo cuentas Vercel revisoras y no crear Shareable Links ni bypass.
4. Mantener Development, Preview y Production con secretos y bases diferentes.
5. Seleccionar memoria mínima viable en Functions y revisar Usage tras cada
   prueba. No activar Password Protection ni productos de pago sin aprobación.
6. Exigir HTTPS; la cookie de aplicación es `HttpOnly`, `SameSite=Lax` y
   `Secure` cuando `NODE_ENV=production`.

Vercel Authentication con All Deployments está disponible en todos los planes.
La disponibilidad general de la plataforma está documentada, pero la cuenta,
equipo, plan y proyecto Vercel de destino todavía no han sido entregados. Por
ello no se confirma acceso real, no se creó un proyecto y no se probó un build
remoto. El propietario deberá completar sus comprobaciones privadas de
facturación y segundo factor directamente en la cuenta autorizada.

Referencia: https://vercel.com/docs/deployment-protection

## PostgreSQL independiente

Aplicar exclusivamente sobre una base nueva cuyo nombre empiece por
`ganjah_preview_`:

1. `database/007_preprod_schema_NOT_APPLIED.sql`
2. `database/008_preprod_synthetic_seed_NOT_APPLIED.sql`
3. `database/009_preprod_validate.sql`

El backend debe arrancar con Hibernate `validate`. El seed contiene únicamente
12 jugadores `PREVIEW TEST`; no contiene los 30 jugadores, los 32 MatchDays ni
las 505 participaciones históricas.

Antes de cada prueba remota: snapshot lógico del esquema Preview. Después:
guardar el resultado de validación, revisar sesiones expiradas y conservar la
última copia verificada. Restaurar primero en otra base vacía y comparar
conteos/restricciones antes de reemplazar cualquier conexión.

## Supabase histórico: decisión pendiente

El nuevo repositorio no contiene `supabase-js`, llamadas REST/GraphQL ni claves
de Data API; su consumidor diseñado es Spring Boot por JDBC. Aun así, la
aplicación original u otros consumidores externos no han sido descartados por
el propietario, por lo que todavía no se puede desactivar Data API.

La sesión del Dashboard permite identificar el proyecto, pero las consultas
remotas de solo lectura mediante el conector fueron rechazadas por permisos.
Por ello, los tipos, grants, RLS y consumidores reales deben reconfirmarse con
acceso de auditoría explícito antes de aprobar cualquier cambio remoto.

Procedimiento sujeto a autorización separada:

1. Inventariar consumidores mediante configuración, logs y propietario.
2. Ejecutar sólo lectura `004_supabase_preflight_readonly.sql` y comparar tipos.
3. Si no hay consumidores, desactivar Data API y revocar los privilegios de
   `anon`/`authenticated` previstos en `005_supabase_security_plan_NOT_APPLIED.sql`.
4. Si existe un consumidor, mantener sólo objetos indispensables con grants y
   RLS por operación y propietario; RLS no sustituye los privilegios JDBC.
5. Crear un rol JDBC dedicado sin `BYPASSRLS`, sin propiedad de tablas y con
   permisos mínimos de aplicación.
6. Validar respaldo y reversión antes de cualquier cambio.

Referencias:

- https://supabase.com/docs/guides/api/securing-your-api
- https://supabase.com/docs/guides/database/secure-data

## Credenciales y liberación

Antes del Preview el propietario debe confirmar la rotación de:

- contraseña PostgreSQL histórica expuesta;
- cuentas ADMIN/VIEWER originales expuestas;
- cualquier clave Data API o token compartido fuera de un gestor de secretos.

El Preview usará credenciales nuevas y exclusivas. El rollback fija el commit
aprobado, conserva la base Preview, vuelve al despliegue anterior desde Vercel y
no ejecuta migraciones automáticas. Si el esquema no valida, Spring Boot debe
fallar cerrado y no cambiar `ddl-auto=validate`.

## Alcance del commit propuesto

Mensaje: `Preparar seguridad y preview protegido full-stack`.

- Backend: Docker, perfil PostgreSQL, sesiones revocables, rate limiting
  compartido, entidades/repositorios y pruebas de seguridad.
- Frontend: sesión cifrada, proxy permitido, CSRF por origen, roles y pruebas.
- Base de datos: corrección `integer`, tablas de seguridad y scripts Preview
  `006` a `009`.
- Infraestructura: `vercel.json` y documentación de Vercel/Supabase.

No incluir: `.env.local`, `.runtime`, logs, `target`, `.next`, credenciales,
respaldos privados ni datos generados. El commit no se ejecuta en esta fase.
