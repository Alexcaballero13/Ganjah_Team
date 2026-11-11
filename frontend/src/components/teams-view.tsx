"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Equipo, Jugador, MatchDay } from "@/lib/types";
import { PlayerCard } from "@/components/player-card";
import { Spinner, StatusPanel } from "@/components/ui";
import { calculateFormation } from "@/lib/formation-layout";

export function TeamsView() {
  const [matches, setMatches] = useState<MatchDay[]>([]);
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.matchdays.list(), api.jugadores.list()]).then(([matchData, playerData]) => {
      const ordered = matchData.sort((a, b) => b.fechaPartido.localeCompare(a.fechaPartido));
      setMatches(ordered);
      setPlayers(playerData);
      setSelectedId(ordered[0]?.id ?? null);
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="content-loading"><Spinner label="Cargando campo" /></div>;
  if (error) return <StatusPanel tone="error" title="Backend no disponible" message={error} />;
  if (!matches.length) return <StatusPanel title="No hay equipos confirmados" message="Los equipos se forman dentro de cada MatchDay. Crea uno para verlos sobre el campo." />;

  const selected = matches.find((match) => match.id === selectedId) || matches[0];
  const teams = ["LOCAL", "VISITANTE"] as const;

  const resolvePlayer = (name: string): Jugador => players.find((player) => player.nombre === name) || {
    id: -1,
    nombre: name,
    posicion: "Sin posición",
    nivelAtaque: 0,
    nivelDefensa: 0,
  };

  return (
    <div className="manager-stack">
      <label className="match-selector"><span>Encuentro</span><select value={selected.id} onChange={(event) => setSelectedId(Number(event.target.value))}>{matches.map((match) => <option key={match.id} value={match.id}>{formatDate(match.fechaPartido)} · MatchDay #{match.legacySequence ?? match.id}</option>)}</select></label>
      {selected.rosterStatus === "DESCONOCIDO" && <StatusPanel title="Alineación histórica pendiente" message="El sistema original conserva este MatchDay, pero no expuso los nombres de sus equipos. No se presenta como una alineación vacía ni se inventan jugadores." />}
      <div className="tactical-board-scroll" tabIndex={0} aria-label="Desplazar cancha horizontalmente">
        <div className="tactical-board" aria-label={`Campo del MatchDay ${selected.legacySequence ?? selected.id}`}>
          <div className="field-markings" aria-hidden="true"><i /><i /><i /></div>
          {selected.rosterStatus !== "DESCONOCIDO" && teams.map((team) => {
            const roster = selected.jugadores
              .filter((entry) => entry.equipo === team)
              .map((entry) => resolvePlayer(entry.nombre));
            return <TeamFormation key={team} team={team} players={roster} />;
          })}
        </div>
      </div>
      <p className="field-note">La distribución ordena las posiciones reales de portería a ataque. El backend aún no almacena coordenadas tácticas ni dorsales.</p>
    </div>
  );
}

function TeamFormation({ team, players }: { team: Equipo; players: Jugador[] }) {
  // La vista Equipos conserva LOCAL arriba y VISITANTE abajo, como la versión
  // aprobada. calculateFormation aporta líneas estables por posición; aquí sólo
  // invertimos el eje vertical de presentación y protegemos los bordes.
  const spots = calculateFormation(players, team).map((spot) => ({
    ...spot,
    y: Math.min(92, Math.max(8,
      spot.position === "DELANTERO"
        ? team === "LOCAL" ? 43 : 57
        : 100 - spot.y,
    )),
  }));

  return (
    <section className={`tactical-team tactical-team-${team.toLowerCase()}`} aria-label={`Equipo ${team === "LOCAL" ? "local" : "visitante"}`}>
      <header><strong>{team === "LOCAL" ? "Local" : "Visitante"}</strong><span>{players.length} jugadores</span></header>
      {spots.map((spot) => (
        <div
          className="team-formation-player"
          key={`${team}-${spot.player.id}-${spot.player.nombre}`}
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
        >
          <PlayerCard player={spot.player} team={team} compact classificationAvailable={spot.player.id !== -1} />
        </div>
      ))}
    </section>
  );
}
