import Image from "next/image";
import { displayLevel } from "@/lib/format";
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

function PlayerSilhouette() {
  return (
    <svg className="player-silhouette" viewBox="0 0 64 76" aria-hidden="true">
      <circle cx="32" cy="20" r="14" />
      <path d="M8 72c1-20 10-32 24-32s23 12 24 32H8Z" />
      <path d="M22 40c2 6 5 9 10 9s8-3 10-9l5 3c-2 10-7 16-15 16S19 53 17 43l5-3Z" opacity=".36" />
    </svg>
  );
}

type PositionSilhouette = {
  className: string;
  height: number;
  label: string;
  src: string;
  width: number;
};

const positionSilhouettes: Record<string, PositionSilhouette> = {
  DEL: { src: "/player-forward-silhouette.png", label: "delantero", className: "position-forward", width: 1153, height: 1364 },
  DELANTERO: { src: "/player-forward-silhouette.png", label: "delantero", className: "position-forward", width: 1153, height: 1364 },
  ATACANTE: { src: "/player-forward-silhouette.png", label: "delantero", className: "position-forward", width: 1153, height: 1364 },
  FORWARD: { src: "/player-forward-silhouette.png", label: "delantero", className: "position-forward", width: 1153, height: 1364 },
  MED: { src: "/player-midfielder-silhouette.png", label: "mediocampista", className: "position-midfielder", width: 1254, height: 1254 },
  MEDIO: { src: "/player-midfielder-silhouette.png", label: "mediocampista", className: "position-midfielder", width: 1254, height: 1254 },
  MEDIOCAMPISTA: { src: "/player-midfielder-silhouette.png", label: "mediocampista", className: "position-midfielder", width: 1254, height: 1254 },
  MEDIOCENTRO: { src: "/player-midfielder-silhouette.png", label: "mediocampista", className: "position-midfielder", width: 1254, height: 1254 },
  VOLANTE: { src: "/player-midfielder-silhouette.png", label: "mediocampista", className: "position-midfielder", width: 1254, height: 1254 },
  MIDFIELDER: { src: "/player-midfielder-silhouette.png", label: "mediocampista", className: "position-midfielder", width: 1254, height: 1254 },
  POR: { src: "/player-goalkeeper-silhouette.png", label: "portero", className: "position-goalkeeper", width: 1536, height: 1024 },
  PORTERO: { src: "/player-goalkeeper-silhouette.png", label: "portero", className: "position-goalkeeper", width: 1536, height: 1024 },
  ARQUERO: { src: "/player-goalkeeper-silhouette.png", label: "portero", className: "position-goalkeeper", width: 1536, height: 1024 },
  GUARDAMETA: { src: "/player-goalkeeper-silhouette.png", label: "portero", className: "position-goalkeeper", width: 1536, height: 1024 },
  GOALKEEPER: { src: "/player-goalkeeper-silhouette.png", label: "portero", className: "position-goalkeeper", width: 1536, height: 1024 },
  DEF: { src: "/player-defender-silhouette.png", label: "defensa", className: "position-defender", width: 1536, height: 1024 },
  DEFENSA: { src: "/player-defender-silhouette.png", label: "defensa", className: "position-defender", width: 1536, height: 1024 },
  DEFENSOR: { src: "/player-defender-silhouette.png", label: "defensa", className: "position-defender", width: 1536, height: 1024 },
  ZAGUERO: { src: "/player-defender-silhouette.png", label: "defensa", className: "position-defender", width: 1536, height: 1024 },
  DEFENDER: { src: "/player-defender-silhouette.png", label: "defensa", className: "position-defender", width: 1536, height: 1024 },
};

export function getPositionSilhouette(position?: string) {
  const normalized = position
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "")
    .toUpperCase() ?? "";

  return positionSilhouettes[normalized];
}

function PlayerAvatar({ player }: { player: Jugador }) {
  const silhouette = getPositionSilhouette(player.posicion);

  return (
    <div
      className={`game-card-avatar ${silhouette ? "game-card-avatar-position" : ""}`}
      aria-label={silhouette ? `Silueta de ${silhouette.label} sin fotografía` : "Silueta de jugador sin fotografía"}
    >
      {silhouette ? (
        <Image
          className={`position-silhouette ${silhouette.className}`}
          src={silhouette.src}
          alt=""
          width={silhouette.width}
          height={silhouette.height}
          unoptimized
          aria-hidden="true"
        />
      ) : <PlayerSilhouette />}
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
        <PlayerAvatar player={player} />
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
