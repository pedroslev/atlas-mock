"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { NuevaInteraccionForm } from "@/components/pad-mock/nueva-interaccion-form";
import { useNow, formatDuration } from "@/lib/pad-mock/use-now";
import {
  CANAL_ICON,
  estadoAgenteMock,
  estadosAgenteDisponibles,
  historialAgenteMock,
  type CampaniaSaliente,
  type CuentaSaliente,
} from "@/lib/pad-mock/data";

const ULTIMAS_VISIBLES = 4;
const ANCHO_MAX_CONTENIDO = "max-w-[900px]";

// Lo que ve el agente al ingresar al pad sin ninguna interacción activa —
// también donde vuelve cada vez que cierra una. A pedido: NO es un estado
// vacío tipo error/404 (la card centrada de antes) — es la pantalla de casa,
// así que va con contenido a lo ancho, alineado a la izquierda, y la franja
// de estado tiene que decir la verdad (antes decía "pasate a Disponible" aun
// con el agente ya en Disponible).
export function SinInteraccionPanel({
  estadoAgenteId,
  estadoAgenteDesde,
  onEstadoAgenteChange,
  campaniaIdInicial,
  cuentaIdInicial,
  onContactar,
}: {
  estadoAgenteId: string;
  estadoAgenteDesde: number;
  onEstadoAgenteChange: (id: string) => void;
  campaniaIdInicial?: string;
  cuentaIdInicial?: string;
  onContactar: (campania: CampaniaSaliente, cuenta: CuentaSaliente, numero: string) => void;
}) {
  const t = useT();
  const estado =
    estadosAgenteDisponibles.find((e) => e.id === estadoAgenteId) ?? estadosAgenteDisponibles[0];
  const disponible = estado.id === "disponible";
  const now = useNow(true);
  const cronometro = formatDuration(Math.max(0, Math.floor((now - estadoAgenteDesde) / 1000)));
  const ultimas = historialAgenteMock.slice(0, ULTIMAS_VISIBLES);

  return (
    <div className="h-full min-h-0 w-full flex-1 overflow-y-auto bg-muted/30">
      <div className={cn("flex w-full flex-col gap-6 p-6 sm:p-8", ANCHO_MAX_CONTENIDO)}>
        {/* 1. Encabezado — nombre, estado y cronómetro. Sin saludo ("Hola"):
            a pedido, empalaga en una herramienta de uso diario. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="font-heading text-2xl font-semibold">{estadoAgenteMock.nombre}</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className={cn("size-2 shrink-0 rounded-full", estado.dotClass)} aria-hidden />
            <estado.icon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="font-medium">{estado.nombre}</span>
            <span className="font-mono text-muted-foreground tabular-nums">{cronometro}</span>
          </div>
        </div>

        {/* 2. Franja de estado — la acción vive EN el mensaje, no manda al
            agente a resolverlo en otro lado. */}
        {disponible ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span className="relative flex size-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-success" />
            </span>
            {t("padMock.sinInteraccion.esperando")}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
            {t("padMock.sinInteraccion.noRecibiendo")}
            <Button size="sm" onClick={() => onEstadoAgenteChange("disponible")}>
              {t("padMock.sinInteraccion.pasarADisponible")}
            </Button>
          </div>
        )}

        {/* 3. Nueva interacción saliente — misma lógica que el modal del
            "+", en una barra ancha en vez de una card angosta. Foco en
            Número al montar, Enter contacta (NuevaInteraccionForm es un
            <form>). */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("padMock.sinInteraccion.nuevaInteraccion")}
          </span>
          <div className="rounded-xl border border-border bg-card p-3">
            <NuevaInteraccionForm
              idPrefix="si"
              layout="row"
              campaniaIdInicial={campaniaIdInicial}
              cuentaIdInicial={cuentaIdInicial}
              onContactar={onContactar}
            />
          </div>
        </div>

        {/* 4. Últimas interacciones — para que el área no quede vacía. */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("padMock.sinInteraccion.ultimasInteracciones")}
          </span>
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {ultimas.map((h) => {
              const Icon = CANAL_ICON[h.canal];
              return (
                <div key={h.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    {h.nombreCliente && <span className="truncate font-medium">{h.nombreCliente}</span>}
                    <span className="truncate font-mono text-xs text-muted-foreground tabular-nums">
                      {h.numeroCliente}
                    </span>
                  </div>
                  <span className="hidden shrink-0 font-mono text-xs text-muted-foreground tabular-nums sm:block">
                    {h.fecha} · {h.hora}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                    {h.duracion}
                  </span>
                  <Badge variant="neutral" className="hidden shrink-0 sm:inline-flex">
                    {h.tipificacion}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
