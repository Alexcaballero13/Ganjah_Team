export type PlayerPosition = "PORTERO" | "DEFENSA" | "MEDIOCAMPISTA" | "DELANTERO";

const POSITION_ALIASES: Record<string, PlayerPosition> = {
  POR: "PORTERO",
  PORTERO: "PORTERO",
  ARQUERO: "PORTERO",
  GUARDAMETA: "PORTERO",
  GOALKEEPER: "PORTERO",
  DEF: "DEFENSA",
  DEFENSA: "DEFENSA",
  DEFENSOR: "DEFENSA",
  ZAGUERO: "DEFENSA",
  CENTRAL: "DEFENSA",
  LATERAL: "DEFENSA",
  DEFENDER: "DEFENSA",
  MED: "MEDIOCAMPISTA",
  MEDIO: "MEDIOCAMPISTA",
  MEDIOCAMPISTA: "MEDIOCAMPISTA",
  MEDIOCENTRO: "MEDIOCAMPISTA",
  VOLANTE: "MEDIOCAMPISTA",
  MIDFIELDER: "MEDIOCAMPISTA",
  DEL: "DELANTERO",
  DELANTERO: "DELANTERO",
  ATACANTE: "DELANTERO",
  EXTREMO: "DELANTERO",
  FORWARD: "DELANTERO",
};

export const playerPositionLabels: Record<PlayerPosition, string> = {
  PORTERO: "Portero",
  DEFENSA: "Defensa",
  MEDIOCAMPISTA: "Mediocampista",
  DELANTERO: "Delantero",
};

export function normalizePositionValue(position?: string): string {
  return position
    ?.trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "")
    .toUpperCase() ?? "";
}

export function normalizePlayerPosition(position?: string): PlayerPosition | null {
  return POSITION_ALIASES[normalizePositionValue(position)] ?? null;
}

export function playerPositionKey(position?: string): string {
  const normalized = normalizePositionValue(position);
  return (normalizePlayerPosition(position) ?? normalized) || "SIN_POSICION";
}
