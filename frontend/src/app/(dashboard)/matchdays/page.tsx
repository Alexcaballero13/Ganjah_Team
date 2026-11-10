import { MatchdaysManager } from "@/components/matchdays-manager";
import { PageHeader } from "@/components/ui";

export default function MatchdaysPage() {
  return <><PageHeader eyebrow="Competición" title="MatchDays" description="Convoca jugadores, equilibra equipos y registra el marcador final." /><MatchdaysManager /></>;
}
