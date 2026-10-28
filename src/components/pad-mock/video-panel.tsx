"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GripHorizontal, Maximize2, PictureInPicture2, Pin, ScreenShare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { IndicadorHabla } from "@/components/pad-mock/vumetro";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

// En el mock no hay cámara: el "video" del cliente es un fondo con sus
// iniciales. Lo comparten la solapa y la ventana flotante.
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

// Pantalla que comparte el cliente. En el mock no hay stream: es el dibujo
// de una página web (la tienda donde el cliente está comprando).
export function PantallaCliente({ chica = false }: { chica?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-slate-100 text-slate-500">
      <div className={cn("flex shrink-0 items-center gap-1 bg-slate-300", chica ? "h-2.5 px-1" : "h-7 px-3")}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn("rounded-full bg-slate-400", chica ? "size-1" : "size-2.5")} />
        ))}
        {!chica && (
          <span className="ml-3 flex-1 truncate rounded bg-white/70 px-2 text-[0.7rem] text-slate-500">
            tienda.example.com/carrito
          </span>
        )}
      </div>
      <div className={cn("flex min-h-0 flex-1", chica ? "gap-1 p-1" : "gap-4 p-5")}>
        <div className="flex flex-1 flex-col gap-[6%]">
          <div className="h-[10%] w-1/2 rounded bg-slate-300" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex h-[18%] items-center gap-[4%] rounded bg-white px-[3%]">
              <div className="aspect-square h-3/4 rounded bg-slate-200" />
              <div className="h-1/5 flex-1 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="flex w-1/3 flex-col gap-[6%] rounded bg-white p-[3%]">
          <div className="h-[8%] w-3/4 rounded bg-slate-200" />
          <div className="h-[8%] w-1/2 rounded bg-slate-200" />
          <div className="mt-auto h-[14%] rounded bg-sky-500/70" />
        </div>
      </div>
    </div>
  );
}

/** Lo que puede ir en el recuadro grande de la videollamada. */
export type FuenteVideo = "cliente" | "pantalla" | "asesor";

function ContenidoFuente({
  fuente,
  nombre,
  compartiendo,
  chica,
}: {
  fuente: FuenteVideo;
  nombre: string;
  compartiendo: boolean;
  chica: boolean;
}) {
  if (fuente === "cliente") return <ImagenCliente nombre={nombre} chica={chica} />;
  if (fuente === "pantalla") return <PantallaCliente chica={chica} />;
  // Cámara del asesor (o su pantalla, si la está compartiendo).
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-700 text-white/80">
      {compartiendo ? (
        <ScreenShare className={chica ? "size-6" : "size-12"} />
      ) : (
        <User className={chica ? "size-6" : "size-12"} />
      )}
    </div>
  );
}

// Solapa "Video" de una videollamada: un recuadro grande y, apilados arriba
// a la derecha, los recuadros chicos del resto — la cámara del asesor (o su pantalla, si
// la está compartiendo) y, cuando el cliente comparte la suya, su cámara o
// su pantalla. Cada recuadro chico tiene un pin para fijarlo en el grande
// (el asesor elige qué ver grande: la cámara del cliente, su pantalla si la
// comparte, o la propia). La captura de imagen
// destella acá y queda adjunta en el chat (CenterColumn). Los controles
// (compartir, captura, Picture-in-Picture) están en la barra de abajo, con
// los de la llamada. La ventanita y el Picture-in-Picture muestran lo
// fijado en grande; mientras está en el Picture-in-Picture, el recuadro
// grande lo indica en su lugar y los chicos siguen igual.
export function VideoPanel({
  nombre,
  compartiendo,
  onDejarDeCompartir,
  clienteComparte,
  fijado,
  onFijar,
  pip,
  onCerrarPip,
  flash,
  habla,
  asesorSilenciado,
}: {
  nombre: string;
  compartiendo: boolean;
  onDejarDeCompartir: () => void;
  clienteComparte: boolean;
  /** Lo que se ve en el recuadro grande. */
  fijado: FuenteVideo;
  onFijar: (f: FuenteVideo) => void;
  pip: boolean;
  onCerrarPip: () => void;
  /** Destello de la captura recién sacada. */
  flash: boolean;
  /** Nivel de voz de cada lado (0 = callado) y si el asesor está silenciado. */
  habla: { cliente: number; asesor: number };
  asesorSilenciado: boolean;
}) {
  const t = useT();
  // Quién habla: recuadro con borde verde y, en su etiqueta, el micrófono con
  // el nivel de voz (la pantalla compartida no habla).
  const nivel = (f: FuenteVideo) => (f === "cliente" ? habla.cliente : f === "asesor" ? habla.asesor : 0);
  const indicador = (f: FuenteVideo) =>
    f === "pantalla" ? null : (
      <IndicadorHabla nivel={nivel(f)} silenciado={f === "asesor" && asesorSilenciado} claro />
    );
  const fuentes: FuenteVideo[] = clienteComparte ? ["pantalla", "cliente", "asesor"] : ["cliente", "asesor"];
  const etiqueta = (f: FuenteVideo) =>
    f === "cliente"
      ? nombre
      : f === "pantalla"
        ? t("padMock.video.pantallaDe", { nombre })
        : t("padMock.video.tuCamara");
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

      <div
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden rounded-xl bg-slate-900 ring-inset transition-shadow",
          !pip && nivel(fijado) > 0 && "ring-3 ring-success"
        )}
      >
        {/* Con el Picture-in-Picture abierto, solo el recuadro grande se
            reemplaza por el aviso: los chicos siguen a la vista, con su pin. */}
        {pip ? (
          <EnPip onCerrarPip={onCerrarPip} />
        ) : (
          <ContenidoFuente fuente={fijado} nombre={nombre} compartiendo={compartiendo} chica={false} />
        )}
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white">
          <Pin className="size-3" />
          {etiqueta(fijado)}
          {indicador(fijado)}
        </span>
        {/* Los recuadros chicos, apilados arriba a la derecha. */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {fuentes
            .filter((f) => f !== fijado)
            .map((f) => (
              <div
                key={f}
                className={cn(
                  "group relative aspect-video w-40 overflow-hidden rounded-lg border border-white/20 transition-shadow",
                  nivel(f) > 0 && "ring-2 ring-success"
                )}
              >
                <ContenidoFuente fuente={f} nombre={nombre} compartiendo={compartiendo} chica />
                <span className="absolute bottom-1 left-1.5 flex max-w-[85%] items-center gap-1 rounded bg-black/40 px-1 text-[0.65rem] text-white">
                  <span className="truncate">{etiqueta(f)}</span>
                  {indicador(f)}
                </span>
                <button
                  type="button"
                  onClick={() => onFijar(f)}
                  aria-label={t("padMock.video.fijar", { fuente: etiqueta(f) })}
                  title={t("padMock.video.fijar", { fuente: etiqueta(f) })}
                  className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-md bg-black/50 text-white hover:bg-black/75"
                >
                  <Pin className="size-3.5" />
                </button>
              </div>
            ))}
        </div>
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 bg-white transition-opacity duration-300",
            flash ? "opacity-70" : "opacity-0"
          )}
        />
      </div>
    </div>
  );
}

function EnPip({ onCerrarPip }: { onCerrarPip: () => void }) {
  const t = useT();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-900 text-sm text-slate-300">
      <PictureInPicture2 className="size-8" />
      {t("padMock.video.enPip")}
      <Button size="sm" variant="secondary" onClick={onCerrarPip}>
        {t("padMock.video.volverAca")}
      </Button>
    </div>
  );
}

// Solapa "Pantalla del cliente" de una webcall: aparece solo mientras el
// cliente comparte su pantalla (el resto del tiempo la webcall prioriza el
// chat, como siempre). Igual que el video de una videollamada, la pantalla
// tiene Picture-in-Picture (botón de la barra) y, fuera de esta solapa, la
// sigue la ventanita.
export function PantallaClientePanel({
  nombre,
  pip,
  onCerrarPip,
}: {
  nombre: string;
  pip: boolean;
  onCerrarPip: () => void;
}) {
  const t = useT();
  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-border">
        {pip ? (
          <EnPip onCerrarPip={onCerrarPip} />
        ) : (
          <>
            <PantallaCliente />
            <span className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white">
              {t("padMock.video.pantallaDe", { nombre })}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// Cuadros del video (640x360) dibujados en un canvas: los usan el
// Picture-in-Picture y la captura de imagen. Son los mismos dibujos que
// ImagenCliente, PantallaCliente y la cámara del asesor.
function dibujarCliente(ctx: CanvasRenderingContext2D, nombre: string) {
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

function dibujarPantalla(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, 640, 360);
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(0, 0, 640, 26);
  ctx.fillStyle = "#94a3b8";
  [14, 30, 46].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, 13, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillRect(64, 6, 560, 14);
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(20, 44, 200, 26);
  for (let i = 0; i < 3; i++) {
    const y = 90 + i * 76;
    ctx.fillStyle = "#fff";
    ctx.fillRect(20, y, 390, 60);
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(32, y + 8, 44, 44);
    ctx.fillRect(90, y + 24, 300, 12);
  }
  ctx.fillStyle = "#fff";
  ctx.fillRect(430, 44, 190, 296);
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(442, 58, 140, 18);
  ctx.fillRect(442, 86, 100, 18);
  ctx.fillStyle = "rgba(14,165,233,0.7)";
  ctx.fillRect(442, 290, 166, 38);
}

function dibujarAsesor(ctx: CanvasRenderingContext2D, etiqueta: string) {
  ctx.fillStyle = "#334155";
  ctx.fillRect(0, 0, 640, 360);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "500 22px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(etiqueta, 20, 336);
}

/** Captura del video del cliente como imagen PNG (dirección data:). */
export function capturarCliente(nombre: string): { url: string; bytes: number } {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");
  if (ctx) dibujarCliente(ctx, nombre);
  const url = canvas.toDataURL("image/png");
  return { url, bytes: Math.round(((url.length - url.indexOf(",") - 1) * 3) / 4) };
}

// Ventanita del video dentro del pad: aparece sola mientras hay una
// videollamada en curso (o una webcall con el cliente compartiendo su
// pantalla) y el asesor no está mirando su solapa (está en el chat, en una
// página externa, en Inicio o en un acceso rápido). Muestra lo mismo que esa
// solapa: lo fijado en grande en la videollamada, la pantalla del cliente en
// la webcall. Se arrastra desde la barra de arriba y el botón lleva a la
// solapa. Fuera del pad (otra pestaña u otro programa) lo cubre el
// Picture-in-Picture del navegador (usePipNavegador).
export function VentanitaVideo({
  nombre,
  fuente,
  webcall = false,
  onVolver,
}: {
  nombre: string;
  fuente: FuenteVideo;
  /** Webcall: el botón vuelve a la solapa "Pantalla del cliente". */
  webcall?: boolean;
  onVolver: () => void;
}) {
  const t = useT();
  // Distancia al borde superior derecho de la pantalla: arranca arriba a la
  // derecha, debajo del encabezado y de la fila de solapas (para no tapar
  // el botón que pliega la columna de contexto).
  const [pos, setPos] = useState({ right: 24, top: 136 });
  const arrastre = useRef<{ x: number; y: number; right: number; top: number } | null>(null);
  const volver = webcall ? t("padMock.video.volverALaPantalla") : t("padMock.video.volverAlVideo");

  return (
    <div
      role="dialog"
      aria-label={webcall ? t("padMock.video.ventanitaPantalla") : t("padMock.video.ventanita")}
      style={{ right: pos.right, top: pos.top }}
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
            top: Math.max(0, a.top + (e.clientY - a.y)),
          });
        }}
        onPointerUp={() => {
          arrastre.current = null;
        }}
      >
        <GripHorizontal className="size-3.5 text-muted-foreground" />
        <span className="flex-1 truncate font-medium">
          {fuente === "pantalla" ? t("padMock.video.pantallaDe", { nombre }) : nombre}
        </span>
      </div>
      <button
        type="button"
        onClick={onVolver}
        className="group relative block aspect-video w-full"
        aria-label={volver}
      >
        <ContenidoFuente fuente={fuente} nombre={nombre} compartiendo={false} chica />
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/55 py-1.5 text-xs font-medium text-white group-hover:bg-black/70">
          <Maximize2 className="size-3.5" />
          {volver}
        </span>
      </button>
    </div>
  );
}

// Picture-in-Picture del navegador: el video en una ventana del sistema que
// queda encima de todo, también fuera del navegador — para que el asesor
// siga viendo al cliente (o su pantalla) mientras busca información en otro
// lado. Muestra lo mismo que la ventanita: en la videollamada, lo fijado en
// grande (si el asesor cambia el pin, cambia también acá); en la webcall, la
// pantalla del cliente mientras la comparte.
// - El botón de la barra la abre y la cierra.
// - Al salir de la pestaña se abre sola donde el navegador lo permite (Chrome
//   lo hace en videollamadas con cámara o micrófono en uso; en el mock, que
//   no usa la cámara, puede no pasar).
// - "Volver a la pestaña" de la ventana trae al asesor a su solapa;
//   cerrarla con la X no lo mueve de donde está.
// En el mock no hay cámara: el video es un dibujo.
export function usePipNavegador(
  nombre: string | null,
  fuente: FuenteVideo,
  etiquetaAsesor: string,
  onVolver: () => void
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onVolverRef = useRef(onVolver);
  const fuenteRef = useRef({ fuente, etiquetaAsesor });
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    onVolverRef.current = onVolver;
    fuenteRef.current = { fuente, etiquetaAsesor };
  }, [onVolver, fuente, etiquetaAsesor]);

  useEffect(() => {
    if (!nombre || !document.pictureInPictureEnabled) return;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    function dibujar() {
      if (!ctx || !nombre) return;
      const f = fuenteRef.current;
      if (f.fuente === "pantalla") dibujarPantalla(ctx);
      else if (f.fuente === "asesor") dibujarAsesor(ctx, f.etiquetaAsesor);
      else dibujarCliente(ctx, nombre);
    }
    dibujar();
    // El stream necesita cuadros nuevos para seguir "en vivo" (y así toma
    // el cambio de pin).
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
