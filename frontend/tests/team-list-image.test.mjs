import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/components/team-list-image.tsx", import.meta.url), "utf8");
const manager = await readFile(new URL("../src/components/matchdays-manager.tsx", import.meta.url), "utf8");

test("la imagen lista utiliza los equipos equilibrados actuales sin persistir datos", () => {
  assert.match(manager, /<TeamListImage/);
  assert.match(manager, /local=\{formationTeams\.local\}/);
  assert.match(manager, /visitante=\{formationTeams\.visitante\}/);
  assert.match(source, /document\.createElement\("canvas"\)/);
  assert.doesNotMatch(source, /api\./);
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
});

test("la imagen también está disponible para MatchDays confirmados", () => {
  assert.match(manager, /match\.rosterStatus !== "DESCONOCIDO"/);
  assert.match(manager, /matchDate=\{match\.fechaPartido\}/);
  assert.match(manager, /matchLabel=\{matchLabel\}/);
  assert.match(manager, /historical/);
  assert.match(source, /Partido confirmado/);
  assert.match(source, /Generar lista/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /Descargar PNG/);
  assert.match(source, /Compartir imagen/);
  assert.match(source, /createTeamListPng\(local, visitante, \{ matchDate, matchLabel \}\)/);
});

test("la lista conserva nombres y posiciones sin exponer niveles", () => {
  assert.match(source, /player\.nombre\.toUpperCase/);
  assert.match(source, /normalizePlayerPosition\(player\.posicion\)/);
  assert.doesNotMatch(source, /player\.nivelAtaque/);
  assert.doesNotMatch(source, /player\.nivelDefensa/);
  assert.doesNotMatch(source, /getPlayerTier\(player\)/);
  assert.doesNotMatch(source, /ATA |DEF /);
});

test("ofrece descarga y compartir con fallback seguro", () => {
  assert.match(source, /anchor\.download/);
  assert.match(source, /navigator\.share/);
  assert.match(source, /navigator\.canShare/);
  assert.match(source, /se descargó la imagen/);
});
