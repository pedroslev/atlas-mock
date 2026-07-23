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
} from "@/components/ui/sidebar";
import { adminNavItems } from "@/components/admin/admin-nav";
import { useT } from "@/lib/i18n";

// Sidebar blanco de la Administración Mitrol — misma estructura que el
// app-sidebar del backoffice (primitivo Sidebar, colapsable a íconos), con las
// secciones internas: Tenants, Regiones, Facturación.
export function AdminSidebar() {
  const pathname = usePathname();
  const t = useT();

  return (
    <Sidebar
      collapsible="icon"
      className="shadow-[2px_0_10px_-4px_rgb(0,0,0,0.12)]"
    >
      <SidebarHeader>
        <div className="flex items-center justify-end px-1 py-1 group-data-[collapsible=icon]:justify-center">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const label = t(item.labelKey);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={label}>
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
