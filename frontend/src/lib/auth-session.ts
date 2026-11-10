import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

export const SESSION_COOKIE = "ganjah_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export interface AuthSession {
  username: string;
  password: string;
  expiresAt: number;
}

function sessionKey() {
  const secret = process.env.GANJAH_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("GANJAH_SESSION_SECRET debe tener al menos 32 caracteres.");
  }
  return createHash("sha256").update(secret).digest();
}

export function createSessionToken(username: string, password: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sessionKey(), iv);
  const payload: AuthSession = {
    username,
    password,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [iv, tag, encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

export function readSessionToken(token?: string): AuthSession | null {
  if (!token) return null;

  try {
    const [ivPart, tagPart, encryptedPart, extra] = token.split(".");
    if (!ivPart || !tagPart || !encryptedPart || extra) return null;

    const decipher = createDecipheriv(
      "aes-256-gcm",
      sessionKey(),
      Buffer.from(ivPart, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedPart, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const session = JSON.parse(decrypted) as Partial<AuthSession>;

    if (
      typeof session.username !== "string" ||
      typeof session.password !== "string" ||
      typeof session.expiresAt !== "number" ||
      !session.username ||
      !session.password ||
      session.expiresAt <= Date.now()
    ) {
      return null;
    }

    return session as AuthSession;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
