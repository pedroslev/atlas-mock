import type { ContenidoPagina } from "@/lib/docs/tipos";

// Clasificaciones: grupos, catálogo y clasificaciones de sistema.
export const contenido: ContenidoPagina = {
  es: {
    titulo: "Clasificaciones",
    resumen:
      "Cómo definir con qué resultado se cierra cada gestión, agruparlos para asignarlos a proyectos y campañas, y qué efecto tiene cada uno sobre el contacto.",
    secciones: [
      {
        id: "que-es",
        titulo: "Qué es una clasificación",
        bloques: [
          {
            tipo: "p",
            texto:
              "Una clasificación es el resultado con el que se cierra una gestión: «Compromiso de pago», «Resuelto en el momento», «Rechaza contacto». Sirve para medir qué pasó con cada contacto y, por su «Efecto sobre el contacto», para decidir si se lo vuelve a buscar.",
          },
          {
            tipo: "p",
            texto:
              "Las clasificaciones se crean una sola vez en el «Catálogo» y se reutilizan: una misma clasificación puede estar en varios grupos. Un grupo es el conjunto de clasificaciones que ofrecés para trabajar; el grupo es lo que se asigna a un proyecto o a una campaña.",
          },
          {
            tipo: "p",
            texto:
              "Se relaciona con: «Proyectos» y «Campañas», donde se elige el «Grupo de clasificaciones» (la campaña puede heredarlo del proyecto), y con la estrategia de salida de cada campaña, que define cuándo y por qué canal se sigue según el efecto.",
          },
          {
            tipo: "p",
            texto:
              "La pantalla tiene tres solapas: «Grupos», «Catálogo» y «De sistema».",
          },
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
              "Clasificaciones — Cuántas clasificaciones tiene el grupo.",
            ],
          },
          { tipo: "sub", texto: "Solapa «Catálogo»" },
          {
            tipo: "lista",
            items: [
              "Clasificación — Nombre. Las que tienen padre se muestran con una flecha «↳» adelante.",
              "Tipo — Una etiqueta de color distinto para cada tipo: «Exitoso», «No exitoso», «No efectivo» o «Neutro». Se puede filtrar por tipo.",
              "Efecto — «Seguir intentando», «Dejar este medio», «Dejar de contactar» o «Sin efecto». Se puede filtrar por efecto.",
            ],
          },
          { tipo: "sub", texto: "Solapa «De sistema»" },
          {
            tipo: "lista",
            items: [
              "Clasificación — Nombre, con un candado: son de solo lectura.",
              "Cuándo se asigna — Explica en qué situación la pone Atlas.",
              "Efecto — El efecto de cada una.",
            ],
          },
          {
            tipo: "p",
            texto:
              "En las tres solapas hay un buscador arriba de la tabla, y los encabezados de columna permiten ordenar y filtrar. La tabla muestra todas las filas: si son muchas, se desplaza dentro de la misma tabla.",
          },
          { tipo: "sub", texto: "Acciones" },
          {
            tipo: "lista",
            items: [
              "«Nuevo grupo» — Botón arriba a la derecha, visible en la solapa «Grupos».",
              "«Nueva clasificación» — Botón arriba a la derecha, visible en la solapa «Catálogo».",
              "Menú de cada fila (los tres puntos) — «Editar» y «Eliminar». «Eliminar» siempre pide confirmación y se ve en rojo.",
              "Solapa «De sistema» — No tiene botón de alta ni menú por fila.",
            ],
          },
          {
            tipo: "p",
            texto:
              "No hay acciones masivas: cada grupo o clasificación se edita o elimina de a una.",
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
              "Completá «Nombre» y, si querés, «Descripción». El nombre viene sugerido como «Nuevo grupo» (si ya existe, con un número: «Nuevo grupo (2)»).",
              "Tocá «Crear grupo». El botón está deshabilitado mientras el nombre esté vacío.",
              "El grupo nace vacío. Abrilo desde su nombre o desde «Editar» para agregarle clasificaciones.",
              "En «Clasificaciones del grupo», tocá «Agregar del catálogo», buscá con «Buscar clasificación...» y elegí. Repetí con cada una.",
              "Para sacar una clasificación del grupo, tocá la cruz «Quitar del grupo» de su fila. No se borra del catálogo.",
              "Tocá «Confirmar» arriba a la derecha (o «Cancelar» para salir).",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Obligatorio. Es lo que vas a elegir después en proyectos y campañas.",
              "Descripción — Opcional. Se carga al crear y se puede ver y editar en «Datos del grupo».",
            ],
          },
          {
            tipo: "p",
            texto:
              "En el grupo, las clasificaciones con padre se muestran sangradas debajo de su padre. Si agregás una clasificación hija pero no su padre, aparece suelta, al mismo nivel que las demás.",
          },
          {
            tipo: "p",
            texto:
              "En la lista de «Agregar del catálogo» solo aparecen las clasificaciones que todavía no están en el grupo. Las de sistema no aparecen nunca: no se agregan a grupos.",
          },
        ],
      },
      {
        id: "crear-clasificacion",
        titulo: "Crear y editar una clasificación",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "En la solapa «Catálogo», tocá «Nueva clasificación». Para editar, abrí el menú de la fila y elegí «Editar»: el título dice «Editar» seguido del nombre.",
              "Completá «Nombre».",
              "Elegí el «Tipo» y el «Efecto sobre el contacto». Debajo se explica en una frase qué significa el efecto elegido.",
              "Si es una subclasificación, elegí su «Clasificación padre».",
              "Tocá «Crear clasificación» (o «Guardar» si estás editando).",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Obligatorio; sin él no se puede guardar. Ej: «Venta exitosa».",
              "ID externo — Opcional. Un código tuyo para identificarla; útil si la usás también en otros sistemas de tu empresa.",
              "Tipo — «Exitoso», «No exitoso», «No efectivo» o «Neutro». Por defecto «Neutro».",
              "Efecto sobre el contacto — Qué significa el resultado para el contacto, igual en todos los canales y campañas. Por defecto «Sin efecto». Ver la sección de efectos.",
              "Clasificación padre — Opcional. Por defecto «Sin padre (raíz)». Se busca con «Buscar clasificación...». Solo se ofrecen clasificaciones raíz (sin padre) y nunca la misma que estás editando: la jerarquía tiene un solo nivel de subclasificaciones.",
              "Descripción — Opcional.",
            ],
          },
          {
            tipo: "p",
            texto:
              "En la ventana de alta no se elige a qué grupo pertenece la clasificación: eso se asigna desde cada grupo.",
          },
        ],
      },
      {
        id: "efectos",
        titulo: "Los efectos sobre el contacto",
        bloques: [
          {
            tipo: "p",
            texto:
              "El efecto dice qué significa el resultado para el contacto y vale para todos los canales. Cuándo y por qué canal se sigue lo decide cada campaña en su estrategia de salida.",
          },
          {
            tipo: "lista",
            items: [
              "Seguir intentando — No se logró el contacto, pero vale la pena insistir.",
              "Dejar este medio — Ese teléfono o mail ya no sirve: se marca como inválido en la ficha y se sigue por otro.",
              "Dejar de contactar — Se cierra el objetivo de contacto: no se lo vuelve a buscar.",
              "Sin efecto — Es informativa: no cambia qué pasa con el contacto.",
            ],
          },
        ],
      },
      {
        id: "sistema",
        titulo: "Clasificaciones de sistema",
        bloques: [
          {
            tipo: "p",
            texto:
              "Son resultados que Atlas asigna solo cuando la interacción no llega a un agente (nadie atiende, está ocupado, el número no existe…). Están en todas las campañas sin agregarlas a ningún grupo y no se pueden modificar ni eliminar.",
          },
          {
            tipo: "lista",
            items: [
              "No contesta — El teléfono sonó y nadie atendió. Efecto: «Seguir intentando».",
              "Ocupado — El teléfono estaba ocupado en otra llamada. Efecto: «Seguir intentando».",
              "Apagado o fuera de cobertura — Apagado, sin señal o no se pudo llegar por un momento. Efecto: «Seguir intentando».",
              "Rechazada — El contacto cortó sin atender o un bloqueador de spam filtró la llamada. Efecto: «Seguir intentando».",
              "Número inexistente — El número no existe o está mal formado. Efecto: «Dejar este medio».",
              "Número cambiado — El número ya no está en uso y fue reemplazado. Efecto: «Dejar este medio».",
              "No acepta llamadas — El teléfono tiene bloqueadas las llamadas entrantes. Efecto: «Dejar este medio».",
              "Fax o módem — Del otro lado atendió un fax o un módem. Efecto: «Dejar este medio».",
            ],
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
              "Reutilización — Una clasificación puede estar en varios grupos; quitarla de un grupo no la borra del catálogo.",
              "Eliminar un grupo — Se elimina el grupo; las clasificaciones del catálogo no se borran.",
              "Eliminar una clasificación — Se quita del catálogo y de todos los grupos que la usan. Si es una clasificación padre, también se eliminan del catálogo sus subclasificaciones.",
              "Nombres — La pantalla no impide repetir un nombre.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Al eliminar una clasificación padre también se eliminan sus subclasificaciones. Revisalas antes de borrar.",
          },
        ],
      },
    ],
  },
  en: {
    titulo: "Classifications",
    resumen:
      "How to define the outcomes each interaction is closed with, group them to assign them to projects and campaigns, and what effect each one has on the contact.",
    secciones: [
      {
        id: "que-es",
        titulo: "What a classification is",
        bloques: [
          {
            tipo: "p",
            texto:
              "A classification is the outcome an interaction is closed with: «Compromiso de pago», «Resuelto en el momento», «Rechaza contacto». It lets you measure what happened with each contact and, through its «Effect on the contact», decide whether they are reached again.",
          },
          {
            tipo: "p",
            texto:
              "Classifications are created once in the «Catalog» and reused: the same classification can be in several groups. A group is the set of classifications you offer to work with; the group is what gets assigned to a project or a campaign.",
          },
          {
            tipo: "p",
            texto:
              "It is related to «Projects» and «Campaigns», where the «Classification group» is chosen (a campaign can inherit it from the project), and to each campaign's outbound strategy, which defines when and through which channel to continue depending on the effect.",
          },
          {
            tipo: "p",
            texto: "The screen has three tabs: «Groups», «Catalog» and «System».",
          },
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
              "Classifications — How many classifications the group has.",
            ],
          },
          { tipo: "sub", texto: "«Catalog» tab" },
          {
            tipo: "lista",
            items: [
              "Classification — Name. Those with a parent show an arrow «↳» in front.",
              "Type — A differently colored tag for each type: «Successful», «Unsuccessful», «Ineffective» or «Neutral». You can filter by type.",
              "Effect — «Keep trying», «Drop this channel», «Stop contacting» or «No effect». You can filter by effect.",
            ],
          },
          { tipo: "sub", texto: "«System» tab" },
          {
            tipo: "lista",
            items: [
              "Classification — Name, with a padlock: they are read-only.",
              "When it's assigned — Explains in which situation Atlas sets it.",
              "Effect — The effect of each one.",
            ],
          },
          {
            tipo: "p",
            texto:
              "All three tabs have a search box above the table, and the column headers let you sort and filter. The table shows every row: if there are many, it scrolls inside the table itself.",
          },
          { tipo: "sub", texto: "Actions" },
          {
            tipo: "lista",
            items: [
              "«New group» — Button at the top right, visible in the «Groups» tab.",
              "«New classification» — Button at the top right, visible in the «Catalog» tab.",
              "Row menu (the three dots) — «Edit» and «Delete». «Delete» always asks for confirmation and is shown in red.",
              "«System» tab — It has no create button and no row menu.",
            ],
          },
          {
            tipo: "p",
            texto:
              "There are no bulk actions: each group or classification is edited or deleted one at a time.",
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
              "Fill in «Name» and, if you want, «Description». The name comes suggested as «New group» (if it already exists, with a number: «New group (2)»).",
              "Click «Create group». The button is disabled while the name is empty.",
              "The group starts empty. Open it from its name or from «Edit» to add classifications.",
              "In «Classifications in the group», click «Add from catalog», search with «Search classification...» and pick one. Repeat for each.",
              "To take a classification out of the group, click the cross «Remove from group» on its row. It is not deleted from the catalog.",
              "Click «Confirm» at the top right (or «Cancel» to leave).",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Name — Required. It is what you will pick later in projects and campaigns.",
              "Description — Optional. It is entered when creating and can be seen and edited in «Group details».",
            ],
          },
          {
            tipo: "p",
            texto:
              "Inside the group, classifications with a parent are shown indented under their parent. If you add a child classification but not its parent, it appears on its own, at the same level as the others.",
          },
          {
            tipo: "p",
            texto:
              "The «Add from catalog» list only shows classifications that are not in the group yet. System ones never appear: they are not added to groups.",
          },
        ],
      },
      {
        id: "crear-clasificacion",
        titulo: "Creating and editing a classification",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "In the «Catalog» tab, click «New classification». To edit, open the row menu and choose «Edit»: the title reads «Edit» followed by the name.",
              "Fill in «Name».",
              "Choose the «Type» and the «Effect on the contact». Below, a sentence explains what the chosen effect means.",
              "If it is a sub-classification, choose its «Parent classification».",
              "Click «Create classification» (or «Save» if you are editing).",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Name — Required; it can't be saved without it. E.g. «Successful sale».",
              "External ID — Optional. A code of your own to identify it; useful if you also use it in other systems of your company.",
              "Type — «Successful», «Unsuccessful», «Ineffective» or «Neutral». Default «Neutral».",
              "Effect on the contact — What the outcome means for the contact, the same in every channel and campaign. Default «No effect». See the section on effects.",
              "Parent classification — Optional. Default «No parent (root)». Searched with «Search classification...». Only root classifications (without a parent) are offered, and never the one you are editing: the hierarchy has a single level of sub-classifications.",
              "Description — Optional.",
            ],
          },
          {
            tipo: "p",
            texto:
              "The creation window does not ask which group the classification belongs to: that is assigned from each group.",
          },
        ],
      },
      {
        id: "efectos",
        titulo: "Effects on the contact",
        bloques: [
          {
            tipo: "p",
            texto:
              "The effect says what the outcome means for the contact and applies to every channel. When and through which channel to continue is decided by each campaign in its outbound strategy.",
          },
          {
            tipo: "lista",
            items: [
              "Keep trying — The contact wasn't reached but it's worth trying again.",
              "Drop this channel — That phone or email no longer works: it's marked invalid in the record and another one is used.",
              "Stop contacting — The contact objective is closed: they're not reached out to again.",
              "No effect — Informational only: it doesn't change what happens with the contact.",
            ],
          },
        ],
      },
      {
        id: "sistema",
        titulo: "System classifications",
        bloques: [
          {
            tipo: "p",
            texto:
              "These are outcomes Atlas assigns automatically when the interaction doesn't reach an agent (nobody answers, the line is busy, the number doesn't exist…). They are in every campaign without adding them to any group and can't be modified or deleted.",
          },
          {
            tipo: "lista",
            items: [
              "No contesta — The phone rang and nobody answered. Effect: «Keep trying».",
              "Ocupado — The phone was busy on another call. Effect: «Keep trying».",
              "Apagado o fuera de cobertura — Switched off, no signal or unreachable for a moment. Effect: «Keep trying».",
              "Rechazada — The contact hung up without answering or a spam blocker filtered the call. Effect: «Keep trying».",
              "Número inexistente — The number doesn't exist or is malformed. Effect: «Drop this channel».",
              "Número cambiado — The number is no longer in use and was replaced. Effect: «Drop this channel».",
              "No acepta llamadas — The phone has incoming calls blocked. Effect: «Drop this channel».",
              "Fax o módem — A fax or a modem answered on the other end. Effect: «Drop this channel».",
            ],
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
              "Reuse — A classification can be in several groups; removing it from a group does not delete it from the catalog.",
              "Deleting a group — The group is deleted; the catalog classifications are not removed.",
              "Deleting a classification — It is removed from the catalog and from every group using it. If it is a parent classification, its sub-classifications are also deleted from the catalog.",
              "Names — The screen does not prevent repeating a name.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "When you delete a parent classification, its sub-classifications are deleted too. Review them before deleting.",
          },
        ],
      },
    ],
  },
};
