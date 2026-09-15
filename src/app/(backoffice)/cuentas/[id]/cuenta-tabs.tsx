"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowEditor } from "@/components/workflow/workflow-editor";
import { UsoDeLinea } from "@/components/cuentas/uso-de-linea";
import { useT } from "@/lib/i18n";
import type { Cuenta, UsoDeLinea as TipoUso } from "@/lib/mock-data";

// Cuerpo del detalle de cuenta. Vive en un componente de cliente porque los
// placeholders exigen strings traducidos (`useT()`), mientras la page sigue
// siendo un Server Component con generateStaticParams.
export function CuentaTabs({
  cuenta,
  campanias,
}: {
  cuenta: Cuenta;
  campanias: { id: string; nombre: string }[];
}) {
  const t = useT();
  const [uso, setUso] = useState<TipoUso | undefined>(cuenta.uso);

  // La derivación define a qué campaña va cada llamada que ENTRA. Si la línea
  // solo origina llamadas, la solapa no aplica y no se muestra.
  const recibeLlamadas = uso === "entrante" || uso === "ambas";

  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">{t("cuentas.tab.general")}</TabsTrigger>
        {recibeLlamadas && (
          <TabsTrigger value="workflow">
            {t("cuentas.tab.derivacion")}
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>{t("cuentas.datos.titulo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">{t("common.comunes.nombre")}</Label>
              <Input id="nombre" defaultValue={cuenta.nombre} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tipo">{t("cuentas.campo.tipo")}</Label>
              <Input
                id="tipo"
                value={t("cuentas.tipo.telefoniaSip")}
                readOnly
                disabled
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descripcion">
                {t("common.comunes.descripcion")}
              </Label>
              <Textarea
                id="descripcion"
                defaultValue={cuenta.descripcion}
                placeholder={t("cuentas.campo.descripcionPlaceholder")}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4">
          <UsoDeLinea
            uso={uso}
            onUsoChange={setUso}
            defaultModoSalida={cuenta.modoSalida}
            defaultLinea={cuenta.identificador}
            defaultLineaSalida={cuenta.lineaSalida}
          />
        </div>
      </TabsContent>

      <TabsContent value="workflow">
        <Card>
          <CardHeader>
            <CardTitle>{t("cuentas.derivacion.titulo")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("cuentas.derivacion.descripcion")}
            </p>
          </CardHeader>
          <CardContent>
            <WorkflowEditor
              initialWorkflow={cuenta.workflow}
              campanias={campanias}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
