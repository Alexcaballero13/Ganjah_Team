import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const styles = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
const card = await readFile(new URL("../src/components/player-card.tsx", import.meta.url), "utf8");

test("usa el logotipo oficial transparente como única marca de agua", async () => {
  await access(new URL("../public/ganjah-team-logo-extracted.png", import.meta.url));
  assert.match(styles, /background: url\("\/ganjah-team-logo-extracted\.png"\) center \/ contain no-repeat/);
  assert.doesNotMatch(styles, /content: "GT"/);
});

test("la marca ocupa la tarjeta, no recibe eventos y queda detrás del contenido", () => {
  assert.match(styles, /\.game-card::after \{[^}]*inset: 3%;[^}]*opacity: var\(--watermark-opacity\);[^}]*pointer-events: none/s);
  assert.match(styles, /\.game-card-compact::after \{ inset: 1%; opacity: calc\(var\(--watermark-opacity\) \+ \.03\); \}/);
  assert.match(styles, /\.game-card > :not\(\.game-card-glow\) \{ position: relative; z-index: 2; \}/);
  assert.match(styles, /\.game-card::before \{[^}]*z-index: 4;[^}]*pointer-events: none/s);
});

test("dorado, plateado y bronce ajustan su transparencia sin cambiar categorías", () => {
  assert.match(styles, /\.tier-gold \{[^}]*--watermark-opacity: \.14;/s);
  assert.match(styles, /\.tier-silver \{[^}]*--watermark-opacity: \.12;/s);
  assert.match(styles, /\.tier-bronze \{[^}]*--watermark-opacity: \.13;/s);
  assert.match(card, /tier-\$\{tier\}/);
  assert.match(card, /compact \? "game-card-compact" : "game-card-full"/);
});

test("las tarjetas compactas conservan completa la valoración y la silueta", () => {
  assert.match(styles, /\.team-formation-player \{[^}]*width: clamp\(88px,7\.2vw,100px\)/s);
  assert.match(styles, /\.team-formation-player \.game-card-compact \.game-card-avatar \{ width: 52px; \}/);
});
