"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n";

// Sub-navegación de la sección Staff, visible en todas sus pantallas:
// "Usuarios" y "Grupos de permisos" (mismas tabs que usa Telefonía, pero cada
// una es una ruta).
export function StaffTabs() {
  const t = useT();
  const pathname = usePathname();
  const value = pathname.startsWith("/admin/staff/grupos") ? "grupos" : "usuarios";
  return (
    <Tabs value={value} className="mb-2">
      <TabsList>
        <TabsTrigger value="usuarios" asChild data-testid="staff-tab-usuarios">
          <Link href="/admin/staff">{t("staff.tabs.usuarios")}</Link>
        </TabsTrigger>
        <TabsTrigger value="grupos" asChild data-testid="staff-tab-grupos">
          <Link href="/admin/staff/grupos">{t("staff.tabs.grupos")}</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
