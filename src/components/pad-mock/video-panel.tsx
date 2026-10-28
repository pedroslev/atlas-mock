"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GripHorizontal, Maximize2, PictureInPicture2, ScreenShare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type CapturaVideo = { n: number; hora: string };

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

// En el mock no hay cámara: el "video" del cliente es un fondo con sus
// iniciales. Lo comparten la solapa, la ventana flotante y las capturas.
function ImagenCliente({ nombre, chica = false }: { nombre: string; chica?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900">
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-white/15 font-heading font-semibold text-white",
          chica ? "size-8 text-xs" : "size-28 text-4xl"
        )}
      >
        {iniciales(nombre)}
      </span>
    </div>
  );
}

// Solapa "Video" de una videollamada: el video del cliente grande, la cámara
// del asesor chica abajo a la derecha (o su pantalla, si la está
// compartiendo), y las capturas que sacó. Los controles (compartir,
// captura, Picture-in-Picture) están en la barra de abajo, con los de la
// llamada. Mientras el video está en el Picture-in-Picture, la solapa lo
// indica en su lugar.
export function VideoPanel({
  nombre,
  compartiendo,
  onDejarDeCompartir,
  pip,
  onCerrarPip,
  capturas,
  flash,
}: {
  nombre: string;
  compartiendo: boolean;
  onDejarDeCompartir: () => void;
  pip: boolean;
  onCerrarPip: () => void;
  capturas: CapturaVideo[];
  /** Destello de la captura recién sacada. */
  flash: boolean;
}) {
  const t = useT();
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
      {compartiendo && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm">
          <span className="flex items-center gap-2">
            <ScreenShare className="size-4 text-warning" />
            {t("padMock.video.compartiendo")}
          </span>
          <Button size="sm" variant="outline" onClick={onDejarDeCompartir}>
            {t("padMock.video.dejarDeCompartir")}
          </Button>
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-slate-900">
        {pip ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-300">
            <PictureInPicture2 className="size-8" />
            {t("padMock.video.enPip")}
            <Button size="sm" variant="secondary" onClick={onCerrarPip}>
              {t("padMock.video.volverAca")}
            </Button>
          </div>
        ) : (
          <>
            <ImagenCliente nombre={nombre} />
            <span className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white">
              {nombre}
            </span>
            {/* Cámara del asesor (o su pantalla compartida). */}
            <div className="absolute right-3 bottom-3 flex aspect-video w-40 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-slate-700 text-white/80">
              {compartiendo ? <ScreenShare className="size-6" /> : <User className="size-6" />}
              <span className="absolute bottom-1 left-1.5 text-[0.65rem]">{t("padMock.video.tuCamara")}</span>
            </div>
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 bg-white transition-opacity duration-300",
                flash ? "opacity-70" : "opacity-0"
              )}
            />
          </>
        )}
      </div>

      {capturas.length > 0 && (
        <div className="flex shrink-0 flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {t("padMock.video.capturas")} ({capturas.length}) · {t("padMock.video.capturaGuardada")}
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {capturas.map((c) => (
              <div key={c.n} className="flex shrink-0 flex-col gap-1">
                <div className="relative aspect-video w-28 overflow-hidden rounded-md border border-border">
                  <ImagenCliente nombre={nombre} chica />
                </div>
                <span className="text-[0.65rem] text-muted-foreground">
                  {t("padMock.video.capturaDe", { n: c.n, hora: c.hora })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Ventanita del video dentro del pad: aparece sola mientras hay una
// videollamada en curso y el asesor no está mirando la solapa Video (está en
// la solapa Chat, en una página externa, en Inicio o en un acceso rápido).
// Se arrastra desde la barra de arriba y "Volver al video" lo lleva a la
// solapa. Fuera del pad (otra pestaña u otro programa) lo cubre el
// Picture-in-Picture del navegador (usePipNavegador).
export function VentanitaVideo({ nombre, onVolver }: { nombre: string; onVolver: () => void }) {
  const t = useT();
  // Distancia al borde inferior derecho de la pantalla: arranca por encima
  // del redactor del chat y de la barra de controles.
  const [pos, setPos] = useState({ right: 24, bottom: 220 });
  const arrastre = useRef<{ x: number; y: number; right: number; bottom: number } | null>(null);

  return (
    <div
      role="dialog"
      aria-label={t("padMock.video.ventanita")}
      style={{ right: pos.right, bottom: pos.bottom }}
      className="fixed z-50 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
    >
      <div
        className="flex cursor-grab touch-none items-center gap-1.5 px-2 py-1 text-xs active:cursor-grabbing"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          arrastre.current = { x: e.clientX, y: e.clientY, ...pos };
        }}
        onPointerMove={(e) => {
          const a = arrastre.current;
          if (!a) return;
          setPos({
            right: Math.max(0, a.right - (e.clientX - a.x)),
            bottom: Math.max(0, a.bottom - (e.clientY - a.y)),
          });
        }}
        onPointerUp={() => {
          arrastre.current = null;
        }}
      >
        <GripHorizontal className="size-3.5 text-muted-foreground" />
        <span className="flex-1 truncate font-medium">{nombre}</span>
      </div>
      <button
        type="button"
        onClick={onVolver}
        className="group relative block aspect-video w-full"
        aria-label={t("padMock.video.volverAlVideo")}
      >
        <ImagenCliente nombre={nombre} chica />
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/55 py-1.5 text-xs font-medium text-white group-hover:bg-black/70">
          <Maximize2 className="size-3.5" />
          {t("padMock.video.volverAlVideo")}
        </span>
      </button>
    </div>
  );
}

// Picture-in-Picture del navegador: el video del cliente en una ventana del
// sistema que queda encima de todo, también fuera del navegador — para que
// el asesor siga viendo al cliente mientras busca información en otro lado.
// - El botón de la barra la abre y la cierra.
// - Al salir de la pestaña se abre sola donde el navegador lo permite (Chrome
//   lo hace en videollamadas con cámara o micrófono en uso; en el mock, que
//   no usa la cámara, puede no pasar).
// - "Volver a la pestaña" de la ventana trae al asesor a la solapa Video;
//   cerrarla con la X no lo mueve de donde está.
// En el mock no hay cámara: el video es un dibujo con las iniciales.
export function usePipNavegador(nombre: string | null, onVolver: () => void) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onVolverRef = useRef(onVolver);
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    onVolverRef.current = onVolver;
  }, [onVolver]);

  useEffect(() => {
    if (!nombre || !document.pictureInPictureEnabled) return;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    function dibujar() {
      if (!ctx || !nombre) return;
      const g = ctx.createLinearGradient(0, 0, 640, 360);
      g.addColorStop(0, "#475569");
      g.addColorStop(1, "#0f172a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.arc(320, 170, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "600 56px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(iniciales(nombre), 320, 172);
      ctx.font = "500 22px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(nombre, 20, 336);
    }
    dibujar();
    // El stream necesita cuadros nuevos para seguir "en vivo".
    const intervalo = window.setInterval(dibujar, 500);

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = canvas.captureStream(10);
    video.style.cssText = "position:fixed;left:0;bottom:0;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(video);
    video.play().catch(() => {});
    videoRef.current = video;

    const onEnter = () => setActivo(true);
    const onLeave = () => {
      setActivo(false);
      // Con la X el navegador pausa el video; con "Volver a la pestaña", no.
      if (video.paused) video.play().catch(() => {});
      else onVolverRef.current();
    };
    video.addEventListener("enterpictureinpicture", onEnter);
    video.addEventListener("leavepictureinpicture", onLeave);

    const accion = "enterpictureinpicture" as MediaSessionAction;
    try {
      navigator.mediaSession.setActionHandler(accion, () => {
        video.requestPictureInPicture().catch(() => {});
      });
    } catch {
      // El navegador no abre el Picture-in-Picture solo.
    }

    return () => {
      window.clearInterval(intervalo);
      video.removeEventListener("enterpictureinpicture", onEnter);
      video.removeEventListener("leavepictureinpicture", onLeave);
      if (document.pictureInPictureElement === video) document.exitPictureInPicture().catch(() => {});
      try {
        navigator.mediaSession.setActionHandler(accion, null);
      } catch {}
      video.remove();
      videoRef.current = null;
      setActivo(false);
    };
  }, [nombre]);

  const alternar = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement === video) document.exitPictureInPicture().catch(() => {});
    else video.requestPictureInPicture().catch(() => {});
  }, []);

  return { activo, alternar };
}
