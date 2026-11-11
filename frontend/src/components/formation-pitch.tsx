import { PlayerCard } from "@/components/player-card";
import { calculateFormation } from "@/lib/formation-layout";
import { normalizePlayerPosition } from "@/lib/player-position";
import type { Equipo, Jugador } from "@/lib/types";

function TeamWarnings({ players, team }: { players: Jugador[]; team: Equipo }) {
  const keeperCount = players.filter((player) => normalizePlayerPosition(player.posicion) === "PORTERO").length;
  if (keeperCount === 1) return null;

  return (
    <span className={`formation-warning warning-${team.toLowerCase()}`} role="status">
      {team === "LOCAL" ? "Local" : "Visitante"}: {keeperCount === 0 ? "sin portero asignado" : `${keeperCount} porteros asignados`}
    </span>
  );
}

export function FormationPitch({ local, visitante }: { local: Jugador[]; visitante: Jugador[] }) {
  const teams = [
    { id: "VISITANTE" as const, players: visitante },
    { id: "LOCAL" as const, players: local },
  ];

  return (
    <section className="formation-preview" aria-labelledby="formation-title">
      <div className="panel-heading formation-heading">
        <div><span className="eyebrow">Vista táctica actual</span><h2 id="formation-title">Formación dinámica</h2></div>
        <div className="team-counter"><span>{local.length} local</span><i>vs</i><span>{visitante.length} visitante</span></div>
      </div>
      <div className="formation-scroll" tabIndex={0} aria-label="Cancha con las alineaciones generadas">
        <div className="dynamic-pitch">
          <div className="dynamic-field-markings" aria-hidden="true"><i /><i /><i /></div>
          <div className="formation-team-label label-visitante"><strong>Visitante</strong><span>{visitante.length}</span></div>
          <div className="formation-team-label label-local"><strong>Local</strong><span>{local.length}</span></div>
          <TeamWarnings players={visitante} team="VISITANTE" />
          <TeamWarnings players={local} team="LOCAL" />
          {teams.flatMap(({ id, players }) => calculateFormation(players, id).map((spot) => (
            <div
              className="formation-player"
              key={`${id}-${spot.player.id}-${spot.player.nombre}`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              <PlayerCard player={spot.player} team={id} compact />
            </div>
          )))}
        </div>
      </div>
      <p className="field-note">La cancha calcula posiciones actuales sin modificar el equipo asignado ni guardar coordenadas. Desliza horizontalmente en pantallas pequeñas.</p>
    </section>
  );
}
