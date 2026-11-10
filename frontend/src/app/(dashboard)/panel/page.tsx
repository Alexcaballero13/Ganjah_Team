import { DashboardOverview } from "@/components/dashboard-overview";
import { PageHeader } from "@/components/ui";

export default function PanelPage() {
  return <><PageHeader eyebrow="Centro de mando" title="La cancha, bajo control." description="Plantilla, próximos encuentros y rendimiento real en un solo lugar." /><DashboardOverview /></>;
}
