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
import type { Marcador } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";
import { MensajeRepetido } from "@/components/layout/campos-unicos";
import { seRepite } from "@/lib/campos-unicos";

// Alta/edición de un bookmark como modal (feedback 2026-07-16: 3 campos no
// justifican una pantalla entera). El bookmark es una entidad del pool,
// reutilizable en varios grupos. Duplicar (ATLAS-1291) abre el alta con los
// datos de `duplicarDe`; la copia no entra en ningún grupo.
export function MarcadorDialog({
  open,
  onOpenChange,
  initial,
  duplicarDe,
  pool,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = crear nuevo */
  initial: Marcador | null;
  duplicarDe?: Marcador | null;
  pool: Marcador[];
  onSave: (marcador: Marcador) => void;
}) {
  const t = useT();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prompt, setPrompt] = useState("");

  // Reset del form al abrir (patrón "adjust state during render" de React,
  // en vez de un setState dentro de un efecto).
  const [lastResetKey, setLastResetKey] = useState<string | null>(null);
  const base = initial ?? duplicarDe;
  const resetKey = open ? (initial?.id ?? (duplicarDe ? `__duplicar-${duplicarDe.id}__` : "__nuevo__")) : null;
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    if (resetKey !== null) {
      setNombre(base?.nombre ?? "");
      setDescripcion(base?.descripcion ?? "");
      setPrompt(base?.prompt ?? "");
    }
  }

  const nombreRepetido = seRepite(
    nombre,
    pool.filter((m) => m.id !== initial?.id).map((m) => m.nombre)
  );

  function guardar() {
    if (!nombre.trim() || nombreRepetido) return;
    onSave({
      id: initial?.id ?? `mk-${pool.length + 1}-${nombre.trim().toLowerCase().replace(/\s+/g, "-")}`,
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      prompt: prompt.trim() || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial
              ? t("marcas.dialogo.editar", { nombre: initial.nombre })
              : t("marcas.nuevaMarca")}
          </DialogTitle>
          <DialogDescription>
            {t("marcas.dialogo.descripcion")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mk-nombre">{t("common.comunes.nombre")}</Label>
            <Input
              id="mk-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={t("marcas.dialogo.placeholderNombre")}
              autoFocus
              aria-invalid={nombreRepetido}
            />
            {nombreRepetido && <MensajeRepetido />}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mk-descripcion">
              {t("common.comunes.descripcion")}
            </Label>
            <Textarea
              id="mk-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              placeholder={t("common.comunes.opcional")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mk-prompt">{t("marcas.dialogo.prompt")}</Label>
            <Textarea
              id="mk-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder={t("common.comunes.opcional")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.acciones.cancelar")}
          </Button>
          <Button onClick={guardar} disabled={!nombre.trim() || nombreRepetido}>
            {initial ? t("common.acciones.guardar") : t("marcas.crearMarca")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
