"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { UserPlus, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { useT } from "@/lib/i18n";
import { getOverrideDeUsuario, type Agente } from "@/lib/mock-data";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("");
}

function AgregarUsuario({
  disponibles,
  onAdd,
}: {
  disponibles: Agente[];
  onAdd: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus />
          {t("grupos.miembros.agregar")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <Command>
          <CommandInput placeholder={t("grupos.miembros.buscar")} />
          <CommandList>
            <CommandEmpty>{t("grupos.miembros.sinDisponibles")}</CommandEmpty>
            <CommandGroup>
              {disponibles.map((a) => (
                <CommandItem
                  key={a.id}
                  value={a.nombre}
                  onSelect={() => {
                    onAdd(a.id);
                    setOpen(false);
                  }}
                >
                  {a.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Estado local solo para que agregar/quitar usuario se sienta real en el
// mock — no hay persistencia (ver PRODUCT.md: esto es un mock sin API).
export function GrupoMiembros({
  agentes,
  initialUsuarioIds,
}: {
  agentes: Agente[];
  initialUsuarioIds: string[];
}) {
  const [usuarioIds, setUsuarioIds] = useState(initialUsuarioIds);
  const t = useT();

  const miembros = useMemo(
    () => agentes.filter((a) => usuarioIds.includes(a.id)),
    [agentes, usuarioIds]
  );
  const disponibles = useMemo(
    () => agentes.filter((a) => !usuarioIds.includes(a.id)),
    [agentes, usuarioIds]
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{t("grupos.miembros.titulo")}</CardTitle>
          <CardDescription>
            {t("grupos.miembros.conteo", { n: miembros.length })}
          </CardDescription>
        </div>
        <AgregarUsuario
          disponibles={disponibles}
          onAdd={(agenteId) =>
            setUsuarioIds((current) => [...current, agenteId])
          }
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {miembros.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t("grupos.miembros.vacio")}
          </p>
        )}
        {miembros.map((m) => {
          const tieneOverride = Boolean(getOverrideDeUsuario(m.id));
          return (
            <div
              key={m.id}
              className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm ring-1 ring-foreground/10"
            >
              <Link
                href={`/agentes/${m.id}`}
                className="flex min-w-0 items-center gap-2 font-medium hover:underline"
              >
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="text-xs">
                    {iniciales(m.nombre)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{m.nombre}</span>
                {tieneOverride && (
                  <Badge variant="secondary" className="shrink-0">
                    {t("grupos.miembros.permisosIndividuales")}
                  </Badge>
                )}
              </Link>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-muted-foreground sm:inline">
                  {m.email}
                </span>
                <ActionTooltip label={t("grupos.miembros.quitar")}>
                  <button
                    type="button"
                    aria-label={t("grupos.miembros.quitarAria", {
                      nombre: m.nombre,
                    })}
                    onClick={() =>
                      setUsuarioIds((current) =>
                        current.filter((id) => id !== m.id)
                      )
                    }
                    className="flex size-7 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                  >
                    <X className="size-3.5" />
                  </button>
                </ActionTooltip>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
