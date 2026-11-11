# Preparación local para Vercel y Supabase

Este documento prepara el repositorio para una revisión posterior. No crea un
proyecto en Vercel, no vincula GitHub, no despliega y no modifica Supabase.

## Topología prevista

`vercel.json` define dos servicios del mismo despliegue:

- `frontend`: Next.js en `frontend/`, único punto de entrada público.
- `backend`: Spring Boot en `backend/`, imagen de contenedor y sin ruta pública.

El binding de Vercel inyectará `GANJAH_BACKEND_URL` solamente en el runtime del
frontend. Las rutas de navegador continúan llegando al proxy de Next.js; este
envía las peticiones autorizadas al backend privado. No se publica un endpoint
JDBC ni una credencial de base de datos.

## Archivos preparados

- `vercel.json`: servicios, binding privado y límite de 60 segundos para el
  backend. Con Fluid Compute, la memoria se configura en el panel de Functions.
- `backend/Dockerfile.vercel`: construcción Gradle con Java 11 y runtime Java
  11 no privilegiado. Escucha `PORT`, que Vercel inyectará.
- `backend/.dockerignore`: excluye build local, registros y archivos `.env` del
  contexto de imagen.
- `database/006_auth_security_plan_NOT_APPLIED.sql`: esquema revisable para
  revocación individual y límite compartido de inicio de sesión; termina en
  `rollback` y no se ha ejecutado remotamente.

La instancia Java no debe guardar archivos ni estado de sesión local. Vercel
puede reutilizar, escalar y detener instancias; PostgreSQL conserva los datos y
la clave `GANJAH_SESSION_SECRET` idéntica en todas las instancias de Next.js
permite leer las cookies cifradas en cualquiera de ellas.

## Variables por entorno

Configurar valores distintos en Development, Preview y Production. Nunca usar
prefijos `NEXT_PUBLIC_` para estos valores ni copiarlos a archivos versionados.

### Frontend (Next.js)

- `GANJAH_SESSION_SECRET`: secreto aleatorio de al menos 32 caracteres,
  gestionado por el proveedor y compartido por todas las instancias de un mismo
  entorno. Rotarlo invalida todas las sesiones activas de ese entorno.
- `GANJAH_BACKEND_URL`: lo genera el binding de Services en Vercel. En local es
  `http://127.0.0.1:8080`.

### Backend (Spring Boot)

- `SPRING_PROFILES_ACTIVE=prod`
- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
  `SPRING_DATASOURCE_PASSWORD`: conexión PostgreSQL privada con TLS
  (`sslmode=require`). Para infraestructura solo IPv4, usar el Session/Transaction
  Pooler autorizado; revisar el tamaño de Hikari frente al límite del pool.
- `DB_POOL_SIZE` y `DB_MIN_IDLE`: comenzar con 3 y 1, respectivamente, y medir
  con carga real antes de aumentarlos.
- `GANJAH_ADMIN_USER`, `GANJAH_ADMIN_USER_ALT`, `GANJAH_ADMIN_PASSWORD`,
  `GANJAH_ADMIN_PASSWORD_ALT`, `GANJAH_VIEWER_USER`, `GANJAH_VIEWER_PASSWORD`:
  secretos del runtime, no usuarios ni claves del navegador.

`application-prod.properties` conserva `spring.jpa.hibernate.ddl-auto=validate`:
el arranque falla si el esquema no coincide y nunca migra tablas por sorpresa.

## Validación y liberación posterior

1. Vercel Services y Container Runtime están en beta para todos los planes. La
   cuenta, equipo, plan y proyecto Vercel de destino no han sido entregados;
   confirmar su acceso real cuando exista autorización, sin reutilizar otra
   cuenta abierta en el navegador.
2. Crear primero un proyecto de Preview protegido y cargar los secretos por
   entorno, sin conectar GitHub con despliegue automático hasta aprobarlo.
   Asociar el dominio y forzar HTTPS solo tras la prueba de Preview; mantener la
   protección de despliegues preliminares activa para revisores autorizados.
3. Crear una base Preview independiente con `007_preprod_schema_NOT_APPLIED.sql`,
   cargar sólo `008_preprod_synthetic_seed_NOT_APPLIED.sql` y ejecutar
   `009_preprod_validate.sql`. Después, ejecutar un preflight de Supabase
   **solo lectura** con
   `database/004_supabase_preflight_readonly.sql`; comparar el esquema con
   Hibernate `validate` y los conteos de referencia.
4. Aplicar y verificar, mediante un cambio remoto autorizado aparte, mínimo
   privilegio, RLS y políticas para las tablas expuestas o retirar su acceso por
   Data API. El plan local `005_supabase_security_plan_NOT_APPLIED.sql` no fue
   ejecutado.
5. Rotar las credenciales que estuvieron expuestas y generar una clave de sesión
   nueva. Verificar que no existen secretos en Git antes de vincular el repo.
6. Ejecutar un preview aislado: login de los dos administradores y del lector,
   cierre de sesión, rutas privadas, tarjetas y campo, MatchDays, sorteo,
   estadísticas, regresión H2/PostgreSQL y recuperación ante caída de base.
7. Medir arranque en frío, memoria, latencia y solicitudes concurrentes. El
   proveedor cobra compute, memoria aprovisionada, invocaciones y llamadas entre
   servicios; establecer alertas de logs, errores y gasto, además de topes antes
   de producción.
8. Documentar el rollback: fijar el commit aprobado, conservar el esquema sin
   migraciones automáticas y revertir a la última implementación estable solo
   después de comprobar compatibilidad de datos.

## Bloqueadores actuales

- La Data API del proyecto Supabase correcto expone tres tablas `public` sin RLS
  ni políticas verificadas. No se autoriza producción así.
- No hay evidencia de rotación de las credenciales históricamente expuestas.
- La revocación de sesiones y el límite compartido de cinco fallos en quince
  minutos están validados localmente en PostgreSQL y entre instancias. Las
  tablas auxiliares deben existir en la base Preview antes de arrancar; no se
  autoriza crearlas todavía en el Supabase histórico.
- Las mutaciones del proxy de Next.js ahora rechazan `Origin` externo y Spring
  Boot usa `X-Frame-Options: SAMEORIGIN`; se mantiene CSRF desactivado en el
  backend porque este usa HTTP Basic de servidor a servidor y no se expone
  públicamente. Cualquier cambio que publique el backend exige revaluar CSRF.
- Las 505 participaciones remotas no pueden sustituirse por las 62 locales;
  faltan 443 respaldos completos, 28 MatchDays históricos incompletos y tres
  etiquetas de jugador pendientes de identificar.

## Alternativa si Services no está disponible

Mantener `frontend/` como proyecto Next.js en Vercel y alojar el JAR de
`backend/` en un runtime Java administrado que admita variables de entorno,
HTTPS, health checks y PostgreSQL/Supabase. Configurar `GANJAH_BACKEND_URL` como
secreto del frontend y permitir CORS únicamente para el dominio de Vercel. Esta
alternativa pierde el binding privado y requiere proteger el backend por red y
autenticación adicional.
