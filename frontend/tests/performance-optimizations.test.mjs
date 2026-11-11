import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const card = await readFile(new URL("../src/components/player-card.tsx", import.meta.url), "utf8");
const players = await readFile(new URL("../src/components/players-manager.tsx", import.meta.url), "utf8");
const matchdays = await readFile(new URL("../src/components/matchdays-manager.tsx", import.meta.url), "utf8");
const formation = await readFile(new URL("../src/components/formation-pitch.tsx", import.meta.url), "utf8");

test("las siluetas usan el optimizador nativo con tamaño responsive", () => {
  assert.doesNotMatch(card, /\bunoptimized\b/);
  assert.match(card, /sizes="\(max-width: 430px\) 88px, 120px"/);
});

test("las escrituras actualizan únicamente el jugador confirmado por la API", () => {
  assert.match(players, /setPlayers\(\(current\) => current\.map/);
  assert.match(players, /setPlayers\(\(current\) => \[\.\.\.current, created\]\)/);
  assert.match(players, /setPlayers\(\(current\) => current\.filter/);
});

test("tarjetas, cancha y carga secundaria evitan trabajo innecesario", () => {
  assert.match(card, /memo\(function PlayerCard/);
  assert.match(players, /memo\(function PlayerListCard/);
  assert.match(formation, /memo\(function FormationPitch/);
  assert.match(matchdays, /dynamic\([\s\S]*formation-pitch/);
});
