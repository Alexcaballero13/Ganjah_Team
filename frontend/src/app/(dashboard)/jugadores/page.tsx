import { PlayersManager } from "@/components/players-manager";
import { PageHeader } from "@/components/ui";

export default function JugadoresPage() {
  return <><PageHeader eyebrow="Plantilla" title="Jugadores" description="Administra perfiles y niveles base utilizados por el sistema de partidos." /><PlayersManager /></>;
}
