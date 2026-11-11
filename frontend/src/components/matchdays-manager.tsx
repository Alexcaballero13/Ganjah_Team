"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api-client";
import { balanceTeams, MAX_DRAFT_PLAYERS, MIN_DRAFT_PLAYERS } from "@/lib/team-balance";
import { formatDate } from "@/lib/format";
import type { Equipo, Jugador, JugadorDePartido, MatchDay } from "@/lib/types";
import { useAuth } from "@/components/auth-context";
import { Spinner, StatusPanel } from "@/components/ui";
import { TeamListImage } from "@/components/team-list-image";
import { normalizePlayerPosition, playerPositionLabels, type PlayerPosition } from "@/lib/player-position";

type RosterPositionFilter = "all" | PlayerPosition;

const rosterPositionOptions: Array<{ value: RosterPositionFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "PORTERO", label: playerPositionLabels.PORTERO },
  { value: "DEFENSA", label: playerPositionLabels.DEFENSA },
  { value: "MEDIOCAMPISTA", label: playerPositionLabels.MEDIOCAMPISTA },
  { value: "DELANTERO", label: playerPositionLabels.DELANTERO },
];

const FormationPitch = dynamic(
  () => import("@/components/formation-pitch").then((module) => module.FormationPitch),
  { loading: () => <div className="content-loading"><Spinner label="Preparando cancha" /></div> },
);

type Assignment = Record<string, Equipo | "">;

function rosterFrom(assignments: Assignment): JugadorDePartido[] {
  return Object.entries(assignments)
    .filter((entry): entry is [string, Equipo] => Boolean(entry[1]))
    .map(([nombre, equipo]) => ({ nombre, equipo }));
}

export function MatchdaysManager() {
  const { role } = useAuth();
  const canWrite = role === "ADMIN";
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [matches, setMatches] = useState<MatchDay[]>([]);
  const [assignments, setAssignments] = useState<Assignment>({});
  const [draftSelection, setDraftSelection] = useState<Record<string, boolean>>({});
  const [rosterPositionFilter, setRosterPositionFilter] = useState<RosterPositionFilter>("all");
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
  const draftedPlayers = useMemo(
    () => players.filter((player) => draftSelection[player.nombre]),
    [draftSelection, players],
  );
  const visibleRosterPlayers = useMemo(
    () => players.filter((player) => rosterPositionFilter === "all" || normalizePlayerPosition(player.posicion) === rosterPositionFilter),
    [players, rosterPositionFilter],
  );
  const localCount = selected.filter((player) => player.equipo === "LOCAL").length;
  const visitorCount = selected.filter((player) => player.equipo === "VISITANTE").length;
  const formationTeams = useMemo(() => ({
    local: players.filter((player) => assignments[player.nombre] === "LOCAL"),
    visitante: players.filter((player) => assignments[player.nombre] === "VISITANTE"),
  }), [assignments, players]);
  const setTeam = (name: string, team: Equipo | "") => {
    setAssignments((current) => ({ ...current, [name]: team }));
    if (team) setDraftSelection((current) => ({ ...current, [name]: true }));
  };

  const toggleDraft = (player: Jugador, checked: boolean) => {
    if (checked && draftedPlayers.length >= MAX_DRAFT_PLAYERS) {
      setError(`La convocatoria admite máximo ${MAX_DRAFT_PLAYERS} jugadores.`);
      return;
    }
    setError("");
    setDraftSelection((current) => ({ ...current, [player.nombre]: checked }));
    if (!checked) setAssignments((current) => ({ ...current, [player.nombre]: "" }));
  };

  const generateBalancedTeams = () => {
    setError("");
    try {
      const balanced = balanceTeams(draftedPlayers);
      setAssignments(Object.fromEntries([
        ...balanced.local.map((player) => [player.nombre, "LOCAL"] as const),
        ...balanced.visitante.map((player) => [player.nombre, "VISITANTE"] as const),
      ]));
      setNotice(`Equipos equilibrados: diferencia DEF ${balanced.diferenciaDefensa.toFixed(2)} · ATA ${balanced.diferenciaAtaque.toFixed(2)}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible generar los equipos.");
    }
  };

  const saveRoster = async (event: FormEvent) => {
    event.preventDefault();
    if (!canWrite) {
      setError("El perfil de consulta no puede registrar ni modificar MatchDays.");
      return;
    }
    if (selected.length !== draftedPlayers.length) {
      setError("Genera los equipos o asigna un lado a cada jugador convocado.");
      return;
    }
    if (selected.length < MIN_DRAFT_PLAYERS || selected.length > MAX_DRAFT_PLAYERS) {
      setError(`La convocatoria debe tener entre ${MIN_DRAFT_PLAYERS} y ${MAX_DRAFT_PLAYERS} jugadores.`);
      return;
    }
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
      setDraftSelection({});
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar la alineación.");
    } finally {
      setSaving(false);
    }
  };

  const editRoster = (match: MatchDay) => {
    if (!canWrite) return;
    setEditingRoster(match.id);
    setAssignments(Object.fromEntries(match.jugadores.map((player) => [player.nombre, player.equipo])));
    setDraftSelection(Object.fromEntries(match.jugadores.map((player) => [player.nombre, true])));
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveScore = async (match: MatchDay) => {
    if (!canWrite) return;
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
    if (!canWrite) return;
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
          <div><span className="eyebrow">{editingRoster ? "Editar encuentro" : "Draft 12–18"}</span><h2 id="roster-title">{editingRoster ? "Ajustar alineaciones" : "Generar equipos"}</h2></div>
          <div className="team-counter"><span>{draftedPlayers.length} convocados</span><span>{localCount} local</span><i>vs</i><span>{visitorCount} visitante</span></div>
        </div>
        {players.length ? (
          <form onSubmit={saveRoster}>
            <div className="roster-position-filter" aria-label="Filtrar convocatoria por posición">
              <span>Posición</span>
              <div role="group" aria-label="Posiciones de jugadores">
                {rosterPositionOptions.map((option) => (
                  <button
                    className={rosterPositionFilter === option.value ? "is-active" : ""}
                    type="button"
                    key={option.value}
                    aria-pressed={rosterPositionFilter === option.value}
                    onClick={() => setRosterPositionFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <small>{visibleRosterPlayers.length} de {players.length} jugadores visibles</small>
            </div>
            <div className="roster-list">
              {visibleRosterPlayers.map((player) => (
                <div className="roster-row" key={player.id}>
                  <div><strong>{player.nombre}</strong><span>{player.posicion}</span></div>
                  <div className="roster-controls">
                    <label className="roster-check"><input type="checkbox" checked={Boolean(draftSelection[player.nombre])} onChange={(event) => toggleDraft(player, event.target.checked)} /><span>Convocar</span></label>
                    <label><span className="sr-only">Equipo de {player.nombre}</span><select disabled={!draftSelection[player.nombre]} value={assignments[player.nombre] || ""} onChange={(event) => setTeam(player.nombre, event.target.value as Equipo | "")}><option value="">Sin asignar</option><option value="LOCAL">Local</option><option value="VISITANTE">Visitante</option></select></label>
                  </div>
                </div>
              ))}
            </div>
            <div className="form-actions">
              {editingRoster && <button className="button" type="button" onClick={() => { setEditingRoster(null); setAssignments({}); setDraftSelection({}); }}>Cancelar edición</button>}
              <button className="button" type="button" onClick={generateBalancedTeams} disabled={draftedPlayers.length < MIN_DRAFT_PLAYERS || draftedPlayers.length > MAX_DRAFT_PLAYERS}>Generar equipos equilibrados</button>
              {canWrite ? <button className="button button-primary" disabled={saving}>{saving ? "Guardando…" : editingRoster ? "Guardar alineación" : "Confirmar MatchDay"}</button> : <span className="viewer-note">Vista previa disponible · registro solo para administradores</span>}
            </div>
          </form>
        ) : loading ? <Spinner label="Cargando plantilla" /> : <StatusPanel title="Primero crea jugadores" message="Un MatchDay necesita jugadores registrados en la plantilla." />}
      </section>
      {selected.length === draftedPlayers.length && localCount > 0 && visitorCount > 0 && (
        <>
          <FormationPitch local={formationTeams.local} visitante={formationTeams.visitante} />
          <TeamListImage
            key={`${formationTeams.local.map((player) => player.id).join("-")}:${formationTeams.visitante.map((player) => player.id).join("-")}`}
            local={formationTeams.local}
            visitante={formationTeams.visitante}
          />
        </>
      )}
      {loading ? <div className="content-loading"><Spinner label="Cargando historial" /></div> : matches.length ? (
        <section className="match-list" aria-label="Historial de MatchDays">
          {matches.map((match) => {
            const local = match.jugadores.filter((player) => player.equipo === "LOCAL");
            const visitor = match.jugadores.filter((player) => player.equipo === "VISITANTE");
            const resolveConfirmedPlayer = (entry: JugadorDePartido, index: number): Jugador => players.find((player) => player.nombre === entry.nombre) || {
              id: -(match.id * 100 + index + 1),
              nombre: entry.nombre,
              posicion: "Sin posición verificada",
              nivelAtaque: 0,
              nivelDefensa: 0,
            };
            const confirmedLocal = local.map(resolveConfirmedPlayer);
            const confirmedVisitor = visitor.map((entry, index) => resolveConfirmedPlayer(entry, local.length + index));
            const matchLabel = `MatchDay #${match.legacySequence ?? match.id}`;
            return (
              <article className="match-card" key={match.id}>
                <div className="match-meta"><span className="eyebrow">MatchDay #{match.legacySequence ?? match.id}</span><time dateTime={match.fechaPartido}>{formatDate(match.fechaPartido)}</time></div>
                <div className="match-teams">
                  <div><b>Local</b><strong>{match.rosterStatus === "DESCONOCIDO" ? "—" : local.length}</strong><span>{match.rosterStatus === "DESCONOCIDO" ? "Plantilla no recuperada" : local.map((player) => player.nombre).join(" · ")}</span></div>
                  <div className="score-editor">
                    <div><input min="0" inputMode="numeric" aria-label="Goles local" type="number" disabled={match.readOnlySnapshot || !canWrite} value={scores[match.id]?.local ?? ""} onChange={(event) => setScores((current) => ({ ...current, [match.id]: { ...current[match.id], local: event.target.value } }))} /><i>:</i><input min="0" inputMode="numeric" aria-label="Goles visitante" type="number" disabled={match.readOnlySnapshot || !canWrite} value={scores[match.id]?.visitor ?? ""} onChange={(event) => setScores((current) => ({ ...current, [match.id]: { ...current[match.id], visitor: event.target.value } }))} /></div>
                    {match.readOnlySnapshot ? <span className="eyebrow">Histórico verificado</span> : canWrite ? <button className="text-button" type="button" disabled={saving} onClick={() => saveScore(match)}>Guardar marcador</button> : <span className="viewer-note">Solo lectura</span>}
                  </div>
                  <div><b>Visitante</b><strong>{match.rosterStatus === "DESCONOCIDO" ? "—" : visitor.length}</strong><span>{match.rosterStatus === "DESCONOCIDO" ? "Plantilla no recuperada" : visitor.map((player) => player.nombre).join(" · ")}</span></div>
                </div>
                {((!match.readOnlySnapshot && canWrite) || (match.rosterStatus !== "DESCONOCIDO" && match.jugadores.length > 0)) && <div className="card-actions">
                  {!match.readOnlySnapshot && canWrite && <><button className="button button-small" type="button" onClick={() => editRoster(match)}>Editar equipos</button><button className="button button-small button-danger-ghost" type="button" onClick={() => remove(match)}>Eliminar</button></>}
                  {match.rosterStatus !== "DESCONOCIDO" && match.jugadores.length > 0 && <TeamListImage local={confirmedLocal} visitante={confirmedVisitor} matchDate={match.fechaPartido} matchLabel={matchLabel} historical />}
                </div>}
              </article>
            );
          })}
        </section>
      ) : <StatusPanel title="Sin historial todavía" message="El primer MatchDay aparecerá aquí cuando confirmes sus alineaciones." />}
    </div>
  );
}
