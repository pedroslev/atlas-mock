"use client";

import { useSyncExternalStore } from "react";

// Lo que el editor del flujo le cuenta al botón «Confirmar» de la cuenta:
// cuántos nodos tienen algo sin conectar, y si hay que marcarlos en rojo en el
// lienzo. Es un store mínimo porque el editor (dentro de CuentaForm) y el botón
// (en la PageHeader de la página) no comparten un padre de cliente.
// Estado local únicamente, como el resto del editor (ver PRODUCT.md).
type EstadoConexiones = { sinConectar: number; mostrar: boolean };

let estado: EstadoConexiones = { sinConectar: 0, mostrar: false };
const oyentes = new Set<() => void>();
const emitir = () => oyentes.forEach((avisar) => avisar());

// El editor la llama cada vez que cambia el flujo.
export function fijarSinConectar(sinConectar: number) {
  if (sinConectar === estado.sinConectar) return;
  estado = { ...estado, sinConectar };
  emitir();
}

// Al tocar «Confirmar» con partes sin conectar, los nodos quedan marcados.
export function marcarSinConectar() {
  if (estado.mostrar) return;
  estado = { ...estado, mostrar: true };
  emitir();
}

// Al cerrar el editor, para que otra cuenta no herede las marcas.
export function reiniciarEstadoConexiones() {
  estado = { sinConectar: 0, mostrar: false };
  emitir();
}

const suscribir = (avisar: () => void) => {
  oyentes.add(avisar);
  return () => oyentes.delete(avisar);
};
const leer = () => estado;

export function useEstadoConexiones() {
  return useSyncExternalStore(suscribir, leer, leer);
}
