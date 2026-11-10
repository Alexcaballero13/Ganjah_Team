"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { JugadorReporte } from "@/lib/types";
import { Spinner, StatusPanel } from "@/components/ui";

export function StatsDashboard({ initialMonth, initialYear }: { initialMonth: number; initialYear: number }) {
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [report, setReport] = useState<JugadorReporte[]>([]);
  const [absent, setAbsent] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [monthly, missing] = await Promise.all([api.reportes.monthly(month, year), api.reportes.absent(month, year)]);
      setError("");
      setReport(monthly.sort((a, b) => b.partidosJugados - a.partidosJugados));
      setAbsent(missing);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    // Los filtros disparan una consulta real al backend.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <div className="manager-stack">
      <div className="report-filters">
        <label><span>Mes</span><select value={month} onChange={(event) => { setLoading(true); setMonth(Number(event.target.value)); }}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Intl.DateTimeFormat("es-CO", { month: "long" }).format(new Date(2026, index, 1))}</option>)}</select></label>
        <label><span>Año</span><input type="number" min="2020" max="2100" value={year} onChange={(event) => { setLoading(true); setYear(Number(event.target.value)); }} /></label>
      </div>
      {error && <StatusPanel tone="error" title="No se pudo generar el reporte" message={error} />}
      {loading ? <div className="content-loading"><Spinner label="Calculando estadísticas" /></div> : (
        <div className="stats-grid">
          <section className="data-panel">
            <div className="panel-heading"><div><span className="eyebrow">Participación</span><h2>Partidos por jugador</h2></div></div>
            {report.length ? <div className="stats-table">{report.map((player, index) => <div key={player.nombre}><span>{String(index + 1).padStart(2, "0")}</span><strong>{player.nombre}</strong><b>{player.partidosJugados} PJ</b></div>)}</div> : <StatusPanel title="Sin actividad en el periodo" message="No hay MatchDays registrados para el mes elegido." />}
          </section>
          <section className="data-panel absent-panel">
            <div className="panel-heading"><div><span className="eyebrow">Disponibilidad</span><h2>Sin participación</h2></div><strong className="large-stat">{absent.length}</strong></div>
            {absent.length ? <ul>{absent.map((name) => <li key={name}>{name}</li>)}</ul> : <StatusPanel tone="success" title="Plantilla activa" message="No hay jugadores ausentes en el periodo consultado." />}
          </section>
        </div>
      )}
    </div>
  );
}
