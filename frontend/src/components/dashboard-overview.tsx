"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import { displayLevel, formatDate } from "@/lib/format";
import type { Jugador, MatchDay } from "@/lib/types";
import { Icon } from "@/components/icons";
import { Metric, Spinner, StatusPanel } from "@/components/ui";

export function DashboardOverview() {
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [matches, setMatches] = useState<MatchDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.jugadores.list(), api.matchdays.list()])
      .then(([playerData, matchData]) => {
        setPlayers(playerData);
        setMatches(matchData.sort((a, b) => b.fechaPartido.localeCompare(a.fechaPartido)));
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const completed = matches.filter(
    (match) => match.golesLocal !== null && match.golesVisitante !== null,
  );
  const latest = matches[0];
  const rated = useMemo(
    () =>
      [...players]
        .filter((player) => typeof player.nivelEfectivo === "number")
        .sort((a, b) => (b.nivelEfectivo || 0) - (a.nivelEfectivo || 0))
        .slice(0, 4),
    [players],
  );

  if (loading) return <div className="content-loading"><Spinner label="Conectando con el backend" /></div>;
  if (error) return <StatusPanel tone="error" title="Backend no disponible" message={error} />;

  return (
    <div className="dashboard-stack">
      <section className="metrics-grid" aria-label="Resumen del equipo">
        <Metric icon="users" label="Plantilla" value={players.length} detail="jugadores registrados" />
        <Metric icon="calendar" label="MatchDays" value={matches.length} detail="encuentros guardados" accent />
        <Metric icon="chart" label="Con marcador" value={completed.length} detail="resultados completos" />
      </section>

      <section className="dashboard-grid">
        <article className="feature-panel pitch-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">Actividad reciente</span><h2>{latest ? "Último MatchDay" : "La cancha está lista"}</h2></div>
            <Link className="text-link" href="/matchdays">Ver MatchDays <Icon name="arrow" /></Link>
          </div>
          {latest ? (
            <>
              <div className="scoreboard">
                <div><span>Local</span><strong>{latest.jugadores.filter((p) => p.equipo === "LOCAL").length}</strong><small>jugadores</small></div>
                <div className="score-main">
                  <small>{formatDate(latest.fechaPartido)}</small>
                  <strong>{latest.golesLocal ?? "—"}<span>:</span>{latest.golesVisitante ?? "—"}</strong>
                  <em>{latest.golesLocal === null ? "Marcador pendiente" : "Resultado final"}</em>
                </div>
                <div><span>Visitante</span><strong>{latest.jugadores.filter((p) => p.equipo === "VISITANTE").length}</strong><small>jugadores</small></div>
              </div>
              <div className="panel-actions"><Link className="button button-primary" href="/matchdays">Gestionar partido</Link></div>
            </>
          ) : (
            <StatusPanel
              title="Todavía no hay partidos"
              message="Crea el primer MatchDay con jugadores reales del backend."
              action={<Link className="button button-primary" href="/matchdays">Crear MatchDay</Link>}
            />
          )}
        </article>

        <article className="data-panel">
          <div className="panel-heading"><div><span className="eyebrow">Rendimiento</span><h2>Nivel efectivo</h2></div></div>
          {rated.length ? (
            <div className="ranking-list">
              {rated.map((player, index) => (
                <div className="ranking-row" key={player.id}>
                  <span className="rank-number">{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{player.nombre}</strong><small>{player.posicion} · {player.partidosJugados || 0} PJ</small></div>
                  <b>{displayLevel(player.nivelEfectivo)}</b>
                </div>
              ))}
            </div>
          ) : (
            <StatusPanel title="Sin historial suficiente" message="Los niveles efectivos aparecerán cuando existan jugadores y partidos con marcador." />
          )}
        </article>
      </section>
    </div>
  );
}

