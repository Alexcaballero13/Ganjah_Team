import { NextRequest, NextResponse } from "next/server";
import { isAllowedBackendRequest } from "@/lib/proxy-policy";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth-session";
import { isBackendSessionActive } from "@/lib/backend-session";

type RouteContext = { params: Promise<{ path: string[] }> };

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

async function forward(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const normalizedPath = path.join("/");

  if (!isAllowedBackendRequest(normalizedPath, request.method)) {
    return NextResponse.json({ message: "Ruta no permitida." }, { status: 404 });
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && !isSameOrigin(request)) {
    return NextResponse.json({ message: "Solicitud no autorizada." }, { status: 403 });
  }

  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ message: "Tu sesión expiró. Ingresa nuevamente." }, { status: 401 });
  }
  if (!(await isBackendSessionActive(session))) {
    return NextResponse.json({ message: "Tu sesión fue invalidada. Ingresa nuevamente." }, { status: 401 });
  }
  const backendUrl = process.env.GANJAH_BACKEND_URL || "http://127.0.0.1:8080";

  const target = new URL(`${backendUrl.replace(/\/$/, "")}/${normalizedPath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const body = ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.text();
    const response = await fetch(target, {
      method: request.method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${session.username}:${session.password}`).toString("base64")}`,
        "Content-Type": request.headers.get("content-type") || "application/json",
        Accept: "application/json",
      },
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    const responseBody = await response.text();
    return new NextResponse(responseBody || null, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "El backend tardó demasiado en responder."
        : "No se pudo conectar con el backend local.";
    return NextResponse.json({ message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;

