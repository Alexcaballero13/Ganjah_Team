"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { AuthProvider, type UserRole } from "@/components/auth-context";
import { Icon, type IconName } from "@/components/icons";

const navigation: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/panel", label: "Resumen", icon: "home" },
  { href: "/jugadores", label: "Jugadores", icon: "users" },
  { href: "/equipos", label: "Equipos", icon: "shield" },
  { href: "/matchdays", label: "MatchDays", icon: "calendar" },
  { href: "/estadisticas", label: "Estadísticas", icon: "chart" },
];

export function AppShell({ children, username, role }: { children: React.ReactNode; username: string; role: UserRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } finally {
      router.replace("/ingreso");
      router.refresh();
    }
  }

  return (
    <AuthProvider username={username} role={role}>
    <div className="app-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="mobile-header">
        <BrandMark compact />
        <button
          className="icon-button"
          type="button"
          aria-label={open ? "Cerrar navegación" : "Abrir navegación"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? "x" : "menu"} />
        </button>
      </header>

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand"><BrandMark /></div>
        <nav className="main-nav" aria-label="Navegación principal">
          {navigation.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "nav-item nav-item-active" : "nav-item"}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-session">
          <span className="status-dot" aria-hidden="true" />
          <div><strong>{username}</strong><span>{role === "ADMIN" ? "Administrador" : "Solo consulta"}</span></div>
          <button className="text-button" type="button" onClick={logout} disabled={loggingOut}>
            {loggingOut ? "Saliendo…" : "Salir"}
          </button>
        </div>
      </aside>

      {open && <button className="sidebar-scrim" aria-label="Cerrar navegación" onClick={() => setOpen(false)} />}
      <main id="contenido" className="app-content">{children}</main>
    </div>
    </AuthProvider>
  );
}

