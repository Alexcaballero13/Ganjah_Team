"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { Jugador, JugadorInput } from "@/lib/types";
import { Icon } from "@/components/icons";
import { PlayerCard } from "@/components/player-card";
import { Spinner, StatusPanel } from "@/components/ui";

const emptyForm: JugadorInput = {
  nombre: "",
  posicion: "",
  nivelAtaque: 3,
  nivelDefensa: 3,
};

export function PlayersManager() {
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [form, setForm] = useState<JugadorInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
    setNotice("");
  };

  const openEdit = (player: Jugador) => {
    setEditingId(player.id);
    setForm({
      nombre: player.nombre,
      posicion: player.posicion,
      nivelAtaque: player.nivelAtaque,
      nivelDefensa: player.nivelDefensa,
    });
    setFormOpen(true);
    setNotice("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.nombre.trim() || !form.posicion.trim()) {
      setError("Nombre y posición son obligatorios.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.jugadores.update(editingId, form);
        setNotice("Jugador actualizado.");
      } else {
        await api.jugadores.create(form);
        setNotice("Jugador creado.");
      }
      setFormOpen(false);
      setForm(emptyForm);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar el jugador.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (player: Jugador) => {
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
        <button className="button button-primary" type="button" onClick={openCreate}><Icon name="plus" />Nuevo jugador</button>
      </div>
      {notice && <StatusPanel tone="success" title="Listo" message={notice} />}
      {error && <StatusPanel tone="error" title="No pudimos completar la operación" message={error} />}

      {formOpen && (
        <section className="form-panel" aria-labelledby="player-form-title">
          <div className="panel-heading"><div><span className="eyebrow">Plantilla</span><h2 id="player-form-title">{editingId ? "Editar jugador" : "Nuevo jugador"}</h2></div><button className="icon-button" type="button" aria-label="Cerrar formulario" onClick={() => setFormOpen(false)}><Icon name="x" /></button></div>
          <form className="form-grid" onSubmit={submit}>
            <label className="field field-span-2"><span>Nombre</span><input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} maxLength={80} required /></label>
            <label className="field field-span-2"><span>Posición</span><input value={form.posicion} onChange={(event) => setForm({ ...form, posicion: event.target.value })} maxLength={40} required placeholder="Ej. Mediocampista" /></label>
            <label className="field"><span>Nivel de ataque</span><select value={form.nivelAtaque} onChange={(event) => setForm({ ...form, nivelAtaque: Number(event.target.value) })}>{[1,2,3,4,5].map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="field"><span>Nivel de defensa</span><select value={form.nivelDefensa} onChange={(event) => setForm({ ...form, nivelDefensa: Number(event.target.value) })}>{[1,2,3,4,5].map((value) => <option key={value}>{value}</option>)}</select></label>
            <div className="form-actions field-span-2"><button className="button" type="button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? "Guardando…" : editingId ? "Guardar cambios" : "Crear jugador"}</button></div>
          </form>
        </section>
      )}

      {loading ? <div className="content-loading"><Spinner label="Cargando jugadores" /></div> : players.length ? (
        <section className="players-grid" aria-label="Jugadores registrados">
          {players.map((player) => <PlayerCard key={player.id} player={player} actions={<><button className="button button-small" type="button" onClick={() => openEdit(player)}>Editar</button><button className="button button-small button-danger-ghost" type="button" onClick={() => remove(player)}>Eliminar</button></>} />)}
        </section>
      ) : <StatusPanel title="La plantilla está vacía" message="Crea el primer jugador para preparar un MatchDay." action={<button className="button button-primary" onClick={openCreate}>Crear jugador</button>} />}
    </div>
  );
}

