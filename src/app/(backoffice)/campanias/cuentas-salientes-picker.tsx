"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";
import { MultiEntityCombobox } from "./multi-entity-combobox";
import { useT } from "@/lib/i18n";
import { cuentas, type Cuenta } from "@/lib/mock-data";

// Ícono por canal para que el tipo de cuenta se lea de un vistazo
// (feedback de producto 2026-07-16).
const iconoPorTipo: Record<Cuenta["tipo"], LucideIcon> = {
  Llamada: Phone,
  WhatsApp: MessageCircle,
  SMS: MessageSquareText,
  Email: Mail,
};

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
      items={cuentas.map((c) => ({
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
