import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manager = await readFile(new URL("../src/components/matchdays-manager.tsx", import.meta.url), "utf8");

test("el generador de equipos filtra exclusivamente por las cuatro posiciones", () => {
  assert.match(manager, /type RosterPositionFilter = "all" \| PlayerPosition/);
  assert.match(manager, /normalizePlayerPosition\(player\.posicion\) === rosterPositionFilter/);
  assert.match(manager, /value: "PORTERO"/);
  assert.match(manager, /value: "DEFENSA"/);
  assert.match(manager, /value: "MEDIOCAMPISTA"/);
  assert.match(manager, /value: "DELANTERO"/);
});

test("cambiar el filtro no modifica la convocatoria ni las asignaciones", () => {
  assert.match(manager, /setRosterPositionFilter\(option\.value\)/);
  assert.match(manager, /visibleRosterPlayers\.map/);
  assert.doesNotMatch(manager, /setRosterPositionFilter\(option\.value\)[\s\S]{0,120}setDraftSelection/);
});
