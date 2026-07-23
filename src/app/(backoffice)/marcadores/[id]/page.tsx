import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { marcadorGrupos, getMarcadorGrupo } from "@/lib/mock-data";
import { T } from "@/lib/i18n";
import { GrupoMarcadores } from "./grupo-marcadores";

export function generateStaticParams() {
  return marcadorGrupos.map((g) => ({ id: g.id }));
}

// Detalle de un grupo de bookmarks: sus datos + qué marcas del pool
// contiene. Las marcas en sí se crean/editan desde el pool en /marcadores.
export default async function GrupoMarcadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const grupo = getMarcadorGrupo(id);
  if (!grupo) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={grupo.nombre}
        description={<T k="marcas.detalle.subtitulo" />}
        backHref="/marcadores"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/marcadores">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <Button asChild>
              <Link href="/marcadores">
                <T k="common.acciones.confirmar" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>
              <T k="marcas.detalle.datos" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">
                <T k="common.comunes.nombre" />
              </Label>
              <Input id="nombre" defaultValue={grupo.nombre} />
            </div>
          </CardContent>
        </Card>

        <GrupoMarcadores initialIds={grupo.marcadorIds} />
      </div>
    </div>
  );
}
