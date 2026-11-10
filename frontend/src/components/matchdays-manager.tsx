"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Equipo, Jugador, JugadorDePartido, MatchDay } from "@/lib/types";
import { Spinner, StatusPanel } from "@/components/ui";

type Assignment = Record<string, Equipo | "">;

function rosterFrom(assignments: Assignment): JugadorDePartido[] {
  return Object.entries(assignments)
    .filter((entry): entry is [string, Equipo] => Boolean(entry[1]))
    .map(([nombre, equipo]) => ({ nombre, equipo }));
}

export function MatchdaysManager() {
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [matches, setMatches] = useState<MatchDay[]>([]);
  const [assignments, setAssignments] = useState<Assignment>({});
  const [editingRoster, setEditingRoster] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<number, { local: string; visitor: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const [playerData, matchData] = await Promise.all([api.jugadores.list(), api.matchdays.list()]);
      setPlayers(playerData);
      setMatches(matchData.sort((a, b) => b.fechaPartido.localeCompare(a.fechaPartido)));
      setScores(Object.fromEntries(matchData.map((match) => [match.id, {
        local: match.golesLocal?.toString() ?? "",
        visitor: match.golesVisitante?.toString() ?? "",
      }])));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar los MatchDays.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // La carga inicial sincroniza el componente con la API externa.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const selected = useMemo(() => rosterFrom(assignments), [assignments]);
  const localCount = selected.filter((player) => player.equipo === "LOCAL").length;
  const visitorCount = selected.filter((player) => player.equipo === "VISITANTE").length;
  const setTeam = (name: string, team: Equipo | "") => setAssignments((current) => ({ ...current, [name]: team }));

  const saveRoster = async (event: FormEvent) => {
    event.preventDefault();
    if (!localCount || !visitorCount) {
      setError("Asigna al menos un jugador a cada equipo.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingRoster) {
        await api.matchdays.updateRoster(editingRoster, selected);
        setNotice("Alineación actualizada.");
      } else {
        await api.matchdays.create(selected);
        setNotice("MatchDay creado.");
      }
      setEditingRoster(null);
      setAssignments({});
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar la alineación.");
    } finally {
      setSaving(false);
    }
  };

  const editRoster = (match: MatchDay) => {
    setEditingRoster(match.id);
    setAssignments(Object.fromEntries(match.jugadores.map((player) => [player.nombre, player.equipo])));
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveScore = async (match: MatchDay) => {
    const score = scores[match.id];
    if (!score || score.local === "" || score.visitor === "") {
      setError("Completa ambos goles antes de guardar.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.matchdays.updateScore(match.id, Number(score.local), Number(score.visitor));
      setNotice("Marcador guardado.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar el marcador.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (match: MatchDay) => {
    if (!window.confirm(`¿Eliminar el MatchDay del ${formatDate(match.fechaPartido)}?`)) return;
    try {
      await api.matchdays.remove(match.id);
      setNotice("MatchDay eliminado.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo eliminar el MatchDay.");
    }
  };

  return (
    <div className="manager-stack">
      {notice && <StatusPanel tone="success" title="Listo" message={notice} />}
      {error && <StatusPanel tone="error" title="No pudimos completar la operación" message={error} />}
      <section className="form-panel roster-builder" aria-labelledby="roster-title">
        <div className="panel-heading">
          <div><span className="eyebrow">{editingRoster ? "Editar encuentro" : "Próximo encuentro"}</span><h2 id="roster-title">{editingRoster ? "Ajustar alineaciones" : "Crear MatchDay"}</h2></div>
          <div className="team-counter"><span>{localCount} local</span><i>vs</i><span>{visitorCount} visitante</span></div>
        </div>
        {players.length ? (
          <form onSubmit={saveRoster}>
            <div className="roster-list">
              {players.map((player) => (
                <div className="roster-row" key={player.id}>
                  <div><strong>{player.nombre}</strong><span>{player.posicion}</span></div>
                  <label><span className="sr-only">Equipo de {player.nombre}</span><select value={assignments[player.nombre] || ""} onChange={(event) => setTeam(player.nombre, event.target.value as Equipo | "")}><option value="">No convocado</option><option value="LOCAL">Local</option><option value="VISITANTE">Visitante</option></select></label>
                </div>
              ))}
            </div>
            <div className="form-actions">
              {editingRoster && <button className="button" type="button" onClick={() => { setEditingRoster(null); setAssignments({}); }}>Cancelar edición</button>}
              <button className="button button-primary" disabled={saving}>{saving ? "Guardando…" : editingRoster ? "Guardar alineación" : "Confirmar MatchDay"}</button>
            </div>
          </form>
        ) : loading ? <Spinner label="Cargando plantilla" /> : <StatusPanel title="Primero crea jugadores" message="Un MatchDay necesita jugadores registrados en la plantilla." />}
      </section>
      {loading ? <div className="content-loading"><Spinner label="Cargando historial" /></div> : matches.length ? (
        <section className="match-list" aria-label="Historial de MatchDays">
          {matches.map((match) => {
            const local = match.jugadores.filter((player) => player.equipo === "LOCAL");
            const visitor = match.jugadores.filter((player) => player.equipo === "VISITANTE");
            return (
              <article className="match-card" key={match.id}>
                <div className="match-meta"><span className="eyebrow">MatchDay #{match.legacySequence ?? match.id}</span><time dateTime={match.fechaPartido}>{formatDate(match.fechaPartido)}</time></div>
                <div className="match-teams">
                  <div><b>Local</b><strong>{match.rosterStatus === "DESCONOCIDO" ? "—" : local.length}</strong><span>{match.rosterStatus === "DESCONOCIDO" ? "Plantilla no recuperada" : local.map((player) => player.nombre).join(" · ")}</span></div>
                  <div className="score-editor">
                    <div><input min="0" inputMode="numeric" aria-label="Goles local" type="number" disabled={match.readOnlySnapshot} value={scores[match.id]?.local ?? ""} onChange={(event) => setScores((current) => ({ ...current, [match.id]: { ...current[match.id], local: event.target.value } }))} /><i>:</i><input min="0" inputMode="numeric" aria-label="Goles visitante" type="number" disabled={match.readOnlySnapshot} value={scores[match.id]?.visitor ?? ""} onChange={(event) => setScores((current) => ({ ...current, [match.id]: { ...current[match.id], visitor: event.target.value } }))} /></div>
                    {match.readOnlySnapshot ? <span className="eyebrow">Histórico verificado</span> : <button className="text-button" type="button" disabled={saving} onClick={() => saveScore(match)}>Guardar marcador</button>}
                  </div>
                  <div><b>Visitante</b><strong>{match.rosterStatus === "DESCONOCIDO" ? "—" : visitor.length}</strong><span>{match.rosterStatus === "DESCONOCIDO" ? "Plantilla no recuperada" : visitor.map((player) => player.nombre).join(" · ")}</span></div>
                </div>
                {!match.readOnlySnapshot && <div className="card-actions"><button className="button button-small" type="button" onClick={() => editRoster(match)}>Editar equipos</button><button className="button button-small button-danger-ghost" type="button" onClick={() => remove(match)}>Eliminar</button></div>}
              </article>
            );
          })}
        </section>
      ) : <StatusPanel title="Sin historial todavía" message="El primer MatchDay aparecerá aquí cuando confirmes sus alineaciones." />}
    </div>
  );
}
