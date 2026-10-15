"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EtiquetaBadge } from "@/components/clientes/clientes-ui";
import { cn } from "@/lib/utils";
import { PALETA_ETIQUETAS, type Etiqueta } from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";

// Alta / edición de etiqueta (2026-10-14). Se usa en la pantalla de
// etiquetas y desde el paso Opciones del importador.
// - Nombre siempre en MAYÚSCULA y único sin importar mayúsculas/minúsculas.
// - Color: paleta ampliada + color libre (picker) para clientes exigentes.
// - Prompt opcional: instrucción para que la IA asigne la etiqueta sola.
export function EtiquetaDialog({
  etiqueta,
  existentes,
  onClose,
  onSave,
}: {
  etiqueta: Etiqueta | "nueva" | null;
  existentes: Etiqueta[];
  onClose: () => void;
  onSave: (e: Etiqueta) => void;
}) {
  const t = useT();
  const base: Etiqueta =
    etiqueta && etiqueta !== "nueva" ? etiqueta : { id: "", nombre: "", color: PALETA_ETIQUETAS[0].hex };
  const [nombre, setNombre] = useState(base.nombre);
  const [descripcion, setDescripcion] = useState(base.descripcion ?? "");
  const [prompt, setPrompt] = useState(base.prompt ?? "");
  const [color, setColor] = useState(base.color);

  const nombreFinal = nombre.trim().toLocaleUpperCase("es-AR");
  const duplicada = existentes.find((e) => e.id !== base.id && e.nombre.toLocaleUpperCase("es-AR") === nombreFinal);
  const enPaleta = PALETA_ETIQUETAS.some((p) => p.hex.toLowerCase() === color.toLowerCase());

  return (
    <Dialog open={etiqueta !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{etiqueta === "nueva" ? t("clientes.et.nueva") : t("common.acciones.editar")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="et-nombre">{t("clientes.et.nombre")}</Label>
            <Input
              id="et-nombre"
              value={nombre}
              aria-invalid={!!duplicada}
              placeholder={t("clientes.et.placeholderNombre")}
              className="uppercase"
              onChange={(e) => setNombre(e.target.value.toLocaleUpperCase("es-AR"))}
            />
            {duplicada && (
              <span className="text-xs text-destructive">
                {t("clientes.et.duplicada", { nombre: duplicada.nombre })}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="et-desc">{t("clientes.et.col.descripcion")}</Label>
            <Input
              id="et-desc"
              value={descripcion}
              placeholder={t("common.comunes.opcional")}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="et-prompt" className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              {t("clientes.et.prompt")}
            </Label>
            <Textarea
              id="et-prompt"
              rows={3}
              value={prompt}
              placeholder={t("clientes.et.promptPlaceholder")}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <span className="text-xs text-muted-foreground">{t("clientes.et.promptDesc")}</span>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">{t("clientes.et.color")}</legend>
            <div className="flex flex-wrap items-center gap-2">
              {PALETA_ETIQUETAS.map((p) => {
                const sel = p.hex.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={p.hex}
                    type="button"
                    aria-label={p.nombre}
                    aria-pressed={sel}
                    title={p.nombre}
                    onClick={() => setColor(p.hex)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-background",
                      sel && "ring-2 ring-foreground"
                    )}
                    style={{ backgroundColor: p.hex }}
                  >
                    {sel && <Check className="size-4 text-white" />}
                  </button>
                );
              })}
              <label
                className={cn(
                  "flex h-7 cursor-pointer items-center gap-1.5 rounded-full border px-2 text-xs",
                  !enPaleta && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                )}
              >
                <input
                  type="color"
                  aria-label={t("clientes.et.colorPersonalizado")}
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="size-5 cursor-pointer rounded-full border-0 bg-transparent p-0"
                />
                {t("clientes.et.colorPersonalizado")}
              </label>
            </div>
          </fieldset>

          {nombreFinal && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {t("clientes.et.vistaPrevia")}
              <EtiquetaBadge etiqueta={{ nombre: nombreFinal, color, descripcion }} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.acciones.cancelar")}
          </Button>
          <Button
            disabled={!nombreFinal || !!duplicada}
            onClick={() =>
              onSave({
                ...base,
                id: base.id || `et-${Date.now()}`,
                nombre: nombreFinal,
                descripcion: descripcion.trim() || undefined,
                prompt: prompt.trim() || undefined,
                color,
              })
            }
          >
            {t("common.acciones.guardar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
