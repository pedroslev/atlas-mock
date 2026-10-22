import type { ContenidoPagina } from "@/lib/docs/tipos";

// Listas de exclusión: listas de contactos que no deben ser contactados.
export const contenido: ContenidoPagina = {
  es: {
    titulo: "Listas de exclusión",
    resumen:
      "Cómo administrar los contactos que no deben ser contactados en tus campañas, ya sea por decisión propia o por registros oficiales de no-llame.",
    secciones: [
      {
        id: "que-es",
        titulo: "Qué es una lista de exclusión",
        bloques: [
          {
            tipo: "p",
            texto:
              "Una lista de exclusión reúne teléfonos, WhatsApp o mails a los que no se debe contactar. Cada lista tiene un «Tipo»:",
          },
          {
            tipo: "lista",
            items: [
              "Exclusión de tareas — Una lista propia: por ejemplo, contactos que pidieron no ser llamados este trimestre.",
              "Gubernamental — Un registro oficial de no-llame.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Se asigna en «Campañas», en el campo «Lista de exclusión». Cada campaña usa una sola lista, y si no elegís ninguna queda «Sin asignar».",
          },
        ],
      },
      {
        id: "listado",
        titulo: "El listado",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Nombre — Nombre de la lista. Al hacer click se abre su edición.",
              "Tipo — «Exclusión de tareas» o «Gubernamental». Se puede filtrar por tipo.",
              "Contactos — Cantidad de contactos excluidos.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Arriba de la tabla hay un buscador, y los encabezados permiten ordenar y filtrar. El botón «Nueva lista» está arriba a la derecha. El menú de cada fila (los tres puntos) ofrece «Editar», «Descargar» y «Eliminar» (en rojo, con confirmación). No hay acciones masivas.",
          },
        ],
      },
      {
        id: "crear-editar",
        titulo: "Crear y editar una lista",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "Tocá «Nueva lista». Para editar una existente, tocá su nombre o «Editar».",
              "En «Datos de la lista», escribí el «Nombre» y elegí el «Tipo».",
              "Tocá «Crear lista» (o «Confirmar» si estás editando). «Cancelar» sale sin guardar.",
              "Cargá los contactos excluidos desde la edición de la lista (ver la sección siguiente).",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Ej: «Excluidos Cobranzas Q4». Es lo que vas a elegir después en la campaña.",
              "Tipo — «Exclusión de tareas» o «Gubernamental». Por defecto, «Exclusión de tareas».",
            ],
          },
          {
            tipo: "p",
            texto:
              "La pantalla de alta solo pide estos dos datos: los contactos se agregan después, abriendo la lista.",
          },
        ],
      },
      {
        id: "contactos",
        titulo: "Los contactos excluidos",
        bloques: [
          {
            tipo: "p",
            texto:
              "En la edición de la lista, la tarjeta «Contactos excluidos» muestra cuántos hay («1 contacto excluido», «2 contactos excluidos») y una tabla con «Contacto» y «Tipo». Si la lista está vacía dice «Todavía no hay contactos excluidos en esta lista.».",
          },
          {
            tipo: "pasos",
            items: [
              "Tocá «Agregar contacto».",
              "Escribí el «Contacto»: un teléfono (+54 11 4000-0000) o un mail (email@ejemplo.com).",
              "Elegí el «Tipo»: «Llamada», «WhatsApp» o «Email». Por defecto, «Llamada».",
              "Tocá «Agregar». El botón está deshabilitado mientras el contacto esté vacío.",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Buscar — El buscador «Buscar por contacto o tipo…» filtra la tabla mientras escribís. Si nada coincide, dice «No hay contactos que coincidan con» lo que escribiste. Solo aparece cuando la lista tiene contactos.",
              "Quitar — La cruz roja «Quitar contacto» de cada fila lo saca de la lista, sin pedir confirmación.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "El tipo del contacto lo elegís vos: la pantalla no revisa que el texto sea coherente con el tipo (por ejemplo, un mail marcado como «Llamada») ni que el contacto no esté repetido.",
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
              "Dónde se usa — En «Campañas»: una lista por campaña. A diferencia de clasificaciones y feriados, el campo no hereda del proyecto.",
              "La descripción de la lista no se edita en estas pantallas.",
            ],
          },
        ],
      },
    ],
  },
  en: {
    titulo: "Exclusion lists",
    resumen:
      "How to manage the contacts that must not be reached in your campaigns, whether by your own decision or because of official do-not-call registries.",
    secciones: [
      {
        id: "que-es",
        titulo: "What an exclusion list is",
        bloques: [
          {
            tipo: "p",
            texto:
              "An exclusion list gathers phones, WhatsApp numbers or emails that must not be contacted. Each list has a «Type»:",
          },
          {
            tipo: "lista",
            items: [
              "Exclusión de tareas (task exclusion) — Your own list: for example, contacts who asked not to be called this quarter.",
              "Gubernamental (government) — An official do-not-call registry.",
            ],
          },
          {
            tipo: "p",
            texto:
              "It is assigned in «Campaigns», in the «Exclusion list» field. Each campaign uses a single list, and if you pick none it stays «Unassigned».",
          },
        ],
      },
      {
        id: "listado",
        titulo: "The list",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Name — Name of the list. Click it to open its edit screen.",
              "Type — «Exclusión de tareas» or «Gubernamental». You can filter by type.",
              "Contacts — Number of excluded contacts.",
            ],
          },
          {
            tipo: "p",
            texto:
              "There is a search box above the table, and the headers let you sort and filter. The «New list» button is at the top right. Each row's menu (the three dots) offers «Edit», «Download» and «Delete» (in red, with confirmation). There are no bulk actions.",
          },
        ],
      },
      {
        id: "crear-editar",
        titulo: "Creating and editing a list",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "Click «New list». To edit an existing one, click its name or «Edit».",
              "In «List details», type the «Name» and choose the «Type».",
              "Click «Create list» (or «Confirm» if you are editing). «Cancel» leaves without saving.",
              "Load the excluded contacts from the list's edit screen (see the next section).",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Name — E.g. «Excluidos Cobranzas Q4». It is what you will pick later in the campaign.",
              "Type — «Task exclusion» or «Government». Default «Task exclusion».",
            ],
          },
          {
            tipo: "p",
            texto:
              "The creation screen only asks for these two fields: contacts are added afterwards, by opening the list.",
          },
        ],
      },
      {
        id: "contactos",
        titulo: "Excluded contacts",
        bloques: [
          {
            tipo: "p",
            texto:
              "On the list's edit screen, the «Excluded contacts» card shows how many there are («1 excluded contact», «2 excluded contacts») and a table with «Contact» and «Type». If the list is empty it says «There are no excluded contacts in this list yet.».",
          },
          {
            tipo: "pasos",
            items: [
              "Click «Add contact».",
              "Type the «Contact»: a phone (+54 11 4000-0000) or an email (email@ejemplo.com).",
              "Choose the «Type»: «Call», «WhatsApp» or «Email». Default «Call».",
              "Click «Add». The button is disabled while the contact is empty.",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Search — The «Search by contact or type…» box filters the table as you type. If nothing matches, it says «No contacts match» followed by what you typed. It only appears when the list has contacts.",
              "Remove — The red cross «Remove contact» on each row takes it off the list, without asking for confirmation.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "You choose the contact's type: the screen does not check that the text matches the type (for example, an email marked as «Call») nor that the contact isn't repeated.",
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
              "Where it is used — In «Campaigns»: one list per campaign. Unlike classifications and holidays, the field does not inherit from the project.",
              "The list's description is not edited on these screens.",
            ],
          },
        ],
      },
    ],
  },
};
