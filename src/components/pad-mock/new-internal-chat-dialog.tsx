"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  agentesInternosMock,
  estadosAgenteDisponibles,
  type AgenteInterno,
  type ChatInterno,
} from "@/lib/pad-mock/data";
import { cn } from "@/lib/utils";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter((p) => p && p !== "—")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

// Réplica del modal de "Nueva interacción" pero para chats internos — a
// pedido: un selector de agentes disponibles donde se ve el estado de cada
// uno (mismo catálogo que "Mi estado"). Elegir un agente abre su ventana
// flotante (mismo mecanismo que clickear un chat ya existente en el menú) y
// cierra el modal.
export function NewInternalChatDialog({
  open,
  onOpenChange,
  onElegirAgente,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onElegirAgente: (chat: ChatInterno) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const filtrados = agentesInternosMock.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  function handleOpenChange(next: boolean) {
    if (!next) setBusqueda("");
    onOpenChange(next);
  }

  function elegir(a: AgenteInterno) {
    onElegirAgente({ id: a.id, nombre: a.nombre, noLeidos: 0 });
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo chat interno</DialogTitle>
          <DialogDescription>Elegí con quién chatear — se ve el estado de cada uno.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar agente…"
            className="pl-8"
          />
        </div>

        <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
          {filtrados.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Sin resultados.</p>
          ) : (
            filtrados.map((a) => {
              const estado =
                estadosAgenteDisponibles.find((e) => e.id === a.estadoId) ?? estadosAgenteDisponibles[0];
              const Icon = estado.icon;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => elegir(a)}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {iniciales(a.nombre)}
                    <span
                      className={cn(
                        "absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-card",
                        estado.dotClass
                      )}
                    />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{a.nombre}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon className="size-3" />
                      {estado.nombre}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
