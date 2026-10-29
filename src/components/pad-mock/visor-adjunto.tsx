"use client";

import { useState } from "react";
import { Download, FileText, ShieldAlert, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { useT } from "@/lib/i18n";
import type { AdjuntoChat } from "@/lib/pad-mock/data";

const ZOOMS = [1, 1.5, 2, 3];

export function esPdf(a: AdjuntoChat) {
  return a.nombre.toLowerCase().endsWith(".pdf");
}

// Visor de un adjunto del chat, dentro de Hermes (sin abrir otra pestaña):
// el asesor lo mira sin perder el chat ni la llamada en curso.
// - Imagen: grande, con zoom.
// - PDF: en el visor.
// - El resto (Word, Excel…): el navegador no lo puede mostrar; solo nombre,
//   tamaño y Descargar.
// Solo muestra, nunca ejecuta. Descargar un archivo que mandó el cliente pide
// confirmación (Enter confirma). Cómo se valida y protege el archivo antes de
// llegar acá (tipo real, antivirus, enlaces que vencen, poder bloquear la
// descarga por campaña) queda por definir con el Architect.
export function VisorAdjunto({
  adjunto: abierto,
  deCliente: deClienteAbierto,
  onClose,
}: {
  adjunto: AdjuntoChat | null;
  deCliente: boolean;
  onClose: () => void;
}) {
  const t = useT();
  // Mientras se cierra (animación), sigue mostrando el último archivo.
  const [ultimo, setUltimo] = useState({ adjunto: abierto, deCliente: deClienteAbierto });
  if (abierto && (abierto !== ultimo.adjunto || deClienteAbierto !== ultimo.deCliente)) {
    setUltimo({ adjunto: abierto, deCliente: deClienteAbierto });
  }
  const { adjunto, deCliente } = abierto ? { adjunto: abierto, deCliente: deClienteAbierto } : ultimo;
  const [zoom, setZoom] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [simulada, setSimulada] = useState(false);

  function cerrar() {
    setZoom(0);
    setConfirmando(false);
    setSimulada(false);
    onClose();
  }

  function descargar() {
    if (!adjunto) return;
    setConfirmando(false);
    if (!adjunto.url) {
      // En el mock no hay archivo detrás.
      setSimulada(true);
      return;
    }
    const a = document.createElement("a");
    a.href = adjunto.url;
    a.download = adjunto.nombre;
    a.click();
  }

  const imagen = !!adjunto?.esImagen && !!adjunto.url;
  const pdf = !!adjunto && esPdf(adjunto) && !!adjunto.url;

  return (
    <Dialog open={abierto !== null} onOpenChange={(o) => !o && cerrar()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-3 sm:max-w-4xl">
        <DialogHeader className="pr-8">
          <DialogTitle className="truncate text-base">{adjunto?.nombre}</DialogTitle>
          <DialogDescription>
            {adjunto?.tamano} · {deCliente ? t("padMock.visor.delCliente") : t("padMock.visor.tuyo")}
          </DialogDescription>
        </DialogHeader>

        <div className="relative min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-muted/40">
          {imagen ? (
            <div className="flex min-h-[50vh] items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={adjunto.url}
                alt={adjunto.nombre}
                style={{ width: zoom === 0 ? undefined : `${ZOOMS[zoom] * 100}%` }}
                className={zoom === 0 ? "max-h-[65vh] max-w-full object-contain" : "max-w-none"}
              />
            </div>
          ) : pdf ? (
            <iframe src={adjunto.url} title={adjunto.nombre} className="h-[65vh] w-full" />
          ) : (
            <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
              <FileText className="size-10" />
              {t("padMock.visor.noSePuedeVer")}
            </div>
          )}
        </div>

        {confirmando && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
            <ShieldAlert className="size-4 shrink-0 text-warning" />
            <span className="flex-1">{t("padMock.visor.avisoDescarga")}</span>
            <Button size="sm" variant="outline" onClick={() => setConfirmando(false)}>
              {t("padMock.visor.cancelar")}
            </Button>
            {/* Con el foco acá al aparecer, Enter confirma. */}
            <Button size="sm" autoFocus onClick={descargar} className="gap-1.5">
              {t("padMock.visor.descargarIgual")}
              <Kbd className="bg-primary-foreground/15 text-primary-foreground">Enter</Kbd>
            </Button>
          </div>
        )}
        {simulada && <p className="text-xs text-muted-foreground">{t("padMock.visor.descargaSimulada")}</p>}

        <div className="flex items-center justify-end gap-2">
          {imagen && (
            <>
              <Button
                size="icon-sm"
                variant="outline"
                disabled={zoom === 0}
                aria-label={t("padMock.visor.alejar")}
                title={t("padMock.visor.alejar")}
                onClick={() => setZoom((z) => Math.max(0, z - 1))}
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="w-12 text-center text-xs text-muted-foreground tabular-nums">
                {zoom === 0 ? t("padMock.visor.ajustado") : `${ZOOMS[zoom] * 100}%`}
              </span>
              <Button
                size="icon-sm"
                variant="outline"
                disabled={zoom === ZOOMS.length - 1}
                aria-label={t("padMock.visor.acercar")}
                title={t("padMock.visor.acercar")}
                onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))}
              >
                <ZoomIn className="size-4" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => (deCliente ? setConfirmando(true) : descargar())}
          >
            <Download className="size-4" />
            {t("padMock.visor.descargar")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
