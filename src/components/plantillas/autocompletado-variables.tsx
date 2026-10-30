"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  coordenadasEnTextarea,
  detectarDisparo,
  type DisparoVariable,
} from "@/lib/autocompletar-variables";
import {
  PREFIJO_CLIENTE,
  nombreVariable,
  type VariablePlantilla,
} from "@/lib/plantillas";

type Campo = HTMLTextAreaElement | HTMLInputElement;

const ANCHO_LISTA = 288;

/**
 * Autocompletado de variables de cliente para un campo de texto (textarea o
 * input). Al escribir el prefijo del cliente al comienzo de una palabra (con
 * "{{" opcional) se despliega la lista de `variables`; al elegir una, lo
 * escrito se reemplaza por el marcador canónico `{{cliente.<clave>}}`.
 *
 * El campo usa `evaluar` (en onChange/onSelect), `onKeyDown` y `cerrar` (en
 * onBlur); `lista` se dibuja dentro de un contenedor `relative` que envuelve
 * al campo.
 */
export function useAutocompletadoVariables({
  setValor,
  variables,
  alElegir,
}: {
  setValor: (valor: string) => void;
  /** Variables de cliente ya filtradas por el permiso Ver del grupo de trabajo. */
  variables: VariablePlantilla[];
  /** Aviso al elegir, con la posición final del cursor (por si el padre la guarda). */
  alElegir?: (cursor: number) => void;
}) {
  const t = useT();
  // El prefijo depende del idioma; el canónico "cliente." vale siempre.
  const prefijoLocal = t("plantillas.variables.prefijoCliente");
  const prefijos = useMemo(
    () => Array.from(new Set([prefijoLocal, PREFIJO_CLIENTE])),
    [prefijoLocal]
  );
  const [disparo, setDisparo] = useState<DisparoVariable | null>(null);
  const [indice, setIndice] = useState(0);
  const [posicion, setPosicion] = useState({ top: 0, left: 0 });
  const campoRef = useRef<Campo | null>(null);
  const activoRef = useRef<HTMLButtonElement | null>(null);

  // Variables que coinciden con lo escrito después del punto (por clave o nombre).
  const opciones = useMemo(() => {
    if (!disparo) return [];
    const q = disparo.consulta.toLowerCase();
    return variables.filter((v) => {
      const sufijo = v.clave.slice(PREFIJO_CLIENTE.length).toLowerCase();
      return sufijo.includes(q) || (v.nombre ?? "").toLowerCase().includes(q);
    });
  }, [disparo, variables]);
  const abierta = disparo !== null && opciones.length > 0;

  // La opción activa siempre queda a la vista al navegar con las flechas.
  useEffect(() => {
    activoRef.current?.scrollIntoView({ block: "nearest" });
  }, [indice, abierta]);

  /** Revisa lo que hay antes del cursor y abre, actualiza o cierra la lista. */
  function evaluar(el: Campo) {
    campoRef.current = el;
    const cursor = el.selectionStart ?? el.value.length;
    const nuevo = detectarDisparo(el.value, cursor, prefijos);
    setDisparo(nuevo);
    setIndice(0);
    if (!nuevo) return;
    if (el instanceof HTMLTextAreaElement) {
      const c = coordenadasEnTextarea(el, nuevo.inicio);
      // Que la lista no se salga por la derecha del cuadro.
      setPosicion({ top: c.top + 4, left: Math.max(0, Math.min(c.left, el.clientWidth - ANCHO_LISTA)) });
    } else {
      setPosicion({ top: el.offsetHeight + 4, left: 0 });
    }
  }

  function cerrar() {
    setDisparo(null);
  }

  /** Reemplaza lo escrito por el marcador canónico y deja el cursor después. */
  function elegir(v: VariablePlantilla) {
    const el = campoRef.current;
    if (!el || !disparo) return;
    const marca = `{{${v.clave}}}`;
    const valor = el.value.slice(0, disparo.inicio) + marca + el.value.slice(disparo.fin);
    const cursor = disparo.inicio + marca.length;
    setValor(valor);
    setDisparo(null);
    alElegir?.(cursor);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  function onKeyDown(e: KeyboardEvent<Campo>) {
    if (!abierta) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndice((i) => (i + 1) % opciones.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndice((i) => (i - 1 + opciones.length) % opciones.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      elegir(opciones[Math.min(indice, opciones.length - 1)]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cerrar();
    }
  }

  const lista = abierta ? (
    <div
      role="listbox"
      data-testid="plantilla-variables-cliente-sugerencias"
      className="absolute z-50 max-h-56 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{ top: posicion.top, left: posicion.left, width: ANCHO_LISTA }}
    >
      {opciones.map((v, i) => (
        <button
          key={v.clave}
          ref={i === indice ? activoRef : undefined}
          type="button"
          role="option"
          aria-selected={i === indice}
          data-testid={`plantilla-variable-sugerida-${v.clave}`}
          // mousedown no le saca el foco al campo; la selección se hace en click.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => elegir(v)}
          onMouseEnter={() => setIndice(i)}
          className={cn(
            "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
            i === indice && "bg-accent text-accent-foreground"
          )}
        >
          <span className="flex-1 truncate">{nombreVariable(v.clave, t)}</span>
          <span className="max-w-[45%] truncate text-xs text-muted-foreground">{v.ejemplo}</span>
        </button>
      ))}
    </div>
  ) : null;

  return { evaluar, onKeyDown, cerrar, lista };
}
