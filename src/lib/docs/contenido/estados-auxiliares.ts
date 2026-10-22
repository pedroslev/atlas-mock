import type { ContenidoPagina } from "@/lib/docs/tipos";

// Estados auxiliares: catálogo de estados de no-atención, con alta y edición
// en un cuadro de diálogo sobre el mismo listado.
export const contenido: ContenidoPagina = {
  es: {
    titulo: "Estados auxiliares",
    resumen:
      "Cómo definir los estados que un asesor puede elegir cuando no está atendiendo, como pausa, capacitación o reunión.",
    secciones: [
      {
        id: "que-es",
        titulo: "Qué es y para qué sirve",
        bloques: [
          {
            tipo: "p",
            texto:
              "Un estado auxiliar es el motivo por el que un asesor deja de atender un rato: almuerzo, capacitación, reunión, descanso, baño, un problema técnico. Cada estado tiene un nombre, un color y un ícono, que es como el asesor lo ve en su pantalla de trabajo. Mientras está en uno, no recibe interacciones nuevas.",
          },
          {
            tipo: "p",
            texto:
              "Acá armás la lista de estados de tu empresa. Quién puede usar cuáles se decide en «Grupos y roles»: cada grupo habilita los que quiera de esta lista, y cada persona ve los de sus grupos (ver «Usuarios»).",
          },
        ],
      },
      {
        id: "listado",
        titulo: "El listado",
        bloques: [
          {
            tipo: "p",
            texto:
              "La tabla muestra todos los estados, sin páginas, con un cuadro de búsqueda arriba. El botón «Crear estado auxiliar» abre el cuadro para armar uno nuevo.",
          },
          {
            tipo: "lista",
            items: [
              "Estado — Un punto del color del estado y su nombre.",
              "Color — El código del color (por ejemplo #FFC107). Esta columna no se puede filtrar.",
              "Ícono — El dibujo del ícono, pintado con el color del estado.",
            ],
          },
          {
            tipo: "p",
            texto:
              "El menú de tres puntos de cada fila tiene «Editar», que abre el cuadro con los datos cargados, y «Eliminar», que pide confirmación.",
          },
        ],
      },
      {
        id: "crear-editar",
        titulo: "Cómo crear y editar un estado",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "Para crear, tocá «Crear estado auxiliar». Para editar, elegí «Editar» en el menú de la fila.",
              "Se abre el cuadro «Nuevo estado auxiliar» (o «Editar <nombre>»). Completá «Nombre».",
              "Elegí un «Color».",
              "Elegí un «Ícono» de la grilla.",
              "Tocá «Crear estado» (o «Guardar» si estás editando). Para salir sin cambios, «Cancelar».",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Obligatorio (por ejemplo, «Ej: Capacitación»). El botón para guardar queda apagado mientras el nombre esté vacío o tenga solo espacios. Es lo que lee el asesor, así que usá un nombre que se entienda solo.",
              "Color — Se elige con el selector de color. Por defecto es #0074B5. Ayuda a reconocer el estado de un vistazo: por ejemplo, verde para el descanso y rojo para un problema técnico.",
              "Ícono — Se elige con un clic en la grilla; no hay que escribir nada. Por defecto es el círculo. El elegido se resalta y toma el color del estado. Hay 22 opciones: círculo, cubiertos, café, birrete, personas, puerta, portapapeles, mensaje, llave, cama, campana, reloj, pausa, premio, maletín, libro, estetoscopio, auto, corazón, auriculares, luna y prohibido.",
            ],
          },
        ],
      },
      {
        id: "eliminar",
        titulo: "Eliminar un estado",
        bloques: [
          {
            tipo: "p",
            texto:
              "Elegí «Eliminar» en el menú de la fila y confirmá en «¿Confirmás la eliminación?». El estado sale del listado.",
          },
          {
            tipo: "nota",
            texto:
              "Antes de eliminar un estado que ya usan tus grupos, revisá «Grupos y roles» para no dejar a nadie sin él.",
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
              "Dónde se usan — Los grupos habilitan estados desde «Grupos y roles» (con un buscador, pensado para listas largas) y el asesor los elige en su pantalla de trabajo con su nombre, color e ícono.",
              "Nombres — Conviene no repetirlos: si dos estados se llaman igual, el asesor no los distingue.",
            ],
          },
        ],
      },
    ],
  },
  en: {
    titulo: "Auxiliary states",
    resumen:
      "How to define the states an agent can pick while not handling interactions, such as break, training or meeting.",
    secciones: [
      {
        id: "que-es",
        titulo: "What it is and what it is for",
        bloques: [
          {
            tipo: "p",
            texto:
              "An auxiliary state is the reason why an agent stops handling interactions for a while: lunch, training, a meeting, a break, the restroom, a technical problem. Each state has a name, a color and an icon, which is how the agent sees it on their work screen. While in one, they do not receive new interactions.",
          },
          {
            tipo: "p",
            texto:
              "Here you build your company's list of states. Who can use which is decided in “Groups and roles”: each group enables the ones it wants from this list, and each person sees those of their groups (see “Users”).",
          },
        ],
      },
      {
        id: "listado",
        titulo: "The list",
        bloques: [
          {
            tipo: "p",
            texto:
              "The table shows all states, without pages, with a search box on top. The “Create auxiliary state” button opens the dialog to build a new one.",
          },
          {
            tipo: "lista",
            items: [
              "State — A dot in the state's color and its name.",
              "Color — The color code (for example #FFC107). This column cannot be filtered.",
              "Icon — The icon drawing, painted in the state's color.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Each row's three-dot menu has “Edit”, which opens the dialog with the data loaded, and “Delete”, which asks for confirmation.",
          },
        ],
      },
      {
        id: "crear-editar",
        titulo: "How to create and edit a state",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "To create, click “Create auxiliary state”. To edit, choose “Edit” in the row menu.",
              "The “New auxiliary state” dialog opens (or “Edit <name>”). Fill in “Name”.",
              "Choose a “Color”.",
              "Choose an “Icon” from the grid.",
              "Click “Create state” (or “Save” if you are editing). To leave with no changes, “Cancel”.",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Name — Required (for example, “E.g.: Training”). The save button stays off while the name is empty or only spaces. It is what the agent reads, so use a name that explains itself.",
              "Color — Chosen with the color picker. The default is #0074B5. It helps recognize the state at a glance: for example, green for a break and red for a technical problem.",
              "Icon — Chosen with one click on the grid; there is nothing to type. The default is the circle. The chosen one is highlighted and takes the state's color. There are 22 options: circle, utensils, coffee, graduation cap, people, door, clipboard, message, wrench, bed, bell, clock, pause, award, briefcase, book, stethoscope, car, heart, headphones, moon and ban.",
            ],
          },
        ],
      },
      {
        id: "eliminar",
        titulo: "Delete a state",
        bloques: [
          {
            tipo: "p",
            texto:
              "Choose “Delete” in the row menu and confirm in “Confirm deletion?”. The state leaves the list.",
          },
          {
            tipo: "nota",
            texto:
              "Before deleting a state your groups already use, check “Groups and roles” so nobody is left without it.",
          },
        ],
      },
      {
        id: "reglas",
        titulo: "Rules and relations",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Where they are used — Groups enable states from “Groups and roles” (with a search box, built for long lists) and the agent picks them on their work screen with their name, color and icon.",
              "Names — Better not to repeat them: if two states have the same name, the agent cannot tell them apart.",
            ],
          },
        ],
      },
    ],
  },
};
