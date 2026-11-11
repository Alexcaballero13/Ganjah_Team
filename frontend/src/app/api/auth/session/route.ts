import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  readSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth-session";

function backendUrl() {
  return (process.env.GANJAH_BACKEND_URL || "http://127.0.0.1:8080").replace(/\/$/, "");
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Solicitud no autorizada." }, { status: 403 });
  }

  let credentials: { username?: unknown; password?: unknown };
  try {
    credentials = (await request.json()) as typeof credentials;
  } catch {
    return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
  }

  const username = typeof credentials.username === "string" ? credentials.username.trim() : "";
  const password = typeof credentials.password === "string" ? credentials.password : "";
  if (!username || !password || username.length > 80 || password.length > 160) {
    return NextResponse.json({ message: "Ingresa usuario y contraseña." }, { status: 400 });
  }

  try {
    const validation = await fetch(`${backendUrl()}/api/auth/me`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (validation.status === 401 || validation.status === 403) {
      return NextResponse.json({ message: "Usuario o contraseña incorrectos." }, { status: 401 });
    }
    if (!validation.ok) {
      return NextResponse.json({ message: "No fue posible validar el acceso." }, { status: 502 });
    }

    const identity = (await validation.json()) as { username?: unknown; role?: unknown };
    const role = identity.role === "ADMIN" || identity.role === "VIEWER" ? identity.role : null;
    if (!role) {
      return NextResponse.json({ message: "El servidor devolvió un perfil inválido." }, { status: 502 });
    }

    const response = NextResponse.json({ username, role });
    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken(username, password, role),
      sessionCookieOptions(),
    );
    return response;
  } catch {
    return NextResponse.json(
      { message: "El servidor de Ganjah Team no está disponible." },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, username: session.username, role: session.role });
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Solicitud no autorizada." }, { status: 403 });
  }
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
