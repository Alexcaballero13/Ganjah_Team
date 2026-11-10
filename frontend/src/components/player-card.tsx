import { displayLevel, initials } from "@/lib/format";
import { getPlayerRating, getPlayerTier, playerTierLabels } from "@/lib/player-tier";
import type { Equipo, Jugador } from "@/lib/types";

function StarRating({ label, value }: { label: string; value: number }) {
  const rating = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <div className="game-card-star-rating" aria-label={`${label}: ${rating} de 5 estrellas`}>
      <span>{label}</span>
      <strong aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <i className={index < rating ? "star-filled" : "star-empty"} key={index}>★</i>
        ))}
      </strong>
    </div>
  );
}

export function PlayerCard({ player, team, compact = false, classificationAvailable = true, actions }: {
  player: Jugador;
  team?: Equipo;
  compact?: boolean;
  classificationAvailable?: boolean;
  actions?: React.ReactNode;
}) {
  const tier = classificationAvailable ? getPlayerTier(player) : "unrated";
  const rating = getPlayerRating(player);
  const tierLabel = playerTierLabels[tier];

  return (
    <article className={`game-card tier-${tier} ${compact ? "game-card-compact" : "game-card-full"}`} aria-label={`${player.nombre}, categoría ${tierLabel}`}>
      <div className="game-card-glow" aria-hidden="true" />
      <div className="game-card-topline">
        <span>{tierLabel}</span>
        {team && <b>{team === "LOCAL" ? "LOC" : "VIS"}</b>}
      </div>
      <div className="game-card-identity">
        <div className="game-card-rating"><strong>{classificationAvailable ? displayLevel(rating) : "—"}</strong><span>{player.posicion || "—"}</span></div>
        <div className="game-card-avatar" aria-label="Avatar sin fotografía">{initials(player.nombre)}</div>
      </div>
      <h2 title={player.nombre}>{player.nombre}</h2>
      {!compact && (
        <>
          <div className="game-card-stats game-card-star-stats">
            <StarRating label="ATA" value={player.nivelAtaque} />
            <StarRating label="DEF" value={player.nivelDefensa} />
          </div>
          {actions && <div className="game-card-actions">{actions}</div>}
        </>
      )}
    </article>
  );
}
