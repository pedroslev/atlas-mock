"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { camposCliente, permisoCampo, type CampoCliente, type PermisoCampo } from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";

const GRUPOS: CampoCliente["grupo"][] = ["basicos", "contacto", "adicional"];

// Solapa "Ficha del cliente" del grupo de trabajo (pedido de producto
// 2026-10-15): qué campos del cliente pueden VER y MODIFICAR los agentes de
// este grupo en Hermes. Si no lo ve, no lo puede modificar. La obligatoriedad
// no va acá: se define por campaña (solapa "Clientes" de la campaña).
export function GrupoFichaClienteTab({ grupoId }: { grupoId: string }) {
  const t = useT();
  const [permisos, setPermisos] = useState<Record<string, PermisoCampo>>(() =>
    Object.fromEntries(camposCliente.map((c) => [c.id, permisoCampo(grupoId, c.id)]))
  );
  const set = (id: string, cambios: Partial<PermisoCampo>) =>
    setPermisos((p) => {
      const nuevo = { ...p[id], ...cambios };
      if (!nuevo.ver) nuevo.modificar = false;
      return { ...p, [id]: nuevo };
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("clientes.grupo.titulo")}</CardTitle>
        <CardDescription>{t("clientes.grupo.descripcion")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("clientes.camp.col.campo")}</TableHead>
                <TableHead>{t("clientes.camp.col.tipo")}</TableHead>
                <TableHead className="w-28 text-center">{t("clientes.grupo.ver")}</TableHead>
                <TableHead className="w-28 text-center">{t("clientes.grupo.modificar")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {GRUPOS.map((g) => (
                <Grupo key={g} grupo={g} permisos={permisos} onChange={set} />
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">{t("clientes.grupo.nota")}</p>
      </CardContent>
    </Card>
  );
}

function Grupo({
  grupo,
  permisos,
  onChange,
}: {
  grupo: CampoCliente["grupo"];
  permisos: Record<string, PermisoCampo>;
  onChange: (id: string, c: Partial<PermisoCampo>) => void;
}) {
  const t = useT();
  return (
    <>
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={4} className="bg-muted/50 py-1.5 text-xs font-semibold text-muted-foreground">
          {t(`clientes.camp.grupo.${grupo}`)}
        </TableCell>
      </TableRow>
      {camposCliente
        .filter((c) => c.grupo === grupo)
        .map((c) => {
          const p = permisos[c.id];
          const siempreVisible = c.id === "nombre";
          return (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.nombre}</TableCell>
              <TableCell>
                <Badge variant="outline">{t(`clientes.camp.tipo.${c.tipo}`)}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1.5">
                  {siempreVisible && <Lock className="size-3 text-muted-foreground" aria-hidden />}
                  <Switch
                    aria-label={`${t("clientes.grupo.ver")}: ${c.nombre}`}
                    checked={p.ver}
                    disabled={siempreVisible}
                    onCheckedChange={(v) => onChange(c.id, { ver: v })}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <Switch
                    aria-label={`${t("clientes.grupo.modificar")}: ${c.nombre}`}
                    checked={p.modificar}
                    disabled={!p.ver}
                    onCheckedChange={(v) => onChange(c.id, { modificar: v })}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
    </>
  );
}
