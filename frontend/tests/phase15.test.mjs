import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const manager = await readFile(new URL("../src/components/players-manager.tsx", import.meta.url), "utf8");
const filters = await readFile(new URL("../src/lib/player-filters.ts", import.meta.url), "utf8");
const formation = await readFile(new URL("../src/lib/formation-layout.ts", import.meta.url), "utf8");
const matchdays = await readFile(new URL("../src/components/matchdays-manager.tsx", import.meta.url), "utf8");
const balance = await readFile(new URL("../src/lib/team-balance.ts", import.meta.url), "utf8");
const positions = await readFile(new URL("../src/lib/player-position.ts", import.meta.url), "utf8");

test("los filtros combinan rendimiento y posición sin reordenar ni mutar", () => {
  assert.match(filters, /players\.filter/);
  assert.match(filters, /performance === "all" \|\| getPlayerTier\(player\) === performance/);
  assert.match(filters, /position === "all" \|\| normalizePlayerPosition\(player\.posicion\) === position/);
  assert.doesNotMatch(filters, /\.sort\(/);
  assert.match(manager, /filteredPlayers\.length.*players\.length.*resultados/s);
  assert.match(manager, /Sin coincidencias/);
  assert.match(manager, /Limpiar filtros/);
});

test("el normalizador compartido conserva los aliases de las cuatro posiciones", () => {
  assert.match(positions, /GUARDAMETA: "PORTERO"/);
  assert.match(positions, /ZAGUERO: "DEFENSA"/);
  assert.match(positions, /VOLANTE: "MEDIOCAMPISTA"/);
  assert.match(positions, /EXTREMO: "DELANTERO"/);
  assert.match(positions, /normalizePlayerPosition/);
});

test("la edición contextual mantiene autorización, foco y confirmación de API", () => {
  assert.match(manager, /role="dialog"/);
  assert.match(manager, /aria-modal="true"/);
  assert.match(manager, /event\.key === "Escape"/);
  assert.match(manager, /editTriggerRef\.current\?\.focus/);
  assert.match(manager, /await api\.jugadores\.update/);
  assert.match(manager, /if \(!canWrite\)/);
  assert.match(manager, /value >= 1 && value <= 5/);
});

test("la formación es posterior al sorteo y no modifica el balance aprobado", () => {
  assert.match(matchdays, /balanceTeams\(draftedPlayers\)/);
  assert.match(matchdays, /<FormationPitch/);
  assert.match(formation, /team === "LOCAL" \? spots : spots\.map/);
  assert.match(formation, /a\.id - b\.id/);
  assert.match(formation, /players\.length > 6/);
  assert.doesNotMatch(formation, /Math\.random/);
  assert.match(balance, /effectiveAdjustment/);
  assert.match(balance, /defenseDifference < bestDefense/);
  assert.match(balance, /attackDifference < bestAttack/);
});
