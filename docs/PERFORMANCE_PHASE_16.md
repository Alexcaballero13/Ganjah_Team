# Fase 16 — rendimiento local reproducible

Fecha: 2026-11-11. Rama: `codex/fase-3-fullstack`.

## Condiciones

- Windows, Docker Desktop 4.85.0, Docker Engine 29.6.2.
- Next.js 16.4.6 con `next build` y `next start -p 3100`.
- Backend Java 11 y PostgreSQL 15 Alpine en contenedores locales aislados.
- 30 jugadores y 33 MatchDays en la base de pruebas. No se usó Supabase ni Vercel.
- Las mediciones HTTP se repitieron 15 veces; los microbenchmarks usaron 500 sorteos y 5.000 formaciones.
- Lighthouse no estaba instalado en el entorno. No se inventan LCP, INP, CLS ni puntuaciones Lighthouse; quedan para el Preview autorizado.

## Antes y después

| Medición | Antes | Después | Resultado |
|---|---:|---:|---|
| Arranque `next start` | 727 ms | 577 ms | -20,6 % en esta ejecución |
| Portada HTTP promedio | 41,54 ms | 40,99 ms | estable; diferencia dentro del ruido |
| Portada HTTP p95 | 475,17 ms | 493,71 ms | estable; primer acceso domina |
| JS inicial portada, sin comprimir | 586.812 B / 8 req. | 586.812 B / 8 req. | sin cambio |
| Siluetas servidas en tarjetas | 1.510.499 B | 11.556 B | -99,23 % |
| Solicitudes tras editar/crear/eliminar | escritura + GET completo | sólo escritura | elimina 1 GET y su JSON por operación |
| Sorteo de 18, promedio / p95 | 56,498 / 93,749 ms | sin cambio | algoritmo ya apto; reglas preservadas |
| Formación de 9, promedio / p95 | 0,013 / 0,023 ms | sin cambio | cálculo ya despreciable |

Las siluetas conservan los PNG originales. `next/image` las transforma según el tamaño visual: delantero 3.525 B, mediocampista 3.431 B, defensa 2.649 B y portero 1.951 B a 256 px.

## Frontend

- Se retiró `unoptimized` de las cuatro siluetas y se agregó `sizes` responsive.
- `PlayerCard`, cada entrada de la cuadrícula y `FormationPitch` se aíslan con `memo`.
- La cancha se carga con importación dinámica únicamente después de generar equipos.
- Una escritura de jugador espera la respuesta real y actualiza sólo el registro confirmado; no existe actualización optimista ni recarga completa.
- Validación visual: 30 tarjetas y filtros en escritorio; cuadrícula de dos columnas y bottom sheet en 390 × 844 px.

## Backend y PostgreSQL

- No se demostró N+1: MatchDays usa `@EntityGraph(attributePaths = "jugadores")` y `open-in-view=false`.
- Hikari ya está limitado a 3 conexiones máximas y 1 mínima en producción.
- Imagen backend: 182.998.242 B (~174,5 MiB). Arranque observado del contenedor existente: 28,609 s.
- RAM en reposo: 325,3–364,3 MiB por instancia; CPU 0,14–0,18 %. PostgreSQL: 40,57 MiB y 0,00 % en la muestra.
- `EXPLAIN (ANALYZE, BUFFERS)`: jugadores 0,416 ms; MatchDays con participaciones 0,373 ms.
- Las tablas pequeñas usan escaneo secuencial eficiente y ya existen índices de identidad, fecha, relaciones, sesiones e intentos.

**SIN MIGRACIÓN NECESARIA.** Añadir índices no aportaría beneficio demostrado y aumentaría el costo de escritura.

## Validación

- Frontend: 21/21 pruebas, ESLint y build de producción aprobados.
- Backend: `gradle test` en `gradle:8.5-jdk11`, `BUILD SUCCESSFUL`.
- No hubo cambios de seguridad, sesiones, rate limiting, CSRF, permisos, sorteo, datos ni diseño.

## Pendientes de Preview

- Medir Lighthouse móvil/escritorio, LCP, INP y CLS con el Preview protegido y la base aislada.
- Medir latencia p95 del binding privado de Vercel y arranque en frío real.
- Confirmar límites/costos y rotación de credenciales antes de habilitar despliegues.
