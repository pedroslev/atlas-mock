"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EntityCombobox } from "../campanias/entity-combobox";
import { useT } from "@/lib/i18n";
import type { Clasificacion } from "@/lib/mock-data";

const SIN_PADRE = "__sin_padre__";

// El `tipo` de una clasificación es un dato de mock-data en castellano. Acá
// sólo se traduce en el punto de render: cada valor tiene su clave en
// `clasificaciones.tipo.*` y el dato crudo sigue siendo el que se guarda.
export const TIPOS: Clasificacion["tipo"][] = [
  "Exitoso",
  "No exitoso",
  "No efectivo",
  "Neutro",
];

const TIPO_CLAVE: Record<string, string> = {
  Exitoso: "exitoso",
  "No exitoso": "noExitoso",
  "No efectivo": "noEfectivo",
  Neutro: "neutro",
};

export function tipoClave(tipo: string) {
  return TIPO_CLAVE[tipo] ?? "neutro";
}

// Alta/edición de una clasificación como modal (feedback 2026-07-16: formularios
// chicos no justifican una pantalla entera). La clasificación es una entidad
// del pool del tenant, reutilizable en varios grupos — acá NO se decide a qué
// grupo pertenece; eso se asigna desde cada grupo.
export function ClasificacionDialog({
  open,
  onOpenChange,
  initial,
  pool,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = crear nueva */
  initial: Clasificacion | null;
  /** Pool completo, para elegir padre (raíces, excluyéndose a sí misma). */
  pool: Clasificacion[];
  onSave: (clasificacion: Clasificacion) => void;
}) {
  const t = useT();
  const [nombre, setNombre] = useState("");
  const [idExt, setIdExt] = useState("");
  const [tipo, setTipo] = useState<Clasificacion["tipo"]>("Neutro");
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [callingTime, setCallingTime] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Reset del form al abrir (patrón "adjust state during render" de React,
  // en vez de un setState dentro de un efecto).
  const [lastResetKey, setLastResetKey] = useState<string | null>(null);
  const resetKey = open ? (initial?.id ?? "__nueva__") : null;
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    if (resetKey !== null) {
      setNombre(initial?.nombre ?? "");
      setIdExt(initial?.idExt ?? "");
      setTipo(initial?.tipo ?? "Neutro");
      setParentId(initial?.parentId);
      setCallingTime(initial?.callingTime ? String(initial.callingTime) : "");
      setDescripcion(initial?.descripcion ?? "");
    }
  }

  const padresPosibles = pool.filter(
    (c) => !c.parentId && c.id !== initial?.id
  );

  function guardar() {
    if (!nombre.trim()) return;
    onSave({
      id: initial?.id ?? `clas-${nombre.trim().toLowerCase().replace(/\s+/g, "-")}-${pool.length}`,
      nombre: nombre.trim(),
      idExt: idExt.trim() || undefined,
      tipo,
      parentId,
      callingTime: callingTime ? Number(callingTime) : undefined,
      descripcion: descripcion.trim() || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial
              ? t("clasificaciones.dialog.editar", { nombre: initial.nombre })
              : t("clasificaciones.nuevaClasificacion")}
          </DialogTitle>
          <DialogDescription>
            {t("clasificaciones.dialog.descripcion")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clas-nombre">{t("common.comunes.nombre")}</Label>
            <Input
              id="clas-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={t("clasificaciones.campo.nombrePlaceholder")}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clas-idext">
              {t("clasificaciones.campo.idExt")}
            </Label>
            <Input
              id="clas-idext"
              value={idExt}
              onChange={(e) => setIdExt(e.target.value)}
              placeholder={t("clasificaciones.campo.idExtPlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clas-tipo">{t("clasificaciones.col.tipo")}</Label>
            <Select
              value={tipo}
              onValueChange={(v) => setTipo(v as Clasificacion["tipo"])}
            >
              <SelectTrigger id="clas-tipo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((opcion) => (
                  <SelectItem key={opcion} value={opcion}>
                    {t(`clasificaciones.tipo.${tipoClave(opcion)}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clas-calling">
              {t("clasificaciones.campo.callingTime")}
            </Label>
            <Input
              id="clas-calling"
              type="number"
              min={0}
              value={callingTime}
              onChange={(e) => setCallingTime(e.target.value)}
              placeholder={t("common.comunes.opcional")}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="clas-padre">
              {t("clasificaciones.campo.padre")}
            </Label>
            <EntityCombobox
              id="clas-padre"
              items={[
                { id: SIN_PADRE, nombre: t("clasificaciones.campo.sinPadre") },
                ...padresPosibles,
              ]}
              value={parentId ?? SIN_PADRE}
              onChange={(v) =>
                setParentId(v === SIN_PADRE || !v ? undefined : v)
              }
              searchPlaceholder={t("clasificaciones.campo.buscar")}
              emptyLabel={t("clasificaciones.campo.sinRaices")}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="clas-descripcion">
              {t("common.comunes.descripcion")}
            </Label>
            <Textarea
              id="clas-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              placeholder={t("common.comunes.opcional")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.acciones.cancelar")}
          </Button>
          <Button onClick={guardar} disabled={!nombre.trim()}>
            {initial
              ? t("common.acciones.guardar")
              : t("clasificaciones.dialog.crear")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
