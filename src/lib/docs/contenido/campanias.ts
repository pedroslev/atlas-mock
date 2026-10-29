import type { ContenidoPagina } from "@/lib/docs/tipos";

// Campañas y proyectos: el listado agrupado por proyecto, el alta y la edición
// de una campaña (solapas General, parámetros y Usuarios) y el alta, edición y
// eliminación de un proyecto, que se gestiona desde la misma pantalla.
export const contenido: ContenidoPagina = {
  es: {
    titulo: "Campañas",
    resumen:
      "Cómo organizar la operación en campañas y proyectos: qué configura cada solapa, qué se hereda del proyecto y qué reglas hay que conocer.",
    secciones: [
      {
        id: "que-es",
        titulo: "Qué es una campaña y qué es un proyecto",
        bloques: [
          {
            tipo: "p",
            texto:
              "Una campaña es la unidad con la que se organiza la atención: define qué pueden hacer los agentes durante la interacción, qué se graba, desde qué líneas se llama y quiénes la operan. Los agentes trabajan sobre campañas.",
          },
          {
            tipo: "p",
            texto:
              "Un proyecto agrupa campañas que comparten una misma configuración de base: horarios de atención, grupo de clasificaciones y grupo de feriados. Cada campaña pertenece a un solo proyecto y, salvo que la personalices, toma esa configuración del proyecto. Así cargás los horarios una vez y no campaña por campaña.",
          },
          {
            tipo: "p",
            texto:
              "No hay una sección «Proyectos» aparte: los proyectos se ven y se gestionan desde la pantalla «Campañas», que muestra las campañas agrupadas por proyecto.",
          },
          { tipo: "sub", texto: "Con qué se relaciona" },
          {
            tipo: "lista",
            items: [
              "Proyecto — Toda campaña pertenece a uno. De él hereda horarios, grupo de clasificaciones y grupo de feriados.",
              "Cuentas — Una campaña puede tener asociadas cuentas salientes: las líneas desde las que se hacen las llamadas. Ver «Cuentas salientes» más abajo y la documentación de «Cuentas».",
              "Clasificaciones, Marcas, Feriados y Listas de exclusión — La campaña elige grupos o listas que ya existen en esas secciones. Desde acá solo se asignan y se ven; el contenido se edita en cada sección.",
              "Usuarios — Los agentes asignados son los que operan la campaña.",
              "Grupos de trabajo — La grabación se configura también en el grupo de trabajo, y entre los dos gana lo más restrictivo (ver «Grabación»).",
            ],
          },
        ],
      },
      {
        id: "listado",
        titulo: "El listado de campañas",
        bloques: [
          {
            tipo: "p",
            texto:
              "La pantalla «Campañas» muestra una tabla con las campañas agrupadas por proyecto. Cada grupo arranca desplegado y tiene como encabezado el nombre del proyecto con un ícono de lápiz: tocalo para editar ese proyecto (el tooltip dice «Editar proyecto»).",
          },
          { tipo: "sub", texto: "Columnas" },
          {
            tipo: "lista",
            items: [
              "Proyecto — El grupo al que pertenece la campaña. Si el proyecto no se encuentra, figura «Sin proyecto».",
              "Nombre — El nombre de la campaña. Es un enlace: lleva a su edición.",
              "Usuarios asignados — Cuántos usuarios operan la campaña.",
              "Cuentas salientes — Cuántas cuentas salientes tiene asociadas.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Un proyecto que todavía no tiene campañas también aparece, con una fila que dice «Sin campañas» y sin acciones. Es la forma de llegar a un proyecto vacío para editarlo o eliminarlo.",
          },
          { tipo: "sub", texto: "Búsqueda" },
          {
            tipo: "p",
            texto:
              "La tabla trae un campo de búsqueda siempre visible para filtrar las filas. La tabla no se pagina: si hay más filas de las que entran en pantalla, se desplaza adentro con el encabezado fijo.",
          },
          { tipo: "sub", texto: "Acciones del encabezado" },
          {
            tipo: "lista",
            items: [
              "Nuevo proyecto — Abre el alta de un proyecto (ver «Crear un proyecto»).",
              "Nueva campaña — Abre el alta de una campaña (ver «Crear una campaña»).",
            ],
          },
          { tipo: "sub", texto: "Acciones por fila" },
          {
            tipo: "lista",
            items: [
              "Editar — Abre la edición de la campaña.",
              "Asignar usuarios — Abre la edición de la campaña para sumar o quitar usuarios en la solapa «Usuarios».",
              "Duplicar — Pensada para crear una campaña nueva a partir de una existente.",
              "Eliminar — Acción destructiva, en rojo: pide confirmación antes de quitar la campaña.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "No hay acciones masivas ni selección de varias filas: cada acción se aplica a una campaña por vez.",
          },
        ],
      },
      {
        id: "crear-campania",
        titulo: "Crear una campaña",
        bloques: [
          {
            tipo: "p",
            texto:
              "El alta pide lo mínimo para empezar: nombre y proyecto. Todo lo demás es opcional y se puede completar más adelante desde la edición. Mientras no lo definas, la campaña hereda la configuración del proyecto y usa los valores por defecto de los parámetros.",
          },
          {
            tipo: "pasos",
            items: [
              "En «Campañas» tocá «Nueva campaña» (o «Nueva campaña en este proyecto» desde la edición de un proyecto).",
              "En «Información general» escribí el «Nombre» y elegí el «Proyecto».",
              "Si querés, completá «Descripción» y «Objetivo».",
              "Si la campaña va a hacer llamadas salientes, elegí sus «Cuentas salientes». Es opcional.",
              "A la derecha, en «Configuración heredada del proyecto», asigná grupos o listas solo si la campaña necesita algo distinto del proyecto, y activá «Personalizar» en los horarios si querés horarios propios.",
              "Tocá «Crear campaña». «Cancelar» vuelve al listado sin crear nada.",
            ],
          },
          { tipo: "sub", texto: "Información general" },
          {
            tipo: "lista",
            items: [
              "Nombre — Obligatorio (marcado con asterisco). Texto libre; el ejemplo de la pantalla es «Ej: Cobranzas Activa PCP».",
              "Proyecto — Obligatorio (asterisco). Se elige de una lista con búsqueda («Buscar proyecto...»); si no hay coincidencias dice «No se encontró ningún proyecto.». Solo se puede elegir al crear: en la edición el proyecto ya no se cambia.",
              "Descripción — Opcional. Texto libre de varias líneas.",
              "Objetivo — Opcional. Texto libre de varias líneas: para qué existe la campaña.",
            ],
          },
          { tipo: "sub", texto: "Cuentas salientes" },
          {
            tipo: "p",
            texto:
              "Las líneas desde las que se pueden realizar llamadas para esta campaña. Es opcional; podés asociarlas más adelante. El detalle está en «Cuentas salientes».",
          },
          { tipo: "sub", texto: "Configuración heredada del proyecto" },
          {
            tipo: "p",
            texto:
              "Todo lo que dejes sin asignar acá toma la configuración del proyecto elegido. Podés personalizarlo en cualquier momento desde la edición de la campaña. Los campos de esta tarjeta se explican en «Herencia: grupos y listas» y «Horarios de atención».",
          },
          {
            tipo: "nota",
            texto:
              "El alta no incluye las solapas de parámetros ni la de usuarios: la campaña nace con los valores por defecto de cada parámetro y sin usuarios asignados. Se ajustan desde la edición.",
          },
        ],
      },
      {
        id: "editar-campania",
        titulo: "Editar una campaña: las solapas",
        bloques: [
          {
            tipo: "p",
            texto:
              "Al entrar a una campaña se ve su nombre como título y «Campaña de <proyecto>» como descripción. La edición se divide en siete solapas. «Cancelar» vuelve al listado; «Confirmar» guarda los cambios.",
          },
          {
            tipo: "lista",
            items: [
              "General — Datos básicos, cuentas salientes, herencia y horarios.",
              "Controles del agente — Qué acciones puede usar el agente durante la interacción.",
              "Visualización — Qué ve el agente en su pantalla de trabajo.",
              "Grabación — Qué se graba y en qué momentos.",
              "Config. operativa — Cómo se asignan las interacciones al agente.",
              "URLs externas — Direcciones que se abren durante la interacción.",
              "Usuarios — Quiénes operan la campaña.",
            ],
          },
          {
            tipo: "p",
            texto:
              "En la solapa «General» están «Nombre», «Descripción» y «Objetivo» (los mismos que en el alta; acá no llevan asterisco), «Cuentas salientes», «Configuración heredada del proyecto» y «Horarios de atención». Cuando la campaña tiene proyecto, la tarjeta de herencia aclara «Se toma de <proyecto>, salvo lo que personalices acá.»; si no, dice «Podés personalizarla para esta campaña.».",
          },
        ],
      },
      {
        id: "herencia",
        titulo: "Herencia: grupos y listas",
        bloques: [
          {
            tipo: "p",
            texto:
              "La tarjeta «Configuración heredada del proyecto» tiene cuatro campos. En cada uno elegís un grupo o lista que ya existe; la campaña lo usa por referencia, es decir que nunca se edita su contenido desde acá. Al lado de cada campo hay un botón con un ojo para ver, en una ventana de solo lectura, lo que contiene lo elegido. El botón se habilita solo cuando hay algo elegido.",
          },
          {
            tipo: "lista",
            items: [
              "Grupo de clasificaciones — Las clasificaciones (resultados de gestión) que el agente puede cargar. El ojo («Ver clasificaciones del grupo») muestra cada clasificación con su tipo. Se edita en «Clasificaciones».",
              "Grupo de marcas — Las marcas que el agente puede agregar a la interacción. El ojo («Ver marcas del grupo») muestra cada marca con su descripción, si la tiene. Se edita en «Marcas».",
              "Feriados — El grupo de feriados que la campaña respeta. El ojo («Ver fechas del grupo») muestra cada fecha con su descripción. Se edita en «Feriados».",
              "Lista de exclusión — Contactos a los que la campaña no debe llamar. El ojo («Ver contactos de la lista») muestra cada contacto con su tipo. Se edita en «Listas de exclusión». A diferencia de los otros tres, este campo no se hereda del proyecto: el proyecto no tiene lista de exclusión.",
            ],
          },
          { tipo: "sub", texto: "Cómo se elige" },
          {
            tipo: "pasos",
            items: [
              "Tocá el campo: se abre una lista con un buscador («Buscar grupo de clasificaciones...», «Buscar grupo de marcas...», etc.).",
              "Escribí para filtrar y elegí una opción. Si no hay coincidencias, la lista dice, por ejemplo, «No se encontró ningún grupo de marcas.».",
              "Para volver a heredar del proyecto, volvé a tocar la opción elegida: se desmarca y el campo queda vacío.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Un campo vacío significa «hereda del proyecto». Por eso el texto del campo vacío dice «Sin asignar acá, hereda de <proyecto>» (o «Sin asignar» si no hay proyecto, y siempre «Sin asignar» en la lista de exclusión). Mientras esté vacío, el ojo queda deshabilitado: lo que se hereda se ve en la edición del proyecto, no acá.",
          },
        ],
      },
      {
        id: "horarios",
        titulo: "Horarios de atención de la campaña",
        bloques: [
          {
            tipo: "p",
            texto:
              "Por defecto la campaña usa los horarios del proyecto. El interruptor «Personalizar» permite definir horarios propios solo para esta campaña.",
          },
          {
            tipo: "lista",
            items: [
              "«Personalizar» desactivado — La campaña hereda los horarios del proyecto. El texto dice «Heredados de <proyecto>. Activá “Personalizar” para redefinirlos.» y abajo se ve, en solo lectura, cada día con sus bandas o «Cerrado».",
              "«Personalizar» activado — Aparece el editor de horarios (el mismo del proyecto, ver «Editar un proyecto») y el texto dice «Personalizados para esta campaña.». Arranca precargado con los horarios heredados para que solo toques lo que cambia.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Si el proyecto no define ningún horario, la campaña atiende sin restricción horaria; la pantalla lo avisa con «Se heredan del proyecto. Si el proyecto no define horarios, la campaña atiende sin restricción horaria.». Al crear una campaña, el interruptor arranca desactivado; al editar, arranca activado solo si la campaña ya tenía horarios propios.",
          },
        ],
      },
      {
        id: "cuentas-salientes",
        titulo: "Cuentas salientes",
        bloques: [
          {
            tipo: "p",
            texto:
              "Son las líneas desde las que se pueden realizar llamadas para la campaña. Se eligen de una lista con búsqueda («Buscar cuenta...») y se pueden marcar varias: el campo muestra «<n> seleccionada(s)» y debajo aparece cada cuenta elegida como una etiqueta con su ícono y una X para quitarla («Quitar <cuenta>»). Sin cuentas, el campo dice «Sin cuentas asociadas».",
          },
          { tipo: "sub", texto: "Qué cuentas se ofrecen" },
          {
            tipo: "p",
            texto:
              "Solo aparecen cuentas de telefonía (tipo Llamada) cuyo uso es saliente o ambas. No se ofrecen las cuentas de chat, videollamada, webcall, WhatsApp, SMS ni email, ni las telefónicas solo de entrada: en esos canales es siempre el cliente quien inicia la interacción, así que una campaña no origina por ellos. Si no hay ninguna que cumpla, la lista dice «No se encontró ninguna cuenta.».",
          },
          {
            tipo: "nota",
            texto:
              "El campo es opcional: una campaña puede existir sin cuentas salientes, por ejemplo si solo recibe interacciones. Para crear o cambiar una cuenta, ver «Cuentas».",
          },
        ],
      },
      {
        id: "controles-agente",
        titulo: "Solapa «Controles del agente»",
        bloques: [
          {
            tipo: "p",
            texto:
              "Define qué acciones puede usar el agente durante la interacción, según canal. Cada control es un interruptor con una breve descripción y una etiqueta que indica a qué canales aplica.",
          },
          {
            tipo: "lista",
            items: [
              "Permitir espera (hold) — Permite poner la interacción en espera. Aplica a Telefonía y Videollamada/Audio. Por defecto: activado.",
              "Permitir cortar llamada — Permite cortar la llamada en curso. Aplica a Telefonía y Videollamada/Audio. Por defecto: activado.",
              "Permitir agregar bookmark — Permite agregar un bookmark durante la llamada. Aplica a todos los canales (llamadas, chat, etc.). Por defecto: activado.",
              "Permitir silenciar (mute) — Permite usar el botón de silenciar durante la llamada. Aplica a Telefonía y Videollamada/Audio. Por defecto: activado.",
              "Permitir tipificar — Permite que el agente cargue un resultado de gestión en la interacción. Aplica a todos los canales. Por defecto: activado.",
              "Obligar tipificación — Obliga a cargar un resultado de gestión antes de salir del «ACW» (el tiempo de trabajo posterior a la llamada, cuando el agente cierra su gestión). Aplica a todos los canales. Por defecto: desactivado.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "«Obligar tipificación» depende de «Permitir tipificar»: si apagás «Permitir tipificar», «Obligar tipificación» queda apagado y deshabilitado, y su texto explica «Deshabilitado porque esta campaña no permite tipificar (Controles del agente → Permitir tipificar).». Tiene sentido: no se puede obligar a hacer algo que no está permitido.",
          },
        ],
      },
      {
        id: "visualizacion",
        titulo: "Solapa «Visualización»",
        bloques: [
          {
            tipo: "p",
            texto: "Define qué ve el agente en su pantalla de trabajo durante la interacción.",
          },
          {
            tipo: "lista",
            items: [
              "Sonido de timbre (ring) — Determina si suena el ring en la campaña. Aplica a todos los canales. Por defecto: activado. Se apaga, por ejemplo, en una mesa de entrada donde los agentes usan auriculares todo el turno.",
            ],
          },
        ],
      },
      {
        id: "grabacion",
        titulo: "Solapa «Grabación»",
        bloques: [
          {
            tipo: "p",
            texto:
              "Se responde en dos pasos y en este orden: qué se graba y en qué momentos. El mismo panel existe en los grupos de trabajo.",
          },
          { tipo: "sub", texto: "¿Qué se graba?" },
          {
            tipo: "lista",
            items: [
              "Audio — La conversación entre el agente y el cliente. Por defecto: activado.",
              "Pantalla — Lo que el agente ve y hace en su pantalla. Por defecto: activado.",
            ],
          },
          { tipo: "sub", texto: "¿En qué momentos?" },
          {
            tipo: "lista",
            items: [
              "La conversación — No se elige: si se graba algo, siempre se graba la conversación. Se muestra con un tilde cuando hay algo para grabar y con «No» cuando no.",
              "La espera — Sigue grabando mientras la llamada está en espera (hold). Por defecto: activado.",
              "El trabajo posterior — Graba el tiempo posterior a la llamada, mientras el agente tipifica la gestión (ACW). Por defecto: activado.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Dependencias: si apagás audio y pantalla, no hay nada para grabar y «La espera» y «El trabajo posterior» se deshabilitan («No hay nada para grabar: activá audio o pantalla.»). «La espera» además se habilita solo si, en «Controles del agente», la campaña permite poner la llamada en espera («Se habilita si la campaña permite poner la llamada en espera.»).",
          },
          {
            tipo: "nota",
            texto:
              "Entre la campaña y el grupo de trabajo gana lo más restrictivo: si el grupo que atiende tiene algo apagado, eso no se graba aunque acá esté encendido. La pantalla lo recuerda al pie del panel.",
          },
        ],
      },
      {
        id: "config-operativa",
        titulo: "Solapa «Config. operativa»",
        bloques: [
          {
            tipo: "p",
            texto: "Define cómo se asignan las interacciones al agente.",
          },
          {
            tipo: "lista",
            items: [
              "Atención forzada — Permite que la llamada, el chat, la webcall o la videollamada entrante se atienda automáticamente, sin que el agente tenga que aceptarlo. Aplica a «Inbound» (llamadas entrantes), «Discador Predictivo» (llamadas salientes que el sistema marca automáticamente), «Chat», «Webcall» y «Videollamada». Con la opción activada, la interacción entra directo a las interacciones en curso del agente; desactivada, al agente le aparece un aviso y la tiene que aceptar (o atender). Por defecto: activado.",
            ],
          },
        ],
      },
      {
        id: "urls-externas",
        titulo: "Solapa «URLs externas»",
        bloques: [
          {
            tipo: "p",
            texto:
              "Sirve para que Hermes (la pantalla de trabajo del agente) abra páginas externas (por ejemplo, la ficha del cliente en otro sistema) durante la interacción. Podés agregar las que necesites, sin máximo. Si no hay ninguna, la solapa dice «Todavía no hay URLs externas configuradas para esta campaña.».",
          },
          {
            tipo: "pasos",
            items: [
              "Tocá «Agregar URL»: aparece una tarjeta nueva.",
              "Completá «Nombre» y «URL».",
              "Elegí el «Modo de apertura» y el «Momento de apertura».",
              "Para quitar una URL, tocá el tacho de la tarjeta («Eliminar URL»). No pide confirmación.",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Cómo identificás la URL en la lista, por ejemplo «Ficha del cliente». Texto libre.",
              "URL — La dirección, con el formato «https://…». Admite variables como {{userid}} o {{iditeraccion}}, que se reemplazan por datos de la interacción (la pantalla las indica como «a definir»).",
              "Modo de apertura — «Dentro de Hermes» (la página se muestra dentro de la pantalla del agente) o «Pestaña nueva» (se abre en otra pestaña del navegador). Una URL nueva arranca en «Dentro de Hermes».",
              "Momento de apertura — «Al inicio de la interacción», «Al finalizar la interacción» o «Manual». Una URL nueva arranca en «Manual».",
            ],
          },
          {
            tipo: "nota",
            texto:
              "«Manual» significa que la URL nunca se abre sola: el agente la abre cuando quiere, desde un botón. Si hay más de una URL en «Al inicio de la interacción» o «Al finalizar la interacción», se abren todas.",
          },
        ],
      },
      {
        id: "usuarios",
        titulo: "Solapa «Usuarios»",
        bloques: [
          {
            tipo: "p",
            texto:
              "Lista los usuarios que operan la campaña. El subtítulo cuenta cuántos hay («<n> usuario(s) operan esta campaña.»). La tabla muestra «Usuario» (nombre con avatar), «Email» y «Estado» («Habilitado» o «Deshabilitado»). Si todavía no hay nadie, dice «Todavía no hay usuarios asignados.».",
          },
          {
            tipo: "lista",
            items: [
              "Asignar usuario — Abre una lista con buscador («Buscar usuario...») con los usuarios que todavía no están en la campaña. Al elegir uno se suma a la tabla. Si ya están todos asignados, dice «No hay usuarios disponibles.».",
              "Desasignar — Acción de cada fila, en rojo, con confirmación («<nombre> deja de operar esta campaña.»). Quita al usuario de la campaña; el usuario sigue existiendo en «Usuarios».",
              "Ficha rápida — Al pasar el mouse por el nombre de un usuario se muestran su email y los grupos a los que pertenece.",
            ],
          },
        ],
      },
      {
        id: "crear-proyecto",
        titulo: "Crear un proyecto",
        bloques: [
          {
            tipo: "p",
            texto:
              "Un proyecto reúne la configuración común de varias campañas. Se crea desde «Campañas» con «Nuevo proyecto».",
          },
          {
            tipo: "pasos",
            items: [
              "En «Campañas» tocá «Nuevo proyecto».",
              "En «Configurar proyecto» escribí el «Nombre» y, si querés, la «Descripción» y el «Objetivo».",
              "En «Configuración por defecto» elegí el «Grupo de clasificaciones» y el «Grupo de feriados», si corresponden.",
              "En «Horarios de atención» activá los días que se atiende y definí las bandas horarias.",
              "Tocá «Crear proyecto». «Cancelar» vuelve a «Campañas» sin crear nada.",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Texto libre; el ejemplo de la pantalla es «Ej: Cobranzas». A diferencia del alta de campañas, no lleva asterisco.",
              "Descripción — Texto libre de varias líneas. Opcional.",
              "Objetivo — Texto libre de varias líneas. Opcional.",
              "Grupo de clasificaciones — Opcional. Las campañas del proyecto lo usan salvo que elijan otro. Los campos de elección funcionan como se describe en «Herencia: grupos y listas».",
              "Grupo de feriados — Opcional. Mismo criterio.",
              "Horarios de atención — Ver «Editar un proyecto».",
            ],
          },
        ],
      },
      {
        id: "editar-proyecto",
        titulo: "Editar un proyecto",
        bloques: [
          {
            tipo: "p",
            texto:
              "Se llega con el lápiz del encabezado de cada grupo en «Campañas». La descripción de la pantalla lo resume: los horarios, clasificaciones y feriados que definas acá se aplican por defecto a todas las campañas del proyecto, salvo que una campaña los personalice. «Confirmar» guarda los cambios y «Cancelar» vuelve a «Campañas» sin guardar.",
          },
          { tipo: "sub", texto: "Acciones rápidas" },
          {
            tipo: "p",
            texto:
              "Atajos frecuentes al gestionar el proyecto, con tres botones: «Crear grupo de feriados» (lleva al alta de feriados), «Crear grupo de clasificaciones» (lleva a «Clasificaciones») y «Nueva campaña en este proyecto» (lleva al alta de campaña, donde el proyecto hay que elegirlo a mano).",
          },
          { tipo: "sub", texto: "Información general" },
          {
            tipo: "lista",
            items: [
              "Nombre — El nombre del proyecto.",
              "Descripción — Texto libre.",
              "Objetivo — Texto libre.",
            ],
          },
          { tipo: "sub", texto: "Configuración por defecto" },
          {
            tipo: "lista",
            items: [
              "Grupo de clasificaciones — Se elige de una lista con búsqueda («Buscar grupo de clasificaciones...»). Sin elección dice «Sin asignar». Volver a tocar la opción elegida la quita.",
              "Grupo de feriados — Igual: «Buscar grupo de feriados...» y «Sin asignar».",
            ],
          },
          { tipo: "sub", texto: "Horarios de atención" },
          {
            tipo: "p",
            texto:
              "Una o varias bandas horarias por día (por ejemplo, con pausa de almuerzo). Los días sin banda quedan cerrados. Cada día de lunes a domingo tiene un interruptor «Atención: <día>».",
          },
          {
            tipo: "lista",
            items: [
              "Activar un día — Aparece una banda. Si ya hay algún día habilitado, la banda copia las del día habilitado más cercano hacia atrás (si abrís el lunes de 09:30 a 18:00, el martes arranca igual). Si no hay ninguno, arranca de 09:00 a 18:00.",
              "Hora de inicio y Hora de fin — Dos campos de hora por banda (formato de reloj del navegador).",
              "Agregar otra banda horaria — El botón con «+», solo en la última banda del día. La banda nueva arranca donde terminó la anterior y dura cuatro horas (máximo hasta las 23:00 en la hora de fin).",
              "Quitar banda horaria — La X de cada banda. No se puede quitar la única banda de un día: para cerrar el día apagá su interruptor.",
              "Desactivar un día — Borra sus bandas y el día queda «Cerrado».",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Revisá al cargarlas que la hora de fin sea posterior a la de inicio y que las bandas de un mismo día no se pisen.",
          },
        ],
      },
      {
        id: "eliminar-proyecto",
        titulo: "Eliminar un proyecto",
        bloques: [
          {
            tipo: "p",
            texto:
              "Al final de la edición del proyecto está la tarjeta «Eliminar el proyecto», con el botón «Eliminar proyecto».",
          },
          {
            tipo: "lista",
            items: [
              "Con campañas — El botón está bloqueado. La tarjeta dice «No se puede eliminar mientras tenga campañas. Tiene <n>: eliminalas primero.» y el tooltip «Primero eliminá sus <n> campaña(s)».",
              "Sin campañas — El botón se habilita («Este proyecto no tiene campañas, así que se puede eliminar. Es una acción definitiva.»). Al tocarlo se abre «¿Eliminar el proyecto «<nombre>»?» con el aviso «Esto no se puede deshacer.» y los botones «Cancelar» y «Eliminar definitivamente».",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Eliminar un proyecto borra también su configuración (horarios de atención, grupos heredados y todo lo que las campañas tomaban de él) y se pierde toda la información histórica de las campañas que el proyecto tuvo alguna vez, incluidas las que ya fueron eliminadas: llamadas, gestiones y reportes dejan de estar disponibles. Por eso la pantalla exige vaciar el proyecto antes.",
          },
          {
            tipo: "p",
            texto:
              "Si eliminás todas las campañas de un proyecto desde «Campañas» y volvés a su edición, el botón se habilita.",
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
              "Pertenencia — Una campaña pertenece a un solo proyecto, que se elige al crearla.",
              "Herencia — Grupo de clasificaciones, grupo de marcas, grupo de feriados y horarios se heredan del proyecto mientras la campaña no los defina. La lista de exclusión es solo de la campaña.",
              "Sin copia — La campaña referencia los grupos y listas; si editás un grupo en su sección, el cambio llega a todas las campañas que lo usan.",
              "Eliminar una campaña — Se confirma antes de quitarla. Mientras un proyecto tenga campañas, no se puede eliminar.",
              "Eliminar un proyecto — Definitivo y con pérdida del histórico de todas sus campañas (ver «Eliminar un proyecto»).",
              "Estado — Las campañas no tienen estado activo o inactivo: no se desactivan, se eliminan o se dejan sin usuarios.",
            ],
          },
        ],
      },
      {
        id: "consejos",
        titulo: "Consejos y errores comunes",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Cargá los horarios en el proyecto — Así todas sus campañas los heredan. Personalizá en una campaña solo cuando de verdad difiera.",
              "Un campo vacío no es un error — Quiere decir que la campaña hereda del proyecto.",
              "No encontrás una cuenta saliente — Revisá que sea de telefonía y de uso saliente o ambas.",
              "«Obligar tipificación» está deshabilitado — Activá antes «Permitir tipificar».",
              "«La espera» de la grabación está deshabilitada — Activá audio o pantalla y asegurate de que «Permitir espera (hold)» esté activo en «Controles del agente».",
              "Una URL no se abre sola — Revisá que su «Momento de apertura» no sea «Manual».",
              "No podés eliminar un proyecto — Todavía tiene campañas: eliminalas primero.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Lo que se graba depende de la campaña y del grupo de trabajo a la vez. Si algo no se graba aunque lo tengas encendido en la campaña, revisá la grabación del grupo de trabajo que atiende.",
          },
        ],
      },
    ],
  },
  en: {
    titulo: "Campaigns",
    resumen:
      "How to organize operations into campaigns and projects: what each tab configures, what is inherited from the project and which rules to know.",
    secciones: [
      {
        id: "que-es",
        titulo: "What a campaign and a project are",
        bloques: [
          {
            tipo: "p",
            texto:
              "A campaign is the unit used to organize service: it defines what agents can do during an interaction, what is recorded, which lines calls are made from and who operates it. Agents work on campaigns.",
          },
          {
            tipo: "p",
            texto:
              "A project groups campaigns that share the same base configuration: business hours, classification group and holiday group. Each campaign belongs to a single project and, unless you customize it, takes that configuration from the project. This way you set the hours once instead of campaign by campaign.",
          },
          {
            tipo: "p",
            texto:
              "There is no separate «Projects» section: projects are viewed and managed from the «Campaigns» screen, which shows the campaigns grouped by project.",
          },
          { tipo: "sub", texto: "What it relates to" },
          {
            tipo: "lista",
            items: [
              "Project — Every campaign belongs to one. It inherits business hours, classification group and holiday group from it.",
              "Accounts — A campaign can have outbound accounts associated: the lines calls are made from. See «Outbound accounts» below and the «Accounts» documentation.",
              "Classifications, Marks, Holidays and Exclusion lists — The campaign picks groups or lists that already exist in those sections. From here they are only assigned and viewed; their content is edited in each section.",
              "Users — The assigned agents are the ones who operate the campaign.",
              "Working groups — Recording is also configured in the working group, and the most restrictive of the two wins (see «Recording»).",
            ],
          },
        ],
      },
      {
        id: "listado",
        titulo: "The campaign list",
        bloques: [
          {
            tipo: "p",
            texto:
              "The «Campaigns» screen shows a table with the campaigns grouped by project. Each group starts expanded and its header shows the project name with a pencil icon: click it to edit that project (the tooltip says «Edit project»).",
          },
          { tipo: "sub", texto: "Columns" },
          {
            tipo: "lista",
            items: [
              "Project — The group the campaign belongs to. If the project can't be found, it reads «No project».",
              "Name — The campaign name. It is a link: it opens the campaign editor.",
              "Assigned users — How many users operate the campaign.",
              "Outbound accounts — How many outbound accounts it has associated.",
            ],
          },
          {
            tipo: "p",
            texto:
              "A project that has no campaigns yet also shows up, with a row that reads «No campaigns» and no actions. It is the way to reach an empty project to edit or delete it.",
          },
          { tipo: "sub", texto: "Search" },
          {
            tipo: "p",
            texto:
              "The table has an always visible search box to filter the rows. The table is not paginated: if there are more rows than fit on screen, it scrolls inside with a fixed header.",
          },
          { tipo: "sub", texto: "Header actions" },
          {
            tipo: "lista",
            items: [
              "New project — Opens the project creation screen (see «Create a project»).",
              "New campaign — Opens the campaign creation screen (see «Create a campaign»).",
            ],
          },
          { tipo: "sub", texto: "Row actions" },
          {
            tipo: "lista",
            items: [
              "Edit — Opens the campaign editor.",
              "Assign users — Opens the campaign editor so you can add or remove users in the «Users» tab.",
              "Duplicate — Meant to create a new campaign from an existing one.",
              "Delete — Destructive action, shown in red: it asks for confirmation before removing the campaign.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "There are no bulk actions or multi-row selection: each action applies to one campaign at a time.",
          },
        ],
      },
      {
        id: "crear-campania",
        titulo: "Create a campaign",
        bloques: [
          {
            tipo: "p",
            texto:
              "Creation asks for the minimum to get started: name and project. Everything else is optional and can be completed later from the editor. Until you define it, the campaign inherits the project's configuration and uses the default values for its parameters.",
          },
          {
            tipo: "pasos",
            items: [
              "In «Campaigns» click «New campaign» (or «New campaign in this project» from a project editor).",
              "Under «General information» type the «Name» and choose the «Project».",
              "If you want, fill in «Description» and «Goal».",
              "If the campaign will place outbound calls, choose its «Outbound accounts». It is optional.",
              "On the right, under «Configuration inherited from the project», assign groups or lists only if the campaign needs something different from the project, and turn on «Customize» in business hours if you want its own hours.",
              "Click «Create campaign». «Cancel» goes back to the list without creating anything.",
            ],
          },
          { tipo: "sub", texto: "General information" },
          {
            tipo: "lista",
            items: [
              "Name — Required (marked with an asterisk). Free text; the example on screen is «E.g. Cobranzas Activa PCP».",
              "Project — Required (asterisk). Chosen from a searchable list («Search project...»); if nothing matches it reads «No projects found.». It can only be chosen on creation: in the editor the project can no longer be changed.",
              "Description — Optional. Free multi-line text.",
              "Goal — Optional. Free multi-line text: what the campaign is for.",
            ],
          },
          { tipo: "sub", texto: "Outbound accounts" },
          {
            tipo: "p",
            texto:
              "The lines that can be used to place calls for this campaign. It is optional; you can associate them later. Details are in «Outbound accounts».",
          },
          { tipo: "sub", texto: "Configuration inherited from the project" },
          {
            tipo: "p",
            texto:
              "Anything you leave unassigned here takes the configuration of the selected project. You can customize it at any time from the campaign editor. The fields in this card are explained in «Inheritance: groups and lists» and «Campaign business hours».",
          },
          {
            tipo: "nota",
            texto:
              "Creation does not include the parameter tabs or the users tab: the campaign is born with the default value of each parameter and no users assigned. They are adjusted from the editor.",
          },
        ],
      },
      {
        id: "editar-campania",
        titulo: "Edit a campaign: the tabs",
        bloques: [
          {
            tipo: "p",
            texto:
              "When you open a campaign, its name is the title and «Campaign of <project>» is the description. The editor is split into seven tabs. «Cancel» goes back to the list; «Confirm» saves your changes.",
          },
          {
            tipo: "lista",
            items: [
              "General — Basic data, outbound accounts, inheritance and business hours.",
              "Agent controls — Which actions the agent can use during the interaction.",
              "Display — What the agent sees on their work screen.",
              "Recording — What is recorded and at which moments.",
              "Operational config. — How interactions are assigned to the agent.",
              "External URLs — Addresses opened during the interaction.",
              "Users — Who operates the campaign.",
            ],
          },
          {
            tipo: "p",
            texto:
              "The «General» tab holds «Name», «Description» and «Goal» (the same as on creation; here they carry no asterisk), «Outbound accounts», «Configuration inherited from the project» and «Business hours». When the campaign has a project, the inheritance card clarifies «Taken from <project>, except for what you customize here.»; otherwise it reads «You can customize it for this campaign.».",
          },
        ],
      },
      {
        id: "herencia",
        titulo: "Inheritance: groups and lists",
        bloques: [
          {
            tipo: "p",
            texto:
              "The «Configuration inherited from the project» card has four fields. In each one you pick a group or list that already exists; the campaign uses it by reference, meaning its content is never edited from here. Next to each field there is an eye button to see, in a read-only window, what the chosen item contains. The button is enabled only when something is chosen.",
          },
          {
            tipo: "lista",
            items: [
              "Classification group — The classifications (interaction outcomes) the agent can record. The eye («View the group's classifications») shows each classification with its type. It is edited in «Classifications».",
              "Mark group — The marks the agent can add to the interaction. The eye («View the group's marks») shows each mark with its description, if it has one. It is edited in «Marks».",
              "Holidays — The holiday group the campaign respects. The eye («View the group's dates») shows each date with its description. It is edited in «Holidays».",
              "Exclusion list — Contacts the campaign must not call. The eye («View the list's contacts») shows each contact with its type. It is edited in «Exclusion lists». Unlike the other three, this field is not inherited from the project: the project has no exclusion list.",
            ],
          },
          { tipo: "sub", texto: "How to choose" },
          {
            tipo: "pasos",
            items: [
              "Click the field: a list opens with a search box («Search classification group...», «Search mark group...», etc.).",
              "Type to filter and choose an option. If nothing matches, the list says, for example, «No mark groups found.».",
              "To go back to inheriting from the project, click the chosen option again: it is unchecked and the field is left empty.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "An empty field means «inherits from the project». That is why the empty field reads «If left unassigned, inherits from <project>» (or «Unassigned» if there is no project, and always «Unassigned» for the exclusion list). While it is empty, the eye stays disabled: what is inherited is seen in the project editor, not here.",
          },
        ],
      },
      {
        id: "horarios",
        titulo: "Campaign business hours",
        bloques: [
          {
            tipo: "p",
            texto:
              "By default the campaign uses the project's business hours. The «Customize» switch lets you define its own hours just for this campaign.",
          },
          {
            tipo: "lista",
            items: [
              "«Customize» off — The campaign inherits the project's hours. The text reads «Inherited from <project>. Turn on “Customize” to redefine them.» and below you see, read-only, each day with its bands or «Closed».",
              "«Customize» on — The hours editor appears (the same one as the project's, see «Edit a project») and the text reads «Customized for this campaign.». It starts preloaded with the inherited hours so you only touch what changes.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "If the project defines no hours, the campaign operates with no time restriction; the screen says so with «They are inherited from the project. If the project defines no hours, the campaign operates with no time restriction.». When creating a campaign the switch starts off; when editing, it starts on only if the campaign already had its own hours.",
          },
        ],
      },
      {
        id: "cuentas-salientes",
        titulo: "Outbound accounts",
        bloques: [
          {
            tipo: "p",
            texto:
              "They are the lines that can be used to place calls for the campaign. They are chosen from a searchable list («Search account...») and several can be checked: the field shows «<n> selected» and below it each chosen account appears as a tag with its icon and an X to remove it («Remove <account>»). With no accounts, the field reads «No associated accounts».",
          },
          { tipo: "sub", texto: "Which accounts are offered" },
          {
            tipo: "p",
            texto:
              "Only telephony accounts (type Llamada) whose use is outbound or both are listed. Chat, video call, webcall, WhatsApp, SMS and email accounts are not offered, nor are inbound-only phone accounts: on those channels it is always the customer who starts the interaction, so a campaign does not originate through them. If none matches, the list reads «No accounts found.».",
          },
          {
            tipo: "nota",
            texto:
              "The field is optional: a campaign can exist without outbound accounts, for example if it only receives interactions. To create or change an account, see «Accounts».",
          },
        ],
      },
      {
        id: "controles-agente",
        titulo: "«Agent controls» tab",
        bloques: [
          {
            tipo: "p",
            texto:
              "It defines which actions the agent can use during the interaction, per channel. Each control is a switch with a short description and a tag that shows which channels it applies to.",
          },
          {
            tipo: "lista",
            items: [
              "Allow hold — Allows putting the interaction on hold. Applies to Telephony and Video/Audio call. Default: on.",
              "Allow hang up — Allows hanging up the call in progress. Applies to Telephony and Video/Audio call. Default: on.",
              "Allow adding a bookmark — Allows adding a bookmark during the call. Applies to all channels (calls, chat, etc.). Default: on.",
              "Allow mute — Allows using the mute button during the call. Applies to Telephony and Video/Audio call. Default: on.",
              "Allow classifying — Allows the agent to record an interaction outcome. Applies to all channels. Default: on.",
              "Force classification — Forces recording an outcome before leaving «ACW» (the after-call work time, when the agent wraps up the interaction). Applies to all channels. Default: off.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "«Force classification» depends on «Allow classifying»: if you turn «Allow classifying» off, «Force classification» is turned off and disabled, and its text explains «Disabled because this campaign does not allow classifying (Agent controls → Allow classifying).». It makes sense: you cannot force something that is not allowed.",
          },
        ],
      },
      {
        id: "visualizacion",
        titulo: "«Display» tab",
        bloques: [
          {
            tipo: "p",
            texto: "It defines what the agent sees on their work screen during the interaction.",
          },
          {
            tipo: "lista",
            items: [
              "Ring sound — Determines whether the ring sounds in the campaign. Applies to all channels. Default: on. Turn it off, for example, on a desk where agents wear headsets all shift.",
            ],
          },
        ],
      },
      {
        id: "grabacion",
        titulo: "«Recording» tab",
        bloques: [
          {
            tipo: "p",
            texto:
              "It answers two questions, in this order: what is recorded and at which moments. The same panel exists in working groups.",
          },
          { tipo: "sub", texto: "What gets recorded?" },
          {
            tipo: "lista",
            items: [
              "Audio — The conversation between agent and customer. Default: on.",
              "Screen — What the agent sees and does on screen. Default: on.",
            ],
          },
          { tipo: "sub", texto: "At which moments?" },
          {
            tipo: "lista",
            items: [
              "The conversation — It is not chosen: if anything is recorded, the conversation is always recorded. It shows a check when there is something to record and «No» when there is not.",
              "The hold — Keeps recording while the call is on hold. Default: on.",
              "The after-call work — Records the time after the call, while the agent classifies the interaction (ACW). Default: on.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Dependencies: if you turn off audio and screen there is nothing to record and «The hold» and «The after-call work» are disabled («Nothing to record: turn on audio or screen.»). «The hold» is also enabled only if, in «Agent controls», the campaign allows putting the call on hold («Enabled if the campaign allows putting calls on hold.»).",
          },
          {
            tipo: "nota",
            texto:
              "Between the campaign and the working group, the most restrictive one wins: if the group handling the call has something off, that isn't recorded even if it's on here. The screen reminds you at the bottom of the panel.",
          },
        ],
      },
      {
        id: "config-operativa",
        titulo: "«Operational config.» tab",
        bloques: [
          {
            tipo: "p",
            texto: "It defines how interactions are assigned to the agent.",
          },
          {
            tipo: "lista",
            items: [
              "Forced answer — Allows an incoming call or chat to be answered automatically, without the agent having to accept it. Applies to «Inbound» (incoming calls), «Predictive Dialer» (outgoing calls dialed automatically by the system) and «Chat». For a chat, when on, the chat goes straight into the agent's ongoing interactions; when off, the agent gets a notice and has to accept it. Default: on.",
            ],
          },
        ],
      },
      {
        id: "urls-externas",
        titulo: "«External URLs» tab",
        bloques: [
          {
            tipo: "p",
            texto:
              "It lets Hermes (the agent's work screen) open external pages (for example, the customer record in another system) during the interaction. You can add as many as you need, with no maximum. If there are none, the tab reads «No external URLs configured for this campaign yet.».",
          },
          {
            tipo: "pasos",
            items: [
              "Click «Add URL»: a new card appears.",
              "Fill in «Name» and «URL».",
              "Choose the «Open mode» and the «Opening moment».",
              "To remove a URL, click the trash icon on its card («Delete URL»). It does not ask for confirmation.",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Name — How you identify the URL in the list, for example «Customer record». Free text.",
              "URL — The address, in the «https://…» format. It accepts variables such as {{userid}} or {{iditeraccion}}, which are replaced by data from the interaction (the screen marks them as «to be defined»).",
              "Open mode — «Inside Hermes» (the page is shown inside the agent's screen) or «New tab» (it opens in another browser tab). A new URL starts as «Inside Hermes».",
              "Opening moment — «At interaction start», «At interaction end» or «Manual». A new URL starts as «Manual».",
            ],
          },
          {
            tipo: "nota",
            texto:
              "«Manual» means the URL is never opened on its own: the agent opens it when they want, from a button. If more than one URL is set to «At interaction start» or «At interaction end», they all open.",
          },
        ],
      },
      {
        id: "usuarios",
        titulo: "«Users» tab",
        bloques: [
          {
            tipo: "p",
            texto:
              "It lists the users who operate the campaign. The subtitle counts them («<n> user(s) operate this campaign.»). The table shows «User» (name with avatar), «Email» and «Status» («Enabled» or «Disabled»). If nobody is assigned yet, it reads «No users assigned yet.».",
          },
          {
            tipo: "lista",
            items: [
              "Assign user — Opens a searchable list («Search user...») of the users not yet in the campaign. Choosing one adds it to the table. If all are already assigned, it reads «No users available.».",
              "Unassign — Action on each row, in red, with confirmation («<name> will no longer operate this campaign.»). It removes the user from the campaign; the user still exists in «Users».",
              "Quick card — Hovering over a user's name shows their email and the groups they belong to.",
            ],
          },
        ],
      },
      {
        id: "crear-proyecto",
        titulo: "Create a project",
        bloques: [
          {
            tipo: "p",
            texto:
              "A project gathers the common configuration of several campaigns. It is created from «Campaigns» with «New project».",
          },
          {
            tipo: "pasos",
            items: [
              "In «Campaigns» click «New project».",
              "Under «Configure project» type the «Name» and, if you want, the «Description» and the «Objective».",
              "Under «Default configuration» choose the «Classification group» and the «Holiday group», if they apply.",
              "Under «Business hours» turn on the days you operate and define the time bands.",
              "Click «Create project». «Cancel» goes back to «Campaigns» without creating anything.",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Name — Free text; the example on screen is «e.g. Collections». Unlike campaign creation, it has no asterisk.",
              "Description — Free multi-line text. Optional.",
              "Objective — Free multi-line text. Optional.",
              "Classification group — Optional. The project's campaigns use it unless they pick another. The selection fields work as described in «Inheritance: groups and lists».",
              "Holiday group — Optional. Same criterion.",
              "Business hours — See «Edit a project».",
            ],
          },
        ],
      },
      {
        id: "editar-proyecto",
        titulo: "Edit a project",
        bloques: [
          {
            tipo: "p",
            texto:
              "You get there with the pencil in each group header in «Campaigns». The screen description sums it up: the business hours, classifications and holidays you set here apply by default to every campaign in the project, unless a campaign sets its own. «Confirm» saves the changes and «Cancel» goes back to «Campaigns» without saving.",
          },
          { tipo: "sub", texto: "Quick actions" },
          {
            tipo: "p",
            texto:
              "Frequent shortcuts for managing the project, with three buttons: «Create holiday group» (goes to holiday creation), «Create classification group» (goes to «Classifications») and «New campaign in this project» (goes to campaign creation, where the project has to be chosen by hand).",
          },
          { tipo: "sub", texto: "General information" },
          {
            tipo: "lista",
            items: [
              "Name — The project name.",
              "Description — Free text.",
              "Objective — Free text.",
            ],
          },
          { tipo: "sub", texto: "Default configuration" },
          {
            tipo: "lista",
            items: [
              "Classification group — Chosen from a searchable list («Search classification group...»). With no choice it reads «Unassigned». Clicking the chosen option again removes it.",
              "Holiday group — Same: «Search holiday group...» and «Unassigned».",
            ],
          },
          { tipo: "sub", texto: "Business hours" },
          {
            tipo: "p",
            texto:
              "One or more time bands per day (for example, with a lunch break). Days without a band stay closed. Each day from Monday to Sunday has a «Business hours: <day>» switch.",
          },
          {
            tipo: "lista",
            items: [
              "Turn a day on — A band appears. If some day is already enabled, the band copies those of the nearest enabled day going backwards (if you open Monday 09:30 to 18:00, Tuesday starts the same). If none is, it starts at 09:00 to 18:00.",
              "Start time and End time — Two time fields per band (using the browser's clock format).",
              "Add another time band — The «+» button, only on the last band of the day. The new band starts where the previous one ended and lasts four hours (the end time is capped at 23:00).",
              "Remove time band — The X on each band. You cannot remove the only band of a day: to close the day, turn its switch off.",
              "Turn a day off — Clears its bands and the day reads «Closed».",
            ],
          },
          {
            tipo: "nota",
            texto:
              "When entering them, check that the end time is after the start time and that bands of the same day do not overlap.",
          },
        ],
      },
      {
        id: "eliminar-proyecto",
        titulo: "Delete a project",
        bloques: [
          {
            tipo: "p",
            texto:
              "At the bottom of the project editor is the «Delete the project» card, with the «Delete project» button.",
          },
          {
            tipo: "lista",
            items: [
              "With campaigns — The button is blocked. The card reads «It can't be deleted while it has campaigns. It has <n>: delete them first.» and the tooltip «First delete its <n> campaign(s)».",
              "Without campaigns — The button is enabled («This project has no campaigns, so it can be deleted. This is a final action.»). Clicking it opens «Delete the project “<name>”?» with the warning «This can't be undone.» and the buttons «Cancel» and «Delete permanently».",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Deleting a project also deletes its configuration (business hours, inherited groups and everything campaigns took from it) and all historical data from every campaign the project ever had is lost, including campaigns already deleted: calls, interactions and reports stop being available. That is why the screen requires emptying the project first.",
          },
          {
            tipo: "p",
            texto:
              "If you delete all of a project's campaigns from «Campaigns» and go back to its editor, the button is enabled.",
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
              "Membership — A campaign belongs to a single project, chosen when it is created.",
              "Inheritance — Classification group, mark group, holiday group and business hours are inherited from the project while the campaign does not define them. The exclusion list belongs only to the campaign.",
              "No copy — The campaign references groups and lists; if you edit a group in its section, the change reaches every campaign that uses it.",
              "Deleting a campaign — Confirmed before removal. While a project has campaigns, it cannot be deleted.",
              "Deleting a project — Final, and the history of all its campaigns is lost (see «Delete a project»).",
              "Status — Campaigns have no active or inactive status: they are not deactivated, they are deleted or left without users.",
            ],
          },
        ],
      },
      {
        id: "consejos",
        titulo: "Tips and common mistakes",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Set the hours in the project — That way all its campaigns inherit them. Customize in a campaign only when it truly differs.",
              "An empty field is not an error — It means the campaign inherits from the project.",
              "You can't find an outbound account — Check that it is a telephony account with outbound or both use.",
              "«Force classification» is disabled — Turn on «Allow classifying» first.",
              "Recording's «The hold» is disabled — Turn on audio or screen and make sure «Allow hold» is on in «Agent controls».",
              "A URL does not open on its own — Check that its «Opening moment» is not «Manual».",
              "You can't delete a project — It still has campaigns: delete them first.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "What is recorded depends on the campaign and the working group at the same time. If something is not recorded even though it is on in the campaign, check the recording of the working group that handles the call.",
          },
        ],
      },
    ],
  },
};
