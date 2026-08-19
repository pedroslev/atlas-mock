import type { Metadata } from "next";
import { SistemaExternoView } from "@/components/sistema-externo/sistema-externo-view";
import { sistemasExternosMock, SISTEMA_EXTERNO_DEFAULT } from "@/lib/pad-mock/sistema-externo-data";

export const metadata: Metadata = {
  title: "Sistema externo (mock)",
};

// Ruta fuera de /pad-mock a propósito: sin PadHeader ni el menú de Hermes,
// para que se sienta un sistema aparte cuando se abre en una pestaña nueva
// ("blank") o se embebe en un <iframe> dentro de una interacción ("frame") —
// ver paginasExternas/accesosRapidosMock en pad-mock/data.ts.
export default async function SistemaExternoPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const config = (id && sistemasExternosMock[id]) || SISTEMA_EXTERNO_DEFAULT;

  return (
    <div className="h-screen w-full">
      <SistemaExternoView config={config} />
    </div>
  );
}
