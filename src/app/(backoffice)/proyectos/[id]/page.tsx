import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
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
import { proyectos, getProyecto, feriados, clasificacionGrupos } from "@/lib/mock-data";
import { ProyectoHerencia } from "./proyecto-herencia";
import { BusinessHoursEditor } from "../business-hours-editor";

export function generateStaticParams() {
  return proyectos.map((p) => ({ id: p.id }));
}

export default async function EditarProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proyecto = getProyecto(id);
  if (!proyecto) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={proyecto.nombre}
        description={<T k="proyectos.detalle.descripcion" />}
        backHref="/campanias"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/campanias">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <Button asChild>
              <Link href="/campanias">
                <T k="common.acciones.confirmar" />
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>
              <T k="proyectos.acciones.titulo" />
            </CardTitle>
            <CardDescription>
              <T k="proyectos.acciones.descripcion" />
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/feriados/nuevo">
              <Plus />
              <T k="proyectos.acciones.crearFeriados" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/clasificaciones">
              <Plus />
              <T k="proyectos.acciones.crearClasificaciones" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/campanias/nueva">
              <Plus />
              <T k="proyectos.acciones.nuevaCampania" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <T k="proyectos.detalle.infoGeneral" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">
                  <T k="common.comunes.nombre" />
                </Label>
                <Input id="nombre" defaultValue={proyecto.nombre} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="descripcion">
                  <T k="common.comunes.descripcion" />
                </Label>
                <Textarea id="descripcion" defaultValue={proyecto.descripcion} rows={3} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="objetivo">
                  <T k="proyectos.campos.objetivo" />
                </Label>
                <Textarea id="objetivo" defaultValue={proyecto.objetivo} rows={3} />
              </div>
            </CardContent>
          </Card>

          <ProyectoHerencia
            initialGrupoClasificacionId={proyecto.grupoClasificacionId}
            initialFeriadosId={proyecto.feriadosId}
            gruposClasificacion={clasificacionGrupos}
            feriados={feriados}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <T k="proyectos.horarios.titulo" />
            </CardTitle>
            <CardDescription>
              <T k="proyectos.horarios.descripcion" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessHoursEditor initialValue={proyecto.businessHours} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
