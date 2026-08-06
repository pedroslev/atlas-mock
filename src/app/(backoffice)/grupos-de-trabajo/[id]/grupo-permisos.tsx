"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import { modulosPermisos, type Permiso, type PermisoAccion } from "@/lib/mock-data";

const ACCIONES: PermisoAccion[] = ["lectura", "escritura", "eliminacion"];

// Los módulos llegan de mock-data en español (ese archivo no se traduce): acá
// se mapean a claves de traducción. Los nombres coinciden con secciones del
// nav, así que se reusan las claves de `common.nav.*` en vez de duplicarlas.
const MODULO_KEYS: Record<string, string> = {
  "Proyectos": "common.buscador.proyectos",
  "Campañas": "common.nav.campanias",
  "Cuentas": "common.nav.cuentas",
  "Clasificaciones": "common.nav.clasificaciones",
  "Marcas": "common.nav.marcas",
  "Feriados": "common.nav.feriados",
  "Listas de exclusión": "common.nav.listasExclusion",
  "Agentes y roles": "common.nav.usuarios",
  "Grupos de trabajo": "common.nav.gruposRoles",
  "Estados auxiliares": "common.nav.estadosAuxiliares",
};

// Árbol de checkboxes lectura/escritura/eliminación por módulo → construye el
// working_groups.permissions real (ver ADR-FUNDAMENTOS-007). Grid explícito
// para que los títulos queden perfectamente centrados sobre su columna de
// checkboxes (feedback 2026-07-16). Estado local, sin persistencia.
//
// Además de los permisos de Olimpo (por módulo), la card tiene una segunda
// sección "Hermes": un único check de acceso, porque el PAD no tiene
// permisos por sección como el backoffice — o el grupo entra, o no entra.
export function GrupoPermisos({
  initialPermisos,
  initialAccesoHermes,
}: {
  initialPermisos: Permiso[];
  initialAccesoHermes: boolean;
}) {
  const [permisos, setPermisos] = useState<Permiso[]>(initialPermisos);
  const [accesoHermes, setAccesoHermes] = useState(initialAccesoHermes);
  const t = useT();

  function tieneAccion(modulo: string, accion: PermisoAccion) {
    return permisos.some(
      (p) => p.modulo === modulo && p.acciones.includes(accion)
    );
  }

  function toggle(modulo: string, accion: PermisoAccion) {
    setPermisos((current) => {
      const existente = current.find((p) => p.modulo === modulo);
      if (!existente) {
        return [...current, { modulo, acciones: [accion] }];
      }
      const tiene = existente.acciones.includes(accion);
      const acciones = tiene
        ? existente.acciones.filter((a) => a !== accion)
        : [...existente.acciones, accion];
      if (acciones.length === 0) {
        return current.filter((p) => p.modulo !== modulo);
      }
      return current.map((p) => (p.modulo === modulo ? { ...p, acciones } : p));
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("grupos.permisos.titulo")}</CardTitle>
        <CardDescription>{t("grupos.permisos.descripcion")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {t("grupos.permisos.seccionOlimpo")}
          </h3>
          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <div className="grid grid-cols-[1fr_repeat(3,110px)] items-center gap-x-2 border-b bg-muted/50 px-3 py-2 text-sm font-medium">
              <span>{t("grupos.permisos.modulo")}</span>
              {ACCIONES.map((accion) => (
                <span key={accion} className="text-center">
                  {t(`grupos.permiso.${accion}`)}
                </span>
              ))}
            </div>
            {modulosPermisos.map((modulo, index) => {
              const nombreModulo = t(MODULO_KEYS[modulo] ?? modulo);
              return (
                <div
                  key={modulo}
                  className={
                    "grid grid-cols-[1fr_repeat(3,110px)] items-center gap-x-2 px-3 py-2 text-sm" +
                    (index > 0 ? " border-t" : "")
                  }
                >
                  <span className="font-medium">{nombreModulo}</span>
                  {ACCIONES.map((accion) => (
                    <span key={accion} className="flex justify-center">
                      <Checkbox
                        checked={tieneAccion(modulo, accion)}
                        onCheckedChange={() => toggle(modulo, accion)}
                        aria-label={t("grupos.permisos.aria", {
                          accion: t(`grupos.permiso.${accion}`),
                          modulo: nombreModulo,
                        })}
                      />
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {t("grupos.permisos.seccionHermes")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("grupos.permisos.hermesDescripcion")}
          </p>
          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <div className="grid grid-cols-[1fr_110px] items-center gap-x-2 border-b bg-muted/50 px-3 py-2 text-sm font-medium">
              <span>{t("common.apps.hermes.tagline")}</span>
              <span className="text-center">{t("grupos.permisos.hermesAcceso")}</span>
            </div>
            <div className="grid grid-cols-[1fr_110px] items-center gap-x-2 px-3 py-2 text-sm">
              <span className="font-medium">{t("grupos.permisos.seccionHermes")}</span>
              <span className="flex justify-center">
                <Checkbox
                  checked={accesoHermes}
                  onCheckedChange={() => setAccesoHermes((v) => !v)}
                  aria-label={t("grupos.permisos.hermesAria")}
                />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
