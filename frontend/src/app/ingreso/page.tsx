"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
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
    <main className="login-page">
      <section className="login-stage" aria-labelledby="login-title">
        <Link href="/" className="login-back">← Volver al inicio</Link>
        <div className="login-brand-panel">
          <Image
            src="/ganjah-team-logo-extracted.png"
            alt="Ganjah Team"
            width={944}
            height={1100}
            priority
          />
          <span className="eyebrow">Cancha eléctrica</span>
          <h1>El equipo empieza aquí.</h1>
          <p>Gestiona la plantilla, prepara los MatchDays y registra cada resultado con los accesos del sistema actual.</p>
        </div>

        <div className="login-form-panel">
          <div>
            <span className="eyebrow">Acceso privado</span>
            <h2 id="login-title">Ingresar</h2>
            <p>Utiliza tu usuario y contraseña habituales.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              <span>Usuario</span>
              <input
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                required
                autoFocus
              />
            </label>
            <label>
              <span>Contraseña</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="button button-primary button-large" type="submit" disabled={loading}>
              {loading ? "Validando…" : "Entrar al sistema"}
            </button>
          </form>
          <p className="login-security">Sesión cifrada · La contraseña no se guarda en el navegador</p>
        </div>
      </section>
    </main>
  );
}
