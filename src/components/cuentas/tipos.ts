import { Headset, MessageSquare, Phone, Video } from "lucide-react";
import type { Cuenta } from "@/lib/mock-data";

// Tipos de cuenta que gestiona el ADM de cuentas (Llamada = `sipcall` en la
// base; Chat, Videollamada y Webcall son los canales digitales; Webcall es la llamada de voz por web, sin carrier). Un solo lugar para el
// ícono y la clave de traducción, que usan el alta, el detalle y el listado.
export type TipoCuenta = Extract<Cuenta["tipo"], "Llamada" | "Chat" | "Videollamada" | "Webcall">;

export const TIPOS_CUENTA: { value: TipoCuenta; icon: typeof Phone; tKey: string }[] = [
  { value: "Llamada", icon: Phone, tKey: "cuentas.tipo.telefoniaSip" },
  { value: "Chat", icon: MessageSquare, tKey: "cuentas.tipo.chat" },
  { value: "Videollamada", icon: Video, tKey: "cuentas.tipo.videollamada" },
  { value: "Webcall", icon: Headset, tKey: "cuentas.tipo.webcall" },
];

// Solo la telefonía tiene "uso de la línea" (número, entrante/saliente).
export const esTelefonia = (tipo: string) => tipo === "Llamada";
