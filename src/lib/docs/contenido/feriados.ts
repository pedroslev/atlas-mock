import type { ContenidoPagina } from "@/lib/docs/tipos";

// Feriados: grupos de fechas no laborables y su calendario anual.
export const contenido: ContenidoPagina = {
  es: {
    titulo: "Feriados",
    resumen:
      "Cómo armar grupos de fechas no laborables para asignarlos a tus proyectos y campañas, de modo que no se opere esos días.",
    secciones: [
      {
        id: "que-es",
        titulo: "Qué es un grupo de feriados",
        bloques: [
          {
            tipo: "p",
            texto:
              "Un grupo de feriados es un conjunto de fechas no laborables, cada una con su motivo (por ejemplo «Navidad»). Podés tener varios: uno nacional, uno provincial, uno por país.",
          },
          {
            tipo: "p",
            texto:
              "Se asigna en «Proyectos» y en «Campañas» (campo «Feriados»), para que no se opere esos días. La campaña puede heredar el grupo del proyecto o elegir otro.",
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
              "Nombre — Nombre del grupo. Al hacer click se abre su edición.",
              "Fechas — Cantidad de fechas marcadas, por ejemplo «16 fecha(s)».",
              "Primera fecha — La fecha más temprana del grupo con su motivo (día y mes abreviado); «—» si el grupo no tiene fechas.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Arriba de la tabla hay un buscador, y los encabezados permiten ordenar y filtrar. El botón «Nuevo grupo de feriados» está arriba a la derecha. El menú de cada fila (los tres puntos) ofrece «Editar» y «Eliminar». No hay acciones masivas.",
          },
        ],
      },
      {
        id: "crear-editar",
        titulo: "Crear y editar un grupo",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "Tocá «Nuevo grupo de feriados». Para editar uno existente, tocá su nombre o «Editar» en el menú de la fila.",
              "Escribí el «Nombre del grupo».",
              "Elegí el año en el selector «Año» del calendario.",
              "Tocá cada día no laborable. En la ventana escribí el «Motivo» y tocá «Marcar feriado».",
              "Repetí con el resto de las fechas, cambiando de año si hace falta.",
              "Tocá «Crear grupo» (o «Confirmar» si estás editando). «Cancelar» sale sin crear.",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre del grupo — Ej: «Feriados Argentina 2027». Al editar viene con el nombre actual.",
              "Año — Elige qué año muestra el calendario. Arranca en el año en curso y se puede elegir desde un año atrás hasta tres adelante.",
              "Motivo — Obligatorio para marcar una fecha: sin motivo el botón queda deshabilitado. Con Enter también se guarda.",
            ],
          },
          { tipo: "sub", texto: "Trabajar con el calendario" },
          {
            tipo: "lista",
            items: [
              "Marcar un día — Tocá un día sin marcar: se abre una ventana con la fecha completa. Escribí el motivo y tocá «Marcar feriado».",
              "Editar el motivo — Tocá un día marcado: cambiá el motivo y tocá «Guardar».",
              "Quitar una fecha — Tocá el día marcado y elegí «Quitar fecha», o usá el tacho de la lista lateral.",
              "Fechas marcadas — El panel lateral lista todas las fechas del grupo (de todos los años) ordenadas, con su motivo y el total entre paréntesis. Vacío dice «Todavía no hay fechas marcadas.».",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Cada fecha tiene un solo motivo: si marcás de nuevo un día ya marcado, se reemplaza el motivo anterior.",
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
              "Quitar una fecha desde el panel lateral no pide confirmación.",
              "Un grupo puede tener fechas de varios años; el selector «Año» solo cambia lo que se ve.",
              "El nombre del grupo es lo que vas a elegir después en proyectos y campañas.",
            ],
          },
        ],
      },
    ],
  },
  en: {
    titulo: "Holidays",
    resumen:
      "How to build groups of non-working dates and assign them to your projects and campaigns so no work happens on those days.",
    secciones: [
      {
        id: "que-es",
        titulo: "What a holiday group is",
        bloques: [
          {
            tipo: "p",
            texto:
              "A holiday group is a set of non-working dates, each with its reason (for example «Navidad»). You can have several: a national one, a provincial one, one per country.",
          },
          {
            tipo: "p",
            texto:
              "It is assigned in «Projects» and in «Campaigns» («Holidays» field), so no work happens on those days. A campaign can inherit the group from the project or choose another one.",
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
              "Name — Name of the group. Click it to open its edit screen.",
              "Dates — Number of marked dates, for example «16 date(s)».",
              "First date — The group's earliest date with its reason (day and abbreviated month); «—» if the group has no dates.",
            ],
          },
          {
            tipo: "p",
            texto:
              "There is a search box above the table, and the headers let you sort and filter. The «New holiday group» button is at the top right. Each row's menu (the three dots) offers «Edit» and «Delete». There are no bulk actions.",
          },
        ],
      },
      {
        id: "crear-editar",
        titulo: "Creating and editing a group",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "Click «New holiday group». To edit an existing one, click its name or «Edit» in the row menu.",
              "Type the «Group name».",
              "Choose the year in the calendar's «Year» selector.",
              "Click each non-working day. In the window type the «Reason» and click «Mark holiday».",
              "Repeat for the rest of the dates, switching year if needed.",
              "Click «Create group» (or «Confirm» if you are editing). «Cancel» leaves without creating.",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Group name — E.g. «Argentina Holidays 2027». When editing it comes with the current name.",
              "Year — Chooses which year the calendar shows. It starts on the current year and you can pick from one year back to three ahead.",
              "Reason — Required to mark a date: without a reason the button stays disabled. Enter also saves.",
            ],
          },
          { tipo: "sub", texto: "Working with the calendar" },
          {
            tipo: "lista",
            items: [
              "Mark a day — Click an unmarked day: a window opens with the full date. Type the reason and click «Mark holiday».",
              "Edit the reason — Click a marked day: change the reason and click «Save».",
              "Remove a date — Click the marked day and choose «Remove date», or use the trash icon in the side list.",
              "Marked dates — The side panel lists all the group's dates (from every year) in order, with their reason and the total in parentheses. When empty it says «No dates marked yet.».",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Each date has a single reason: if you mark an already marked day again, the previous reason is replaced.",
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
              "Removing a date from the side panel does not ask for confirmation.",
              "A group can hold dates from several years; the «Year» selector only changes what you see.",
              "The group name is what you will pick later in projects and campaigns.",
            ],
          },
        ],
      },
    ],
  },
};
