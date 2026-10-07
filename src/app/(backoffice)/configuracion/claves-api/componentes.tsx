"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, ShieldAlert, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizarOrigen } from "@/lib/mock-claves-api";
import { useLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Piezas compartidas por las pantallas de claves de acceso API: la lista
// (/configuracion/claves-api), el alta (/configuracion/claves-api/nueva) y el detalle (/configuracion/claves-api/[id]).

// Formato de fecha y hora corto, en el idioma elegido.
export function useFormatoFecha() {
  const { locale } = useLocale();
  return useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale]
  );
}

// Botón de copiar con confirmación visual ("Copiada") que vuelve sola a su
// estado normal. Lo usan la lista, el detalle (clave pública) y el alta (las dos).
export function BotonCopiar({
  valor,
  etiqueta,
  testId,
  soloIcono = false,
}: {
  valor: string;
  etiqueta: string;
  testId: string;
  soloIcono?: boolean;
}) {
  const t = useT();
  const [copiada, setCopiada] = useState(false);

  // stopPropagation: en la lista el botón vive dentro de una fila clickeable,
  // y copiar no tiene que abrir el detalle.
  async function copiar(event: React.MouseEvent) {
    event.stopPropagation();
    await navigator.clipboard.writeText(valor);
    setCopiada(true);
    setTimeout(() => setCopiada(false), 1500);
  }

  return (
    <Button
      variant={soloIcono ? "ghost" : "outline"}
      size={soloIcono ? "icon-sm" : "sm"}
      onClick={copiar}
      aria-label={etiqueta}
      data-testid={testId}
    >
      {copiada ? <Check /> : <Copy />}
      {!soloIcono &&
        (copiada ? t("clavesApi.creada.copiada") : t("clavesApi.creada.copiar"))}
    </Button>
  );
}

// Una de las dos claves del par recién creado: título, valor completo,
// copiar y para qué se usa. La secreta lleva el aviso en tono de advertencia.
export function BloqueClave({
  titulo,
  valor,
  ayuda,
  advertencia,
  testId,
}: {
  titulo: string;
  valor: string;
  ayuda: string;
  advertencia?: boolean;
  testId: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{titulo}</span>
      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 ring-1 ring-foreground/10">
        <KeyRound className="size-4 shrink-0 text-muted-foreground" />
        <code className="flex-1 font-mono text-xs break-all" data-testid={testId}>
          {valor}
        </code>
        <BotonCopiar valor={valor} etiqueta={titulo} testId={`copiar-${testId}`} />
      </div>
      <p
        className={cn(
          "flex items-start gap-2 text-xs",
          advertencia ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {advertencia && <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />}
        {ayuda}
      </p>
    </div>
  );
}

// Lista editable de dominios permitidos para la clave pública (alta y detalle).
// Se agrega con Enter o con el botón; cada dominio se puede quitar. Vacío =
// cualquier dominio, y la ayuda lo dice para que no parezca un campo olvidado.
export function DominiosPermitidos({
  dominios,
  onChange,
}: {
  dominios: string[];
  onChange: (dominios: string[]) => void;
}) {
  const t = useT();
  const [texto, setTexto] = useState("");
  const [error, setError] = useState(false);

  function agregar() {
    const origen = normalizarOrigen(texto);
    if (!origen) {
      setError(true);
      return;
    }
    if (!dominios.includes(origen)) onChange([...dominios, origen]);
    setTexto("");
    setError(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="clave-dominio">
        {t("clavesApi.dominios.titulo")}{" "}
        <span className="font-normal text-muted-foreground">
          ({t("common.comunes.opcional").toLowerCase()})
        </span>
      </Label>
      <div className="flex gap-2">
        <Input
          id="clave-dominio"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              agregar();
            }
          }}
          placeholder={t("clavesApi.dominios.placeholder")}
          aria-invalid={error || undefined}
          data-testid="clave-api-dominio"
        />
        <Button
          type="button"
          variant="outline"
          onClick={agregar}
          disabled={!texto.trim()}
          data-testid="agregar-dominio"
        >
          {t("common.acciones.agregar")}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive">{t("clavesApi.dominios.invalido")}</p>
      )}
      {dominios.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {dominios.map((d) => (
            <li key={d}>
              <Badge variant="outline" className="h-6 gap-1 pr-1 font-mono">
                {d}
                <button
                  type="button"
                  onClick={() => onChange(dominios.filter((x) => x !== d))}
                  aria-label={t("clavesApi.dominios.quitar", { dominio: d })}
                  className="rounded-sm text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        {dominios.length === 0
          ? t("clavesApi.dominios.ayudaVacio")
          : t("clavesApi.dominios.ayuda")}
      </p>
    </div>
  );
}
