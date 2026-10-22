import type { ContenidoPagina } from "@/lib/docs/tipos";

// Grupos y roles (ruta técnica `grupos-de-trabajo`): listado, alta, detalle
// con solapas, permisos, miembros y configuración de Hermes.
export const contenido: ContenidoPagina = {
  es: {
    titulo: "Grupos y roles",
    resumen:
      "Cómo definir qué puede hacer cada equipo: sus permisos, el acceso a Hermes, los estados auxiliares habilitados y las personas que lo integran.",
    secciones: [
      {
        id: "que-es",
        titulo: "Qué es y para qué sirve",
        bloques: [
          {
            tipo: "p",
            texto:
              "Un grupo de trabajo es un equipo de personas (por ejemplo «Cobranzas» o «Ventas») al que le asignás permisos. Los grupos hacen el papel de roles: no hay una pantalla de roles aparte, el «rol» de una persona es el conjunto de permisos de los grupos en los que está.",
          },
          {
            tipo: "p",
            texto:
              "Cómo se combinan las piezas: un «Usuario» (ver «Usuarios») pertenece a uno o más grupos. Cada grupo define sus permisos en Olimpo, si tiene acceso a «Hermes» (la pantalla de trabajo del asesor), qué «Estados auxiliares» tiene habilitados y cómo se comporta Hermes para sus integrantes. Lo que ve y puede hacer un usuario es la suma de todos sus grupos.",
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
              "La tabla muestra todos los grupos, sin paginación, con cuadro de búsqueda arriba y filtros por columna.",
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Nombre del grupo. Es un enlace al detalle.",
              "Descripción — Texto libre. Si el grupo no tiene, muestra «—».",
              "Usuarios — Cantidad de usuarios que integran el grupo.",
              "Auxiliares habilitados — Cantidad de estados auxiliares habilitados para el grupo.",
            ],
          },
          {
            tipo: "p",
            texto:
              "El botón «Nuevo grupo de trabajo» abre el alta. El menú de tres puntos de cada fila ofrece «Editar» (abre el detalle) y «Eliminar» (pide confirmación). No hay acciones masivas.",
          },
        ],
      },
      {
        id: "crear",
        titulo: "Cómo crear un grupo",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "Tocá «Nuevo grupo de trabajo».",
              "En la tarjeta «Información general», completá «Nombre» y, si querés, «Descripción».",
              "En «Estados auxiliares habilitados», abrí el selector y tildá los estados que tendrá el grupo.",
              "Tocá «Crear grupo». Para salir sin guardar, «Cancelar».",
              "Después, abrí el grupo para sumar usuarios, permisos y configuración de Hermes: esas partes se cargan desde la edición.",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Cómo se llama el equipo (ejemplo: «Ej: Cobranzas»). Es lo que se ve en el listado y en la tarjeta de cada usuario.",
              "Descripción — Opcional. Texto libre de hasta 3 líneas visibles.",
              "Estados auxiliares habilitados — Opcional. Selector con buscador («Buscar estado auxiliar...»): tildás o destildás cada estado, y la selección se resume en el botón («{n} habilitado(s)») y en etiquetas debajo, cada una con una X para quitarla. Si no hay coincidencias dice «No se encontró ningún estado auxiliar.». Está pensado para catálogos grandes, por eso es un buscador y no una lista de casillas.",
            ],
          },
        ],
      },
      {
        id: "editar",
        titulo: "Cómo editar un grupo",
        bloques: [
          {
            tipo: "p",
            texto:
              "El detalle del grupo se organiza en solapas. El botón «Confirmar» (arriba) y «Cancelar» valen para todas.",
          },
          {
            tipo: "lista",
            items: [
              "General — Nombre, descripción y usuarios del grupo.",
              "Permisos — Tabla de permisos de Olimpo, acceso a Hermes y permisos de las «Claves de acceso API» (las llaves que usan las aplicaciones de tu empresa para conectarse a Atlas).",
              "Config. Hermes — Solo aparece si el grupo tiene acceso a Hermes. Estados auxiliares, historial, llamadas internas, accesos rápidos y grabación.",
              "Ficha del cliente — También solo con acceso a Hermes. Qué datos del cliente ve y modifica el grupo.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Si destildás el acceso a Hermes en «Permisos», las solapas «Config. Hermes» y «Ficha del cliente» desaparecen. Si estabas parado en una de ellas, vuelve a «General».",
          },
        ],
      },
      {
        id: "general-usuarios",
        titulo: "Solapa General: datos y usuarios",
        bloques: [
          {
            tipo: "p",
            texto:
              "La tarjeta «Información general» trae «Nombre» y «Descripción» con los valores actuales. Debajo está la tarjeta «Usuarios del grupo», con el conteo («{n} usuario(s).»).",
          },
          {
            tipo: "pasos",
            items: [
              "Para sumar a alguien, tocá «Agregar usuario» y buscalo en «Buscar usuario...». Solo aparecen los que todavía no están en el grupo; si ya están todos dice «No hay más usuarios para agregar.».",
              "Para sacar a alguien, tocá la X roja de su fila («Quitar del grupo»).",
              "Para ver el detalle de una persona, tocá su nombre.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Cada fila muestra el avatar, el nombre y el email. Si el usuario tiene permisos asignados de forma individual, lleva la etiqueta «+ permisos individuales». Si el grupo no tiene gente dice «Todavía no hay usuarios en este grupo.».",
          },
          {
            tipo: "p",
            texto:
              "Un usuario puede estar en varios grupos a la vez: sus permisos se suman.",
          },
        ],
      },
      {
        id: "permisos",
        titulo: "Solapa Permisos",
        bloques: [
          {
            tipo: "p",
            texto:
              "Define qué puede hacer el grupo en cada sección: consultar, editar o eliminar. Aplica a todos sus usuarios. Tiene tres partes.",
          },
          { tipo: "sub", texto: "Olimpo: tabla por sección" },
          {
            tipo: "p",
            texto:
              "Una fila por módulo y tres casillas: «Lectura», «Escritura» y «Eliminación». Los módulos son: Proyectos, Campañas, Clientes, Cuentas, Clasificaciones, Marcas, Feriados, Listas de exclusión, Usuarios, Grupos y roles y Estados auxiliares.",
          },
          {
            tipo: "lista",
            items: [
              "Lectura — Permite consultar la sección. Es la base de las demás.",
              "Escritura — Permite crear y editar. Si la tildás sin «Lectura», la «Lectura» se tilda sola.",
              "Eliminación — Permite eliminar. Si la tildás sin «Lectura», la «Lectura» se tilda sola.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Sin «Lectura» no hay nada: al destildar «Lectura» se destildan también «Escritura» y «Eliminación» de ese módulo. La tabla nunca queda en una combinación que no se pueda usar.",
          },
          { tipo: "sub", texto: "Hermes: acceso a la pantalla del asesor" },
          {
            tipo: "p",
            texto:
              "Una sola casilla «Acceso» (sección «Hermes»): habilita al grupo a entrar a Hermes, la pantalla donde el asesor atiende. No hay permisos por sección como en Olimpo: el grupo entra o no entra. Es lo que muestra u oculta las solapas «Config. Hermes» y «Ficha del cliente».",
          },
          { tipo: "sub", texto: "Claves de acceso API" },
          {
            tipo: "p",
            texto:
              "Una fila con cuatro casillas: «Ver», «Crear», «Editar» y «Revocar». Definen qué puede hacer el grupo con las claves con las que las aplicaciones propias del cliente se conectan a Atlas. Sin «Ver» no hay ningún otro, y el grupo no ve la opción en el menú. Tildar «Crear», «Editar» o «Revocar» tilda «Ver» sola; destildar «Ver» destilda todas.",
          },
        ],
      },
      {
        id: "config-hermes",
        titulo: "Solapa Config. Hermes",
        bloques: [
          {
            tipo: "p",
            texto:
              "Reúne lo que el grupo ve y tiene disponible dentro de Hermes. Solo está si el grupo tiene acceso a Hermes. Tiene cinco bloques.",
          },
          {
            tipo: "lista",
            items: [
              "Estados auxiliares habilitados — Mismo selector con buscador del alta. Son los estados que los usuarios del grupo pueden elegir cuando no están atendiendo. Se definen en «Estados auxiliares».",
              "Historial de interacciones del cliente — Campo «Días de historial»: cuántos días hacia atrás busca Hermes el historial del cliente cuando lo muestra en pantalla. Aplica a los canales digitales (chat y mensajería). Es un número, mínimo 0, y por defecto 30 días. Es por grupo, no por campaña.",
              "Llamadas internas — Llamadas entre agentes desde Hermes, sin cliente en línea. El interruptor «Permitir llamadas internas» las habilita (viene encendido). Apagado, el recuadro queda deshabilitado y los usuarios no ven el directorio en Hermes. Encendido, «¿A quién pueden llamar?» tiene tres opciones que se suman: «Agentes del mismo grupo de trabajo», «Agentes de los mismos proyectos» y «Agentes de las mismas campañas» (las tres vienen tildadas). Quien comparte una campaña comparte su proyecto, así que con «mismos proyectos» tildada, «mismas campañas» queda incluida y no se puede destildar. Definen a quién pueden llamar los usuarios de este grupo, no quién puede llamarlos a ellos. Si no dejás ninguna tildada, aparece un aviso: los usuarios del grupo no pueden hacer llamadas internas. El interruptor «Grabar las llamadas internas» (por defecto apagado) graba el audio de esas llamadas.",
              "Accesos rápidos — Botones en el menú de Hermes para los usuarios del grupo. Con «Agregar acceso rápido» sumás uno; cada uno tiene «Nombre» (ejemplo: «Ej: Manual del agente»), «URL» (ejemplo: «https://…») y «Modo de apertura»: «Dentro de Hermes» (por defecto) o «Pestaña nueva». El tacho lo elimina. Sin ninguno dice «Todavía no hay accesos rápidos configurados para este grupo.». No hay máximo.",
              "Grabación — Qué se graba cuando atiende un agente del grupo y en qué momentos. Ver la sección «Grabación» más abajo.",
            ],
          },
        ],
      },
      {
        id: "grabacion",
        titulo: "Grabación del grupo",
        bloques: [
          {
            tipo: "p",
            texto:
              "Primero se elige «¿Qué se graba?»: «Audio» (la conversación entre el agente y el cliente) y/o «Pantalla» (lo que el agente ve y hace en su pantalla). Después, «¿En qué momentos?»:",
          },
          {
            tipo: "lista",
            items: [
              "La conversación — No se elige: si se graba algo, siempre se graba la conversación. Si no hay audio ni pantalla activados, dice «No hay nada para grabar: activá audio o pantalla.».",
              "La espera — Sigue grabando mientras la llamada está en espera. Se apaga si no se graba nada.",
              "El trabajo posterior — Graba el tiempo posterior a la llamada, mientras el agente clasifica la gestión (el trabajo posterior a la llamada). Se apaga si no se graba nada.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Entre la campaña y el grupo de trabajo gana lo más restrictivo: si la campaña tiene algo apagado, eso no se graba aunque en el grupo esté encendido. Lo mismo al revés.",
          },
        ],
      },
      {
        id: "ficha-cliente",
        titulo: "Solapa Ficha del cliente",
        bloques: [
          {
            tipo: "p",
            texto:
              "Con el título «Ficha del cliente en Hermes», define qué datos del cliente pueden ver y modificar los agentes del grupo, etiquetas incluidas. Es una tabla con una fila por campo, agrupada en «Datos básicos», «Contacto», «Información adicional» y «Etiquetas», y dos interruptores por fila: «Ver» y «Modificar».",
          },
          {
            tipo: "lista",
            items: [
              "Ver — Si está apagado, el agente no ve ese dato.",
              "Modificar — Solo se puede encender si «Ver» está encendido; si apagás «Ver», «Modificar» se apaga solo.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Si un campo no está configurado para el grupo, se puede ver y modificar. La «Información adicional» se arma con los campos que se fueron creando en las importaciones (ver «Clientes»).",
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
              "Permisos efectivos — Un usuario tiene la suma de los permisos y estados auxiliares de todos sus grupos más lo que tenga asignado de forma individual. Nunca se resta: los permisos solo se agregan. Se ve en el detalle del usuario (ver «Usuarios»).",
              "Usuarios sin grupo — Pueden iniciar sesión pero no tienen permisos ni estados auxiliares operativos.",
              "Estados auxiliares — El selector del grupo lee el catálogo de «Estados auxiliares».",
              "Grabación — Se cruza con la de cada campaña (ver «Campañas») y gana lo más restrictivo.",
            ],
          },
        ],
      },
    ],
  },
  en: {
    titulo: "Groups and roles",
    resumen:
      "How to define what each team can do: its permissions, Hermes access, the enabled auxiliary states and the people who belong to it.",
    secciones: [
      {
        id: "que-es",
        titulo: "What it is and what it is for",
        bloques: [
          {
            tipo: "p",
            texto:
              "A working group is a team of people (for example “Cobranzas” or “Ventas”) that you assign permissions to. Groups play the role of roles: there is no separate roles screen, a person's “role” is the set of permissions of the groups they are in.",
          },
          {
            tipo: "p",
            texto:
              "How the pieces combine: a “User” (see “Users”) belongs to one or more groups. Each group defines its permissions in Olimpo, whether it has access to “Hermes” (the agent's work screen), which “Auxiliary states” it has enabled and how Hermes behaves for its members. What a user sees and can do is the sum of all their groups.",
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
              "The table shows all groups, without pagination, with a search box on top and column filters.",
          },
          {
            tipo: "lista",
            items: [
              "Name — The group's name. It is a link to the detail.",
              "Description — Free text. If the group has none, it shows “—”.",
              "Users — Number of users in the group.",
              "Enabled auxiliaries — Number of auxiliary states enabled for the group.",
            ],
          },
          {
            tipo: "p",
            texto:
              "The “New working group” button opens the creation form. Each row's three-dot menu offers “Edit” (opens the detail) and “Delete” (asks for confirmation). There are no bulk actions.",
          },
        ],
      },
      {
        id: "crear",
        titulo: "How to create a group",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "Click “New working group”.",
              "In the “General information” card, fill in “Name” and, if you want, “Description”.",
              "In “Enabled auxiliary states”, open the selector and tick the states the group will have.",
              "Click “Create group”. To leave without saving, “Cancel”.",
              "Then open the group to add users, permissions and Hermes settings: those parts are loaded from the edit screen.",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Name — What the team is called (example: “e.g. Cobranzas”). It is what shows in the list and on each user's card.",
              "Description — Optional. Free text, 3 visible lines.",
              "Enabled auxiliary states — Optional. Selector with a search box (“Search auxiliary state...”): you tick or untick each state, and the selection is summarized on the button (“{n} enabled”) and in tags below, each with an X to remove it. If nothing matches it says “No auxiliary state found.”. It is built for large catalogs, which is why it is a search box and not a list of checkboxes.",
            ],
          },
        ],
      },
      {
        id: "editar",
        titulo: "How to edit a group",
        bloques: [
          {
            tipo: "p",
            texto:
              "The group detail is organized in tabs. The “Confirm” button (top) and “Cancel” apply to all of them.",
          },
          {
            tipo: "lista",
            items: [
              "General — Name, description and the group's users.",
              "Permissions — Olimpo permission table, Hermes access and permissions for the “API access keys” (the keys your company's applications use to connect to Atlas).",
              "Config. Hermes — Only appears if the group has Hermes access. Auxiliary states, history, internal calls, quick access buttons and recording.",
              "Ficha del cliente — Also only with Hermes access. Which customer data the group sees and modifies.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "If you untick Hermes access in “Permissions”, the “Config. Hermes” and “Ficha del cliente” tabs disappear. If you were on one of them, you go back to “General”.",
          },
        ],
      },
      {
        id: "general-usuarios",
        titulo: "General tab: details and users",
        bloques: [
          {
            tipo: "p",
            texto:
              "The “General information” card has “Name” and “Description” with the current values. Below it is the “Group users” card, with the count (“{n} user(s).”).",
          },
          {
            tipo: "pasos",
            items: [
              "To add someone, click “Add user” and search for them in “Search user...”. Only users not yet in the group appear; if all are in, it says “There are no more users to add.”.",
              "To remove someone, click the red X on their row (“Remove from group”).",
              "To see a person's detail, click their name.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Each row shows the avatar, name and email. If the user has individually assigned permissions, it carries the “+ individual permissions” tag. If the group has nobody it says “There are no users in this group yet.”.",
          },
          {
            tipo: "p",
            texto:
              "A user can be in several groups at once: their permissions add up.",
          },
        ],
      },
      {
        id: "permisos",
        titulo: "Permissions tab",
        bloques: [
          {
            tipo: "p",
            texto:
              "It defines what the group can do in each section: view, edit or delete. It applies to all its users. It has three parts.",
          },
          { tipo: "sub", texto: "Olimpo: table by section" },
          {
            tipo: "p",
            texto:
              "One row per module and three checkboxes: “Read”, “Write” and “Delete”. The modules are: Projects, Campaigns, Clientes, Accounts, Classifications, Marks, Holidays, Exclusion lists, Users, Groups and roles and Auxiliary states.",
          },
          {
            tipo: "lista",
            items: [
              "Read — Allows viewing the section. It is the base for the others.",
              "Write — Allows creating and editing. If you tick it without “Read”, “Read” is ticked automatically.",
              "Delete — Allows deleting. If you tick it without “Read”, “Read” is ticked automatically.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Without “Read” there is nothing: unticking “Read” also unticks “Write” and “Delete” for that module. The table never ends up in a combination that cannot be used.",
          },
          { tipo: "sub", texto: "Hermes: access to the agent's screen" },
          {
            tipo: "p",
            texto:
              "A single “Access” checkbox (“Hermes” section): it lets the group into Hermes, the screen where the agent handles interactions. There are no per-section permissions as in Olimpo: the group is either in or out. It is what shows or hides the “Config. Hermes” and “Ficha del cliente” tabs.",
          },
          { tipo: "sub", texto: "API access keys" },
          {
            tipo: "p",
            texto:
              "One row with four checkboxes: “View”, “Create”, “Edit” and “Revoke”. They define what the group can do with the keys the customer's own applications use to connect to Atlas. Without “View” none of the others apply, and the group doesn't see the option in the menu. Ticking “Create”, “Edit” or “Revoke” ticks “View” automatically; unticking “View” unticks all of them.",
          },
        ],
      },
      {
        id: "config-hermes",
        titulo: "Config. Hermes tab",
        bloques: [
          {
            tipo: "p",
            texto:
              "It gathers what the group sees and has available inside Hermes. It is only there if the group has Hermes access. It has five blocks.",
          },
          {
            tipo: "lista",
            items: [
              "Enabled auxiliary states — Same search selector as in creation. These are the states the group's users can pick when they are not handling interactions. They are defined in “Auxiliary states”.",
              "Customer interaction history («Historial de interacciones del cliente») — Field «Días de historial»: how many days back Hermes looks for the customer's history when showing it on screen. It applies to digital channels (chat and messaging). It is a number, minimum 0, default 30 days. It is per group, not per campaign.",
              "Internal calls («Llamadas internas») — Calls between agents from Hermes, with no customer on the line. The «Permitir llamadas internas» switch enables them (it starts on). When off, the box is disabled and the users do not see the directory in Hermes. When on, «¿A quién pueden llamar?» has three options that add up: «Agentes del mismo grupo de trabajo», «Agentes de los mismos proyectos» and «Agentes de las mismas campañas» (all three start ticked). Whoever shares a campaign shares its project, so with «mismos proyectos» ticked, «mismas campañas» is included and cannot be unticked. They define whom this group's users can call, not who can call them. If you leave none ticked, a warning appears: the group's users cannot make internal calls. The «Grabar las llamadas internas» switch (off by default) records the audio of those calls.",
              "Quick access buttons («Accesos rápidos») — Buttons in the Hermes menu for the group's users. «Agregar acceso rápido» adds one; each has «Nombre» (example: «Ej: Manual del agente»), «URL» (example: «https://…») and «Modo de apertura»: «Dentro de Hermes» (default) or «Pestaña nueva». The trash can removes it. With none it says «Todavía no hay accesos rápidos configurados para este grupo.». There is no maximum.",
              "Recording — What is recorded when an agent from the group handles the call and at which moments. See the “Group recording” section below.",
            ],
          },
        ],
      },
      {
        id: "grabacion",
        titulo: "Group recording",
        bloques: [
          {
            tipo: "p",
            texto:
              "First you choose “What gets recorded?”: “Audio” (the conversation between agent and customer) and/or “Screen” (what the agent sees and does on screen). Then, “At which moments?”:",
          },
          {
            tipo: "lista",
            items: [
              "The conversation — Not selectable: if anything is recorded, the conversation always is. If neither audio nor screen is on, it says “Nothing to record: turn on audio or screen.”.",
              "The hold — Keeps recording while the call is on hold. It turns off if nothing is recorded.",
              "The after-call work — Records the time after the call, while the agent classifies the interaction (the work after the call). It turns off if nothing is recorded.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Between the campaign and the working group, the most restrictive one wins: if the campaign has something off, that isn't recorded even if it's on in the group. The same applies the other way around.",
          },
        ],
      },
      {
        id: "ficha-cliente",
        titulo: "Ficha del cliente tab",
        bloques: [
          {
            tipo: "p",
            texto:
              "Titled «Ficha del cliente en Hermes», it defines which customer data the group's agents can see and modify, labels included. It is a table with one row per field, grouped into «Datos básicos», «Contacto», «Información adicional» and «Etiquetas», and two switches per row: «Ver» and «Modificar».",
          },
          {
            tipo: "lista",
            items: [
              "Ver (view) — If off, the agent does not see that data.",
              "Modificar (modify) — Can only be turned on if «Ver» is on; if you turn «Ver» off, «Modificar» turns off by itself.",
            ],
          },
          {
            tipo: "p",
            texto:
              "If a field is not configured for the group, it can be seen and modified. The «Información adicional» is built from the fields created in the imports (see “Clientes”).",
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
              "Effective permissions — A user has the sum of the permissions and auxiliary states of all their groups plus whatever is assigned to them individually. Nothing is ever subtracted: permissions are only added. It shows in the user detail (see “Users”).",
              "Users without a group — They can sign in but have no permissions or operational auxiliary states.",
              "Auxiliary states — The group selector reads the catalog from “Auxiliary states”.",
              "Recording — It is crossed with each campaign's (see “Campaigns”) and the most restrictive wins.",
            ],
          },
        ],
      },
    ],
  },
};
