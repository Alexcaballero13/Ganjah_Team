"use client";

import { useEffect, useId, useState } from "react";
import NextImage from "next/image";
import { normalizePlayerPosition, playerPositionLabels } from "@/lib/player-position";
import type { Jugador } from "@/lib/types";

const IMAGE_WIDTH = 1080;
const IMAGE_HEIGHT = 1350;

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function loadLogo(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = "/ganjah-team-logo.png";
  });
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (context.measureText(text).width <= maxWidth) return text;
  let fitted = text;
  while (fitted.length > 1 && context.measureText(`${fitted}…`).width > maxWidth) fitted = fitted.slice(0, -1);
  return `${fitted}…`;
}

function drawTeam(context: CanvasRenderingContext2D, title: string, players: Jugador[], x: number, accent: string) {
  const columnWidth = 470;
  context.fillStyle = "rgba(6,17,13,.82)";
  roundedRect(context, x, 306, columnWidth, 874, 24);
  context.fill();
  context.strokeStyle = `${accent}99`;
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = accent;
  context.font = "700 40px 'Arial Narrow', Arial, sans-serif";
  context.fillText(title, x + 28, 365);
  context.fillStyle = "#8CA398";
  context.font = "600 22px Arial, sans-serif";
  context.textAlign = "right";
  context.fillText(`${players.length} JUGADORES`, x + columnWidth - 28, 361);
  context.textAlign = "left";

  players.forEach((player, index) => {
    const rowY = 397 + index * 82;
    context.fillStyle = index % 2 === 0 ? "rgba(244,248,245,.055)" : "rgba(244,248,245,.025)";
    roundedRect(context, x + 20, rowY, columnWidth - 40, 68, 13);
    context.fill();

    context.fillStyle = accent;
    context.beginPath();
    context.arc(x + 46, rowY + 34, 8, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#C9F45B";
    context.font = "700 22px 'Courier New', monospace";
    context.fillText(String(index + 1).padStart(2, "0"), x + 66, rowY + 41);

    context.fillStyle = "#F4F8F5";
    context.font = "700 27px 'Arial Narrow', Arial, sans-serif";
    context.fillText(fitText(context, player.nombre.toUpperCase(), 320), x + 112, rowY + 32);

    const canonicalPosition = normalizePlayerPosition(player.posicion);
    const position = canonicalPosition ? playerPositionLabels[canonicalPosition] : player.posicion || "Sin posición";
    context.fillStyle = "#8CA398";
    context.font = "600 17px Arial, sans-serif";
    context.fillText(position.toUpperCase(), x + 112, rowY + 55);

  });
}

interface TeamListOptions {
  matchDate?: string;
  matchLabel?: string;
}

export async function createTeamListPng(local: Jugador[], visitante: Jugador[], options: TeamListOptions = {}): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = IMAGE_WIDTH;
  canvas.height = IMAGE_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("El navegador no permitió crear la imagen.");

  const background = context.createLinearGradient(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  background.addColorStop(0, "#06110D");
  background.addColorStop(.55, "#10251B");
  background.addColorStop(1, "#06110D");
  context.fillStyle = background;
  context.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

  context.strokeStyle = "rgba(34,227,109,.08)";
  context.lineWidth = 1;
  for (let x = -IMAGE_HEIGHT; x < IMAGE_WIDTH; x += 72) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + IMAGE_HEIGHT, IMAGE_HEIGHT);
    context.stroke();
  }

  const logo = await loadLogo();
  if (logo) context.drawImage(logo, 56, 43, 170, 170);

  context.fillStyle = "#22E36D";
  context.font = "700 25px 'Courier New', monospace";
  context.fillText("GANJAH TEAM", 252, 85);
  context.fillStyle = "#F4F8F5";
  context.font = "700 66px 'Arial Narrow', Arial, sans-serif";
  context.fillText("EQUIPOS CONVOCADOS", 250, 151);
  context.fillStyle = "#8CA398";
  context.font = "500 22px Arial, sans-serif";
  const requestedDate = options.matchDate ? new Date(options.matchDate) : new Date();
  const imageDate = Number.isNaN(requestedDate.getTime()) ? new Date() : requestedDate;
  const date = new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: "America/Bogota" }).format(imageDate);
  const metadata = [options.matchLabel, `${local.length + visitante.length} JUGADORES`, date.toUpperCase()].filter(Boolean).join(" · ");
  context.fillText(fitText(context, metadata, 760), 253, 190);

  context.fillStyle = "#22E36D";
  context.fillRect(55, 244, 970, 4);
  drawTeam(context, "LOCAL", local, 55, "#22E36D");
  drawTeam(context, "VISITANTE", visitante, 555, "#C9F45B");

  context.fillStyle = "#8CA398";
  context.font = "500 18px Arial, sans-serif";
  context.textAlign = "center";
  context.fillText("GENERADO CON GANJAH TEAM · LISTA DE CONVOCADOS", IMAGE_WIDTH / 2, 1260);
  context.fillStyle = "#22E36D";
  context.fillRect(410, 1290, 260, 3);

  return canvas.toDataURL("image/png");
}

function downloadDataUrl(dataUrl: string, matchDate?: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  const fileDate = matchDate?.slice(0, 10) || new Date().toISOString().slice(0, 10);
  anchor.download = `ganjah-team-equipos-${fileDate}.png`;
  anchor.click();
}

export function TeamListImage({ local, visitante, matchDate, matchLabel, historical = false }: {
  local: Jugador[];
  visitante: Jugador[];
  matchDate?: string;
  matchLabel?: string;
  historical?: boolean;
}) {
  const headingId = useId();
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const generate = async () => {
    setBusy(true);
    setMessage("");
    try {
      setImageUrl(await createTeamListPng(local, visitante, { matchDate, matchLabel }));
      setMessage(historical ? "Imagen preparada con los equipos confirmados." : "Imagen preparada con la convocatoria actual.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "No se pudo generar la imagen.");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!imageUrl) return;
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], "ganjah-team-equipos.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "Equipos Ganjah Team", text: "Convocatoria y equipos equilibrados", files: [file] });
      } else {
        downloadDataUrl(imageUrl, matchDate);
        setMessage("Tu navegador no admite compartir archivos; se descargó la imagen.");
      }
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setMessage("No se pudo compartir. Puedes descargar la imagen manualmente.");
    }
  };

  useEffect(() => {
    if (!dialogOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialogOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [dialogOpen]);

  const openHistoricalImage = async () => {
    setDialogOpen(true);
    if (!imageUrl) await generate();
  };

  if (historical) {
    return (
      <>
        <button className="button button-small" type="button" onClick={openHistoricalImage}>Generar lista</button>
        {dialogOpen && (
          <div className="team-list-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogOpen(false); }}>
            <section className="team-list-dialog" role="dialog" aria-modal="true" aria-labelledby={headingId}>
              <div className="panel-heading">
                <div><span className="eyebrow">Partido confirmado</span><h2 id={headingId}>{matchLabel ? `Lista del ${matchLabel}` : "Lista de equipos"}</h2></div>
                <button className="icon-button" type="button" autoFocus aria-label="Cerrar lista" onClick={() => setDialogOpen(false)}>×</button>
              </div>
              {busy && <p className="export-message" role="status">Generando imagen…</p>}
              {message && !busy && <p className="export-message" role="status">{message}</p>}
              {imageUrl && <>
                <div className="team-list-dialog-preview"><NextImage src={imageUrl} alt="Lista generada de los equipos local y visitante" width={IMAGE_WIDTH} height={IMAGE_HEIGHT} unoptimized /></div>
                <div className="share-actions dialog-share-actions">
                  <button className="button" type="button" onClick={() => downloadDataUrl(imageUrl, matchDate)}>Descargar PNG</button>
                  <button className="button button-primary" type="button" onClick={share}>Compartir imagen</button>
                </div>
              </>}
            </section>
          </div>
        )}
      </>
    );
  }

  return (
    <section className="team-list-export" aria-labelledby={headingId}>
      <div className="panel-heading">
        <div><span className="eyebrow">Lista para el grupo</span><h2 id={headingId}>Imagen de convocados</h2></div>
        <div className="share-actions">
          {!imageUrl ? <button className="button button-primary" type="button" disabled={busy} onClick={generate}>{busy ? "Generando…" : "Generar imagen"}</button> : <>
            <button className="button" type="button" onClick={() => downloadDataUrl(imageUrl, matchDate)}>Descargar PNG</button>
            <button className="button button-primary" type="button" onClick={share}>Compartir imagen</button>
          </>}
        </div>
      </div>
      <p className="field-note">Crea una lista vertical con ambos equipos, nombres y posiciones. La imagen no muestra niveles y se procesa únicamente en este dispositivo.</p>
      {message && <p className="export-message" role="status">{message}</p>}
      {imageUrl && <div className="team-list-preview"><NextImage src={imageUrl} alt="Lista generada de los equipos local y visitante" width={IMAGE_WIDTH} height={IMAGE_HEIGHT} unoptimized /></div>}
    </section>
  );
}
