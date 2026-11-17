import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const positions = await readFile(new URL("../src/lib/player-position.ts", import.meta.url), "utf8");
const playerCard = await readFile(new URL("../src/components/player-card.tsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");

test("centraliza las cuatro abreviaturas de posición aprobadas", () => {
  assert.match(positions, /PORTERO: "GK"/);
  assert.match(positions, /DEFENSA: "DF"/);
  assert.match(positions, /MEDIOCAMPISTA: "MD"/);
  assert.match(positions, /DELANTERO: "DL"/);
  assert.match(positions, /getPlayerPositionAbbreviation/);
});

test("muestra la posición abreviada entre calificación y silueta en todas las tarjetas", () => {
  assert.match(playerCard, /<div className="game-card-rating">/);
  assert.match(playerCard, /className="game-card-position"/);
  assert.match(playerCard, /<PlayerAvatar player=\{player\} \/>/);
  assert.match(styles, /grid-template-columns: \.55fr auto 1\.2fr/);
  assert.match(styles, /\.game-card-compact \.game-card-position/);
});
