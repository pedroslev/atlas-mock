"use client";

import { useState } from "react";
import { Lock, Search, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ADefinir } from "@/components/clientes/clientes-ui";
import { camposCliente, obligatoriosPorCampania, permisoCampo, type CampoCliente } from "@/lib/mock-clientes";
import { getGruposDeUsuario } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

const GRUPOS: CampoCliente["grupo"][] = ["basicos", "contacto", "adicional"];

// Solapa "Clientes" de la campaña (pedido de producto 2026-10-15): qué campos
// del cliente son obligatorios para el agente en esta campaña. Aplica cuando
// el agente abre la ficha del cliente; no afecta a la importación.
// Qué ve y modifica cada agente se define en su grupo de trabajo: si un campo
// obligatorio no lo puede modificar algún grupo de la campaña, se avisa acá.
export function ClientesTab({ campaniaId, usuarioIds }: { campaniaId: string; usuarioIds: string[] }) {
  const t = useT();
  const gruposCampania = Array.from(
    new Map(usuarioIds.flatMap((u) => getGruposDeUsuario(u)).map((g) => [g.id, g])).values()
  );
  const sinPermiso = (campoId: string) =>
    gruposCampania.filter((g) => !permisoCampo(g.id, campoId).modificar).map((g) => g.nombre);
  const [obligatorios, setObligatorios] = useState<string[]>(() => obligatoriosPorCampania[campaniaId] ?? []);
  const [q, setQ] = useState("");

  const coincide = (c: CampoCliente) => c.nombre.toLowerCase().includes(q.trim().toLowerCase());
  const total = camposCliente.filter((c) => c.fijo || obligatorios.includes(c.id)).length;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{t("clientes.camp.titulo")}</CardTitle>
          <CardDescription>{t("clientes.camp.descripcion")}</CardDescription>
        </div>
        <ADefinir nota={t("clientes.camp.cuandoNota")} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              className="pl-8"
              placeholder={t("clientes.camp.buscar")}
              aria-label={t("clientes.camp.buscar")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <span className="text-sm text-muted-foreground">{t("clientes.camp.total", { n: total })}</span>
        </div>

        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("clientes.camp.col.campo")}</TableHead>
                <TableHead>{t("clientes.camp.col.tipo")}</TableHead>
                <TableHead className="text-right">{t("clientes.camp.col.obligatorio")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {GRUPOS.map((g) => {
                const filas = camposCliente.filter((c) => c.grupo === g && coincide(c));
                if (filas.length === 0) return null;
                return (
                  <GrupoCampos
                    key={g}
                    titulo={t(`clientes.camp.grupo.${g}`)}
                    filas={filas}
                    obligatorios={obligatorios}
                    sinPermiso={sinPermiso}
                    onToggle={(id, on) =>
                      setObligatorios((xs) => (on ? [...xs, id] : xs.filter((x) => x !== id)))
                    }
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">{t("clientes.camp.nota")}</p>
      </CardContent>
    </Card>
  );
}

function GrupoCampos({
  titulo,
  filas,
  obligatorios,
  sinPermiso,
  onToggle,
}: {
  titulo: string;
  filas: CampoCliente[];
  obligatorios: string[];
  sinPermiso: (campoId: string) => string[];
  onToggle: (id: string, on: boolean) => void;
}) {
  const t = useT();
  return (
    <>
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={3} className="bg-muted/50 py-1.5 text-xs font-semibold text-muted-foreground">
          {titulo}
        </TableCell>
      </TableRow>
      {filas.map((c) => {
        const on = !!c.fijo || obligatorios.includes(c.id);
        const conflicto = on ? sinPermiso(c.id) : [];
        return (
          <TableRow key={c.id}>
            <TableCell className="font-medium">
              <label htmlFor={`oblig-${c.id}`}>{c.nombre}</label>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{t(`clientes.camp.tipo.${c.tipo}`)}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-2">
                {conflicto.length > 0 && (
                  <Badge variant="warning" className="gap-1" title={t("clientes.camp.conflictoDesc")}>
                    <TriangleAlert />
                    {t("clientes.camp.conflicto", { grupos: conflicto.join(", ") })}
                  </Badge>
                )}
                {c.fijo && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="size-3" aria-hidden />
                    {t("clientes.camp.siempre")}
                  </span>
                )}
                <Switch
                  id={`oblig-${c.id}`}
                  checked={on}
                  disabled={c.fijo}
                  onCheckedChange={(v) => onToggle(c.id, v)}
                />
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
