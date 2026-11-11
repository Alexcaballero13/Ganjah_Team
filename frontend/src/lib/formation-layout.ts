import { normalizePlayerPosition, type PlayerPosition } from "@/lib/player-position";
import type { Equipo, Jugador } from "@/lib/types";

export interface FormationSpot {
  player: Jugador;
  position: PlayerPosition | null;
  x: number;
  y: number;
}

const POSITION_DEPTH: Record<PlayerPosition, number> = {
  PORTERO: 94,
  DEFENSA: 81,
  MEDIOCAMPISTA: 67,
  DELANTERO: 53,
};

const POSITION_ORDER: PlayerPosition[] = ["PORTERO", "DEFENSA", "MEDIOCAMPISTA", "DELANTERO"];

function stablePlayers(players: Jugador[]) {
  return [...players].sort((a, b) => a.id - b.id || a.nombre.localeCompare(b.nombre, "es"));
}

function distributeLine(players: Jugador[], position: PlayerPosition | null, baseY: number): FormationSpot[] {
  const rows = players.length > 6 ? [players.slice(0, Math.ceil(players.length / 2)), players.slice(Math.ceil(players.length / 2))] : [players];

  return rows.flatMap((row, rowIndex) => {
    const rowOffset = rows.length === 1 ? 0 : rowIndex === 0 ? -3.2 : 3.2;
    return row.map((player, index) => ({
      player,
      position,
      x: 8 + ((index + 1) * 84) / (row.length + 1),
      y: baseY + rowOffset,
    }));
  });
}

export function calculateFormation(players: Jugador[], team: Equipo): FormationSpot[] {
  const grouped = new Map<PlayerPosition | null, Jugador[]>();
  for (const position of POSITION_ORDER) grouped.set(position, []);
  grouped.set(null, []);

  stablePlayers(players).forEach((player) => {
    const position = normalizePlayerPosition(player.posicion);
    grouped.get(position)?.push(player);
  });

  const localSpots = POSITION_ORDER.flatMap((position) =>
    distributeLine(grouped.get(position) ?? [], position, POSITION_DEPTH[position]),
  );
  const unknownSpots = distributeLine(grouped.get(null) ?? [], null, POSITION_DEPTH.MEDIOCAMPISTA);
  const spots = [...localSpots, ...unknownSpots];

  return team === "LOCAL" ? spots : spots.map((spot) => ({ ...spot, y: 100 - spot.y }));
}
