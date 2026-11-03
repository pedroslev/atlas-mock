"use client";

import { useState, type ReactNode } from "react";
import { Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ActionTooltip } from "@/components/layout/action-tooltip";

export type MemberOption = { id: string; name: string; detail?: string };

// Card de membresía con el mismo patrón que `grupo-miembros.tsx` de
// clasificaciones: "Agregar" abre un Popover+Command buscable con las opciones
// que todavía no están, y cada fila tiene una X que la quita SIN borrar la
// entidad. Se usa para "Personas del grupo" (en el grupo) y "Grupos de
// permisos" (en la persona).
export function MembersCard({
  title,
  description,
  members,
  available,
  onAdd,
  onRemove,
  texts,
  testIdPrefix,
  footer,
}: {
  title: string;
  description?: string;
  members: MemberOption[];
  available: MemberOption[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  texts: { agregar: string; buscar: string; sinDisponibles: string; vacio: string; quitar: string; quitarAria: (nombre: string) => string };
  testIdPrefix: string;
  /** Contenido extra al pie (ej. enlace "Crear grupo nuevo"). */
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" data-testid={`${testIdPrefix}-agregar`}>
              <Plus />
              {texts.agregar}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Command>
              <CommandInput placeholder={texts.buscar} data-testid={`${testIdPrefix}-buscar`} />
              <CommandList>
                <CommandEmpty>{texts.sinDisponibles}</CommandEmpty>
                <CommandGroup>
                  {available.map((o) => (
                    <CommandItem
                      key={o.id}
                      value={`${o.name} ${o.detail ?? ""}`}
                      data-testid={`${testIdPrefix}-opcion-${o.id}`}
                      onSelect={() => {
                        onAdd(o.id);
                        setOpen(false);
                      }}
                    >
                      <Check className="opacity-0" />
                      {o.name}
                      {o.detail && (
                        <span className="ml-auto truncate text-xs text-muted-foreground">
                          {o.detail}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        {members.length === 0 && (
          <p className="text-sm text-muted-foreground">{texts.vacio}</p>
        )}
        {members.map((m) => (
          <div
            key={m.id}
            data-testid={`${testIdPrefix}-fila-${m.id}`}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-foreground/10"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate font-medium">{m.name}</span>
              {m.detail && (
                <span className="truncate text-muted-foreground">{m.detail}</span>
              )}
            </span>
            <ActionTooltip label={texts.quitar}>
              <button
                type="button"
                aria-label={texts.quitarAria(m.name)}
                data-testid={`${testIdPrefix}-quitar-${m.id}`}
                onClick={() => onRemove(m.id)}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
              >
                <X className="size-3.5" />
              </button>
            </ActionTooltip>
          </div>
        ))}
        {footer}
      </CardContent>
    </Card>
  );
}
