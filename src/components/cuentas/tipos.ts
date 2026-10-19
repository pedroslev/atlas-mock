import { MessageSquare, Phone, Video } from "lucide-react";
import type { Cuenta } from "@/lib/mock-data";

// Tipos de cuenta que gestiona el ADM de cuentas (Llamada = `sipcall` en la
// base; Chat y Videollamada son los canales digitales). Un solo lugar para el
// ícono y la clave de traducción, que usan el alta, el detalle y el listado.
export type TipoCuenta = Extract<Cuenta["tipo"], "Llamada" | "Chat" | "Videollamada">;

export const TIPOS_CUENTA: { value: TipoCuenta; icon: typeof Phone; tKey: string }[] = [
  { value: "Llamada", icon: Phone, tKey: "cuentas.tipo.telefoniaSip" },
  { value: "Chat", icon: MessageSquare, tKey: "cuentas.tipo.chat" },
  { value: "Videollamada", icon: Video, tKey: "cuentas.tipo.videollamada" },
];

// Solo la telefonía tiene "uso de la línea" (número, entrante/saliente).
export const esTelefonia = (tipo: string) => tipo === "Llamada";
