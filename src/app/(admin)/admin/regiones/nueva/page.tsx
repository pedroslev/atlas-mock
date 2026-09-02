"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/lib/i18n";

// Onboarding (alta) de región de despliegue — mismo patrón que el onboarding
// de tenant (admin/tenants/nuevo). Campos según el DER de la base Global
// (ADR-BD-001, tabla `regions`): code, region_url, annotations.
// Mock: no persiste; al "crear" vuelve al listado (PRODUCT.md).
export default function NuevaRegionPage() {
  const router = useRouter();
  const t = useT();
  const [code, setCode] = useState("");
  const [regionUrl, setRegionUrl] = useState("");
  const [annotations, setAnnotations] = useState("");

  const puedeCrear = code.trim().length > 0 && regionUrl.trim().length > 0;

  function crear() {
    if (!puedeCrear) return;
    // Sin backend: el alta se simula navegando de vuelta al listado.
    router.push("/admin/regiones");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("admin.regiones.nueva")}
        description={t("admin.regiones.nuevaDescripcion")}
        backHref="/admin/regiones"
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{t("admin.regiones.form.datosRegion")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="region-code">{t("admin.regiones.col.codigo")}</Label>
            <Input
              id="region-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("admin.regiones.form.codigoPlaceholder")}
              className="font-mono"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {t("admin.regiones.form.codigoAyuda")}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="region-url">{t("admin.regiones.col.url")}</Label>
            <Input
              id="region-url"
              value={regionUrl}
              onChange={(e) => setRegionUrl(e.target.value)}
              placeholder={t("admin.regiones.form.urlPlaceholder")}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              {t("admin.regiones.form.urlAyuda")}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="region-annotations">
              {t("admin.regiones.col.anotaciones")}
            </Label>
            <Textarea
              id="region-annotations"
              value={annotations}
              onChange={(e) => setAnnotations(e.target.value)}
              placeholder={t("common.comunes.opcional")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/admin/regiones">{t("common.acciones.cancelar")}</Link>
        </Button>
        <Button onClick={crear} disabled={!puedeCrear}>
          {t("admin.regiones.form.crearRegion")}
        </Button>
      </div>
    </div>
  );
}
