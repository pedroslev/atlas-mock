"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EntityCombobox } from "@/app/(backoffice)/campanias/entity-combobox";
import { regions, regionLabel } from "@/lib/mock-admin";
import { countries } from "@/lib/countries";
import { useT } from "@/lib/i18n";

// Onboarding (alta) de tenant cloud con región asignada (Fase 0, ADR-BD-001).
// Mock: no persiste; al "crear" vuelve al listado (PRODUCT.md).
//
// A pedido: el cliente siempre nace INACTIVO — el switch de abajo arranca en
// false, y se activa después (desde este mismo formulario antes de crear, o
// más tarde desde el detalle / el "Activar" del listado).
export default function NuevoTenantPage() {
  const router = useRouter();
  const t = useT();
  const [name, setName] = useState("");
  const [regionId, setRegionId] = useState("");
  const [countryId, setCountryId] = useState<string | undefined>(undefined);
  const [active, setActive] = useState(false);

  const puedeCrear =
    name.trim().length > 0 && regionId.length > 0 && !!countryId;

  function crear() {
    if (!puedeCrear) return;
    // Sin backend: el alta se simula navegando de vuelta al listado.
    router.push("/admin/tenants");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("admin.clientes.onboarding")}
        description={t("admin.nuevo.descripcion")}
        backHref="/admin/tenants"
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{t("admin.form.datosCliente")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tenant-name">{t("common.comunes.nombre")}</Label>
            <Input
              id="tenant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("admin.form.nombrePlaceholder")}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tenant-region">{t("admin.campos.region")}</Label>
            <Select value={regionId} onValueChange={setRegionId}>
              <SelectTrigger id="tenant-region" className="w-full">
                <SelectValue placeholder={t("admin.form.regionPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.code} · {regionLabel(region, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("admin.form.regionAyuda")}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tenant-country">{t("admin.campos.pais")}</Label>
            <EntityCombobox
              id="tenant-country"
              items={countries}
              value={countryId}
              onChange={setCountryId}
              placeholder={t("admin.form.paisPlaceholder")}
              searchPlaceholder={t("admin.form.paisBuscar")}
              emptyLabel={t("admin.form.paisVacio")}
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-lg ring-1 ring-foreground/10 p-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="tenant-active">
                {t("admin.form.clienteActivo")}
              </Label>
              <span className="text-xs text-muted-foreground">
                {t("admin.form.clienteActivoAyuda")}
              </span>
            </div>
            <Switch
              id="tenant-active"
              checked={active}
              onCheckedChange={setActive}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/admin/tenants">{t("common.acciones.cancelar")}</Link>
        </Button>
        <Button onClick={crear} disabled={!puedeCrear}>
          {t("admin.form.crearCliente")}
        </Button>
      </div>
    </div>
  );
}
