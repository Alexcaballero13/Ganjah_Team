# Ganjah Team Fullstack

Aplicación local unificada para gestionar jugadores, MatchDays, alineaciones, marcadores y estadísticas de Ganjah Team.

## Estructura

- `frontend/`: Next.js, TypeScript y App Router.
- `backend/`: Spring Boot existente, conservando su historial.
- `docs/`: integración local, sistema visual y arquitectura futura.

## Requisitos

- Node.js 20.9 o superior.
- Java 11 o superior.
- El perfil local utiliza H2 en memoria y no necesita Docker.

## Inicio local

### Terminal 1 — backend

```powershell
cd backend
$env:JAVA_HOME = "RUTA_AL_JDK_11_O_SUPERIOR"
$env:GANJAH_ADMIN_USER = "USUARIO_LOCAL"
$env:GANJAH_ADMIN_USER_ALT = "SEGUNDO_ADMIN_LOCAL"
$env:GANJAH_ADMIN_PASSWORD = "CONTRASEÑA_LOCAL"
$env:GANJAH_VIEWER_USER = "LECTOR_LOCAL"
$env:GANJAH_VIEWER_PASSWORD = "CONTRASEÑA_LECTOR_LOCAL"
.\gradlew.bat bootRun --args="--spring.profiles.active=dev"
```

El backend queda disponible en `http://127.0.0.1:8080`.

### Terminal 2 — frontend

Copiar `frontend/.env.local.example` como `frontend/.env.local`, conservar la URL local del backend y generar un secreto aleatorio de al menos 32 caracteres para `GANJAH_SESSION_SECRET`. El archivo `.env.local` está ignorado por Git.

```powershell
cd frontend
npm install
npm run dev
```

Abrir `http://127.0.0.1:3000`.

El panel de ingreso valida las credenciales existentes directamente contra Spring Boot. La sesión se cifra con AES-256-GCM dentro de una cookie `HttpOnly`, expira a las ocho horas y conserva los permisos ADMIN o VIEWER definidos por el backend. No se incorporan contraseñas al código ni se exponen variables sensibles al navegador.

## Validación

```powershell
cd frontend
npm test
npm run lint
npm run build

cd ..\backend
.\gradlew.bat test --offline
```

## Conexión segura con Supabase

El backend de producción está preparado para conectarse al PostgreSQL existente
mediante variables de entorno. Hibernate usa `validate`, por lo que nunca crea,
elimina ni modifica tablas al arrancar. El frontend no recibe credenciales de
Supabase y continúa comunicándose únicamente con Spring Boot.

Consulta [docs/SUPABASE_CONNECTION.md](docs/SUPABASE_CONNECTION.md) para la
configuración del runtime Java. Las contraseñas deben guardarse en el proveedor
de alojamiento, nunca en GitHub.

No hay despliegue ni conexión remota activa desde este repositorio.

