import { Icon, type IconName } from "@/components/icons";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  );
}

export function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export function StatusPanel({
  title,
  message,
  tone = "neutral",
  action,
}: {
  title: string;
  message: string;
  tone?: "neutral" | "error" | "success";
  action?: React.ReactNode;
}) {
  return (
    <div className={`status-panel status-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <div><strong>{title}</strong><p>{message}</p></div>
      {action}
    </div>
  );
}

export function Metric({
  label,
  value,
  detail,
  icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: IconName;
  accent?: boolean;
}) {
  return (
    <article className={accent ? "metric-card metric-accent" : "metric-card"}>
      <div className="metric-icon"><Icon name={icon} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export function Spinner({ label = "Cargando" }: { label?: string }) {
  return <span className="spinner" role="status"><span aria-hidden="true" />{label}</span>;
}

