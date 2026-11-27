"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { configItemVisible, configuracionItems, configuracionNav, documentacionNav, navItems } from "@/lib/nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { puedeClaves } from "@/lib/mock-claves-api";
import { useT } from "@/lib/i18n";

export function AppSidebar() {
  const pathname = usePathname();
  const t = useT();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="shadow-[2px_0_10px_-4px_rgb(0,0,0,0.12)]">
      <SidebarHeader>
        <div className="flex items-center justify-end px-1 py-1 group-data-[collapsible=icon]:justify-center">
          <ActionTooltip
            label={
              state === "expanded"
                ? t("common.header.sidebarContraer")
                : t("common.header.sidebarExpandir")
            }
          >
            <SidebarTrigger data-tour="sidebar-toggle" />
          </ActionTooltip>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const label = t(item.labelKey);
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`) ||
                  // Los proyectos se gestionan desde Campañas (agrupadas por
                  // proyecto), así que sus rutas iluminan esa sección.
                  (item.href === "/campanias" &&
                    pathname.startsWith("/proyectos"));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                      data-tour={`nav-${item.href.slice(1)}`}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Documentación y Configuración van al pie, separadas de las
          secciones operativas. Configuración es del tenant entero y solo
          aparece si el usuario puede ver alguno de sus ítems. */}
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/documentacion")}
              tooltip={t(documentacionNav.labelKey)}
              data-testid="nav-documentacion"
            >
              <Link href={documentacionNav.href}>
                <documentacionNav.icon />
                <span>{t(documentacionNav.labelKey)}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Configuración abre un desplegable con sus pantallas, cada una según su permiso. */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  isActive={pathname.startsWith(configuracionNav.href)}
                  tooltip={t(configuracionNav.labelKey)}
                  data-testid="nav-configuracion"
                >
                  <configuracionNav.icon />
                  <span>{t(configuracionNav.labelKey)}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end">
                {configuracionItems
                  .filter((item) => configItemVisible(item, puedeClaves))
                  .map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className="whitespace-nowrap"
                        data-testid={`nav-${item.href.split("/").pop()}`}
                      >
                        <item.icon />
                        {t(item.labelKey)}
                      </Link>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
