"use client";

// MOCK: el nombre y la descripción del grupo se editan en memoria.
// REAL: PATCH del grupo en message_template_groups (olimpo-api).

import { CampoUnico } from "@/components/layout/campos-unicos";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/lib/i18n";

// Datos del grupo (nombre y descripción), igual que en Clasificaciones.
export function DatosGrupoPlantillas({
  nombre,
  descripcion,
  existentes,
}: {
  nombre: string;
  descripcion?: string;
  existentes: string[];
}) {
  const t = useT();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{t("plantillas.detalle.datos")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombre">{t("common.comunes.nombre")}</Label>
          <CampoUnico id="nombre" existentes={existentes} defaultValue={nombre} obligatorio />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descripcion">{t("common.comunes.descripcion")}</Label>
          <Textarea
            id="descripcion"
            defaultValue={descripcion}
            rows={3}
            placeholder={t("common.comunes.opcional")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
