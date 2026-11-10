import type { Jugador } from "@/lib/types";

export type PlayerTier = "gold" | "silver" | "bronze" | "unrated";

// Regla aprobada para la adaptación visual del snapshot original.
// Usa primero la categoría persistida y, mientras Supabase no la guarde,
// clasifica con la valoración deportiva real disponible.
export const PLAYER_TIER_THRESHOLDS = {
  gold: 3.5,
  silver: 2.5,
} as const;

export function getPlayerRating(player: Jugador): number {
  if (typeof player.nivelEfectivo === "number") return player.nivelEfectivo;
  if (typeof player.nivelGeneral === "number") return player.nivelGeneral;
  return (player.nivelAtaque + player.nivelDefensa) / 2;
}

export function getPlayerTier(player: Jugador): PlayerTier {
  if (player.categoriaVisual === "GOLD") return "gold";
  if (player.categoriaVisual === "SILVER") return "silver";
  if (player.categoriaVisual === "BRONZE") return "bronze";
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
