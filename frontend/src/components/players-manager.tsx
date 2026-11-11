"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/components/auth-context";
import type { Jugador, JugadorInput } from "@/lib/types";
import { Icon } from "@/components/icons";
import { PlayerCard } from "@/components/player-card";
import { Spinner, StatusPanel } from "@/components/ui";
import { filterPlayers, type PerformanceFilter, type PositionFilter } from "@/lib/player-filters";

const emptyForm: JugadorInput = {
  nombre: "",
  posicion: "",
  nivelAtaque: 3,
  nivelDefensa: 3,
};

export function PlayersManager() {
  const { role } = useAuth();
  const canWrite = role === "ADMIN";
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [form, setForm] = useState<JugadorInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>("all");
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const editTriggerRef = useRef<HTMLButtonElement | null>(null);

  const filteredPlayers = useMemo(
    () => filterPlayers(players, performanceFilter, positionFilter),
    [performanceFilter, players, positionFilter],
  );
  const filtersActive = performanceFilter !== "all" || positionFilter !== "all";

  const load = useCallback(async () => {
    try {
      setPlayers(await api.jugadores.list());
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudieron cargar los jugadores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // La carga inicial sincroniza el componente con la API externa.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const closeForm = useCallback(() => {
    if (saving) return;
    setFormOpen(false);
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }, [saving]);

  useEffect(() => {
    if (!formOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus({ preventScroll: true });

    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        event.preventDefault();
        closeForm();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyboard);
      editTriggerRef.current?.focus({ preventScroll: true });
    };
  }, [closeForm, formOpen, saving]);

  const openCreate = (event: MouseEvent<HTMLButtonElement>) => {
    if (!canWrite) return;
    editTriggerRef.current = event.currentTarget;
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
    setNotice("");
    setError("");
  };

  const openEdit = (player: Jugador, event: MouseEvent<HTMLButtonElement>) => {
    if (!canWrite) return;
    editTriggerRef.current = event.currentTarget;
    setEditingId(player.id);
    setForm({
      nombre: player.nombre,
      posicion: player.posicion,
      nivelAtaque: player.nivelAtaque,
      nivelDefensa: player.nivelDefensa,
    });
    setFormOpen(true);
    setNotice("");
    setError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canWrite) {
      setError("El perfil de consulta no puede modificar jugadores.");
      return;
    }
    if (!form.nombre.trim() || !form.posicion.trim()) {
      setError("Nombre y posición son obligatorios.");
      return;
    }
    if (![form.nivelAtaque, form.nivelDefensa].every((value) => Number.isInteger(value) && value >= 1 && value <= 5)) {
      setError("Ataque y defensa deben estar entre 1 y 5 estrellas.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId !== null) {
        await api.jugadores.update(editingId, form);
        setNotice("Jugador actualizado.");
      } else {
        await api.jugadores.create(form);
        setNotice("Jugador creado.");
      }
      setFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar el jugador.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (player: Jugador) => {
    if (!canWrite) return;
    if (!window.confirm(`¿Eliminar a ${player.nombre}? El historial de MatchDays conservará su nombre.`)) return;
    setError("");
    try {
      await api.jugadores.remove(player.id);
      setNotice("Jugador eliminado.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo eliminar el jugador.");
    }
  };

  return (
    <div className="manager-stack">
      <div className="toolbar">
        <div><strong>{players.length}</strong><span> jugadores en la plantilla</span></div>
        {canWrite ? <button className="button button-primary" type="button" onClick={openCreate}><Icon name="plus" />Nuevo jugador</button> : <span className="viewer-note">Perfil de consulta · solo lectura</span>}
      </div>
      {notice && <StatusPanel tone="success" title="Listo" message={notice} />}
      {error && !formOpen && <StatusPanel tone="error" title="No pudimos completar la operación" message={error} />}

      <section className="player-filters" aria-labelledby="player-filters-title">
        <div className="filter-copy"><span className="eyebrow">Explorar plantilla</span><h2 id="player-filters-title">Filtrar jugadores</h2><p aria-live="polite">{filteredPlayers.length} de {players.length} resultados</p></div>
        <div className="filter-controls">
          <label><span>Rendimiento</span><select value={performanceFilter} onChange={(event) => setPerformanceFilter(event.target.value as PerformanceFilter)}><option value="all">Todos</option><option value="gold">Superior · dorado</option><option value="silver">Regular · plateado</option><option value="bronze">Bajo rendimiento · bronce</option></select></label>
          <label><span>Posición</span><select value={positionFilter} onChange={(event) => setPositionFilter(event.target.value as PositionFilter)}><option value="all">Todas las posiciones</option><option value="DELANTERO">Delantero</option><option value="MEDIOCAMPISTA">Mediocampista</option><option value="DEFENSA">Defensa</option><option value="PORTERO">Portero</option></select></label>
          <button className="button" type="button" disabled={!filtersActive} onClick={() => { setPerformanceFilter("all"); setPositionFilter("all"); }}>Limpiar filtros</button>
        </div>
      </section>

      {formOpen && (
        <div className="player-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <div className="player-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="player-form-title">
            <div className="panel-heading"><div><span className="eyebrow">Plantilla</span><h2 id="player-form-title">{editingId !== null ? "Editar jugador" : "Nuevo jugador"}</h2></div><button className="icon-button" type="button" aria-label="Cerrar formulario" disabled={saving} onClick={closeForm}><Icon name="x" /></button></div>
            {error && <StatusPanel tone="error" title="No se guardaron los cambios" message={error} />}
            <form className="form-grid" onSubmit={submit}>
              <label className="field field-span-2"><span>Nombre</span><input ref={firstFieldRef} value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} maxLength={80} required /></label>
              <label className="field field-span-2"><span>Posición</span><input list="player-positions" value={form.posicion} onChange={(event) => setForm({ ...form, posicion: event.target.value })} maxLength={40} required placeholder="Ej. Mediocampista" /><datalist id="player-positions"><option value="Portero" /><option value="Defensa" /><option value="Mediocampista" /><option value="Delantero" /></datalist></label>
              <label className="field"><span>Nivel de ataque</span><select value={form.nivelAtaque} onChange={(event) => setForm({ ...form, nivelAtaque: Number(event.target.value) })}>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} estrella{value === 1 ? "" : "s"}</option>)}</select></label>
              <label className="field"><span>Nivel de defensa</span><select value={form.nivelDefensa} onChange={(event) => setForm({ ...form, nivelDefensa: Number(event.target.value) })}>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} estrella{value === 1 ? "" : "s"}</option>)}</select></label>
              <div className="form-actions field-span-2"><button className="button" type="button" disabled={saving} onClick={closeForm}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? "Guardando…" : editingId !== null ? "Guardar cambios" : "Crear jugador"}</button></div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="content-loading"><Spinner label="Cargando jugadores" /></div> : players.length ? (
        filteredPlayers.length ? <section className="players-grid" aria-label="Jugadores registrados">
          {filteredPlayers.map((player) => <div className={editingId === player.id ? "player-card-slot player-card-slot-editing" : "player-card-slot"} key={player.id}><PlayerCard player={player} actions={canWrite ? <><button className="button button-small" type="button" onClick={(event) => openEdit(player, event)}>Editar</button><button className="button button-small button-danger-ghost" type="button" onClick={() => remove(player)}>Eliminar</button></> : undefined} /></div>)}
        </section> : <StatusPanel title="Sin coincidencias" message="No hay jugadores que cumplan ambos filtros." action={<button className="button" type="button" onClick={() => { setPerformanceFilter("all"); setPositionFilter("all"); }}>Limpiar filtros</button>} />
      ) : <StatusPanel title="La plantilla está vacía" message={canWrite ? "Crea el primer jugador para preparar un MatchDay." : "No hay jugadores disponibles para consultar."} action={canWrite ? <button className="button button-primary" onClick={openCreate}>Crear jugador</button> : undefined} />}
    </div>
  );
}

