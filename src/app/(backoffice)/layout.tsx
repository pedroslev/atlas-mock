import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

// SidebarProvider ahora envuelve todo (header incluido) para que AppHeader
// tenga acceso a useSidebar() y pueda mostrar el trigger mobile — pero se
// fuerza flex-col para que el header siga punta a punta (todo el ancho) y
// el sidebar arranque debajo, no al costado.
export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-screen w-full flex-col">
      <AppHeader />
      <div className="flex min-h-0 flex-1">
        <AppSidebar />
        <SidebarInset>
          <main className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 sm:gap-6 sm:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
