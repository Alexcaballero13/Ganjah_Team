import "server-only";

import type { AuthSession } from "@/lib/auth-session";

function backendUrl() {
  return (process.env.GANJAH_BACKEND_URL || "http://127.0.0.1:8080").replace(/\/$/, "");
}

function authorization(session: AuthSession) {
  return `Basic ${Buffer.from(`${session.username}:${session.password}`).toString("base64")}`;
}

export async function createBackendSession(session: AuthSession) {
  const response = await fetch(`${backendUrl()}/api/auth/sessions`, {
    method: "POST",
    headers: { Authorization: authorization(session), "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: session.sessionId, expiresAt: session.expiresAt }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  return response.ok;
}

export async function isBackendSessionActive(session: AuthSession) {
  try {
    const response = await fetch(`${backendUrl()}/api/auth/sessions/${session.sessionId}`, {
      headers: { Authorization: authorization(session) },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function revokeBackendSession(session: AuthSession) {
  try {
    const response = await fetch(`${backendUrl()}/api/auth/sessions/${session.sessionId}`, {
      method: "DELETE",
      headers: { Authorization: authorization(session) },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
