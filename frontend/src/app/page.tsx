import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Icon } from "@/components/icons";

export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav" aria-label="Navegación de inicio">
        <BrandMark />
        <Link className="button button-ghost" href="/panel">Abrir panel <Icon name="arrow" /></Link>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker"><i /> Fútbol local, gestión real</span>
          <h1>La energía del equipo.<br /><em>En cada jugada.</em></h1>
          <p>Organiza tu plantilla, arma los equipos y convierte cada MatchDay en datos que impulsan el próximo partido.</p>
          <div className="hero-actions"><Link className="button button-primary button-large" href="/panel">Entrar a la cancha <Icon name="arrow" /></Link><a className="text-link" href="#sistema">Explorar el sistema</a></div>
        </div>
        <div className="hero-pitch" aria-label="Representación de una cancha de fútbol">
          <div className="pitch-lines"><span className="center-circle" /><span className="pitch-score">GT</span><span className="pitch-label">Cancha eléctrica</span></div>
          <span className="floating-stat stat-one"><b>01</b> Plantilla</span>
          <span className="floating-stat stat-two"><b>02</b> Equipos</span>
          <span className="floating-stat stat-three"><b>03</b> MatchDay</span>
        </div>
      </section>
      <section id="sistema" className="landing-system">
        <div><span className="eyebrow">Un flujo conectado</span><h2>De la convocatoria<br />al resultado final.</h2></div>
        <ol>
          <li><span>01</span><div><strong>Construye la plantilla</strong><p>Registra posiciones y niveles reales.</p></div></li>
          <li><span>02</span><div><strong>Confirma alineaciones</strong><p>Asigna local y visitante en cada fecha.</p></div></li>
          <li><span>03</span><div><strong>Mide la participación</strong><p>Consulta marcadores e informes mensuales.</p></div></li>
        </ol>
      </section>
      <footer className="landing-footer"><BrandMark /><span>Entorno local · Sin servicios externos</span></footer>
    </main>
  );
}
