import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const route = await readFile(new URL("../src/app/api/backend/[...path]/route.ts", import.meta.url), "utf8");
const policy = await readFile(new URL("../src/lib/proxy-policy.ts", import.meta.url), "utf8");
const sessionRoute = await readFile(new URL("../src/app/api/auth/session/route.ts", import.meta.url), "utf8");
const session = await readFile(new URL("../src/lib/auth-session.ts", import.meta.url), "utf8");

test("el proxy utiliza la sesión cifrada y no credenciales públicas", () => {
  assert.match(route, /readSessionToken/);
  assert.match(route, /SESSION_COOKIE/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_.*(?:USER|PASSWORD|SECRET)/);
  assert.match(session, /aes-256-gcm/);
  assert.match(session, /httpOnly:\s*true/);
  assert.match(session, /sameSite:\s*"lax"/);
  assert.match(session, /secure:\s*process\.env\.NODE_ENV === "production"/);
  assert.match(session, /SESSION_MAX_AGE_SECONDS = 60 \* 60 \* 8/);
  assert.match(session, /session\.expiresAt <= Date\.now\(\)/);
  assert.match(sessionRoute, /api\/auth\/me/);
  assert.match(sessionRoute, /Usuario o contraseña incorrectos/);
});

test("el proxy aplica una lista explícita de endpoints y métodos", () => {
  assert.match(route, /isAllowedBackendRequest/);
  assert.match(policy, /const rules:/);
  assert.ok(policy.includes("api\\/jugadores"));
  assert.ok(policy.includes("api\\/matchdays"));
});
