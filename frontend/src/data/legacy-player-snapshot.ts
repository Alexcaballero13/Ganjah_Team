import type { Jugador } from "@/lib/types";

// Rendimiento verificado en la aplicación original el 2026-11-10.
// Adaptador temporal de desarrollo: no asigna categorías ni inventa datos.
const performance: Record<string, Pick<Jugador, "partidosJugados" | "victorias" | "empates" | "derrotas">> = {
  Galeano: { partidosJugados: 1, victorias: 1, empates: 0, derrotas: 0 },
  Papo: { partidosJugados: 1, victorias: 0, empates: 0, derrotas: 1 },
  Juanda: { partidosJugados: 1, victorias: 0, empates: 0, derrotas: 1 },
  Alex: { partidosJugados: 1, victorias: 0, empates: 0, derrotas: 1 },
  Cristian: { partidosJugados: 1, victorias: 1, empates: 0, derrotas: 0 },
  Arturo: { partidosJugados: 1, victorias: 1, empates: 0, derrotas: 0 },
  "Esteban T": { partidosJugados: 1, victorias: 1, empates: 0, derrotas: 0 },
  Olave: { partidosJugados: 1, victorias: 0, empates: 0, derrotas: 1 },
  Lara: { partidosJugados: 1, victorias: 0, empates: 0, derrotas: 1 },
  Varela: { partidosJugados: 1, victorias: 1, empates: 0, derrotas: 0 },
  Diego: { partidosJugados: 1, victorias: 1, empates: 0, derrotas: 0 },
  Cocho: { partidosJugados: 1, victorias: 1, empates: 0, derrotas: 0 },
  Cifu: { partidosJugados: 1, victorias: 0, empates: 0, derrotas: 1 },
  Balanta: { partidosJugados: 1, victorias: 0, empates: 0, derrotas: 1 },
  Perico: { partidosJugados: 1, victorias: 1, empates: 0, derrotas: 0 },
  Guille: { partidosJugados: 1, victorias: 0, empates: 0, derrotas: 1 },
};

// Identificadores reales del proyecto Supabase autorizado. Se conservan como
// trazabilidad de origen; `id` sigue siendo el identificador operativo de H2.
export const supabasePlayerIds: Readonly<Record<string, number>> = {
  Jp: 2,
  Lerma: 5,
  Galeano: 6,
  Juanma: 8,
  Alex: 9,
  Guille: 11,
  Papo: 12,
  Jhones: 13,
  Juli: 14,
  Perico: 15,
  Rango: 16,
  Cocho: 20,
  Arturo: 21,
  Leo: 23,
  Miguelito: 25,
  Diego: 26,
  Cifu: 28,
  "Esteban T": 29,
  Mike: 31,
  Cristian: 32,
  Juanda: 35,
  Sanmi: 38,
  Varela: 47,
  Alan: 48,
  Olave: 57,
  Lara: 58,
  Pri: 60,
  Jose: 61,
  Balanta: 80,
  Daniel: 88,
};

export function hydrateLegacyPlayerSnapshot(player: Jugador): Jugador {
  const verified = performance[player.nombre] ?? {
    partidosJugados: 0,
    victorias: 0,
    empates: 0,
    derrotas: 0,
  };

  return {
    ...player,
    legacySequence: supabasePlayerIds[player.nombre] ?? player.legacySequence,
    ...verified,
    categoriaVisual: null,
  };
}
