"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n";

export default function NuevaListaExclusionPage() {
  const t = useT();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("listas.nueva.titulo")}
        backHref="/listas-de-exclusion"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/listas-de-exclusion">
                {t("common.acciones.cancelar")}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/listas-de-exclusion">{t("listas.nueva.crear")}</Link>
            </Button>
          </>
        }
      />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{t("listas.datos")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">{t("common.comunes.nombre")}</Label>
            <Input id="nombre" placeholder={t("listas.placeholderNombre")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipo">{t("listas.col.tipo")}</Label>
            {/* `value` es el valor de dominio (ListaExclusion["tipo"]), en
                español y sin traducir; lo que se traduce es la etiqueta. */}
            <Select defaultValue="Exclusión de tareas">
              <SelectTrigger id="tipo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Exclusión de tareas">
                  {t("listas.tipo.tareas")}
                </SelectItem>
                <SelectItem value="Gubernamental">
                  {t("listas.tipo.gubernamental")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
