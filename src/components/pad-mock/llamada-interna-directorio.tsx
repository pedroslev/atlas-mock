"use client";

import { useMemo, useState } from "react";
import { MessagesSquare, Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  ESTADOS_DIRECTORIO,
  agentesDirectorioMock,
  type AgenteDirectorio,
} from "@/lib/pad-mock/data";

// Opción "Interno" del modal "Nueva interacción" (y de la barra de
// InicioPanel) — propuesta opción A de llamadas internas: lista de agentes
// conectados habilitados por el grupo de trabajo, con su estado actual. Solo
// se llama a los que están en Disponible; el resto se ve con el botón
// deshabilitado. Cada agente tiene además "Chatear" (chat interno), siempre
// habilitado: se puede chatear con cualquier agente conectado, en cualquier
// estado. Llamadas y chats se
// permiten por separado en el grupo, así que un agente puede traer un solo
// botón. El switch "Simular grupo sin reglas" existe solo para poder
// mostrar el estado vacío en la reunión.
export function LlamadaInternaDirectorio({
  onLlamar,
  onChatear,
  onSimularEntrante,
  onSimularChatEntrante,
  compacto = false,
}: {
  onLlamar: (agente: AgenteDirectorio) => void;
  onChatear: (agente: AgenteDirectorio) => void;
  /** Solo para la reunión: dispara el aviso de llamada interna entrante. */
  onSimularEntrante?: () => void;
  /** Solo para la reunión: dispara el aviso de chat interno entrante. */
  onSimularChatEntrante?: () => void;
  /** Lista más baja para la barra de la pantalla de inicio. */
  compacto?: boolean;
}) {
  const t = useT();
  const [busqueda, setBusqueda] = useState("");
  const [sinReglas, setSinReglas] = useState(false);

  const agentes = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return agentesDirectorioMock.filter((a) => !q || a.nombre.toLowerCase().includes(q));
  }, [busqueda]);

  return (
    <div className="flex flex-col gap-3">
      {sinReglas ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
          {t("padMock.llamadaInterna.sinHabilitados")}
        </p>
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={t("padMock.llamadaInterna.buscar")}
              className="pl-8"
              autoFocus
            />
          </div>

          <ul
            className={cn(
              "flex flex-col divide-y divide-border overflow-y-auto rounded-lg border border-border",
              compacto ? "max-h-48" : "max-h-72"
            )}
          >
            {agentes.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                {t("padMock.llamadaInterna.sinResultados")}
              </li>
            )}
            {agentes.map((a) => {
              const estado = ESTADOS_DIRECTORIO[a.estadoId];
              return (
                <li key={a.id} className="flex items-center gap-3 px-3 py-2">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{a.nombre}</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={cn("size-2 shrink-0 rounded-full", estado.dotClass)} />
                      {estado.nombre}
                    </span>
                  </div>
                  {a.puedeChatear !== false && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      data-testid={`directorio-chatear-${a.id}`}
                      onClick={() => onChatear(a)}
                    >
                      <MessagesSquare className="size-3.5" />
                      {t("padMock.llamadaInterna.chatear")}
                    </Button>
                  )}
                  {a.puedeLlamar !== false && (
                    <Button
                      type="button"
                      size="sm"
                      variant={estado.llamable ? "default" : "outline"}
                      disabled={!estado.llamable}
                      className="gap-1.5"
                      data-testid={`directorio-llamar-${a.id}`}
                      onClick={() => onLlamar(a)}
                    >
                      <Phone className="size-3.5" />
                      {t("padMock.llamadaInterna.llamar")}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="text-xs text-muted-foreground">{t("padMock.llamadaInterna.soloDisponibles")}</p>
        </>
      )}

      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
        {onSimularChatEntrante && (
          <button
            type="button"
            onClick={onSimularChatEntrante}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t("padMock.chatInterno.simularEntrante")}
          </button>
        )}
        {onSimularEntrante && (
          <button
            type="button"
            onClick={onSimularEntrante}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t("padMock.llamadaInterna.simularEntrante")}
          </button>
        )}
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch size="sm" checked={sinReglas} onCheckedChange={setSinReglas} />
          {t("padMock.llamadaInterna.simularSinReglas")}
        </label>
      </div>
    </div>
  );
}
