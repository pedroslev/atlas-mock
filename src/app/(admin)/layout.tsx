import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

// Shell propio de la Administración Mitrol (consola interna). Mismo patrón que
// el layout del backoffice: SidebarProvider en flex-col para que el header vaya
// punta a punta y el sidebar arranque debajo. No toca el layout del backoffice.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-screen w-full flex-col">
      <AdminHeader />
      <div className="flex min-h-0 flex-1">
        <AdminSidebar />
        <SidebarInset>
          <main className="flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
