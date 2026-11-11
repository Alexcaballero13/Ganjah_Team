"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(body.message || "No fue posible iniciar sesión.");
        return;
      }
      router.replace("/panel");
      router.refresh();
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form welcome-form" onSubmit={handleSubmit}>
      <label>
        <span>Usuario</span>
        <input name="username" type="text" autoComplete="username" autoCapitalize="none" required />
      </label>
      <label>
        <span>Contraseña</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error && <p className="login-error" role="alert">{error}</p>}
      <button className="button button-primary button-large" type="submit" disabled={loading}>
        {loading ? "Validando…" : "Entrar al sistema"}
      </button>
    </form>
  );
}
