// MOCK: abre el editor vacío, o con los datos de la original al duplicar; Crear plantilla no persiste.
// REAL: POST a olimpo-api (message_templates) con el cuerpo ya validado; ver plantilla-editor.tsx.

import { PlantillaEditor } from "@/components/plantillas/plantilla-editor";
import { plantillas } from "@/lib/mock-data";

export default async function NuevaPlantillaPage({
  searchParams,
}: {
  searchParams: Promise<{ duplicar?: string }>;
}) {
  const { duplicar } = await searchParams;
  return <PlantillaEditor initial={null} duplicarDe={plantillas.find((p) => p.id === duplicar)} />;
}
