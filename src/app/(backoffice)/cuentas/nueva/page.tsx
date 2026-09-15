"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsoDeLinea } from "@/components/cuentas/uso-de-linea";
import { useT } from "@/lib/i18n";
import type { UsoDeLinea as TipoUso } from "@/lib/mock-data";

// Fase 0: solo cuentas telefónicas — sin selector de tipo ni campos de
// valorización (una llamada vale siempre 100). Feedback 2026-07-16.
export default function NuevaCuentaPage() {
  const t = useT();
  const [uso, setUso] = useState<TipoUso | undefined>();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("cuentas.nueva.titulo")}
        backHref="/cuentas"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/cuentas">{t("common.acciones.cancelar")}</Link>
            </Button>
            <Button asChild>
              <Link href="/cuentas">{t("cuentas.nueva.crear")}</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("cuentas.datos.titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">{t("common.comunes.nombre")}</Label>
            <Input
              id="nombre"
              placeholder={t("cuentas.campo.nombrePlaceholder")}
            />
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
            <Label htmlFor="descripcion">{t("common.comunes.descripcion")}</Label>
            <Textarea
              id="descripcion"
              placeholder={t("cuentas.campo.descripcionPlaceholder")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <UsoDeLinea uso={uso} onUsoChange={setUso} />
    </div>
  );
}
