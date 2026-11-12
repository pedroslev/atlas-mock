"use client";

import { useMemo, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAutocompletadoVariables } from "@/components/plantillas/autocompletado-variables";
import { variablesPlantilla } from "@/lib/plantillas";

// Los datos del cliente que el flujo puede usar: los campos de la ficha
// (datos básicos, formas de contacto e información adicional), los mismos que
// las plantillas de mensajes. El flujo corre del lado del servidor, así que no
// se filtran por grupo de trabajo: ofrece todos (ADR-WORKFLOWS-003).
const VARIABLES_CLIENTE = variablesPlantilla.filter((v) => v.origen.startsWith("cliente"));

// Campo de texto del flujo con autocompletado de los datos del cliente, igual
// que en las plantillas: al escribir `cliente.` (o el prefijo del idioma) se
// despliega la lista de campos de la ficha y elegir uno lo deja escrito.
// - En textos, URLs, encabezados y cuerpos queda `{{cliente.<campo>}}`.
// - Con `cel`, en una expresión o un nombre de variable, queda `cliente.<campo>`.
type Comunes = {
  value: string;
  onChange: (valor: string) => void;
  cel?: boolean;
};

export function CampoConVariables({
  multilinea,
  cel,
  value,
  onChange,
  ...props
}: Comunes &
  (
    | ({ multilinea: true } & Omit<ComponentProps<typeof Textarea>, "value" | "onChange">)
    | ({ multilinea?: false } & Omit<ComponentProps<typeof Input>, "value" | "onChange">)
  )) {
  const formato = useMemo(() => (cel ? (clave: string) => clave : undefined), [cel]);
  const auto = useAutocompletadoVariables({
    setValor: onChange,
    variables: VARIABLES_CLIENTE,
    formato,
  });
  const comunes = {
    value,
    onKeyDown: auto.onKeyDown,
    onBlur: auto.cerrar,
    // onChange y onSelect: la lista sigue al cursor mientras se escribe o se mueve.
    onChange: (e: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => {
      onChange(e.currentTarget.value);
      auto.evaluar(e.currentTarget);
    },
    onSelect: (e: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) =>
      auto.evaluar(e.currentTarget),
  };
  return (
    // relative: la lista de sugerencias se ubica respecto del campo.
    <div className="relative">
      {multilinea ? (
        <Textarea {...(props as ComponentProps<typeof Textarea>)} {...comunes} />
      ) : (
        <Input {...(props as ComponentProps<typeof Input>)} {...comunes} />
      )}
      {auto.lista}
    </div>
  );
}
