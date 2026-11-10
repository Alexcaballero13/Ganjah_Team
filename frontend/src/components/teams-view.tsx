"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Equipo, Jugador, MatchDay } from "@/lib/types";
import { PlayerCard } from "@/components/player-card";
import { Spinner, StatusPanel } from "@/components/ui";

function positionWeight(position: string) {
  const normalized = position.toLowerCase();
  if (/portero|arquero|guardameta/.test(normalized)) return 0;
  if (/defensa|central|lateral/.test(normalized)) return 1;
  if (/medio|volante/.test(normalized)) return 2;
  if (/delantero|atacante|extremo/.test(normalized)) return 3;
  return 2;
}

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
      <div className="tactical-board" aria-label={`Campo del MatchDay ${selected.legacySequence ?? selected.id}`}>
        <div className="field-markings" aria-hidden="true"><i /><i /><i /></div>
        {selected.rosterStatus !== "DESCONOCIDO" && teams.map((team) => {
          const roster = selected.jugadores
            .filter((entry) => entry.equipo === team)
            .map((entry) => resolvePlayer(entry.nombre))
            .sort((a, b) => positionWeight(a.posicion) - positionWeight(b.posicion));
          return <TeamHalf key={team} team={team} players={roster} />;
        })}
      </div>
      <p className="field-note">La distribución ordena las posiciones reales de portería a ataque. El backend aún no almacena coordenadas tácticas ni dorsales.</p>
    </div>
  );
}

function TeamHalf({ team, players }: { team: Equipo; players: Jugador[] }) {
  return (
    <section className={`team-half half-${team.toLowerCase()}`} aria-label={`Equipo ${team === "LOCAL" ? "local" : "visitante"}`}>
      <header><strong>{team === "LOCAL" ? "Local" : "Visitante"}</strong><span>{players.length} jugadores</span></header>
      <div className="field-roster">{players.map((player) => <PlayerCard key={`${team}-${player.nombre}`} player={player} team={team} compact classificationAvailable={player.id !== -1} />)}</div>
    </section>
  );
}
