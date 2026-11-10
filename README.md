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
$env:GANJAH_ADMIN_PASSWORD = "CONTRASEÑA_LOCAL"
$env:GANJAH_VIEWER_USER = "LECTOR_LOCAL"
$env:GANJAH_VIEWER_PASSWORD = "CONTRASEÑA_LECTOR_LOCAL"
.\gradlew.bat bootRun --args="--spring.profiles.active=dev"
```

El backend queda disponible en `http://127.0.0.1:8080`.

### Terminal 2 — frontend

Copiar `frontend/.env.local.example` como `frontend/.env.local` y completar las credenciales locales del backend. `GANJAH_BACKEND_USER` y `GANJAH_BACKEND_PASSWORD` deben coincidir con las variables de administrador anteriores. El archivo `.env.local` está ignorado por Git.

```powershell
cd frontend
npm install
npm run dev
```

Abrir `http://127.0.0.1:3000`.

Las credenciales Basic se usan únicamente en el servidor de Next.js para comunicarse con el backend. Nunca se envían al navegador ni deben utilizarse en un despliegue público sin una capa de autenticación real.

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

