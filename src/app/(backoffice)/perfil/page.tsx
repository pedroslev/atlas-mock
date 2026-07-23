"use client";

import { Mail, Calendar, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { agentes } from "@/lib/mock-data";
import { LOCALES, LOCALE_META, useLocale, useT, type Locale } from "@/lib/i18n";

// Usuario "actual" = el mismo que muestra el avatar del header (Marina
// Acosta). SOLO visual: sin auth ni backend.
const usuarioActual = agentes[0];

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Filas de "Datos de la cuenta": la clave de label/valor se resuelve en el
// render (el diccionario es de cliente). El email sale del mock y no se traduce.
const datosCuenta = [
  { icon: Mail, labelKey: "perfil.cuenta.email", valor: usuarioActual.email },
  { icon: Calendar, labelKey: "perfil.cuenta.alta", valorKey: "perfil.cuenta.altaValor" },
  {
    icon: Clock,
    labelKey: "perfil.cuenta.ultimoAcceso",
    valorKey: "perfil.cuenta.ultimoAccesoValor",
  },
] as const;

export default function PerfilPage() {
  const t = useT();
  // Mismo store (localStorage + evento) que el selector del header: cambiar el
  // idioma acá se refleja allá y viceversa, sin estado local que se desincronice.
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.header.miPerfil")}
        description={t("perfil.descripcion")}
        actions={<Button>{t("perfil.guardarCambios")}</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tarjeta de identidad. */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <Avatar className="size-20">
              <AvatarFallback className="bg-primary text-xl font-semibold text-primary-foreground">
                {iniciales(usuarioActual.nombre)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground">
                {usuarioActual.nombre}
              </h2>
              <p className="text-sm text-muted-foreground">
                {usuarioActual.email}
              </p>
            </div>
            <Badge variant={usuarioActual.habilitado ? "success" : "neutral"}>
              {usuarioActual.habilitado
                ? t("perfil.habilitado")
                : t("perfil.deshabilitado")}
            </Badge>
          </CardContent>
        </Card>

        {/* Datos de la cuenta. */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("perfil.cuenta.titulo")}</CardTitle>
            <CardDescription>{t("perfil.cuenta.descripcion")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {datosCuenta.map((dato, i) => (
              <div key={dato.labelKey}>
                <div className="flex items-center gap-3 py-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <dato.icon className="size-4" />
                  </span>
                  <span className="flex-1 text-sm text-muted-foreground">
                    {t(dato.labelKey)}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {"valor" in dato ? dato.valor : t(dato.valorKey)}
                  </span>
                </div>
                {i < datosCuenta.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Preferencias. */}
      <Card>
        <CardHeader>
          <CardTitle>{t("perfil.preferencias.titulo")}</CardTitle>
          <CardDescription>{t("perfil.preferencias.descripcion")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="idioma">{t("common.header.idioma")}</Label>
              {/* Cableado de verdad contra el store de i18n: lista LOCALES y
                  escribe con setLocale, así queda sincronizado con el selector
                  del header. Los labels son endónimos (no se traducen). */}
              <Select
                value={locale}
                onValueChange={(value) => setLocale(value as Locale)}
              >
                <SelectTrigger id="idioma" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCALES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {LOCALE_META[code].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tema">{t("perfil.preferencias.tema")}</Label>
              <Select defaultValue="sistema">
                <SelectTrigger id="tema" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claro">
                    {t("perfil.preferencias.temaClaro")}
                  </SelectItem>
                  <SelectItem value="oscuro">
                    {t("perfil.preferencias.temaOscuro")}
                  </SelectItem>
                  <SelectItem value="sistema">
                    {t("perfil.preferencias.temaSistema")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
