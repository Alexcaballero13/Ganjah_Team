import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const route = await readFile(new URL("../src/app/api/backend/[...path]/route.ts", import.meta.url), "utf8");
const policy = await readFile(new URL("../src/lib/proxy-policy.ts", import.meta.url), "utf8");

test("el proxy usa credenciales solo del entorno servidor", () => {
  assert.match(route, /GANJAH_BACKEND_USER/);
  assert.match(route, /GANJAH_BACKEND_PASSWORD/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_.*(?:USER|PASSWORD)/);
});

test("el proxy aplica una lista explícita de endpoints y métodos", () => {
  assert.match(route, /isAllowedBackendRequest/);
  assert.match(policy, /const rules:/);
  assert.ok(policy.includes("api\\/jugadores"));
  assert.ok(policy.includes("api\\/matchdays"));
});
