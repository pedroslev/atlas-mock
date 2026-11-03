"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { Kbd } from "@/components/ui/kbd";
import { ATAJOS, type DefinicionAtajo, type NombreAtajo } from "@/lib/atajos";
import { useIsMac } from "@/lib/pad-mock/use-is-mac";
import { cn } from "@/lib/utils";

// Los componentes compartidos con Hermes y Zeus declaran su atajo igual, pero
// solo se muestra donde responde: dentro de AtajosDeBotones.
const AtajosActivos = createContext(false);

export function useAtajosActivos() {
  return useContext(AtajosActivos);
}

// Etiqueta del atajo dentro de un botón con texto (ver Button, prop `atajo`).
export function EtiquetaAtajo({ atajo, className }: { atajo: NombreAtajo; className?: string }) {
  const isMac = useIsMac();
  const activos = useAtajosActivos();
  if (!activos) return null;
  return <Kbd className={cn("ml-1 max-sm:hidden", className)}>{ATAJOS[atajo].etiqueta(isMac)}</Kbd>;
}

function esCampo(el: Element | null) {
  return (
    !!el &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.tagName === "SELECT" ||
      (el as HTMLElement).isContentEditable)
  );
}

function coincide(e: KeyboardEvent, a: DefinicionAtajo) {
  return (
    e.code === a.code &&
    (e.ctrlKey || e.metaKey) === !!a.mod &&
    e.altKey === !!a.alt &&
    e.shiftKey === !!a.shift
  );
}

function visible(el: HTMLElement) {
  return el.getClientRects().length > 0;
}

function habilitado(el: HTMLElement) {
  return !el.hasAttribute("disabled") && el.getAttribute("aria-disabled") !== "true";
}

// La fila de un botón que se repite: la fila de tabla, el ítem de lista o la
// marca `data-fila`; si no hay ninguna, lo que lo contiene directamente.
function filaDe(el: HTMLElement) {
  return el.closest("tr, li, [data-fila]") ?? el.parentElement;
}

// Con un modal abierto solo vale lo que está adentro de él. Un menú o un
// desplegable abiertos se quedan con el teclado.
function capaActiva(): ParentNode | null {
  const desplegables = document.querySelectorAll<HTMLElement>('[role="menu"], [role="listbox"]');
  if (Array.from(desplegables).some(visible)) return null;
  const capas = document.querySelectorAll(
    '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [data-capa-atajos]',
  );
  return capas.length > 0 ? capas[capas.length - 1] : document;
}

function escPropio() {
  const zonas = document.querySelectorAll<HTMLElement>("[data-esc-propio]");
  return Array.from(zonas).some(visible);
}

// Los menús desplegables abren con pointerdown y no con clic.
function activar(boton: HTMLElement) {
  if (boton.getAttribute("aria-haspopup") === "menu") {
    boton.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0 }));
  }
  boton.click();
}

// Qué botón responde. Si se repite en la pantalla, el más cercano al foco; si
// el foco no define uno solo, ninguno: nunca se elige al azar.
function resolver(nombre: NombreAtajo, capa: ParentNode, activo: Element | null) {
  const candidatos = Array.from(
    capa.querySelectorAll<HTMLElement>(`[data-atajo="${nombre}"]`),
  ).filter(visible);

  const deFila = candidatos.filter((b) => b.hasAttribute("data-atajo-fila"));
  // Una fila puede estar dentro de otra (una opción dentro de un nodo del
  // flujo): responde la más interna.
  let enFoco: HTMLElement | null = null;
  for (const b of deFila) {
    const fila = filaDe(b);
    if (!activo || !fila?.contains(activo)) continue;
    if (!enFoco || filaDe(enFoco)?.contains(fila)) enFoco = b;
  }
  if (enFoco) return enFoco;

  const resto = candidatos.filter((b) => !b.hasAttribute("data-atajo-fila"));
  if (resto.length <= 1) return resto[0] ?? null;

  for (let el = activo?.parentElement; el; el = el.parentElement) {
    const cercanos = resto.filter((b) => el!.contains(b));
    if (cercanos.length === 1) return cercanos[0];
    if (cercanos.length > 1) return null;
  }
  return null;
}

// Un solo escucha para toda la app: cada botón declara su atajo con
// `data-atajo` y acá se hace clic en el que corresponda, así el atajo hace
// siempre lo mismo que el botón (incluido no hacer nada si está deshabilitado).
export function AtajosDeBotones({ children }: { children: ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      const capa = capaActiva();
      if (!capa) return;
      const activo = document.activeElement;
      const enCampo = esCampo(activo);

      // Una misma combinación puede tener un uso distinto en otra pantalla.
      for (const [nombre, atajo] of Object.entries(ATAJOS) as [NombreAtajo, DefinicionAtajo][]) {
        if (!coincide(e, atajo)) continue;
        if (atajo.soloEnCampo ? !enCampo : enCampo && !atajo.enCampo) continue;
        // Esc en un modal lo resuelve el propio modal, y en el editor de flujo,
        // el flujo: cancela lo que se está haciendo, no sale de la pantalla.
        if (nombre === "cancelar" && (capa !== document || escPropio())) continue;

        const boton = resolver(nombre, capa, activo);
        if (!boton) continue;
        e.preventDefault();
        // Antes que los atajos del navegador y del resto de la app (Cmd+B del
        // menú lateral, Cmd+K del buscador) cuando el botón es el que responde.
        e.stopImmediatePropagation();
        if (habilitado(boton)) activar(boton);
        return;
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);
  return <AtajosActivos.Provider value>{children}</AtajosActivos.Provider>;
}
