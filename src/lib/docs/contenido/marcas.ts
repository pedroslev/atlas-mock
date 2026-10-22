import type { ContenidoPagina } from "@/lib/docs/tipos";

// Marcas: catálogo y grupos de marcas.
export const contenido: ContenidoPagina = {
  es: {
    titulo: "Marcas",
    resumen:
      "Cómo definir las marcas que los asesores pueden dejar sobre una gestión y agruparlas para asignarlas a tus campañas.",
    secciones: [
      {
        id: "que-es",
        titulo: "Qué es una marca",
        bloques: [
          {
            tipo: "p",
            texto:
              "Una marca es una etiqueta que los asesores pueden dejar sobre una gestión para destacar algo del contacto o del caso: «Cliente VIP», «Reclamo activo», «Contacto sensible».",
          },
          {
            tipo: "p",
            texto:
              "Las marcas se crean una sola vez en el «Catálogo» y se reutilizan. Un grupo de marcas es el conjunto que ofrecés para trabajar, y el grupo es lo que se asigna a una campaña: en «Campañas», el campo «Grupo de marcas» te deja elegirlo.",
          },
          { tipo: "p", texto: "La pantalla tiene dos solapas: «Grupos» y «Catálogo»." },
        ],
      },
      {
        id: "listado",
        titulo: "Los listados",
        bloques: [
          { tipo: "sub", texto: "Solapa «Grupos»" },
          {
            tipo: "lista",
            items: [
              "Grupo — Nombre del grupo. Al hacer click se abre su edición.",
              "Marcas — Cuántas marcas tiene el grupo.",
            ],
          },
          { tipo: "sub", texto: "Solapa «Catálogo»" },
          {
            tipo: "lista",
            items: [
              "Marca — Nombre.",
              "Descripción — Lo que escribiste al crearla; si no tiene, muestra «—».",
            ],
          },
          {
            tipo: "p",
            texto:
              "En las dos solapas hay un buscador arriba de la tabla, y los encabezados de columna permiten ordenar y filtrar. La tabla muestra todas las filas y se desplaza si son muchas.",
          },
          { tipo: "sub", texto: "Acciones" },
          {
            tipo: "lista",
            items: [
              "«Nuevo grupo» — Botón arriba a la derecha, en la solapa «Grupos».",
              "«Nueva marca» — Botón arriba a la derecha, en la solapa «Catálogo».",
              "Menú de cada fila (los tres puntos) — «Editar» y «Eliminar». «Eliminar» pide confirmación.",
            ],
          },
          { tipo: "p", texto: "No hay acciones masivas." },
        ],
      },
      {
        id: "crear-marca",
        titulo: "Crear y editar una marca",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "En la solapa «Catálogo», tocá «Nueva marca». Para editar, abrí el menú de la fila y elegí «Editar».",
              "Escribí el «Nombre».",
              "Si querés, completá «Descripción» e «Instrucciones para asistencia con IA».",
              "Tocá «Crear marca» (o «Guardar» si estás editando).",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Obligatorio; sin él no se puede guardar. Ej: «Cliente VIP».",
              "Descripción — Opcional. Para explicarle al equipo cuándo usarla (por ejemplo, «Requiere atención prioritaria»).",
              "Instrucciones para asistencia con IA — Opcional. Texto libre donde podés indicar cómo querés que la asistencia automática entienda y use esta marca.",
            ],
          },
          {
            tipo: "p",
            texto:
              "La ventana de alta no pregunta a qué grupo pertenece la marca: eso se asigna desde cada grupo.",
          },
        ],
      },
      {
        id: "crear-grupo",
        titulo: "Crear un grupo y completarlo",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "En la solapa «Grupos», tocá «Nuevo grupo».",
              "Escribí el «Nombre». Viene sugerido como «Nuevo grupo» (si ya existe, con un número: «Nuevo grupo (2)»).",
              "Tocá «Crear grupo». Está deshabilitado mientras el nombre esté vacío.",
              "El grupo nace vacío. Abrilo desde su nombre o desde «Editar».",
              "En «Marcas del grupo», tocá «Agregar del catálogo», buscá con «Buscar marca…» y elegí. Repetí con cada una.",
              "Para sacar una marca del grupo, tocá la cruz «Quitar del grupo». No se borra del catálogo.",
              "Tocá «Confirmar» (o «Cancelar» para salir).",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Obligatorio. Es lo que vas a elegir después en la campaña.",
            ],
          },
          {
            tipo: "p",
            texto:
              "En la lista del grupo cada marca muestra su nombre y, abajo, su descripción. En «Agregar del catálogo» solo aparecen las marcas que todavía no están en el grupo.",
          },
        ],
      },
      {
        id: "reglas",
        titulo: "Reglas y relaciones",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Reutilización — Una marca puede estar en varios grupos; quitarla de un grupo no la borra del catálogo.",
              "Eliminar un grupo — Se elimina el grupo; las marcas del catálogo no se borran.",
              "Eliminar una marca — Se quita del catálogo y de todos los grupos que la usan.",
              "Nombres — La pantalla no impide repetir un nombre.",
              "Dónde se usa — El grupo de marcas se asigna en «Campañas». En «Proyectos» no hay campo de marcas.",
            ],
          },
        ],
      },
    ],
  },
  en: {
    titulo: "Marks",
    resumen:
      "How to define the marks agents can leave on an interaction and group them to assign them to your campaigns.",
    secciones: [
      {
        id: "que-es",
        titulo: "What a mark is",
        bloques: [
          {
            tipo: "p",
            texto:
              "A mark is a label agents can leave on an interaction to highlight something about the contact or the case: «Cliente VIP», «Reclamo activo», «Contacto sensible».",
          },
          {
            tipo: "p",
            texto:
              "Marks are created once in the «Catalog» and reused. A mark group is the set you offer to work with, and the group is what gets assigned to a campaign: in «Campaigns», the «Mark group» field lets you choose it.",
          },
          { tipo: "p", texto: "The screen has two tabs: «Groups» and «Catalog»." },
        ],
      },
      {
        id: "listado",
        titulo: "The lists",
        bloques: [
          { tipo: "sub", texto: "«Groups» tab" },
          {
            tipo: "lista",
            items: [
              "Group — Name of the group. Click it to open its edit screen.",
              "Marks — How many marks the group has.",
            ],
          },
          { tipo: "sub", texto: "«Catalog» tab" },
          {
            tipo: "lista",
            items: [
              "Mark — Name.",
              "Description — What you wrote when creating it; if it has none, it shows «—».",
            ],
          },
          {
            tipo: "p",
            texto:
              "Both tabs have a search box above the table, and the column headers let you sort and filter. The table shows every row and scrolls if there are many.",
          },
          { tipo: "sub", texto: "Actions" },
          {
            tipo: "lista",
            items: [
              "«New group» — Button at the top right, in the «Groups» tab.",
              "«New mark» — Button at the top right, in the «Catalog» tab.",
              "Row menu (the three dots) — «Edit» and «Delete». «Delete» asks for confirmation.",
            ],
          },
          { tipo: "p", texto: "There are no bulk actions." },
        ],
      },
      {
        id: "crear-marca",
        titulo: "Creating and editing a mark",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "In the «Catalog» tab, click «New mark». To edit, open the row menu and choose «Edit».",
              "Type the «Name».",
              "If you want, fill in «Description» and «Instructions for AI assistance».",
              "Click «Create mark» (or «Save» if you are editing).",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Name — Required; it can't be saved without it. E.g. «Cliente VIP».",
              "Description — Optional. To tell the team when to use it (for example, «Requiere atención prioritaria»).",
              "Instructions for AI assistance — Optional. Free text where you can say how you want the automatic assistance to understand and use this mark.",
            ],
          },
          {
            tipo: "p",
            texto:
              "The creation window does not ask which group the mark belongs to: that is assigned from each group.",
          },
        ],
      },
      {
        id: "crear-grupo",
        titulo: "Creating a group and filling it",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "In the «Groups» tab, click «New group».",
              "Type the «Name». It comes suggested as «New group» (if it already exists, with a number: «New group (2)»).",
              "Click «Create group». It is disabled while the name is empty.",
              "The group starts empty. Open it from its name or from «Edit».",
              "In «Marks in this group», click «Add from catalog», search with «Search mark…» and pick one. Repeat for each.",
              "To take a mark out of the group, click the cross «Remove from group». It is not deleted from the catalog.",
              "Click «Confirm» (or «Cancel» to leave).",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Name — Required. It is what you will pick later in the campaign.",
            ],
          },
          {
            tipo: "p",
            texto:
              "In the group's list each mark shows its name and, below it, its description. «Add from catalog» only shows marks that are not in the group yet.",
          },
        ],
      },
      {
        id: "reglas",
        titulo: "Rules and relationships",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Reuse — A mark can be in several groups; removing it from a group does not delete it from the catalog.",
              "Deleting a group — The group is deleted; the catalog marks are not removed.",
              "Deleting a mark — It is removed from the catalog and from every group that uses it.",
              "Names — The screen does not prevent repeating a name.",
              "Where it is used — The mark group is assigned in «Campaigns». «Projects» has no marks field.",
            ],
          },
        ],
      },
    ],
  },
};
