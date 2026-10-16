"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  MessageSquare,
  MessageSquareText,
  Video,
  type LucideIcon,
} from "lucide-react";
import { MultiEntityCombobox } from "./multi-entity-combobox";
import { useT } from "@/lib/i18n";
import { cuentas, type Cuenta } from "@/lib/mock-data";

// Ícono por canal para que el tipo de cuenta se lea de un vistazo
// (feedback de producto 2026-07-16).
const iconoPorTipo: Record<Cuenta["tipo"], LucideIcon> = {
  Llamada: Phone,
  Chat: MessageSquare,
  Videollamada: Video,
  WhatsApp: MessageCircle,
  SMS: MessageSquareText,
  Email: Mail,
};

// REGLA (la implementación real debe respetarla): solo se ofrecen cuentas
// SIP (`sipcall`) con uso "saliente" u "omnicanal/ambas". Chat y videollamada
// son siempre inbound (el cliente inicia la interacción), así que una campaña
// nunca origina por ellas; una SIP "entrante" tampoco puede originar. Filtrar
// en el backend también, no solo en este selector.
const cuentasSalientes = cuentas.filter(
  (c) => c.tipo === "Llamada" && (c.uso === "saliente" || c.uso === "ambas")
);

// Picker de cuentas salientes asociadas a la campaña (campaigns.outbound
// account ids, N:N) — estado local únicamente, sin persistencia (ver
// PRODUCT.md). Campo opcional: una campaña puede no tener cuentas todavía.
export function CuentasSalientesPicker({
  initialIds = [],
}: {
  initialIds?: string[];
}) {
  const t = useT();
  const [ids, setIds] = useState<string[]>(initialIds);

  return (
    <MultiEntityCombobox
      id="cuentas-salientes"
      items={cuentasSalientes.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        icon: iconoPorTipo[c.tipo],
      }))}
      value={ids}
      onChange={setIds}
      placeholder={t("campanias.sinCuentasAsociadas")}
      searchPlaceholder={t("campanias.buscarCuenta")}
      emptyLabel={t("campanias.vacioCuenta")}
    />
  );
}
