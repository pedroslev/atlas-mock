"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/lib/i18n";

// Fase 0: solo cuentas telefónicas — sin selector de tipo ni campos de
// valorización (una llamada vale siempre 100). Feedback 2026-07-16.
export default function NuevaCuentaPage() {
  const t = useT();

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
            <Label htmlFor="identificador">{t("cuentas.campo.linea")}</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="identificador"
                placeholder="+54 11 4000-1000"
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <Label htmlFor="descripcion">{t("common.comunes.descripcion")}</Label>
            <Textarea
              id="descripcion"
              placeholder={t("cuentas.campo.descripcionPlaceholder")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
