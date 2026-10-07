"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { configuracionItems, configuracionNav } from "@/lib/nav";
import { puedeClaves } from "@/lib/mock-claves-api";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Sección Configuración del tenant: submenú propio en una fila arriba y la
// pantalla del ítem debajo. Arriba y no a la izquierda para que las pantallas
// de adentro (tablas anchas) tengan todo el ancho. Cada ítem se ve solo con
// su permiso.
export default function ConfiguracionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useT();
  const pathname = usePathname();
  const items = configuracionItems.filter((item) => puedeClaves(item.permiso));

  return (
    <div className="flex flex-col">
      <nav
        aria-label={t(configuracionNav.labelKey)}
        // El <main> no tiene padding arriba (lo pone el PageHeader): acá se
        // suma el mismo, para que el submenú no quede pegado al header.
        className="flex flex-col gap-2 pt-4 sm:pt-6"
      >
        <span className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t(configuracionNav.labelKey)}
        </span>
        <ul className="flex gap-1 overflow-x-auto">
          {items.map((item) => {
            const activo = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={activo ? "page" : undefined}
                  data-testid={`config-${item.href.split("/").pop()}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm whitespace-nowrap transition-colors",
                    activo
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {t(item.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
