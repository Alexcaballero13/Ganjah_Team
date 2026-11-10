import { StatsDashboard } from "@/components/stats-dashboard";
import { PageHeader } from "@/components/ui";
import { connection } from "next/server";

export default async function EstadisticasPage() {
  await connection();
  const now = new Date();
  return <><PageHeader eyebrow="Datos de juego" title="Estadísticas" description="Analiza la participación mensual con reportes calculados por el backend." /><StatsDashboard initialMonth={now.getMonth() + 1} initialYear={now.getFullYear()} /></>;
}
