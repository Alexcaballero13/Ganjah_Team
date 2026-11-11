import type { Jugador } from "@/lib/types";

export const MIN_DRAFT_PLAYERS = 12;
export const MAX_DRAFT_PLAYERS = 18;

const POSITION_ORDER: Record<string, number> = {
  PORTERO: 1,
  DEFENSA: 2,
  MEDIOCAMPISTA: 3,
  DELANTERO: 4,
};

function normalizedPosition(position: string) {
  const value = position.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (["POR", "PORTERO", "ARQUERO"].includes(value)) return "PORTERO";
  if (["DEF", "DEFENSA"].includes(value)) return "DEFENSA";
  if (["MED", "MEDIO", "MEDIOCENTRO", "MEDIOCAMPISTA"].includes(value)) return "MEDIOCAMPISTA";
  if (["DEL", "DELANTERO", "ATACANTE"].includes(value)) return "DELANTERO";
  return value || "SIN_POSICION";
}

function manualLevel(player: Jugador) {
  return typeof player.nivelGeneral === "number"
    ? player.nivelGeneral
    : (player.nivelAtaque + player.nivelDefensa) / 2;
}

function effectiveAdjustment(player: Jugador) {
  return typeof player.nivelEfectivo === "number"
    ? player.nivelEfectivo - manualLevel(player)
    : 0;
}

function shuffle<T>(values: T[], random: () => number) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [values[index], values[target]] = [values[target], values[index]];
  }
  return values;
}

export interface BalancedTeams {
  local: Jugador[];
  visitante: Jugador[];
  diferenciaAtaque: number;
  diferenciaDefensa: number;
}

export function balanceTeams(players: Jugador[], random: () => number = Math.random): BalancedTeams {
  if (players.length < MIN_DRAFT_PLAYERS || players.length > MAX_DRAFT_PLAYERS) {
    throw new Error(`Selecciona entre ${MIN_DRAFT_PLAYERS} y ${MAX_DRAFT_PLAYERS} jugadores.`);
  }
  if (players.some((player) => !Number.isFinite(player.nivelAtaque) || !Number.isFinite(player.nivelDefensa))) {
    throw new Error("Todos los convocados deben tener ataque y defensa antes del sorteo.");
  }

  const shuffled = shuffle([...players], random);
  const positionTotals = new Map<string, number>();
  shuffled.forEach((player) => {
    const position = normalizedPosition(player.posicion);
    positionTotals.set(position, (positionTotals.get(position) || 0) + 1);
  });

  const maxTeamSize = Math.ceil(shuffled.length / 2);
  const positionsLocal = new Map<string, number>();
  const positionsVisitor = new Map<string, number>();
  let bestDefense = Number.POSITIVE_INFINITY;
  let bestAttack = Number.POSITIVE_INFINITY;
  let bestLocal: Jugador[] = [];
  let bestVisitor: Jugador[] = [];
  let optimalCount = 0;

  function search(
    index: number,
    local: Jugador[],
    visitor: Jugador[],
    attackLocal: number,
    defenseLocal: number,
    attackVisitor: number,
    defenseVisitor: number,
  ) {
    if (index === shuffled.length) {
      const defenseDifference = Math.abs(defenseLocal - defenseVisitor);
      const attackDifference = Math.abs(attackLocal - attackVisitor);
      const improves = defenseDifference < bestDefense ||
        (defenseDifference === bestDefense && attackDifference < bestAttack);

      if (improves) {
        bestDefense = defenseDifference;
        bestAttack = attackDifference;
        bestLocal = [...local];
        bestVisitor = [...visitor];
        optimalCount = 1;
      } else if (defenseDifference === bestDefense && attackDifference === bestAttack) {
        optimalCount += 1;
        if (random() < 1 / optimalCount) {
          bestLocal = [...local];
          bestVisitor = [...visitor];
        }
      }
      return;
    }

    const player = shuffled[index];
    const position = normalizedPosition(player.posicion);
    const maxPosition = Math.ceil((positionTotals.get(position) || 0) / 2);
    const adjustment = effectiveAdjustment(player);
    const weightedAttack = player.nivelAtaque + adjustment;
    const weightedDefense = player.nivelDefensa + adjustment;

    if (local.length < maxTeamSize && (positionsLocal.get(position) || 0) < maxPosition) {
      local.push(player);
      positionsLocal.set(position, (positionsLocal.get(position) || 0) + 1);
      search(index + 1, local, visitor, attackLocal + weightedAttack, defenseLocal + weightedDefense, attackVisitor, defenseVisitor);
      positionsLocal.set(position, (positionsLocal.get(position) || 1) - 1);
      local.pop();
    }

    if (visitor.length < maxTeamSize && (positionsVisitor.get(position) || 0) < maxPosition) {
      visitor.push(player);
      positionsVisitor.set(position, (positionsVisitor.get(position) || 0) + 1);
      search(index + 1, local, visitor, attackLocal, defenseLocal, attackVisitor + weightedAttack, defenseVisitor + weightedDefense);
      positionsVisitor.set(position, (positionsVisitor.get(position) || 1) - 1);
      visitor.pop();
    }
  }

  search(0, [], [], 0, 0, 0, 0);
  if (!bestLocal.length || !bestVisitor.length) {
    throw new Error("No fue posible formar dos equipos con la convocatoria actual.");
  }

  const sortTeam = (team: Jugador[]) => team.sort((a, b) => {
    const positionDifference = (POSITION_ORDER[normalizedPosition(a.posicion)] || 99) -
      (POSITION_ORDER[normalizedPosition(b.posicion)] || 99);
    return positionDifference || manualLevel(b) - manualLevel(a);
  });

  return {
    local: sortTeam(bestLocal),
    visitante: sortTeam(bestVisitor),
    diferenciaAtaque: bestAttack,
    diferenciaDefensa: bestDefense,
  };
}
