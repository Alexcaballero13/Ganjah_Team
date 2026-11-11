import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function Home() {
  return (
    <main className="welcome-page">
      <section className="welcome-stage" aria-labelledby="welcome-title">
        <div className="welcome-brand">
          <Image
            src="/ganjah-team-logo-extracted.png"
            alt="Ganjah Team"
            width={944}
            height={1100}
            priority
            unoptimized
          />
          <div>
            <span className="hero-kicker"><i /> Fútbol local, gestión real</span>
            <h1 id="welcome-title">La energía del equipo.<br /><em>En cada jugada.</em></h1>
            <p>Organiza la plantilla, equilibra los equipos y registra cada MatchDay con los datos reales del club.</p>
          </div>
        </div>

        <div className="welcome-access">
          <div>
            <span className="eyebrow">Acceso privado</span>
            <h2>Ingresar</h2>
            <p>Utiliza tu usuario y contraseña habituales.</p>
          </div>
          <LoginForm />
          <p className="login-security">Sesión cifrada · La contraseña no se guarda en el navegador</p>
        </div>
      </section>
    </main>
  );
}
