import type { MatchDay } from "@/lib/types";

// Únicas cuatro alineaciones con equipo LOCAL/VISITANTE verificable en Supabase.
// `legacySequence` conserva el ID real remoto y los IDs negativos evitan
// colisiones con registros editables creados por el backend local.
export const legacyMatchdays: MatchDay[] = [
  { id: -1, legacySequence: 52, fechaPartido: "2026-11-08T17:34:13.987559", golesLocal: 4, golesVisitante: 7, rosterStatus: "COMPLETO", readOnlySnapshot: true, jugadores: [
    ...["Lara","Alex","Papo","Cifu","Balanta","Guille","Juanda","Olave"].map((nombre) => ({ nombre, equipo: "LOCAL" as const })),
    ...["Arturo","Cristian","Diego","Varela","Cocho","Esteban T","Galeano","Perico"].map((nombre) => ({ nombre, equipo: "VISITANTE" as const })),
  ]},
  { id: -2, legacySequence: 51, fechaPartido: "2026-11-02T16:25:31.298595", golesLocal: null, golesVisitante: null, rosterStatus: "COMPLETO", readOnlySnapshot: true, jugadores: [
    ...["Lara","Papo","Sanmi","Cocho","Esteban T","Balanta","Olave","Rango"].map((nombre) => ({ nombre, equipo: "LOCAL" as const })),
    ...["Jhones","Cristian","Varela","Cifu","Daniel","Lerma","Perico","Juanda"].map((nombre) => ({ nombre, equipo: "VISITANTE" as const })),
  ]},
  { id: -3, legacySequence: 50, fechaPartido: "2026-10-25T17:28:22.211233", golesLocal: null, golesVisitante: null, rosterStatus: "COMPLETO", readOnlySnapshot: true, jugadores: [
    ...["Balanta","Diego","Varela","Daniel pri olave","Juanma","Alan","Amigo jose","Rango"].map((nombre) => ({ nombre, equipo: "LOCAL" as const })),
    ...["Papo","Alex","Cifu","Cocho","Amigo rolo","Perico","Olave","Jose"].map((nombre) => ({ nombre, equipo: "VISITANTE" as const })),
  ]},
  { id: -4, legacySequence: 49, fechaPartido: "2026-10-25T17:21:05.300778", golesLocal: null, golesVisitante: null, rosterStatus: "COMPLETO", readOnlySnapshot: true, jugadores: [
    ...["Lara","Sanmi","Cocho","Jp","Alan","Galeano","Leo"].map((nombre) => ({ nombre, equipo: "LOCAL" as const })),
    ...["Arturo","Balanta","Alex","Esteban T","Guille","Juanda","Jose"].map((nombre) => ({ nombre, equipo: "VISITANTE" as const })),
  ]},
];
