import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/components/teams-view.tsx", import.meta.url), "utf8");

test("la pestaña equipos usa la formación compartida y toda la cancha", () => {
  assert.match(source, /calculateFormation\(players, team\)/);
  assert.match(source, /100 - spot\.y/);
  assert.match(source, /spot\.position === "DELANTERO"/);
  assert.match(source, /team === "LOCAL" \? 43 : 57/);
  assert.match(source, /style=\{\{ left: `\$\{spot\.x\}%`, top: `\$\{spot\.y\}%` \}\}/);
  assert.match(source, /team-formation-player/);
  assert.doesNotMatch(source, /field-roster/);
});

test("la distribución conserva los equipos y las posiciones reales", () => {
  assert.match(source, /entry\.equipo === team/);
  assert.match(source, /resolvePlayer\(entry\.nombre\)/);
  assert.match(source, /classificationAvailable=\{spot\.player\.id !== -1\}/);
});
