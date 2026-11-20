import type { ContenidoPagina } from "@/lib/docs/tipos";

// Listas de exclusión: listas de contactos que no deben ser contactados.
// ATLAS-1444: sin tipo de lista; canal y sentido por contacto; importar y quitar
// por archivo; "Dónde se usa".
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
              "Una lista de exclusión reúne teléfonos, WhatsApp o mails a los que no se debe contactar. Las listas no tienen tipo: todas funcionan igual, sean de un registro oficial o propias.",
          },
          {
            tipo: "p",
            texto:
              "Se asigna en «Proyectos» y en «Campañas»: una lista en cada uno. La campaña usa la del proyecto si no tiene una propia.",
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
              "Nombre — Nombre de la lista. Al hacer click se abre su detalle.",
              "Descripción — Para qué se usa la lista.",
              "Contactos — Cantidad de contactos excluidos.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Arriba de la tabla hay un buscador, y los encabezados permiten ordenar y filtrar. El botón «Nueva lista» está arriba a la derecha. El menú de cada fila (los tres puntos) ofrece «Editar», «Duplicar», «Descargar» y «Eliminar» (en rojo, con confirmación).",
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
              "En «Datos de la lista», escribí el «Nombre» y, si querés, la «Descripción».",
              "Tocá «Crear lista» (o «Confirmar» si estás editando). «Cancelar» sale sin guardar.",
              "Cargá los contactos desde el detalle de la lista (ver la sección siguiente).",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Obligatorio y único. Ej: «Excluidos Cobranzas Q4». Es lo que vas a elegir después en el proyecto o la campaña.",
              "Descripción — Opcional. Se edita también desde el detalle.",
              "Duplicar — Abre el alta con los datos de la lista original y copia sus contactos con su canal y su sentido. La fecha y el usuario de alta son los de la copia.",
            ],
          },
          {
            tipo: "p",
            texto:
              "En el detalle, la tarjeta «Dónde se usa» muestra los proyectos y las campañas que tienen la lista, con un enlace a cada uno. Las campañas que la heredan del proyecto llevan la marca «Heredada del proyecto». Si no está asignada a ninguno, dice que no excluye a nadie.",
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
              "La tarjeta «Contactos excluidos» muestra cuántos hay y una tabla paginada, ordenada por fecha de alta (lo más nuevo primero). El buscador busca en toda la lista y el filtro (el embudo) permite filtrar por «Canal» y por «Sentido». Con el selector de columnas se enciende «Usuario de alta», que viene oculta.",
          },
          {
            tipo: "lista",
            items: [
              "Contacto — El número (solo dígitos) o el email (en minúsculas).",
              "Canal — «Llamada», «WhatsApp» o «Email».",
              "Sentido — «Saliente» (no se lo contacta desde Atlas), «Entrante» (cuando inicia una interacción, el workflow puede desviarla) o «Bidireccional» (las dos cosas).",
              "Fecha de alta y Usuario de alta — Cuándo y quién lo cargó. Los contactos cargados antes de que se registraran estos datos muestran «—».",
            ],
          },
          {
            tipo: "pasos",
            items: [
              "Tocá «Agregar contactos».",
              "En «Contactos», escribí o pegá uno por línea: teléfonos (+54 11 4000-0000) o mails.",
              "Elegí el «Canal» y el «Sentido» (por defecto, «Llamada» y «Saliente»). Se aplican a todo lo cargado.",
              "Tocá «Agregar».",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Validación — Los números quedan solo con dígitos (sin el + inicial, espacios, guiones ni paréntesis) y tienen que tener entre 8 y 15. Los mails tienen que tener formato texto@dominio. Un mail no se acepta como «Llamada» ni un número como «Email».",
              "Líneas no válidas — Lo válido se agrega y lo que no queda en el cuadro, en rojo, para corregirlo. «Cerrar» se queda con lo agregado.",
              "Repetidos — Si el contacto ya está con ese canal, no se duplica: se combina el sentido (Saliente + Entrante = Bidireccional). El diálogo informa cuántos se agregaron y cuántos ya estaban.",
              "Editar — El lápiz de cada fila abre el mismo diálogo con el contacto, el canal y el sentido cargados. Si el resultado queda igual a otro contacto de la lista con ese canal, avisa «Ese contacto ya está en la lista.» y no guarda. Para achicar un sentido (de Bidireccional a Saliente), se edita el contacto.",
              "Quitar — La cruz roja de cada fila lo saca de la lista, sin pedir confirmación.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Agregar, Editar y Quitar quedan pendientes hasta tocar «Confirmar» arriba a la derecha. Salir antes muestra el aviso de cambios sin guardar.",
          },
        ],
      },
      {
        id: "archivo",
        titulo: "Importar y quitar por archivo",
        bloques: [
          {
            tipo: "p",
            texto:
              "«Importar archivo» y, en el menú de los tres puntos, «Quitar por archivo» abren el mismo asistente de tres pasos. Se guardan en el momento, al terminar. Si hay cambios pendientes, antes pregunta: «Confirmar y seguir» los guarda y deja en el detalle; «Descartar y seguir» los descarta.",
          },
          {
            tipo: "pasos",
            items: [
              "Archivo — .txt (uno por línea), .csv, .xlsx o .xls (primera hoja). Con una sola columna se toma como Contacto, sin fila de títulos. Con varias, la primera fila lleva los títulos: se usan Contacto, Canal y Sentido, y el resto se ignora. Si el archivo no trae Canal o Sentido, se elige un valor para todo el archivo.",
              "Limpieza (y Modo, al importar) — Reglas opcionales para números: reemplazar prefijos (solo al comienzo del número) y quitar caracteres. La lista recuerda las reglas de su última importación. Modo «Agregar» suma lo del archivo y combina el sentido de los que ya estaban; «Reemplazar la lista» deja la lista igual al archivo solo para las combinaciones de canal y sentido que trae, y a los que ya estaban les deja el sentido del archivo.",
              "Vista previa — Contadores que también filtran (Total, Válidos, Repetidos en el archivo, No válidos; al quitar, además Están y No están en la lista) y una tabla con el valor original, el valor después de limpiar y el estado. Lo no válido y lo repetido aparece primero.",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Canal y Sentido en el archivo — Aceptan los nombres sin importar mayúsculas (llamada, WHATSAPP, Saliente…). Un valor que no se reconoce marca la fila como no válida.",
              "Reemplazar — Pide confirmación y avisa qué combinaciones de canal y sentido se van a vaciar de lo que no viene en el archivo.",
              "Quitar por archivo — Quita el contacto del canal indicado; el sentido no importa. Un número que está como Llamada y como WhatsApp, quitado de Llamada, sigue como WhatsApp.",
              "Al confirmar — Barra de progreso, cancelable: lo procesado hasta el momento queda guardado. El resultado muestra Agregados, Ya estaban, Actualizados (cambió el sentido), Quitados y No válidos, con descarga de los no válidos.",
            ],
          },
        ],
      },
      {
        id: "masivas",
        titulo: "Descargar y quitar todos",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Descargar — En el menú de los tres puntos del detalle (y en el del listado). Baja un .csv con Contacto, Canal, Sentido, Fecha de alta y Usuario de alta, con los mismos títulos que la importación.",
              "Quitar todos — En el mismo menú, en rojo. Pide confirmación y se guarda en el momento.",
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
              "An exclusion list gathers phones, WhatsApp numbers or emails that must not be contacted. Lists have no type: they all work the same, whether they come from an official registry or are your own.",
          },
          {
            tipo: "p",
            texto:
              "It is assigned in «Projects» and «Campaigns»: one list in each. A campaign uses the project's list if it has none of its own.",
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
              "Name — Name of the list. Click it to open its detail.",
              "Description — What the list is for.",
              "Contacts — Number of excluded contacts.",
            ],
          },
          {
            tipo: "p",
            texto:
              "There is a search box above the table, and the headers let you sort and filter. The «New list» button is at the top right. Each row's menu offers «Edit», «Duplicate», «Download» and «Delete» (in red, with confirmation).",
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
              "In «List details», type the «Name» and, optionally, the «Description».",
              "Click «Create list» (or «Confirm» if you are editing). «Cancel» leaves without saving.",
              "Load the contacts from the list's detail (see the next section).",
            ],
          },
          {
            tipo: "p",
            texto:
              "In the detail, the «Where it is used» card lists the projects and campaigns that have the list, with a link to each. Campaigns that inherit it from the project are marked «Inherited from the project».",
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
              "The «Excluded contacts» card shows a paginated table sorted by date added. Search looks through the whole list, and the filter lets you filter by «Channel» and «Direction». «Added by» is hidden and can be turned on from the column selector.",
          },
          {
            tipo: "lista",
            items: [
              "Add contacts — One per line, with a Channel and a Direction for all of them. Invalid lines stay in the box to fix. If a contact is already there with that channel, the direction is combined.",
              "Edit — Opens the same dialog with the contact loaded. If it ends up equal to another contact with that channel, it says «That contact is already in the list.» and does not save.",
              "Remove — The red cross removes it, without confirmation.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Adding, editing and removing stay pending until you click «Confirm». Import, Remove from file and Remove all are saved right away.",
          },
        ],
      },
      {
        id: "archivo",
        titulo: "Import and remove from a file",
        bloques: [
          {
            tipo: "p",
            texto:
              "A three-step wizard: File, Cleanup (and Mode, when importing), Preview. «Add» mode combines directions; «Replace the list» leaves the list equal to the file for the channel and direction combinations it contains. Processing shows a cancellable progress bar and a result summary.",
          },
        ],
      },
    ],
  },
};
