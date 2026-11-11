# Entrega técnica — Ganjah Team

## Versión entregada

- Repositorio: `https://github.com/Alexcaballero13/Ganjah_Team`
- Rama de trabajo: `codex/fase-3-fullstack`
- SHA del código validado (Fases 9–15): `8bcdd0b`.
- SHA consolidado con bloqueo de despliegues automáticos: `991474d`.
- `main` no debe modificarse ni fusionarse sin autorización expresa.

## Estructura y ejecución

- `frontend/`: Next.js 16, TypeScript, App Router y proxy de mismo origen `/api/backend/*`.
- `backend/`: Spring Boot con Java 11, autenticación ADMIN/VIEWER y PostgreSQL mediante JDBC.
- `database/`: esquema local, snapshot verificable y planes SQL no aplicados.
- `backend/Dockerfile.vercel`: compilación Java 11 y runtime no privilegiado.
- `vercel.json`: propuesta de Frontend Service + Container Service; `git.deploymentEnabled` permanece en `false` para impedir despliegues automáticos durante la entrega.

Para desarrollo local, definir `GANJAH_BACKEND_URL`, `GANJAH_SESSION_SECRET` y las variables de cuentas descritas en `backend/.env.example`, sin versionar valores. Ejecutar:

```powershell
cd backend
.\gradlew.bat bootRun --args="--spring.profiles.active=dev"

cd ..\frontend
npm install
npm run dev
```

Validación frontend:

```powershell
cd frontend
npm test
npm run lint
npm run build
```

## Funciones de Fase 15

- Jugadores: filtros combinables por categoría visual y las cuatro posiciones; el contador y la lista se actualizan sin recarga.
- Edición: ADMIN abre un diálogo contextual desde cualquier tarjeta. Escape/Cancelar descartan; el diálogo sólo se cierra tras confirmarse el guardado. VIEWER continúa en lectura.
- Sorteo: conserva `balanceTeams`; después calcula una formación determinista por las posiciones actuales. No cambia equipos, no persiste coordenadas y advierte equipos sin portero o con varios.
- Lista compartible: después de equilibrar, el navegador genera un PNG vertical con LOCAL/VISITANTE, nombres y posiciones, sin mostrar niveles deportivos. Se puede descargar o compartir desde el dispositivo y no se persiste en backend ni PostgreSQL.
- Históricos: la nueva vista previa vive en el constructor actual; los 32 MatchDays recuperados no se reescriben.

## Base de datos

**SIN MIGRACIÓN SQL NECESARIA para Fase 15.** Se reutilizan nombre, posición, ataque, defensa y asignación LOCAL/VISITANTE.

- `001`–`003`: esquema, snapshot e integridad de PostgreSQL local.
- `006_auth_security_plan_NOT_APPLIED.sql`: plan revisable de sesiones y rate limiting.
- `007`–`009`: preparación de una base Preview aislada; no están aplicados a Supabase.
- Referencia preservada: 30 jugadores, 32 MatchDays y 505 participaciones remotas. El snapshot local parcial nunca debe sobrescribir la fuente remota.

## Seguridad y pasos pendientes

- El frontend nunca debe recibir la contraseña JDBC ni credenciales internas del backend.
- Las credenciales históricamente expuestas deben ser rotadas por el propietario antes de producción; falta evidencia de rotación.
- Verificar consumidores de Data API antes de decidir desactivarla o aplicar RLS y permisos mínimos.
- Configurar una base Preview independiente, variables separadas, protección de acceso y rollback según `PREVIEW_PROTECTED_RUNBOOK.md`.
- Confirmar el entorno Vercel autorizado y sus costos antes de crear recursos. No existe despliegue autorizado en esta entrega.
- Reactivar despliegues Git únicamente después de esa aprobación; mientras tanto, no retirar `git.deploymentEnabled: false`.
- La aplicación original y Supabase real son fuentes protegidas: no ejecutar seeds, migraciones ni escrituras contra ellas sin respaldo y aprobación específica.
