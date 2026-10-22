import type { ContenidoPagina } from "@/lib/docs/tipos";

// Usuarios: listado, alta, detalle y eliminación.
export const contenido: ContenidoPagina = {
  es: {
    titulo: "Usuarios",
    resumen:
      "Cómo dar de alta a las personas que usan la plataforma, habilitarlas o deshabilitarlas y ver qué permisos tienen en total.",
    secciones: [
      {
        id: "que-es",
        titulo: "Qué es y para qué sirve",
        bloques: [
          {
            tipo: "p",
            texto:
              "«Usuarios» es la lista de personas de tu empresa que pueden entrar a la plataforma: asesores, supervisores, administradores. Acá cargás quién es cada una (nombre y email) y decidís si puede entrar o no.",
          },
          {
            tipo: "p",
            texto:
              "Lo que cada persona puede hacer no se define acá, sino en «Grupos y roles». Cada usuario pertenece a uno o más grupos de trabajo (por ejemplo «Cobranzas») y recibe los permisos y los estados auxiliares de esos grupos. Esta pantalla te muestra el resultado, pero no lo cambia.",
          },
          {
            tipo: "nota",
            texto:
              "Una persona sin grupo puede iniciar sesión, pero no tiene permisos ni estados auxiliares hasta que la asignes a un grupo.",
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
              "La tabla muestra a todas las personas, sin páginas: si no entran en pantalla, te desplazás hacia abajo. Arriba tiene un cuadro de búsqueda y podés filtrar cada columna.",
          },
          { tipo: "sub", texto: "Columnas" },
          {
            tipo: "lista",
            items: [
              "Usuario — Las iniciales y el nombre de la persona. Tocá el nombre para abrir su detalle. Si apoyás el mouse sobre él, aparece una tarjeta con el email, si está habilitada o deshabilitada y los grupos a los que pertenece.",
              "Email — La dirección de correo de la persona.",
              "Estado — «Habilitado» o «Deshabilitado». Podés filtrar por uno de los dos.",
            ],
          },
          { tipo: "sub", texto: "Acciones" },
          {
            tipo: "p",
            texto:
              "El botón «Nuevo usuario» (arriba a la derecha) abre el formulario de alta. En cada fila, el menú de tres puntos tiene «Editar», que abre el detalle de la persona, y «Eliminar», que pide confirmación. «Eliminar» solo se puede usar si la persona está deshabilitada.",
          },
        ],
      },
      {
        id: "crear",
        titulo: "Cómo crear un usuario",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "En «Usuarios», tocá «Nuevo usuario».",
              "Completá «Nombre» y «Email».",
              "Si querés, elegí un «Grupo de trabajo». Podés buscarlo escribiendo en el desplegable.",
              "Tocá «Crear usuario». Si te arrepentís, tocá «Cancelar».",
            ],
          },
          { tipo: "sub", texto: "Campos de «Datos del usuario»" },
          {
            tipo: "lista",
            items: [
              "Nombre — Nombre y apellido de la persona (por ejemplo, «Ej: Marina Acosta»). Con él se arman las iniciales que se ven en el listado.",
              "Email — El correo de la persona (por ejemplo, «Ej: marina.acosta@bancosur.com»). Es el dato que identifica a la persona en el listado.",
              "Grupo de trabajo — Opcional. Arranca en «Sin asignar». Es una lista con buscador («Buscar grupo de trabajo...»). Si nada coincide, dice «No se encontró ningún grupo de trabajo.». Elegís un solo grupo; si la persona tiene que estar en más, sumala después desde «Grupos y roles».",
            ],
          },
        ],
      },
      {
        id: "editar",
        titulo: "Cómo editar un usuario",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "En el listado, tocá el nombre de la persona o elegí «Editar» en el menú de la fila.",
              "Cambiá «Nombre», «Email» o el interruptor «Habilitado».",
              "Tocá «Guardar». Para volver sin cambios, «Cancelar».",
            ],
          },
          { tipo: "sub", texto: "Tarjeta «Usuario»" },
          {
            tipo: "lista",
            items: [
              "Nombre — Viene cargado con el nombre actual.",
              "Email — Viene cargado con el correo actual.",
              "Habilitado — Interruptor que muestra si la persona puede entrar. Si lo apagás, se le bloquea el acceso pero no se pierde su historial ni sus asignaciones, y lo podés volver a encender cuando quieras. Es lo ideal para una licencia o una baja temporal.",
            ],
          },
          { tipo: "sub", texto: "Tarjeta «Permisos y estados auxiliares»" },
          {
            tipo: "p",
            texto:
              "Es solo para consultar. Te dice cuántos grupos tiene la persona y muestra todo lo que puede hacer en total:",
          },
          {
            tipo: "lista",
            items: [
              "Permisos — Una etiqueta por sección con lo que puede hacer (por ejemplo «Campañas: Lectura, Escritura»). Si no tiene ninguno dice «Sin permisos asignados.».",
              "Estados auxiliares — Una etiqueta por cada estado que puede elegir cuando no está atendiendo, con su color. Si no tiene ninguno dice «Sin estados auxiliares asignados.».",
            ],
          },
          {
            tipo: "p",
            texto:
              "Lo que ves es la suma de lo que dan todos sus grupos, más lo que se le haya dado a esa persona en particular. Nunca se resta: los permisos solo se agregan. Los estados auxiliares dados a la persona en particular llevan la marca «+ individual».",
          },
        ],
      },
      {
        id: "eliminar",
        titulo: "Deshabilitar y eliminar",
        bloques: [
          {
            tipo: "p",
            texto:
              "Son dos acciones distintas, a propósito. Deshabilitar se puede deshacer: bloquea el acceso pero guarda el historial y las asignaciones. Eliminar es definitivo: se pierde el registro de la persona. Por eso solo se puede eliminar a alguien que ya está deshabilitado.",
          },
          {
            tipo: "pasos",
            items: [
              "Abrí el detalle de la persona y apagá el interruptor «Habilitado».",
              "Bajá hasta la tarjeta «Zona de peligro» y tocá «Eliminar usuario». Mientras la persona siga habilitada, el botón está apagado y, si apoyás el mouse, dice «Deshabilitá el usuario antes de poder eliminarlo».",
              "Confirmá en el cuadro «¿Eliminar a <nombre>?». Te avisa que la acción es permanente y no se puede deshacer.",
            ],
          },
          {
            tipo: "p",
            texto:
              "También podés eliminar desde el menú de la fila del listado. Si la persona está habilitada, la opción aparece apagada.",
          },
          {
            tipo: "nota",
            texto:
              "Ante la duda, deshabilitá. Eliminar no tiene vuelta atrás.",
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
              "Grupos — Una persona puede estar en más de un grupo y sus permisos se suman. Se asigna desde «Grupos y roles», en la solapa «General» del grupo.",
              "Estados auxiliares — Los que ve una persona salen de sus grupos. Se crean en «Estados auxiliares».",
              "Eliminar — Solo con la persona deshabilitada.",
            ],
          },
        ],
      },
    ],
  },
  en: {
    titulo: "Users",
    resumen:
      "How to add the people who use the platform, enable or disable them and see which permissions they have overall.",
    secciones: [
      {
        id: "que-es",
        titulo: "What it is and what it is for",
        bloques: [
          {
            tipo: "p",
            texto:
              "“Users” is the list of people in your company who can sign in to the platform: agents, supervisors, administrators. Here you enter who each person is (name and email) and decide whether they can sign in.",
          },
          {
            tipo: "p",
            texto:
              "What each person can do is not defined here, but in “Groups and roles”. Every user belongs to one or more working groups (for example “Cobranzas”) and receives the permissions and auxiliary states of those groups. This screen shows you the result, but does not change it.",
          },
          {
            tipo: "nota",
            texto:
              "A person without a group can sign in, but has no permissions or auxiliary states until you assign them to a group.",
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
              "The table shows everybody, without pages: if they do not fit on screen, you scroll down. It has a search box on top and you can filter each column.",
          },
          { tipo: "sub", texto: "Columns" },
          {
            tipo: "lista",
            items: [
              "User — The person's initials and name. Click the name to open their detail. If you hover over it, a card shows the email, whether they are enabled or disabled and the groups they belong to.",
              "Email — The person's email address.",
              "State — “Enabled” or “Disabled”. You can filter by either one.",
            ],
          },
          { tipo: "sub", texto: "Actions" },
          {
            tipo: "p",
            texto:
              "The “New user” button (top right) opens the creation form. On each row, the three-dot menu has “Edit”, which opens the person's detail, and “Delete”, which asks for confirmation. “Delete” can only be used if the person is disabled.",
          },
        ],
      },
      {
        id: "crear",
        titulo: "How to create a user",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "In “Users”, click “New user”.",
              "Fill in “Name” and “Email”.",
              "If you want, pick a “Working group”. You can search it by typing in the dropdown.",
              "Click “Create user”. If you change your mind, click “Cancel”.",
            ],
          },
          { tipo: "sub", texto: "Fields in “User details”" },
          {
            tipo: "lista",
            items: [
              "Name — The person's full name (for example, “e.g. Marina Acosta”). It is used to build the initials shown in the list.",
              "Email — The person's email (for example, “e.g. marina.acosta@bancosur.com”). It is the data that identifies the person in the list.",
              "Working group — Optional. It starts at “Unassigned”. It is a list with a search box (“Search working group...”). If nothing matches, it says “No working group found.”. You choose one group; if the person has to be in more, add them later from “Groups and roles”.",
            ],
          },
        ],
      },
      {
        id: "editar",
        titulo: "How to edit a user",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "In the list, click the person's name or choose “Edit” in the row menu.",
              "Change “Name”, “Email” or the “Enabled” switch.",
              "Click “Save”. To go back with no changes, “Cancel”.",
            ],
          },
          { tipo: "sub", texto: "“User” card" },
          {
            tipo: "lista",
            items: [
              "Name — Loaded with the current name.",
              "Email — Loaded with the current email.",
              "Enabled — Switch that shows whether the person can sign in. If you turn it off, their access is blocked but their history and assignments are kept, and you can turn it on again whenever you want. It is ideal for a leave or a temporary absence.",
            ],
          },
          { tipo: "sub", texto: "“Permissions and auxiliary states” card" },
          {
            tipo: "p",
            texto:
              "It is for consultation only. It tells you how many groups the person has and shows everything they can do in total:",
          },
          {
            tipo: "lista",
            items: [
              "Permissions — One tag per section with what they can do (for example “Campaigns: Read, Write”). If they have none it says “No permissions assigned.”.",
              "Auxiliary states — One tag for each state they can pick when they are not handling interactions, with its color. If they have none it says “No auxiliary states assigned.”.",
            ],
          },
          {
            tipo: "p",
            texto:
              "What you see is the sum of what all their groups give, plus whatever was given to that person in particular. Nothing is ever subtracted: permissions are only added. Auxiliary states given to the person in particular carry the “+ individual” mark.",
          },
        ],
      },
      {
        id: "eliminar",
        titulo: "Disable and delete",
        bloques: [
          {
            tipo: "p",
            texto:
              "They are two different actions, on purpose. Disabling can be undone: it blocks access but keeps the history and assignments. Deleting is final: the person's record is lost. That is why you can only delete someone who is already disabled.",
          },
          {
            tipo: "pasos",
            items: [
              "Open the person's detail and turn off the “Enabled” switch.",
              "Scroll to the “Danger zone” card and click “Delete user”. While the person is still enabled, the button is off and, if you hover over it, it says “Disable the user before you can delete them”.",
              "Confirm in the “Delete <name>?” dialog. It warns you that the action is permanent and cannot be undone.",
            ],
          },
          {
            tipo: "p",
            texto:
              "You can also delete from the row menu in the list. If the person is enabled, the option appears turned off.",
          },
          {
            tipo: "nota",
            texto: "When in doubt, disable. Deleting cannot be undone.",
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
              "Groups — A person can be in more than one group and their permissions add up. It is assigned from “Groups and roles”, in the group's “General” tab.",
              "Auxiliary states — The ones a person sees come from their groups. They are created in “Auxiliary states”.",
              "Delete — Only with the person disabled.",
            ],
          },
        ],
      },
    ],
  },
};
