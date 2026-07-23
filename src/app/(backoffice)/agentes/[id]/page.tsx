import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { T } from "@/lib/i18n";
import {
  agentes,
  getGruposDeUsuario,
  getOverrideDeUsuario,
  getEstadoAuxiliar,
} from "@/lib/mock-data";
import { AgenteEliminar } from "./agente-eliminar";

// Los módulos de permiso viven en mock-data en español (no se toca ese
// archivo): acá se mapean a claves de traducción. Los nombres coinciden con
// secciones del nav, así que se reusan las claves de `common.nav.*`.
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

export function generateStaticParams() {
  return agentes.map((a) => ({ id: a.id }));
}

export default async function EditarAgentePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agente = agentes.find((a) => a.id === id);
  if (!agente) notFound();

  const grupos = getGruposDeUsuario(agente.id);
  const override = getOverrideDeUsuario(agente.id);

  // Efectivo = unión de lo que dan los grupos + overrides propios del
  // usuario (aditivo, nunca reemplazo — ver ADR-FUNDAMENTOS-007).
  const permisosEfectivos = new Map<string, Set<string>>();
  for (const permiso of [
    ...grupos.flatMap((g) => g.permisos),
    ...(override?.permisosExtra ?? []),
  ]) {
    const acciones = permisosEfectivos.get(permiso.modulo) ?? new Set<string>();
    permiso.acciones.forEach((a) => acciones.add(a));
    permisosEfectivos.set(permiso.modulo, acciones);
  }

  const auxIdsEfectivos = new Set<string>([
    ...grupos.flatMap((g) => g.estadosAuxiliares),
    ...(override?.estadosAuxiliaresExtra ?? []),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={agente.nombre}
        description={<T k="usuarios.detalle.descripcion" />}
        backHref="/agentes"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/agentes">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <Button>
              <T k="common.acciones.guardar" />
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <T k="usuarios.usuario" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">
                <T k="common.comunes.nombre" />
              </Label>
              <Input id="nombre" defaultValue={agente.nombre} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">
                <T k="usuarios.email" />
              </Label>
              <Input id="email" defaultValue={agente.email} />
            </div>
            <div className="flex flex-col gap-2 rounded-lg p-3 ring-1 ring-foreground/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  <T k="usuarios.habilitado" />
                </span>
                <Switch defaultChecked={agente.habilitado} />
              </div>
              <p className="text-xs text-muted-foreground">
                <T k="usuarios.detalle.habilitadoAyuda" />
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
        <CardHeader>
          <CardTitle>
            <T k="usuarios.detalle.permisosTitulo" />
          </CardTitle>
          <CardDescription>
            <T
              k={
                override
                  ? "usuarios.detalle.permisosDescOverride"
                  : "usuarios.detalle.permisosDesc"
              }
              vars={{ n: grupos.length }}
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              <T k="usuarios.detalle.permisos" />
            </span>
            <div className="flex flex-wrap gap-1.5">
              {permisosEfectivos.size === 0 && (
                <span className="text-sm text-muted-foreground">
                  <T k="usuarios.detalle.sinPermisos" />
                </span>
              )}
              {[...permisosEfectivos.entries()].map(([modulo, acciones]) => (
                <Badge key={modulo} variant="outline">
                  <T k={MODULO_KEYS[modulo] ?? modulo} />:{" "}
                  {[...acciones].map((accion, index) => (
                    <span key={accion}>
                      {index > 0 && ", "}
                      <T k={`grupos.permiso.${accion}`} />
                    </span>
                  ))}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              <T k="common.nav.estadosAuxiliares" />
            </span>
            <div className="flex flex-wrap gap-1.5">
              {auxIdsEfectivos.size === 0 && (
                <span className="text-sm text-muted-foreground">
                  <T k="usuarios.detalle.sinAuxiliares" />
                </span>
              )}
              {[...auxIdsEfectivos].map((auxId) => {
                const estado = getEstadoAuxiliar(auxId);
                if (!estado) return null;
                const esExtra = override?.estadosAuxiliaresExtra.includes(auxId);
                return (
                  <Badge key={auxId} variant="outline" className="gap-1.5">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: estado.color }}
                      aria-hidden
                    />
                    {estado.nombre}
                    {esExtra && (
                      <span className="text-secondary">
                        <T k="usuarios.detalle.individual" />
                      </span>
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <T k="usuarios.detalle.peligroTitulo" />
          </CardTitle>
          <CardDescription>
            <T k="usuarios.detalle.peligroDesc" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgenteEliminar nombre={agente.nombre} habilitado={agente.habilitado} />
        </CardContent>
      </Card>
    </div>
  );
}
