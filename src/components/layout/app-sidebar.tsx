"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
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
import { navItems } from "@/lib/nav";
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
    </Sidebar>
  );
}
