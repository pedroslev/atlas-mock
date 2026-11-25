"use client";

// Caja de la consulta avanzada de Clientes (ATLAS-1186): se escribe una
// consulta estilo JQL, con sugerencias según la posición del cursor (campos,
// condiciones según el tipo del campo, valores conocidos, Y / O) y el error
// en lenguaje simple si algo no se entiende.

import { useMemo, useRef, useState } from "react";
import { CheckCheck, CircleHelp, Search, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useT } from "@/lib/i18n";
import { clientes } from "@/lib/mock-clientes";
import { sugerir } from "@/lib/consulta-clientes";
import { cn } from "@/lib/utils";

export function ConsultaAvanzada({
  valor,
  onChange,
  onBuscar,
  error,
  resultados,
  validar,
}: {
  valor: string;
  onChange: (v: string) => void;
  onBuscar: () => void;
  error: string | null;
  /** Cantidad de clientes de la última búsqueda (null si no se buscó). */
  resultados: number | null;
  /** En la estrategia el botón valida en lugar de buscar. */
  validar?: boolean;
}) {
  const t = useT();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [cursor, setCursor] = useState(valor.length);
  const [abierto, setAbierto] = useState(false);
  const [marcada, setMarcada] = useState(0);

  const { desde, opciones } = useMemo(() => sugerir(valor, cursor, clientes), [valor, cursor]);
  const mostrar = abierto && opciones.length > 0;

  function elegir(i: number) {
    const o = opciones[i];
    if (!o) return;
    const antes = valor.slice(0, desde);
    const despues = valor.slice(cursor).replace(/^\S*/, "");
    const espacio = antes && !/[\s(]$/.test(antes) ? " " : "";
    const nuevo = `${antes}${espacio}${o.insertar} ${despues.trimStart()}`;
    const pos = antes.length + espacio.length + o.insertar.length + 1;
    onChange(nuevo);
    setCursor(pos);
    setMarcada(0);
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(pos, pos);
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mostrar && e.key === "ArrowDown") {
      e.preventDefault();
      setMarcada((m) => (m + 1) % opciones.length);
    } else if (mostrar && e.key === "ArrowUp") {
      e.preventDefault();
      setMarcada((m) => (m - 1 + opciones.length) % opciones.length);
    } else if (mostrar && e.key === "Tab") {
      e.preventDefault();
      elegir(marcada);
    } else if (e.key === "Escape") {
      setAbierto(false);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setAbierto(false);
      onBuscar();
    }
  }

  const actualizarCursor = () => {
    setCursor(ref.current?.selectionStart ?? valor.length);
    setMarcada(0);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Textarea
          ref={ref}
          rows={2}
          spellCheck={false}
          className="min-h-16 font-mono text-sm"
          placeholder={t("clientes.consulta.placeholder")}
          aria-label={t("clientes.consulta.titulo")}
          aria-invalid={!!error || undefined}
          value={valor}
          onChange={(e) => {
            onChange(e.target.value);
            setCursor(e.target.selectionStart);
            setAbierto(true);
            setMarcada(0);
          }}
          onFocus={() => {
            actualizarCursor();
            setAbierto(true);
          }}
          onClick={actualizarCursor}
          onKeyUp={(e) => {
            if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) actualizarCursor();
          }}
          onBlur={() => setTimeout(() => setAbierto(false), 150)}
          onKeyDown={onKeyDown}
        />
        {mostrar && (
          <ul
            role="listbox"
            className="absolute left-0 top-full z-50 mt-1 max-h-64 w-80 max-w-full overflow-y-auto rounded-md border bg-popover p-1 text-sm shadow-md"
          >
            {opciones.map((o, i) => (
              <li
                key={`${o.texto}-${i}`}
                role="option"
                aria-selected={i === marcada}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded px-2 py-1",
                  i === marcada ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  elegir(i);
                }}
              >
                <span className="font-mono">{o.texto}</span>
                {o.detalle && <span className="text-xs text-muted-foreground">{o.detalle}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-h-5 items-center gap-2 text-xs">
          {error ? (
            <span className="flex items-center gap-1.5 text-destructive">
              <TriangleAlert className="size-3.5" />
              {error}
            </span>
          ) : resultados !== null ? (
            <span className="text-muted-foreground">
              {validar
                ? t("filtro.cumplenHoy", { n: resultados, total: clientes.length })
                : t("clientes.consulta.resultados", { n: resultados })}
            </span>
          ) : (
            <span className="text-muted-foreground">
              {t(validar ? "estrategias.filtro.teclas" : "clientes.consulta.teclas")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <CircleHelp />
                {t("clientes.consulta.ayuda")}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[26rem] max-w-[calc(100vw-2rem)] text-sm">
              <AyudaConsulta />
            </PopoverContent>
          </Popover>
          <Button size="sm" onClick={onBuscar}>
            {validar ? <CheckCheck /> : <Search />}
            {validar ? t("estrategias.filtro.validar") : t("clientes.consulta.buscar")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AyudaConsulta() {
  const t = useT();
  const ejemplos = [
    ['etiquetas EN ("MORA +90") Y "Días de mora" >= 60', "clientes.consulta.ej1"],
    ['Vencimiento >= hoy Y Vencimiento <= +7d', "clientes.consulta.ej2"],
    ['(Producto = "Tarjeta Visa" O Deuda > 500000) Y NO etiquetas EN (REFINANCIADO)', "clientes.consulta.ej3"],
    ['Apellido CONTIENE "fer" ORDENAR POR Deuda DESC', "clientes.consulta.ej4"],
  ];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground">{t("clientes.consulta.ayudaIntro")}</p>
      <ul className="flex flex-col gap-2">
        {ejemplos.map(([q, k]) => (
          <li key={k} className="flex flex-col gap-0.5">
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{q}</code>
            <span className="text-xs text-muted-foreground">{t(k)}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">{t("clientes.consulta.ayudaPalabras")}</p>
    </div>
  );
}
