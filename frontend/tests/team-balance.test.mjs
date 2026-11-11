import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/lib/team-balance.ts", import.meta.url), "utf8");

test("el sorteo conserva las reglas aprobadas del sistema original", () => {
  assert.match(source, /MIN_DRAFT_PLAYERS = 12/);
  assert.match(source, /MAX_DRAFT_PLAYERS = 18/);
  assert.match(source, /effectiveAdjustment/);
  assert.match(source, /defenseDifference < bestDefense/);
  assert.match(source, /attackDifference < bestAttack/);
  assert.match(source, /maxPosition/);
  assert.match(source, /optimalCount/);
});
