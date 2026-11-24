"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

// Contactos que ya están en la lista con otro sentido (ATLAS-1444): el usuario
// elige si quedan con el sentido nuevo o pasan a Bidireccional. La usan
// Agregar contactos (en un modal) e Importar en modo Agregar (en la vista previa).
export type DecisionSentido = "nuevo" | "bidireccional";

export function EleccionSentido({
  etiquetaNuevo,
  decision,
  onChange,
  name,
}: {
  etiquetaNuevo: string;
  decision: DecisionSentido | null;
  onChange: (d: DecisionSentido) => void;
  name: string;
}) {
  const t = useT();
  const opciones: { valor: DecisionSentido; titulo: string; desc: string }[] = [
    { valor: "nuevo", titulo: etiquetaNuevo, desc: t("listas.conflicto.nuevoDesc") },
    { valor: "bidireccional", titulo: t("listas.conflicto.bidireccional"), desc: t("listas.conflicto.bidireccionalDesc") },
  ];
  return (
    <fieldset className="flex flex-col gap-2">
      {opciones.map((o) => (
        <label
          key={o.valor}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border p-3",
            decision === o.valor && "border-primary bg-primary/5"
          )}
        >
          <input
            type="radio"
            name={name}
            className="mt-1 accent-primary"
            checked={decision === o.valor}
            onChange={() => onChange(o.valor)}
          />
          <span className="flex flex-col">
            <span className="font-medium">{o.titulo}</span>
            <span className="text-xs text-muted-foreground">{o.desc}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
