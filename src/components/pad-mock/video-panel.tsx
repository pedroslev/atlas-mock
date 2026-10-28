"use client";

import { useRef, useState } from "react";
import { GripHorizontal, PictureInPicture2, ScreenShare, User, X } from "lucide-react";
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
// captura, ventana flotante) están en la barra de abajo, con los de la
// llamada.
export function VideoPanel({
  nombre,
  compartiendo,
  onDejarDeCompartir,
  ventanaFlotante,
  onCerrarVentanaFlotante,
  capturas,
  flash,
}: {
  nombre: string;
  compartiendo: boolean;
  onDejarDeCompartir: () => void;
  ventanaFlotante: boolean;
  onCerrarVentanaFlotante: () => void;
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
        {ventanaFlotante ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-300">
            <PictureInPicture2 className="size-8" />
            {t("padMock.video.enVentanaFlotante")}
            <Button size="sm" variant="secondary" onClick={onCerrarVentanaFlotante}>
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

// Ventana flotante (picture-in-picture): el video del cliente en chico,
// encima de todo, para seguir viéndolo desde la solapa del chat o una página
// externa. Se arrastra desde la barra de arriba. En el producto
// real puede salir del navegador y quedar encima de otras aplicaciones.
export function VentanaFlotanteVideo({ nombre, onCerrar }: { nombre: string; onCerrar: () => void }) {
  const t = useT();
  // Distancia al borde inferior derecho de la pantalla: arranca por encima
  // del redactor del chat y de la barra de controles.
  const [pos, setPos] = useState({ right: 24, bottom: 220 });
  const arrastre = useRef<{ x: number; y: number; right: number; bottom: number } | null>(null);

  return (
    <div
      role="dialog"
      aria-label={t("padMock.callControls.ventanaFlotante")}
      style={{ right: pos.right, bottom: pos.bottom }}
      className="fixed z-50 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
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
        <button
          type="button"
          aria-label={t("padMock.callControls.cerrarVentanaFlotante")}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onCerrar}
          className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="relative aspect-video">
        <ImagenCliente nombre={nombre} chica />
      </div>
    </div>
  );
}
