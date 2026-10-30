// MOCK: abre el editor vacío; Crear plantilla no persiste.
// REAL: POST a olimpo-api (message_templates) con el cuerpo ya validado; ver plantilla-editor.tsx.

import { PlantillaEditor } from "@/components/plantillas/plantilla-editor";

export default function NuevaPlantillaPage() {
  return <PlantillaEditor initial={null} />;
}
