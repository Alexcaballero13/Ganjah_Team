import { getPlayerTier, type PlayerTier } from "@/lib/player-tier";
import { normalizePlayerPosition, type PlayerPosition } from "@/lib/player-position";
import type { Jugador } from "@/lib/types";

export type PerformanceFilter = "all" | Exclude<PlayerTier, "unrated">;
export type PositionFilter = "all" | PlayerPosition;

export function filterPlayers(
  players: Jugador[],
  performance: PerformanceFilter,
  position: PositionFilter,
): Jugador[] {
  return players.filter((player) =>
    (performance === "all" || getPlayerTier(player) === performance) &&
    (position === "all" || normalizePlayerPosition(player.posicion) === position),
  );
}
