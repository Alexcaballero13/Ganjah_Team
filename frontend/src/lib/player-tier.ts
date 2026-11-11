import type { Jugador } from "@/lib/types";

export type PlayerTier = "gold" | "silver" | "bronze" | "unrated";

// Regla aprobada para la adaptación visual del snapshot original.
// Clasifica siempre con las estrellas actuales de ataque y defensa, igual que
// el sistema original. Así el color cambia al guardar una nueva calificación.
// El rendimiento histórico se muestra aparte.
export const PLAYER_TIER_THRESHOLDS = {
  gold: 3.5,
  silver: 2.5,
} as const;

export function getPlayerRating(player: Jugador): number {
  if (typeof player.nivelGeneral === "number") return player.nivelGeneral;
  return (player.nivelAtaque + player.nivelDefensa) / 2;
}

export function getPlayerTier(player: Jugador): PlayerTier {
  const rating = getPlayerRating(player);
  if (!Number.isFinite(rating)) return "unrated";
  if (rating >= PLAYER_TIER_THRESHOLDS.gold) return "gold";
  if (rating >= PLAYER_TIER_THRESHOLDS.silver) return "silver";
  return "bronze";
}

export const playerTierLabels: Record<PlayerTier, string> = {
  gold: "Superior",
  silver: "Regular",
  bronze: "Bajo rendimiento",
  unrated: "Sin clasificar",
};
