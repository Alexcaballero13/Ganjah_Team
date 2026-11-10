import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/lib/player-tier.ts", import.meta.url), "utf8");

test("la clasificación aprobada está centralizada", () => {
  assert.match(source, /PLAYER_TIER_THRESHOLDS/);
  assert.match(source, /gold:\s*3\.5/);
  assert.match(source, /silver:\s*2\.5/);
  assert.match(source, /categoriaVisual === "GOLD"/);
  assert.match(source, /categoriaVisual === "SILVER"/);
  assert.match(source, /categoriaVisual === "BRONZE"/);
  assert.match(source, /return "bronze"/);
  assert.match(source, /nivelEfectivo/);
  assert.match(source, /nivelGeneral/);
  assert.match(source, /nivelAtaque \+ player\.nivelDefensa/);
});
