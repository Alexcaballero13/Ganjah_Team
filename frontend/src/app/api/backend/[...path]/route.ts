import { NextRequest, NextResponse } from "next/server";
import { isAllowedBackendRequest } from "@/lib/proxy-policy";

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const normalizedPath = path.join("/");

  if (!isAllowedBackendRequest(normalizedPath, request.method)) {
    return NextResponse.json({ message: "Ruta no permitida." }, { status: 404 });
  }

  const backendUrl = process.env.GANJAH_BACKEND_URL || "http://127.0.0.1:8080";
  const username = process.env.GANJAH_BACKEND_USER;
  const password = process.env.GANJAH_BACKEND_PASSWORD;

  if (!username || !password) {
    return NextResponse.json(
      { message: "Faltan credenciales locales del backend en el servidor." },
      { status: 503 },
    );
  }

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
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
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

