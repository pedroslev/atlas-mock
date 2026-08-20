"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  User,
  History,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useT, type TranslateFn } from "@/lib/i18n";
import { CANAL_ICON, type HistorialEntrada } from "@/lib/pad-mock/data";
import { ALTO_CABECERA_COLUMNA } from "@/lib/pad-mock/layout";
import { HistorialDetailDialog } from "@/components/pad-mock/historial-detail-dialog";
import { ResizeHandle } from "@/components/pad-mock/resize-handle";

type ClienteMock = {
  numeroCliente: string;
  nombre: string;
  telefono: string;
  mail: string;
  segmento: string;
  antiguedad: string;
};

// Tipificación se mudó a la barra de controles de la interacción (siempre
// visible, junto a "Cerrar interacción") — ya no vive en este acordeón.
// Copiloto y Notas se retiraron a pedido para esta fase.
type SeccionId = "cliente" | "historial";

function secciones(t: TranslateFn): { id: SeccionId; label: string; icon: typeof User }[] {
  return [
    { id: "cliente", label: t("padMock.contextColumn.cliente"), icon: User },
    { id: "historial", label: t("padMock.contextColumn.historial"), icon: History },
  ];
}

// A pedido: siempre arranca igual — Cliente e Historial abiertas.
const SECCIONES_ABIERTAS_INIT: SeccionId[] = ["cliente", "historial"];
const HISTORIAL_VISIBLE_INICIAL = 3;
const ANCHO_MIN = 220;
const ANCHO_MAX = 420;
const ANCHO_INICIAL = 240;

// Acordeón 100% React (sin <details>/onToggle nativo — ese combo controlado
// se desincronizaba al cambiar de interacción). Un botón + render condicional,
// nada de estado del navegador que React tenga que perseguir.
function Seccion({
  label,
  icon: Icon,
  abierta,
  onToggle,
  children,
}: {
  label: string;
  icon: typeof User;
  abierta: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1">{label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform",
            abierta && "rotate-180"
          )}
        />
      </button>
      {abierta && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function HistorialItem({
  entrada,
  onVerMas,
}: {
  entrada: HistorialEntrada;
  onVerMas: () => void;
}) {
  const t = useT();
  const Icon = CANAL_ICON[entrada.canal];
  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs">
        <Icon className="size-3 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate font-medium">{entrada.fecha}</span>
        <Badge
          variant={
            entrada.estado === "Resuelto"
              ? "success"
              : entrada.estado === "Derivado a nivel 2"
                ? "info"
                : "warning"
          }
        >
          {entrada.estado}
        </Badge>
      </div>
      <div className="flex items-center gap-2 border-t border-border px-2 py-1.5">
        <p className="flex-1 text-xs text-muted-foreground">{entrada.resumen}</p>
        <button
          type="button"
          onClick={onVerMas}
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Eye className="size-3" />
          {t("padMock.contextColumn.verMasDetalle")}
        </button>
      </div>
    </div>
  );
}

// Brief §5 — acordeón, cada sección se abre/cierra por separado. Colapsa a una
// tira de íconos verticales; un click sobre un ícono reabre la columna con esa
// sección puntual abierta. Ancho ajustable (ResizeHandle en el borde
// izquierdo) — a pedido, tanto esta columna como el menú se pueden acomodar.
export function ContextColumn({
  colapsada,
  onToggle,
  cliente,
  historial,
}: {
  colapsada: boolean;
  onToggle: () => void;
  cliente: ClienteMock;
  historial: HistorialEntrada[];
}) {
  const t = useT();
  const SECCIONES = secciones(t);
  const [abiertas, setAbiertas] = useState<Set<SeccionId>>(new Set(SECCIONES_ABIERTAS_INIT));
  const [historialCompleto, setHistorialCompleto] = useState(false);
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [ancho, setAncho] = useState(ANCHO_INICIAL);

  function toggle(id: SeccionId) {
    setAbiertas((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function abrirDesdeColapsada(id: SeccionId) {
    setAbiertas(new Set([id]));
    onToggle();
  }

  const historialVisible = historialCompleto ? historial : historial.slice(0, HISTORIAL_VISIBLE_INICIAL);
  const detalle = historial.find((h) => h.id === detalleId);

  if (colapsada) {
    return (
      <div className="flex w-12 shrink-0 flex-col items-center gap-2 border-l border-border bg-card py-2">
        <Button variant="ghost" size="icon-sm" aria-label={t("padMock.contextColumn.expandirContexto")} onClick={onToggle}>
          <ChevronsLeft className="size-4" />
        </Button>
        <div className="flex flex-col gap-1.5">
          {SECCIONES.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="ghost"
              size="icon-sm"
              aria-label={label}
              title={label}
              onClick={() => abrirDesdeColapsada(id)}
            >
              <Icon className="size-4" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex shrink-0 flex-col border-l border-border bg-card" style={{ width: ancho }}>
      <ResizeHandle side="left" onResize={(d) => setAncho((w) => Math.min(ANCHO_MAX, Math.max(ANCHO_MIN, w + d)))} />
      {/* ALTO_CABECERA_COLUMNA: mismo alto que la barra de solapas de
          CenterColumn (fuente única compartida — ver layout.ts), para que
          las dos columnas arranquen alineadas. */}
      <div
        className={cn(
          ALTO_CABECERA_COLUMNA,
          "flex shrink-0 items-center justify-between border-b border-border px-3"
        )}
      >
        <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t("padMock.contextColumn.contexto")}
        </span>
        <Button variant="ghost" size="icon-sm" aria-label={t("padMock.contextColumn.colapsarContexto")} onClick={onToggle}>
          <ChevronsRight className="size-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Seccion
          label={t("padMock.contextColumn.cliente")}
          icon={User}
          abierta={abiertas.has("cliente")}
          onToggle={() => toggle("cliente")}
        >
          <dl className="flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("padMock.contextColumn.numeroCliente")}</dt>
              <dd className="font-medium tabular-nums">{cliente.numeroCliente}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("padMock.contextColumn.nombre")}</dt>
              <dd className="text-right font-medium">{cliente.nombre}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("padMock.contextColumn.telefono")}</dt>
              <dd className="text-right tabular-nums">{cliente.telefono}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("padMock.contextColumn.mail")}</dt>
              <dd className="truncate text-right">{cliente.mail}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("padMock.contextColumn.segmento")}</dt>
              <dd className="text-right">{cliente.segmento}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("padMock.contextColumn.antiguedad")}</dt>
              <dd className="text-right">{cliente.antiguedad}</dd>
            </div>
          </dl>
        </Seccion>

        <Seccion
          label={t("padMock.contextColumn.historial")}
          icon={History}
          abierta={abiertas.has("historial")}
          onToggle={() => toggle("historial")}
        >
          <div className="flex flex-col gap-1.5">
            {historialVisible.map((h) => (
              <HistorialItem key={h.id} entrada={h} onVerMas={() => setDetalleId(h.id)} />
            ))}
            {!historialCompleto && historial.length > HISTORIAL_VISIBLE_INICIAL && (
              <button
                type="button"
                onClick={() => setHistorialCompleto(true)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {t("padMock.contextColumn.verMas", { n: historial.length - HISTORIAL_VISIBLE_INICIAL })}
              </button>
            )}
          </div>
        </Seccion>
      </div>

      <HistorialDetailDialog entrada={detalle} open={detalleId !== null} onOpenChange={(o) => !o && setDetalleId(null)} />
    </div>
  );
}
