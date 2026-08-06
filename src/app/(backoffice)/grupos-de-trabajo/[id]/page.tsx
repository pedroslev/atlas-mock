import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { T } from "@/lib/i18n";
import { gruposTrabajo, getGrupoTrabajo, agentes } from "@/lib/mock-data";
import { GrupoMiembros } from "./grupo-miembros";
import { GrupoPermisos } from "./grupo-permisos";
import { AuxMultiSelect } from "../aux-multi-select";

export function generateStaticParams() {
  return gruposTrabajo.map((g) => ({ id: g.id }));
}

export default async function EditarGrupoTrabajoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const grupo = getGrupoTrabajo(id);
  if (!grupo) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={grupo.nombre}
        backHref="/grupos-de-trabajo"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/grupos-de-trabajo">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <Button>
              <T k="common.acciones.confirmar" />
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <T k="grupos.infoGeneral" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">
                <T k="common.comunes.nombre" />
              </Label>
              <Input id="nombre" defaultValue={grupo.nombre} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descripcion">
                <T k="common.comunes.descripcion" />
              </Label>
              <Textarea id="descripcion" defaultValue={grupo.descripcion} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <T k="grupos.aux.titulo" />
            </CardTitle>
            <CardDescription>
              <T k="grupos.aux.desc" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuxMultiSelect initialIds={grupo.estadosAuxiliares} />
          </CardContent>
        </Card>
      </div>

      <GrupoPermisos
        initialPermisos={grupo.permisos}
        initialAccesoHermes={grupo.accesoHermes}
      />

      <GrupoMiembros agentes={agentes} initialUsuarioIds={grupo.usuarioIds} />
    </div>
  );
}
