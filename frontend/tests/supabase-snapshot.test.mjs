import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const players = await readFile(new URL("../src/data/legacy-player-snapshot.ts", import.meta.url), "utf8");
const matches = await readFile(new URL("../src/data/legacy-matchday-snapshot.ts", import.meta.url), "utf8");
const seed = await readFile(new URL("../../backend/src/main/resources/dev-data.sql", import.meta.url), "utf8");
const playerManager = await readFile(new URL("../src/components/players-manager.tsx", import.meta.url), "utf8");
const teamsView = await readFile(new URL("../src/components/teams-view.tsx", import.meta.url), "utf8");
const playerCard = await readFile(new URL("../src/components/player-card.tsx", import.meta.url), "utf8");

test("conserva los 30 IDs reales de jugadores sin duplicarlos", () => {
  const mapping = players.match(/supabasePlayerIds:[\s\S]*?= \{([\s\S]*?)\n\};/)?.[1] ?? "";
  const ids = [...mapping.matchAll(/:\s*(\d+),/g)].map((entry) => Number(entry[1]));
  assert.equal(ids.length, 30);
  assert.equal(new Set(ids).size, 30);
  assert.deepEqual([...ids].sort((a, b) => a - b), [2, 5, 6, 8, 9, 11, 12, 13, 14, 15, 16, 20, 21, 23, 25, 26, 28, 29, 31, 32, 35, 38, 47, 48, 57, 58, 60, 61, 80, 88]);
});

test("los snapshots tácticos conservan los MatchDay reales 49 a 52", () => {
  const ids = [...matches.matchAll(/legacySequence:\s*(\d+)/g)].map((entry) => Number(entry[1]));
  assert.deepEqual(ids, [52, 51, 50, 49]);
  assert.match(matches, /golesLocal: 4, golesVisitante: 7/);
  assert.match(matches, /readOnlySnapshot: true/g);
});

test("las estrellas reales producen una clasificación estable en todas las tarjetas", () => {
  const playerInsert = seed.match(/insert into jugadores[\s\S]*?values\s*([\s\S]*?);/)?.[1] ?? "";
  const ratings = [...playerInsert.matchAll(/\(\d+,'[^']+','[^']+',([1-5]),([1-5])\)/g)]
    .map((entry) => (Number(entry[1]) + Number(entry[2])) / 2);
  const tiers = ratings.map((rating) => rating >= 3.5 ? "gold" : rating >= 2.5 ? "silver" : "bronze");

  assert.equal(ratings.length, 30);
  assert.equal(tiers.filter((tier) => tier === "gold").length, 8);
  assert.equal(tiers.filter((tier) => tier === "silver").length, 12);
  assert.equal(tiers.filter((tier) => tier === "bronze").length, 10);
  assert.match(playerManager, /<PlayerCard/);
  assert.match(teamsView, /<PlayerCard/);
  assert.match(playerCard, /player-forward-silhouette\.png/);
  assert.match(playerCard, /player-midfielder-silhouette\.png/);
  assert.match(playerCard, /player-goalkeeper-silhouette\.png/);
  assert.match(playerCard, /player-defender-silhouette\.png/);
  assert.match(playerCard, /positionSilhouettes\[normalized\]/);
  assert.match(playerCard, /MEDIOCAMPISTA:/);
  assert.match(playerCard, /PORTERO:/);
  assert.match(playerCard, /DEFENSA:/);
});

