"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  capacidadesClaveApi,
  capacidadesPublicas,
  generarClaveApi,
  PREFIJO_CLAVE_PUBLICA,
  PREFIJO_CLAVE_SECRETA,
  puedeClaves,
  useClavesApi,
  usuarioActual,
  type CapacidadClaveApi,
} from "@/lib/mock-claves-api";
import { useT } from "@/lib/i18n";
import { BloqueClave, DominiosPermitidos } from "../componentes";

// El par recién creado: vive solo en esta pantalla. Al salir se descarta y la
// secreta no se vuelve a ver nunca más.
type ParCreado = { publica: string; secreta: string };

// Alta de una clave de acceso API, en pantalla propia (el formulario creció
// demasiado para un modal). Dos momentos: el formulario (nombre, capacidades y
// dominios permitidos) y, al crear, el par de claves — única vez que se ve la
// secreta completa, y solo la ve quien la creó.
export default function NuevaClaveApiPage() {
  const t = useT();
  const { agregar } = useClavesApi();
  const [nombre, setNombre] = useState("");
  const [capacidades, setCapacidades] = useState<CapacidadClaveApi[]>([]);
  const [dominios, setDominios] = useState<string[]>([]);
  const [creada, setCreada] = useState<ParCreado | null>(null);

  const valido = nombre.trim() !== "" && capacidades.length > 0;

  function toggleCapacidad(capacidad: CapacidadClaveApi) {
    setCapacidades((actuales) =>
      actuales.includes(capacidad)
        ? actuales.filter((c) => c !== capacidad)
        : [...actuales, capacidad]
    );
  }

  function crear() {
    if (!valido) return;
    const par = {
      publica: generarClaveApi(PREFIJO_CLAVE_PUBLICA),
      secreta: generarClaveApi(PREFIJO_CLAVE_SECRETA),
    };
    agregar({
      id: `key-${Date.now()}`,
      nombre: nombre.trim(),
      clavePublica: par.publica,
      finalizacionSecreta: par.secreta.slice(-4),
      // Mismo orden que el catálogo, no el orden en que se tildaron.
      capacidades: capacidadesClaveApi.filter((c) => capacidades.includes(c)),
      dominiosPermitidos: dominios,
      creadaPor: usuarioActual.id,
      creadaEl: new Date().toISOString(),
      ultimoUso: null,
      revocada: null,
    });
    setCreada(par);
  }

  // Sin permiso de crear no hay formulario: se llega acá solo tipeando la URL.
  if (!puedeClaves("crear")) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("clavesApi.nueva.titulo")} backHref="/configuracion/claves-api" />
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          {t("clavesApi.sinPermiso")}
        </p>
      </div>
    );
  }

  if (creada) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("clavesApi.creada.titulo")}
          description={t("clavesApi.creada.descripcion")}
          actions={
            <Button asChild data-testid="clave-api-listo">
              <Link href="/configuracion/claves-api">{t("clavesApi.creada.listo")}</Link>
            </Button>
          }
        />
        <Card className="max-w-3xl">
          <CardContent className="flex flex-col gap-6">
            <BloqueClave
              titulo={t("clavesApi.clave.publica")}
              valor={creada.publica}
              ayuda={t("clavesApi.creada.publicaAyuda")}
              testId="clave-api-publica"
            />
            <BloqueClave
              titulo={t("clavesApi.clave.secreta")}
              valor={creada.secreta}
              ayuda={t("clavesApi.creada.secretaAyuda")}
              advertencia
              testId="clave-api-secreta"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("clavesApi.nueva.titulo")}
        description={t("clavesApi.nueva.descripcion")}
        backHref="/configuracion/claves-api"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/configuracion/claves-api">{t("common.acciones.cancelar")}</Link>
            </Button>
            <Button
              onClick={crear}
              disabled={!valido}
              data-testid="confirmar-crear-clave-api"
            >
              {t("clavesApi.crear")}
            </Button>
          </>
        }
      />

      <div className="flex max-w-3xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("clavesApi.nueva.datos")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clave-nombre">{t("common.comunes.nombre")}</Label>
              <Input
                id="clave-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={t("clavesApi.nueva.placeholderNombre")}
                data-testid="clave-api-nombre"
                autoFocus
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("clavesApi.nueva.capacidades")}</CardTitle>
            <CardDescription>{t("clavesApi.nueva.capacidadesAyuda")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col rounded-lg ring-1 ring-foreground/10">
              {capacidadesClaveApi.map((cap, index) => (
                <label
                  key={cap}
                  className={
                    "flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-muted/50" +
                    (index > 0 ? " border-t" : "")
                  }
                >
                  <Checkbox
                    className="mt-0.5"
                    checked={capacidades.includes(cap)}
                    onCheckedChange={() => toggleCapacidad(cap)}
                    data-testid={`capacidad-${cap}`}
                  />
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="flex items-center justify-between gap-2 text-sm font-medium">
                      {t(`clavesApi.capacidad.${cap}.titulo`)}
                      {/* Con qué clave del par se usa: dice de un vistazo qué
                          puede ir en un navegador y qué no. */}
                      <Badge variant="neutral">
                        {capacidadesPublicas.includes(cap)
                          ? t("clavesApi.uso.ambas")
                          : t("clavesApi.uso.secreta")}
                      </Badge>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t(`clavesApi.capacidad.${cap}.descripcion`)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <DominiosPermitidos dominios={dominios} onChange={setDominios} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
