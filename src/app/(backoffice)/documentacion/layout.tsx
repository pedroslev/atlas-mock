import { DocNav } from "@/components/docs/doc-nav";

// Marco de la documentación: menú categorizado a la izquierda y la página a la
// derecha (cada página trae su propio encabezado).
export default function DocumentacionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0 lg:flex-row lg:gap-8">
      <DocNav />
      <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
    </div>
  );
}
