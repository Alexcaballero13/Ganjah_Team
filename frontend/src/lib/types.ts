export type Equipo = "LOCAL" | "VISITANTE";

export interface Jugador {
  id: number;
  legacySequence?: number | null;
  nombre: string;
  posicion: string;
  nivelAtaque: number;
  nivelDefensa: number;
  nivelGeneral?: number | null;
  nivelEfectivo?: number | null;
  partidosJugados?: number | null;
  victorias?: number | null;
  empates?: number | null;
  derrotas?: number | null;
  categoriaVisual?: "GOLD" | "SILVER" | "BRONZE" | null;
}

export interface JugadorInput {
  nombre: string;
  posicion: string;
  nivelAtaque: number;
  nivelDefensa: number;
}

export interface JugadorDePartido {
  nombre: string;
  equipo: Equipo;
}

export interface MatchDay {
  id: number;
  legacySequence?: number | null;
  fechaPartido: string;
  jugadores: JugadorDePartido[];
  golesLocal: number | null;
  golesVisitante: number | null;
  rosterStatus?: "COMPLETO" | "DESCONOCIDO" | null;
  readOnlySnapshot?: boolean;
}

export interface JugadorReporte {
  nombre: string;
  partidosJugados: number;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
  status?: number;
}

