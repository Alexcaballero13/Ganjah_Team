import type {
  Jugador,
  JugadorDePartido,
  JugadorInput,
  JugadorReporte,
  MatchDay,
} from "@/lib/types";
import { hydrateLegacyPlayerSnapshot } from "@/data/legacy-player-snapshot";
import { legacyMatchdays } from "@/data/legacy-matchday-snapshot";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function hydratePlayer(player: Jugador): Jugador {
  return process.env.NODE_ENV === "development" ? hydrateLegacyPlayerSnapshot(player) : player;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/backend${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.replace("/ingreso?sesion=expirada");
    }
    let message = `La operación falló (${response.status}).`;
    try {
      const body = (await response.json()) as { message?: string; error?: string };
      message = body.message || body.error || message;
    } catch {
      // The backend may return an empty body for 401/403/404 responses.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  jugadores: {
    list: async () => {
      const players = await apiRequest<Jugador[]>("/api/jugadores");
      return players.map(hydratePlayer);
    },
    create: async (input: JugadorInput) =>
      hydratePlayer(await apiRequest<Jugador>("/api/jugadores", {
        method: "POST",
        body: JSON.stringify(input),
      })),
    update: async (id: number, input: JugadorInput) =>
      hydratePlayer(await apiRequest<Jugador>(`/api/jugadores/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      })),
    remove: (id: number) =>
      apiRequest<void>(`/api/jugadores/${id}`, { method: "DELETE" }),
  },
  matchdays: {
    list: async () => {
      const matches = await apiRequest<MatchDay[]>("/api/matchdays");
      if (process.env.NODE_ENV !== "development") return matches;
      const persistedDates = new Set(matches.map((match) => match.fechaPartido.slice(0, 16)));
      return [
        ...legacyMatchdays.filter((match) => !persistedDates.has(match.fechaPartido.slice(0, 16))),
        ...matches,
      ];
    },
    create: (jugadores: JugadorDePartido[]) =>
      apiRequest<MatchDay>("/api/matchdays", {
        method: "POST",
        body: JSON.stringify({ jugadores }),
      }),
    updateScore: (id: number, golesLocal: number, golesVisitante: number) =>
      apiRequest<MatchDay>(`/api/matchdays/${id}/marcador`, {
        method: "PUT",
        body: JSON.stringify({ golesLocal, golesVisitante }),
      }),
    updateRoster: (id: number, jugadores: JugadorDePartido[]) =>
      apiRequest<MatchDay>(`/api/matchdays/${id}/jugadores`, {
        method: "PUT",
        body: JSON.stringify({ jugadores }),
      }),
    remove: (id: number) =>
      apiRequest<void>(`/api/matchdays/${id}`, { method: "DELETE" }),
  },
  reportes: {
    monthly: (mes: number, anio: number) =>
      apiRequest<JugadorReporte[]>(
        `/api/reportes/partidos-por-mes?mes=${mes}&anio=${anio}`,
      ),
    absent: (mes: number, anio: number) =>
      apiRequest<string[]>(
        `/api/reportes/ausentes-por-mes?mes=${mes}&anio=${anio}`,
      ),
  },
};

