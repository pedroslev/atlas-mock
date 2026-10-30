import type { ContenidoPagina } from "@/lib/docs/tipos";

// Cuentas: tipos de cuenta, listado, alta/edición, capacidad del asesor en chat,
// uso de la línea en telefonía y solapa de flujo.
export const contenido: ContenidoPagina = {
  es: {
    titulo: "Cuentas",
    resumen:
      "Las cuentas son los canales por los que entran y salen las interacciones: telefonía, chat, videollamada y webcall. Acá se crean, se editan y se define cómo se atiende cada una.",
    secciones: [
      {
        id: "que-es",
        titulo: "Qué es una cuenta y para qué sirve",
        bloques: [
          {
            tipo: "p",
            texto:
              "Una cuenta es un canal de contacto de tu empresa. Por ejemplo, la línea telefónica de cobranzas o el chat de la web de soporte. Cada interacción entra (o sale) por una cuenta, y la cuenta define cómo se la atiende.",
          },
          {
            tipo: "p",
            texto:
              "Se relaciona con otras secciones de Olimpo:\n• Campañas: la solapa «Flujo» de la cuenta termina en una «Derivación a campaña», que es la que atiende la interacción.\n• Números telefónicos: en las cuentas de telefonía, los números que podés elegir son los que tu empresa tiene disponibles.",
          },
          {
            tipo: "p",
            texto:
              "Depende de que existan campañas (para derivar las interacciones) y, en telefonía, de que haya números cargados para tu empresa.",
          },
        ],
      },
      {
        id: "tipos-de-cuenta",
        titulo: "Tipos de cuenta",
        bloques: [
          {
            tipo: "p",
            texto:
              "El tipo se elige al crear la cuenta y después no se puede cambiar. Son cuatro y cada uno pide cosas distintas:",
          },
          {
            tipo: "lista",
            items: [
              "Telefonía SIP — La línea telefónica de siempre, con un número al que llaman tus clientes. Pide definir el «Uso de la línea» (si recibe llamadas, si las origina o ambas), qué número ve el destinatario y el número. Una llamada ocupa al asesor completo. La solapa «Flujo» solo aparece si la línea recibe llamadas.",
              "Chat — Conversación de texto. Pide la «Capacidad del asesor»: cuántos chats a la vez atiende cada asesor y qué parte de su capacidad reserva la cuenta. No tiene línea ni uso. La solapa «Flujo» siempre está, porque el cliente es quien inicia el chat.",
              "Videollamada — No tiene línea, uso ni capacidad: ocupa al asesor completo, igual que una llamada. La solapa «Flujo» siempre está. Con «Chat durante la llamada» activado, además del video, el cliente y el asesor se escriben y se mandan archivos durante la videollamada; apagado (por defecto), es solo video y audio.",
              "Webcall (llamada web) — Llamada de voz desde la web, sin línea telefónica. Tampoco tiene línea, uso ni capacidad, y ocupa al asesor completo. La solapa «Flujo» siempre está. Con «Chat durante la llamada» activado, además del audio, el cliente y el asesor se escriben y se mandan archivos en la misma pantalla de la llamada; apagado (por defecto), es solo audio.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Cada asesor tiene 100 de capacidad. Una llamada, una videollamada o una webcall ocupan los 100: mientras el asesor está en una, no recibe un chat, y al revés. Solo el chat reparte esa capacidad entre varias interacciones.",
          },
          {
            tipo: "p",
            texto:
              "En el flujo de las cuentas de chat, videollamada y webcall, los mensajes son siempre de texto: «Reproducir» pasa a llamarse «Enviar mensaje» y «Capturar dígitos» pasa a ser «Capturar texto». El detalle está en «Flujo de las cuentas».",
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
              "La pantalla «Cuentas» muestra una tabla con todas las cuentas de telefonía, chat, videollamada y webcall. Otros canales (WhatsApp, SMS, Email) no se administran desde acá.",
          },
          { tipo: "sub", texto: "Columnas" },
          {
            tipo: "lista",
            items: [
              "Nombre — El nombre de la cuenta, con el ícono de su tipo. Es un link que abre la cuenta para editarla.",
              "Tipo — «Telefonía SIP», «Chat», «Videollamada» o «Webcall (llamada web)».",
              "Línea — El número de la línea en telefonía. En las demás cuentas muestra el nombre de la cuenta; si no hay dato aparece «—».",
              "Uso — Solo telefonía: «Recibe llamadas», «Origina llamadas» o «Recibe y origina». En el resto aparece «—».",
            ],
          },
          { tipo: "sub", texto: "Búsqueda y acciones" },
          {
            tipo: "lista",
            items: [
              "Buscador — El campo «Buscar» arriba de la tabla filtra las cuentas por lo que escribas.",
              "Orden y filtros — La tabla permite ordenar y filtrar por columna. Todas las filas se ven en una sola lista, que se desplaza dentro de la pantalla: no hay páginas.",
              "«Editar» — Está en el menú de tres puntos de cada fila. Abre la cuenta.",
              "«Eliminar» — También en el menú de la fila, en rojo. Pide confirmación («¿Confirmás la eliminación?»).",
              "«Nueva cuenta» — Botón arriba a la derecha. Abre el alta.",
            ],
          },
          {
            tipo: "p",
            texto: "El listado no tiene acciones masivas: las acciones se hacen cuenta por cuenta.",
          },
        ],
      },
      {
        id: "crear-y-editar",
        titulo: "Crear y editar una cuenta",
        bloques: [
          {
            tipo: "p",
            texto:
              "El alta y la edición usan la misma pantalla, con dos solapas: «General» (datos de la cuenta) y «Flujo» (cómo se atiende). Así podés crear la cuenta y definir su flujo de una vez.",
          },
          { tipo: "sub", texto: "Cómo crear una cuenta" },
          {
            tipo: "pasos",
            items: [
              "En «Cuentas», tocá «Nueva cuenta».",
              "En la solapa «General», escribí el «Nombre» y, si querés, la «Descripción».",
              "Elegí el «Tipo» de cuenta. Mirá bien esta elección: después no se puede cambiar.",
              "Completá lo que pide el tipo: «Capacidad del asesor» en chat, «Uso de la línea» en telefonía y, en webcall y videollamada, si suman «Chat durante la llamada».",
              "Si la cuenta recibe interacciones, abrí la solapa «Flujo» y armá el flujo de atención.",
              "Tocá «Crear cuenta».",
            ],
          },
          { tipo: "sub", texto: "Cómo editar una cuenta" },
          {
            tipo: "pasos",
            items: [
              "En el listado, tocá el nombre de la cuenta, o abrí el menú de la fila y elegí «Editar».",
              "Cambiá lo que necesites en «General» o en «Flujo».",
              "Tocá «Confirmar» para guardar, o «Cancelar» para volver sin guardar.",
            ],
          },
          { tipo: "sub", texto: "Datos de la cuenta (solapa «General»)" },
          {
            tipo: "lista",
            items: [
              "Nombre — Cómo se llama la cuenta en Olimpo. En el alta, el ejemplo es «Ej: Línea Cobranzas AR». Poné un nombre que se entienda a simple vista, porque es el que ves en el listado.",
              "Tipo — «Telefonía SIP», «Chat», «Videollamada» o «Webcall (llamada web)». Por defecto el alta arranca en «Telefonía SIP». Se elige solo al crear; al editar aparece bloqueado.",
              "Descripción — Texto libre para recordar para qué se usa la cuenta («Para qué se usa esta cuenta»). Opcional en la práctica: la pantalla no lo exige.",
            ],
          },
        ],
      },
      {
        id: "capacidad-chat",
        titulo: "Capacidad del asesor (cuentas de chat)",
        bloques: [
          {
            tipo: "p",
            texto:
              "Solo aparece en cuentas de chat. Define cuántos chats de esta cuenta atiende a la vez un asesor y qué parte de su capacidad reserva la cuenta. Sirve para repartir a un mismo asesor entre varias cuentas sin que una le coma el lugar a la otra.",
          },
          {
            tipo: "p",
            texto:
              "Cada asesor tiene 100 de capacidad. Cada chat ocupa el cupo dividido la cantidad de chats simultáneos, redondeado hacia abajo. Por ejemplo, con 3 chats y un cupo de 60%, cada chat ocupa el 20%.",
          },
          {
            tipo: "lista",
            items: [
              "Limitar los chats simultáneos por asesor — Casilla. Por defecto está apagada en una cuenta nueva. Apagada: no se reserva capacidad y cada chat ocupa el 10%, o sea hasta 10 chats a la vez por asesor. Encendida: aparecen los dos campos siguientes.",
              "Chats simultáneos por asesor — Cuántos chats de esta cuenta atiende un asesor a la vez. Número entero, mínimo 1. Por defecto 3.",
              "Capacidad que reserva (%) — Qué porcentaje de la capacidad del asesor reserva la cuenta. Número entero entre 1 y 100. Por defecto 60%, o lo que quede libre si otras cuentas de chat ya reservaron.",
            ],
          },
          { tipo: "sub", texto: "Validaciones" },
          {
            tipo: "lista",
            items: [
              "Los dos campos deben tener números mayores a 0; si no, aparece «Completá los dos campos con números mayores a 0.»",
              "Entre todas las cuentas de chat no se puede reservar más del 100%. Si te pasás, aparece «Entre todas las cuentas se reservaría más del 100% de la capacidad del asesor.»",
              "No puede haber más chats simultáneos que el cupo. Si pasa, aparece «No pueden ser más chats simultáneos que el cupo.» Esto es porque cada chat necesita al menos 1 de capacidad.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Mientras los datos son válidos, la pantalla te explica el resultado en una frase, por ejemplo cuántos chats atiende el asesor y qué porcentaje ocupa cada uno.",
          },
        ],
      },
      {
        id: "uso-de-linea",
        titulo: "Uso de la línea (cuentas de telefonía)",
        bloques: [
          {
            tipo: "p",
            texto:
              "Solo aparece en cuentas de telefonía. Se completa en orden, de arriba hacia abajo, porque lo que se puede elegir depende de lo anterior y de lo que permitan los proveedores. Los números se ofrecen recién al final.",
          },
          { tipo: "sub", texto: "Paso 1. «¿Para qué se usa esta línea?»" },
          {
            tipo: "lista",
            items: [
              "Recibe llamadas — Las llamadas entran por la cuenta y se derivan a una campaña.",
              "Origina llamadas — Se usa para llamar desde las campañas.",
              "Recibe y origina — La misma línea recibe y también llama.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Hasta que no elijas uno no se ofrece ningún número («Elegí primero para qué se va a usar la línea»). Y si la línea solo origina, la solapa «Flujo» no aparece: el flujo decide a dónde va cada llamada que entra, y esta línea no recibe.",
          },
          { tipo: "sub", texto: "Paso 2. «¿Qué ve el destinatario cuando llamás?»" },
          {
            tipo: "p",
            texto:
              "Aparece solo si la línea origina llamadas («Origina llamadas» o «Recibe y origina»). Son tres opciones; la primera cambia según el uso.",
          },
          {
            tipo: "lista",
            items: [
              "Número visible — Con «Recibe y origina»: sale el mismo número por el que entran las llamadas, así el destinatario puede devolver el llamado y entra por esta cuenta. Queda elegida por defecto. Con «Origina llamadas»: se muestra un número del listado de disponibles, también elegido por defecto.",
              "Número aleatorio — La llamada sale con un número aleatorio del país del destinatario: si llamás a Argentina, sale con un número de Argentina. No elegís número.",
              "Número oculto — La llamada sale sin mostrar ningún número. No elegís número.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "«Número aleatorio» y «Número oculto» pueden aparecer deshabilitadas, con el motivo escrito en la propia opción: porque ningún proveedor lo permite, o porque no hay tarifas cargadas para elegir por dónde sale la llamada. Las opciones se habilitan según lo que permitan los proveedores.",
          },
          { tipo: "sub", texto: "Paso 3. «Elegí el número»" },
          {
            tipo: "lista",
            items: [
              "Número por el que entran las llamadas — Aparece si la línea recibe llamadas. Si además es «Recibe y origina» con «Número visible», el rótulo es «Número por el que entran y salen las llamadas».",
              "Número que se muestra al llamar — Aparece solo si la línea origina y elegiste «Número visible» (con «Origina llamadas»).",
            ],
          },
          {
            tipo: "p",
            texto:
              "Solo se listan las líneas disponibles y todavía no asignadas a otra cuenta, y que sirven para el uso elegido. Si necesitás un número propio, pedile al administrador de Mitrol que lo dé de alta: cuando esté cargado aparece en el listado.",
          },
          {
            tipo: "nota",
            texto:
              "Si alguien más tomó el número entre que abriste la lista y lo elegiste, la selección se descarta y tenés que elegir de nuevo sobre la lista actualizada.",
          },
        ],
      },
      {
        id: "flujo",
        titulo: "La solapa «Flujo»",
        bloques: [
          {
            tipo: "p",
            texto:
              "La solapa «Flujo» (con el título «Flujo de atención») contiene el editor donde se arma qué pasa con cada interacción que entra por la cuenta: qué se le reproduce o escribe al cliente, qué datos se le piden, qué decisiones se toman y a qué campaña se deriva.",
          },
          {
            tipo: "p",
            texto:
              "Todo flujo arranca en «Inicio de interacción» y normalmente termina en una «Derivación a campaña», donde se elige la campaña con «Elegir campaña…». La derivación también tiene una salida opcional «Fuera de horario», para desviar las interacciones que caen fuera del horario de atención o en un feriado de la campaña elegida.",
          },
          {
            tipo: "p",
            texto:
              "Cuándo aparece la solapa: siempre en chat, videollamada y webcall; en telefonía, solo si la línea «Recibe llamadas» o «Recibe y origina». Si cambiás el tipo de cuenta en el alta, el editor se rearma, porque cambian las opciones de cada paso (voz o texto).",
          },
          {
            tipo: "p",
            texto:
              "Cómo funciona cada macroestado (Reproducir, Capturar, Condición, Según valor, Consulta HTTP, Calcular y Derivación), las variables y las expresiones está explicado en la documentación «Flujo de las cuentas».",
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
              "Tipo fijo — Una vez creada, la cuenta no cambia de tipo. Si te equivocaste, hay que crear otra cuenta.",
              "Números — Un número libre que elegís queda ocupado y deja de ofrecerse a otros. ",
              "Capacidad en chat — El cupo de todas las cuentas de chat suma como máximo 100%. Al crear o editar una, el máximo que podés reservar es lo que dejaron libre las demás.",
              "Campañas — La derivación del flujo apunta a una campaña. La lista de campañas que ves es la de Olimpo.",
              "Eliminar — Quita la cuenta. Antes te pide confirmación, porque no se puede deshacer.",
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
              "Elegí el tipo con cuidado: no se puede cambiar después.",
              "En telefonía, ¿no ves la solapa «Flujo»? Revisá el «Uso de la línea»: aparece cuando recibe llamadas. Si todavía no elegiste ningún uso, tampoco aparece.",
              "En chat, si aparece un error rojo en «Capacidad del asesor», revisá que los chats simultáneos no superen el cupo y que, sumando las demás cuentas de chat, no pases el 100%.",
              "¿No ves el número que querés? Solo se listan los libres y compatibles con el uso elegido. Pedile el alta al administrador de Mitrol.",
              "Usá la «Descripción» para anotar qué campañas o equipos usan la cuenta: ayuda a quien la edite después.",
            ],
          },
        ],
      },
    ],
  },
  en: {
    titulo: "Accounts",
    resumen:
      "Accounts are the channels interactions come in and go out through: telephony, chat, video call and webcall. Here you create and edit them and define how each one is handled.",
    secciones: [
      {
        id: "que-es",
        titulo: "What an account is and what it is for",
        bloques: [
          {
            tipo: "p",
            texto:
              "An account is a contact channel of your company. For example, the collections phone line or the support chat on the website. Every interaction comes in (or goes out) through an account, and the account defines how it is handled.",
          },
          {
            tipo: "p",
            texto:
              "It relates to other sections of Olimpo:\n• Campaigns: the account's «Workflow» tab ends in a «Route to campaign», which is what handles the interaction.\n• Phone numbers: in telephony accounts, the numbers you can choose are the ones your company has available.",
          },
          {
            tipo: "p",
            texto:
              "It depends on campaigns existing (to route the interactions to) and, in telephony, on numbers being loaded for your company.",
          },
        ],
      },
      {
        id: "tipos-de-cuenta",
        titulo: "Account types",
        bloques: [
          {
            tipo: "p",
            texto:
              "The type is chosen when the account is created and cannot be changed afterwards. There are four, and each asks for different things:",
          },
          {
            tipo: "lista",
            items: [
              "SIP telephony — The usual phone line, with a number your customers call. It asks you to define the «Line usage» (whether it receives calls, places them, or both), what the other party sees, and the number. A call takes up the whole agent. The «Workflow» tab only appears if the line receives calls.",
              "Chat — Text conversation. It asks for the «Agent capacity»: how many chats at once each agent handles and what share of their capacity the account reserves. It has no line or usage. The «Workflow» tab is always there, because the customer is the one who starts the chat.",
              "Video call — It has no line, usage or capacity: it takes up the whole agent, like a call. The «Workflow» tab is always there. With «Chat during the call» on, besides video the customer and the agent message each other and send files during the video call; off (the default), it is video and audio only.",
              "Webcall (web call) — Voice call from the web, with no phone line. It also has no line, usage or capacity, and takes up the whole agent. The «Workflow» tab is always there. With «Chat during the call» on, besides audio the customer and the agent message each other and send files on the same call screen; off (the default), it is audio only.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Each agent has 100 capacity. A call, a video call or a webcall takes all 100: while the agent is in one, they do not receive a chat, and the other way around. Only chat splits that capacity across several interactions.",
          },
          {
            tipo: "p",
            texto:
              "In the workflow of chat, video call and webcall accounts, messages are always text: «Play» becomes «Send message» and «Collect digits» becomes «Collect text». The details are in «Account workflow».",
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
              "The «Accounts» screen shows a table with all the telephony, chat, video call and webcall accounts. Other channels (WhatsApp, SMS, Email) are not managed from here.",
          },
          { tipo: "sub", texto: "Columns" },
          {
            tipo: "lista",
            items: [
              "Name — The account name, with the icon of its type. It is a link that opens the account for editing.",
              "Type — «SIP telephony», «Chat», «Video call» or «Webcall (web call)».",
              "Line — The line number in telephony. In the other accounts it shows the account name; if there is no data it shows «—».",
              "Usage — Telephony only: «Receives calls», «Places calls» or «Receives and places». Everywhere else it shows «—».",
            ],
          },
          { tipo: "sub", texto: "Search and actions" },
          {
            tipo: "lista",
            items: [
              "Search box — The «Search» field above the table filters accounts by what you type.",
              "Sorting and filters — The table lets you sort and filter by column. All rows show in a single list that scrolls inside the screen: there are no pages.",
              "«Edit» — In the three-dot menu of each row. It opens the account.",
              "«Delete» — Also in the row menu, in red. It asks for confirmation («Confirm deletion?»).",
              "«New account» — Button at the top right. It opens the creation form.",
            ],
          },
          {
            tipo: "p",
            texto: "The list has no bulk actions: actions are done account by account.",
          },
        ],
      },
      {
        id: "crear-y-editar",
        titulo: "Creating and editing an account",
        bloques: [
          {
            tipo: "p",
            texto:
              "Creating and editing use the same screen, with two tabs: «General» (account data) and «Workflow» (how it is handled). That way you can create the account and define its workflow in one go.",
          },
          { tipo: "sub", texto: "How to create an account" },
          {
            tipo: "pasos",
            items: [
              "In «Accounts», click «New account».",
              "In the «General» tab, write the «Name» and, if you want, the «Description».",
              "Choose the account «Type». Think it through: it cannot be changed afterwards.",
              "Fill in what the type asks for: «Agent capacity» in chat, «Line usage» in telephony and, in webcall and video call, whether they add «Chat during the call».",
              "If the account receives interactions, open the «Workflow» tab and build the handling flow.",
              "Click «Create account».",
            ],
          },
          { tipo: "sub", texto: "How to edit an account" },
          {
            tipo: "pasos",
            items: [
              "In the list, click the account name, or open the row menu and choose «Edit».",
              "Change what you need in «General» or «Workflow».",
              "Click «Confirm» to save, or «Cancel» to go back without saving.",
            ],
          },
          { tipo: "sub", texto: "Account data («General» tab)" },
          {
            tipo: "lista",
            items: [
              "Name — What the account is called in Olimpo. When creating, the example is «E.g. Collections Line AR». Use a name that is clear at a glance, since it is what you see in the list.",
              "Type — «SIP telephony», «Chat», «Video call» or «Webcall (web call)». By default the creation form starts on «SIP telephony». It is chosen only on creation; when editing it appears locked.",
              "Description — Free text to remember what the account is used for («What this account is used for»). In practice optional: the screen does not require it.",
            ],
          },
        ],
      },
      {
        id: "capacidad-chat",
        titulo: "Agent capacity (chat accounts)",
        bloques: [
          {
            tipo: "p",
            texto:
              "It only appears in chat accounts. It defines how many chats of this account an agent handles at once and what share of their capacity the account reserves. It lets you split one agent across several accounts without one taking the other's room.",
          },
          {
            tipo: "p",
            texto:
              "Each agent has 100 capacity. Each chat takes the quota divided by the number of simultaneous chats, rounded down. For example, with 3 chats and a 60% quota, each chat takes 20%.",
          },
          {
            tipo: "lista",
            items: [
              "Limit simultaneous chats per agent — Checkbox. By default it is off in a new account. Off: no capacity is reserved and each chat takes 10%, that is, up to 10 chats at once per agent. On: the next two fields appear.",
              "Simultaneous chats per agent — How many chats of this account an agent handles at once. Whole number, minimum 1. Default 3.",
              "Capacity reserved (%) — What percentage of the agent's capacity the account reserves. Whole number between 1 and 100. Default 60%, or whatever is left if other chat accounts already reserved some.",
            ],
          },
          { tipo: "sub", texto: "Validations" },
          {
            tipo: "lista",
            items: [
              "Both fields must have numbers greater than 0; otherwise you see «Fill in both fields with numbers greater than 0.»",
              "Across all chat accounts you cannot reserve more than 100%. If you go over, you see «Across all accounts, more than 100% of the agent's capacity would be reserved.»",
              "There cannot be more simultaneous chats than the quota. If so, you see «Simultaneous chats cannot exceed the quota.» This is because each chat needs at least 1 of capacity.",
            ],
          },
          {
            tipo: "p",
            texto:
              "While the data is valid, the screen explains the result in one sentence, for example how many chats the agent handles and what percentage each one takes.",
          },
        ],
      },
      {
        id: "uso-de-linea",
        titulo: "Line usage (telephony accounts)",
        bloques: [
          {
            tipo: "p",
            texto:
              "It only appears in telephony accounts. It is filled in order, top to bottom, because what you can choose depends on what came before and on what your phone providers allow. Numbers are offered only at the end.",
          },
          { tipo: "sub", texto: "Step 1. «What is this line used for?»" },
          {
            tipo: "lista",
            items: [
              "Receives calls — Calls come in through the account and are routed to a campaign.",
              "Places calls — Used to call out from campaigns.",
              "Receives and places — The same line receives and also calls out.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Until you choose one, no number is offered («Choose what the line is for first»). And if the line only places calls, the «Workflow» tab does not appear: the workflow decides where each incoming call goes, and this line does not receive any.",
          },
          { tipo: "sub", texto: "Step 2. «What does the other party see when you call?»" },
          {
            tipo: "p",
            texto:
              "It appears only if the line places calls («Places calls» or «Receives and places»). There are three options; the first one changes with the usage.",
          },
          {
            tipo: "lista",
            items: [
              "Visible number — With «Receives and places»: the same number calls come in on goes out, so the other party can call back and reaches this account. It is chosen by default. With «Places calls»: a number from the available list is shown, also chosen by default.",
              "Random number — The call goes out with a random number from the recipient's country: calling Argentina shows an Argentine number. You do not pick a number.",
              "Hidden number — The call goes out without showing any number. You do not pick a number.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "«Random number» and «Hidden number» may appear disabled, with the reason written in the option itself: because your phone provider does not allow it, or because there are no rates loaded to choose how the call goes out. Options are enabled based on what your phone providers allow.",
          },
          { tipo: "sub", texto: "Step 3. «Choose the number»" },
          {
            tipo: "lista",
            items: [
              "Number calls come in on — Appears if the line receives calls. If it is also «Receives and places» with «Visible number», the label is «Number calls come in and go out on».",
              "Number shown when calling — Appears only if the line places calls and you chose «Visible number» (with «Places calls»).",
            ],
          },
          {
            tipo: "p",
            texto:
              "Only lines that are available, not yet assigned to another account, and valid for the chosen usage are listed. If you need your own number, ask the Mitrol administrator to onboard it: once loaded, it shows up in the list.",
          },
          {
            tipo: "nota",
            texto:
              "If someone else took the number between you opening the list and choosing it, the selection is discarded and you have to choose again from the refreshed list.",
          },
        ],
      },
      {
        id: "flujo",
        titulo: "The «Workflow» tab",
        bloques: [
          {
            tipo: "p",
            texto:
              "The «Workflow» tab (titled «Call workflow») holds the editor where you build what happens with each interaction coming in through the account: what the customer hears or reads, what data is asked for, what decisions are made and which campaign it is routed to.",
          },
          {
            tipo: "p",
            texto:
              "Every flow starts at «Interaction start» and normally ends in a «Route to campaign», where you pick the campaign with «Choose a campaign…». The routing also has an optional «Out of hours» exit, to divert interactions that fall outside the chosen campaign's business hours or on a holiday.",
          },
          {
            tipo: "p",
            texto:
              "When the tab appears: always in chat, video call and webcall; in telephony, only if the line «Receives calls» or «Receives and places». If you change the account type while creating, the editor is rebuilt, because the options of each step change (voice or text).",
          },
          {
            tipo: "p",
            texto:
              "How each macro-state works (Play, Collect, Condition, By value, HTTP request, Calculate and Route), the variables and the expressions is explained in the «Account workflow» documentation.",
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
              "Fixed type — Once created, the account does not change type. If you got it wrong, you need to create another account.",
              "Numbers — A free number you choose becomes occupied and stops being offered to others. ",
              "Chat capacity — The quota of all chat accounts adds up to at most 100%. When creating or editing one, the most you can reserve is what the others left free.",
              "Campaigns — The workflow's routing points to a campaign. The campaign list you see is Olimpo's.",
              "Delete — Removes the account. It asks for confirmation first, because it cannot be undone.",
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
              "Choose the type carefully: it cannot be changed afterwards.",
              "In telephony, can't see the «Workflow» tab? Check the «Line usage»: it appears when the line receives calls. If you have not chosen any usage yet, it does not appear either.",
              "In chat, if a red error appears in «Agent capacity», check that simultaneous chats do not exceed the quota and that, adding the other chat accounts, you do not go over 100%.",
              "Can't see the number you want? Only free numbers compatible with the chosen usage are listed. Ask the Mitrol administrator to onboard it.",
              "Use the «Description» to note which campaigns or teams use the account: it helps whoever edits it later.",
            ],
          },
        ],
      },
    ],
  },
};
