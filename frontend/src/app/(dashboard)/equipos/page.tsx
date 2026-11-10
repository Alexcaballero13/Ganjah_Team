import { TeamsView } from "@/components/teams-view";
import { PageHeader } from "@/components/ui";

export default function EquiposPage() {
  return <><PageHeader eyebrow="Alineaciones" title="Equipos" description="Consulta la composición local y visitante de cada MatchDay confirmado." /><TeamsView /></>;
}
