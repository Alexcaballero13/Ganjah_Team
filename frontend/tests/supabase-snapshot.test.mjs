import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const players = await readFile(new URL("../src/data/legacy-player-snapshot.ts", import.meta.url), "utf8");
const matches = await readFile(new URL("../src/data/legacy-matchday-snapshot.ts", import.meta.url), "utf8");

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

