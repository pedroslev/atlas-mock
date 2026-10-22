import type { ContenidoPagina } from "@/lib/docs/tipos";

// Configuración → Claves de acceso API: qué es una clave, cómo se crea, qué
// puede hacer, cómo se limitan los sitios web y cómo se revoca.
export const contenido: ContenidoPagina = {
  es: {
    titulo: "Claves de acceso API",
    resumen:
      "Cómo crear y administrar las claves que permiten que tu página web o otros sistemas de tu empresa se conecten con Atlas: para qué sirve cada una, qué puede hacer y cómo darla de baja.",
    secciones: [
      {
        id: "que-es",
        titulo: "Qué es una clave de acceso API",
        bloques: [
          {
            tipo: "p",
            texto:
              "Una clave de acceso API es como una llave que le das a una aplicación de tu empresa para que pueda conectarse con Atlas. Sin la llave, la aplicación no entra.",
          },
          {
            tipo: "p",
            texto:
              "Por ejemplo, la necesitás para que el chat de tu página web pueda iniciar conversaciones con tus agentes, para que otro sistema de tu empresa consulte los datos de tus clientes, o para que una página tuya maneje el puesto de trabajo del agente (el PAD).",
          },
          {
            tipo: "p",
            texto:
              "Cada clave hace solo lo que vos le permitís. Por eso conviene crear una clave por aplicación, con un nombre que diga para qué es. Las encontrás en Configuración → «Claves de acceso API».",
          },
          {
            tipo: "p",
            texto:
              "Los datos de clientes que una clave puede consultar o modificar son los que se explican en «Clientes».",
          },
        ],
      },
      {
        id: "publica-y-secreta",
        titulo: "Clave pública y clave secreta",
        bloques: [
          {
            tipo: "p",
            texto:
              "Cada vez que creás una clave, Atlas te da dos: una pública y una secreta. Se crean juntas y se dan de baja juntas.",
          },
          {
            tipo: "lista",
            items: [
              "Pública — La que puede ir en tu página web. No es un secreto, porque cualquiera que mire la página la puede ver. La podés volver a copiar desde el listado o desde el detalle cuando quieras. Empieza con «atl_pub_».",
              "Secreta — La que debe quedar guardada solo en tus sistemas, nunca en una página web. Empieza con «atl_sec_». La ves completa una sola vez, cuando creás la clave. Después solo se ve cómo termina (por ejemplo «atl_sec_…7f3c»).",
            ],
          },
          {
            tipo: "p",
            texto:
              "Los prefijos «atl_pub_» y «atl_sec_» te ayudan a reconocer de un vistazo qué clave es y de qué tipo, aunque la encuentres en un archivo o en un registro.",
          },
          {
            tipo: "nota",
            texto:
              "La clave secreta no se puede recuperar. Si la perdés, dala de baja («Revocar») y creá otra.",
          },
        ],
      },
      {
        id: "capacidades",
        titulo: "Capacidades",
        bloques: [
          {
            tipo: "p",
            texto:
              "Las capacidades son lo que la clave puede hacer. Las elegís al crearla y después no se pueden cambiar. Si necesitás otras, creás una clave nueva y das de baja la anterior. Elegí solo lo que la aplicación necesita.",
          },
          {
            tipo: "p",
            texto:
              "Al lado de cada capacidad ves con qué clave se usa: «Pública y secreta» o «Solo secreta». Las que dicen «Solo secreta» trabajan con datos de tus clientes, así que solo se usan desde tus sistemas, nunca desde una página web.",
          },
          {
            tipo: "lista",
            items: [
              "Chat — Abrir conversaciones y enviar y recibir mensajes. Sirve para el chat de tu página web o para páginas de atención propias. Pública y secreta.",
              "Videollamada — Iniciar videollamadas entrantes desde una página tuya. Pública y secreta.",
              "Webcall — Iniciar llamadas de voz entrantes desde internet (solo audio, sin línea telefónica) desde una página tuya. Pública y secreta.",
              "Clientes · lectura — Consultar los datos y el historial de contacto de tus clientes. Solo secreta.",
              "Clientes · escritura — Crear y actualizar datos de clientes desde otro sistema de tu empresa. Solo secreta.",
              "Control del agente — Manejar el PAD del agente que tiene la sesión abierta desde otra aplicación web, con su propia sesión. Pública y secreta.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Una clave puede tener varias capacidades. Por ejemplo, «Control del agente» y «Clientes · lectura» para una botonera de llamadas dentro de otro sistema de tu empresa.",
          },
        ],
      },
      {
        id: "permisos",
        titulo: "Quién puede ver y administrar las claves",
        bloques: [
          {
            tipo: "p",
            texto:
              "Qué puede hacer cada persona con las claves depende de sus grupos. Se configura en «Grupos y roles», en los permisos de la sección «Claves de acceso API». Hay cuatro, y los permisos de una persona se suman entre todos sus grupos.",
          },
          {
            tipo: "lista",
            items: [
              "Ver — Entrar a la pantalla, ver las claves y su detalle, y copiar la clave pública. Sin «Ver», la opción «Claves de acceso API» no aparece en el menú de Configuración. Si alguien llega igual por la dirección, la pantalla le avisa que no tiene permiso.",
              "Crear — Muestra el botón «Crear clave» y permite crear claves nuevas.",
              "Editar — Permite cambiar los «Dominios permitidos» de una clave activa.",
              "Revocar — Permite dar de baja claves, desde el listado o desde el detalle.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Los permisos van encadenados: sin «Ver» no se puede nada más. Si tildás «Crear», «Editar» o «Revocar», «Ver» se tilda solo. Si destildás «Ver», se destildan todos.",
          },
          {
            tipo: "p",
            texto:
              "Si una persona tiene solo «Ver», el listado le muestra un aviso: para crear, editar o revocar necesita los permisos de su grupo en «Grupos y roles».",
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
              "Muestra todas las claves de tu empresa, también las dadas de baja, para que quede constancia de que existieron. Si tocás una fila, se abre el detalle de la clave.",
          },
          {
            tipo: "sub",
            texto: "Columnas",
          },
          {
            tipo: "lista",
            items: [
              "Nombre — El nombre de la clave. Debajo ves desde qué sitios web se acepta la clave pública: «Cualquier dominio», el sitio si hay uno solo, o «sitio y N más» si hay varios (pasando el mouse por encima se ven todos).",
              "Claves — La pública resumida, con un botón «Copiar clave pública» que copia la completa, y la secreta con solo cómo termina. En las claves dadas de baja no aparece el botón de copiar.",
              "Capacidades — Una etiqueta por cada cosa que puede hacer la clave.",
              "Creada por — Quién la creó y cuándo.",
              "Último uso — Fecha y hora de la última vez que se usó, o «Nunca usada».",
              "Estado — «Activa» o «Revocada». En una revocada ves además quién la dio de baja y cuándo.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Las columnas «Claves» y «Último uso» no se pueden filtrar. Las demás sí, desde la misma tabla.",
          },
          {
            tipo: "sub",
            texto: "Acciones",
          },
          {
            tipo: "lista",
            items: [
              "Crear clave — Botón de arriba a la derecha. Aparece solo si tenés el permiso «Crear».",
              "Revocar — En el menú de tres puntos de la fila. Te pide confirmación. Aparece solo si tenés el permiso «Revocar» y solo en claves activas.",
              "Abrir el detalle — Tocá la fila. Copiar la clave pública desde el listado no abre el detalle.",
            ],
          },
        ],
      },
      {
        id: "crear",
        titulo: "Cómo crear una clave",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "En Configuración → «Claves de acceso API», tocá «Crear clave». Se abre «Nueva clave de acceso API».",
              "Escribí el nombre de la clave.",
              "Tildá las capacidades que necesita la aplicación.",
              "Si querés que la clave pública solo funcione en tus páginas, agregá los «Dominios permitidos».",
              "Tocá «Crear clave». Aparece la pantalla «Clave creada» con las dos claves.",
              "Copiá la pública y la secreta con sus botones «Copiar» y guardalas en un lugar seguro.",
              "Tocá «Listo, ya la guardé». Volvés al listado, donde la clave nueva aparece primera.",
            ],
          },
          {
            tipo: "sub",
            texto: "Campos",
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Obligatorio. Es texto libre; poné algo que diga para qué aplicación es, por ejemplo «Widget de chat del sitio web». Después no se puede cambiar.",
              "Capacidades — Obligatorio: tildá al menos una. Las opciones son «Chat», «Videollamada», «Webcall», «Clientes · lectura», «Clientes · escritura» y «Control del agente». Después no se pueden cambiar.",
              "Dominios permitidos — Opcional. Es la lista de sitios web (por ejemplo www.bancosur.com.ar) desde los que se acepta la clave pública. Sirve para que nadie pueda usarla desde una página que no es tuya. Solo vale para la pública. Si lo dejás vacío, se acepta desde cualquier sitio.",
            ],
          },
          {
            tipo: "p",
            texto:
              "El botón «Crear clave» queda deshabilitado hasta que haya un nombre y al menos una capacidad.",
          },
          {
            tipo: "sub",
            texto: "Cómo cargar los sitios web",
          },
          {
            tipo: "lista",
            items: [
              "Qué escribir — El nombre del sitio (www.bancosur.com.ar) o su dirección completa (https://ayuda.bancosur.com.ar). Si no escribís el «https://», se agrega solo. Si escribís algo más después del nombre del sitio, se descarta y queda solo el sitio.",
              "Cómo agregarlo — Apretá Enter o el botón «Agregar». Cada sitio queda como una etiqueta.",
              "Qué se acepta — Un nombre de sitio con al menos un punto, o localhost para pruebas. Si no es válido, aparece un aviso debajo del campo.",
              "Repetidos — Si el sitio ya está en la lista, no se agrega dos veces.",
              "Cómo sacarlo — Con la X de la etiqueta.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "La clave secreta completa se muestra solo en la pantalla «Clave creada». Si salís de ahí sin copiarla, no hay forma de volver a verla: tenés que dar de baja la clave y crear otra.",
          },
        ],
      },
      {
        id: "detalle",
        titulo: "El detalle de una clave",
        bloques: [
          {
            tipo: "p",
            texto:
              "Se abre al tocar una fila del listado. Arriba ves el nombre y el estado («Activa» o «Revocada»).",
          },
          {
            tipo: "lista",
            items: [
              "Datos de la clave — La clave pública completa (con botón de copiar si la clave está activa), cómo termina la secreta, quién la creó y cuándo, el último uso y, si está dada de baja, quién la revocó y cuándo.",
              "Capacidades — Lo que puede hacer la clave, cada una con «Pública y secreta» o «Solo secreta». Solo se ven: no se editan.",
              "Dominios permitidos — Es lo único que se puede cambiar de una clave. Si tenés el permiso «Editar» y la clave está activa, cambiás la lista y tocás «Guardar»; «Cancelar» descarta los cambios. Los dos botones se habilitan solo si cambiaste algo. Sin el permiso, o si la clave está revocada, la lista se ve pero no se edita.",
              "Revocar — Al final de la pantalla. Aparece solo si tenés el permiso «Revocar» y la clave está activa.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Poder cambiar los sitios sin tocar nada más te permite, por ejemplo, sumar una página nueva sin dar de baja la clave ni crear otra.",
          },
        ],
      },
      {
        id: "revocar",
        titulo: "Revocar una clave",
        bloques: [
          {
            tipo: "p",
            texto:
              "Podés revocar desde el menú de tres puntos del listado o desde el detalle. En los dos casos aparece una confirmación con el nombre de la clave. Cuando confirmás:",
          },
          {
            tipo: "lista",
            items: [
              "La clave, pública y secreta, deja de funcionar en el momento. Las aplicaciones que la usan pierden el acceso.",
              "No se puede deshacer.",
              "La clave no se borra: queda en el listado como «Revocada», con quién la dio de baja y cuándo.",
              "Ya no se puede copiar su clave pública ni cambiar sus sitios, y no tiene más acciones.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Antes de revocar, asegurate de que la aplicación que usa esa clave ya tenga la nueva. Si no, deja de funcionar apenas confirmes.",
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
              "Una clave por aplicación — Con un nombre claro. Así, si una aplicación tiene un problema, das de baja solo esa clave y las demás siguen andando.",
              "Solo las capacidades necesarias — No se pueden cambiar después, y una clave con permisos de más puede hacer más de lo que debería.",
              "Cargá los «Dominios permitidos» — Sin ellos, la clave pública se acepta desde cualquier sitio. Cargalos para que solo funcione en tus páginas.",
              "La secreta, solo en tus sistemas — Nunca en una página web. Las capacidades «Clientes · lectura» y «Clientes · escritura» se usan solo con la secreta.",
              "Mirá «Último uso» — Una clave que figura como «Nunca usada», o que hace tiempo que no se usa y ya no hace falta, es buena candidata para revocar.",
              "¿Necesitás otras capacidades? — Creá una clave nueva con las correctas, cambiá la aplicación a esa clave y revocá la anterior.",
              "¿No ves la opción en el menú o no podés crear claves? — Es cuestión de los permisos de tu grupo, que se configuran en «Grupos y roles».",
            ],
          },
        ],
      },
    ],
  },
  en: {
    titulo: "API access keys",
    resumen:
      "How to create and manage the keys that let your website or other systems in your company connect with Atlas: what each one is for, what it can do and how to switch it off.",
    secciones: [
      {
        id: "que-es",
        titulo: "What an API access key is",
        bloques: [
          {
            tipo: "p",
            texto:
              "An API access key is like a key you hand to one of your company's applications so it can connect with Atlas. Without the key, the application can't get in.",
          },
          {
            tipo: "p",
            texto:
              "For example, you need one so the chat on your website can start conversations with your agents, so another system in your company can look up your customers' data, or so one of your pages can operate the agent's workstation (the PAD).",
          },
          {
            tipo: "p",
            texto:
              "Each key does only what you allow it to do. That is why it is best to create one key per application, with a name that says what it is for. You'll find them in Settings → “API access keys”.",
          },
          {
            tipo: "p",
            texto:
              "The customer data a key can look up or change is the data explained in “Customers”.",
          },
        ],
      },
      {
        id: "publica-y-secreta",
        titulo: "Public key and secret key",
        bloques: [
          {
            tipo: "p",
            texto:
              "Every time you create a key, Atlas gives you two: a public one and a secret one. They are created together and switched off together.",
          },
          {
            tipo: "lista",
            items: [
              "Public — The one that can go on your website. It isn't a secret, because anyone looking at the page can see it. You can copy it again from the list or the detail whenever you want. It starts with “atl_pub_”.",
              "Secret — The one that must stay stored only in your own systems, never on a web page. It starts with “atl_sec_”. You see it in full only once, when you create the key. Afterwards you only see how it ends (for example “atl_sec_…7f3c”).",
            ],
          },
          {
            tipo: "p",
            texto:
              "The prefixes “atl_pub_” and “atl_sec_” help you tell at a glance which key it is and what type, even if you come across it in a file or a record.",
          },
          {
            tipo: "nota",
            texto:
              "The secret key can't be recovered. If you lose it, switch the key off (“Revoke”) and create another one.",
          },
        ],
      },
      {
        id: "capacidades",
        titulo: "Capabilities",
        bloques: [
          {
            tipo: "p",
            texto:
              "Capabilities are what the key can do. You choose them when you create the key and they can't be changed afterwards. If you need different ones, create a new key and switch off the old one. Choose only what the application needs.",
          },
          {
            tipo: "p",
            texto:
              "Next to each capability you see which key it is used with: “Public and secret” or “Secret only”. Those marked “Secret only” work with your customers' data, so they are used only from your own systems, never from a web page.",
          },
          {
            tipo: "lista",
            items: [
              "Chat — Open conversations and send and receive messages. Useful for the chat on your website or your own service pages. Public and secret.",
              "Video call — Start inbound video calls from a page of yours. Public and secret.",
              "Web call — Start inbound voice calls over the internet (audio only, no phone line) from a page of yours. Public and secret.",
              "Customers · read — Look up your customers' data and contact history. Secret only.",
              "Customers · write — Create and update customer data from another system in your company. Secret only.",
              "Agent control — Operate the PAD of the logged-in agent from another web application, using their own session. Public and secret.",
            ],
          },
          {
            tipo: "p",
            texto:
              "A key can have several capabilities. For example, “Agent control” and “Customers · read” for a call button panel inside another system in your company.",
          },
        ],
      },
      {
        id: "permisos",
        titulo: "Who can see and manage the keys",
        bloques: [
          {
            tipo: "p",
            texto:
              "What each person can do with the keys depends on their groups. It is set up in “Groups and roles”, in the permissions of the “API access keys” section. There are four, and a person's permissions add up across all their groups.",
          },
          {
            tipo: "lista",
            items: [
              "View — Enter the screen, see the keys and their detail, and copy the public key. Without “View”, the “API access keys” option doesn't appear in the Settings menu. If someone gets there anyway by the address, the screen tells them they don't have permission.",
              "Create — Shows the “Create key” button and lets you create new keys.",
              "Edit — Lets you change the “Allowed domains” of an active key.",
              "Revoke — Lets you switch keys off, from the list or from the detail.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Permissions are chained: without “View” you can't do anything else. If you tick “Create”, “Edit” or “Revoke”, “View” is ticked automatically. If you untick “View”, all of them are unticked.",
          },
          {
            tipo: "p",
            texto:
              "If a person has only “View”, the list shows a notice: to create, edit or revoke they need their group's permissions in “Groups and roles”.",
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
              "It shows all your company's keys, including the ones switched off, so there is a record that they existed. If you click a row, the key's detail opens.",
          },
          {
            tipo: "sub",
            texto: "Columns",
          },
          {
            tipo: "lista",
            items: [
              "Name — The key's name. Below it you see which websites the public key is accepted from: “Any domain”, the site if there is just one, or “site and N more” if there are several (hover to see them all).",
              "Keys — The public key shortened, with a “Copy public key” button that copies the full one, and the secret key showing only how it ends. Keys that have been switched off have no copy button.",
              "Capabilities — One badge for each thing the key can do.",
              "Created by — Who created it and when.",
              "Last used — Date and time it was last used, or “Never used”.",
              "Status — “Active” or “Revoked”. For a revoked key you also see who switched it off and when.",
            ],
          },
          {
            tipo: "p",
            texto:
              "The “Keys” and “Last used” columns can't be filtered. The others can, from the table itself.",
          },
          {
            tipo: "sub",
            texto: "Actions",
          },
          {
            tipo: "lista",
            items: [
              "Create key — Button at the top right. It appears only if you have the “Create” permission.",
              "Revoke — In the row's three-dot menu. It asks you to confirm. It appears only if you have the “Revoke” permission and only on active keys.",
              "Open the detail — Click the row. Copying the public key from the list doesn't open the detail.",
            ],
          },
        ],
      },
      {
        id: "crear",
        titulo: "How to create a key",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "In Settings → “API access keys”, click “Create key”. “New API access key” opens.",
              "Type the key's name.",
              "Tick the capabilities the application needs.",
              "If you want the public key to work only on your pages, add the “Allowed domains”.",
              "Click “Create key”. The “Key created” screen appears with both keys.",
              "Copy the public and the secret key with their “Copy” buttons and store them somewhere safe.",
              "Click “Done, I saved it”. You go back to the list, where the new key appears first.",
            ],
          },
          {
            tipo: "sub",
            texto: "Fields",
          },
          {
            tipo: "lista",
            items: [
              "Name — Required. Free text; use something that says which application it is for, for example “Website chat widget”. It can't be changed afterwards.",
              "Capabilities — Required: tick at least one. The options are “Chat”, “Video call”, “Web call”, “Customers · read”, “Customers · write” and “Agent control”. They can't be changed afterwards.",
              "Allowed domains — Optional. The list of websites (for example www.bancosur.com.ar) the public key is accepted from. It stops anyone from using it on a page that isn't yours. It applies to the public key only. If you leave it empty, it is accepted from any site.",
            ],
          },
          {
            tipo: "p",
            texto:
              "The “Create key” button stays disabled until there is a name and at least one capability.",
          },
          {
            tipo: "sub",
            texto: "How to enter the websites",
          },
          {
            tipo: "lista",
            items: [
              "What to type — The site's name (www.bancosur.com.ar) or its full address (https://ayuda.bancosur.com.ar). If you don't type the “https://”, it is added for you. If you type anything after the site's name, it is dropped and only the site is kept.",
              "How to add it — Press Enter or the “Add” button. Each site becomes a badge.",
              "What is accepted — A site name with at least one dot, or localhost for testing. If it isn't valid, a notice appears under the field.",
              "Duplicates — If the site is already in the list, it isn't added twice.",
              "How to remove it — With the X on the badge.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "The full secret key is shown only on the “Key created” screen. If you leave it without copying the key, there is no way to see it again: you have to switch the key off and create another one.",
          },
        ],
      },
      {
        id: "detalle",
        titulo: "A key's detail",
        bloques: [
          {
            tipo: "p",
            texto:
              "It opens when you click a row in the list. At the top you see the name and the status (“Active” or “Revoked”).",
          },
          {
            tipo: "lista",
            items: [
              "Key details — The full public key (with a copy button if the key is active), how the secret key ends, who created it and when, the last use and, if it has been switched off, who revoked it and when.",
              "Capabilities — What the key can do, each with “Public and secret” or “Secret only”. They are view-only: they can't be edited.",
              "Allowed domains — The only thing you can change on a key. If you have the “Edit” permission and the key is active, you change the list and click “Save”; “Cancel” discards the changes. Both buttons are enabled only if you changed something. Without the permission, or if the key is revoked, you can see the list but not edit it.",
              "Revoke — At the bottom of the screen. It appears only if you have the “Revoke” permission and the key is active.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Being able to change the sites without touching anything else lets you, for example, add a new page without switching off the key or creating another one.",
          },
        ],
      },
      {
        id: "revocar",
        titulo: "Revoking a key",
        bloques: [
          {
            tipo: "p",
            texto:
              "You can revoke from the list's three-dot menu or from the detail. Either way, a confirmation appears with the key's name. When you confirm:",
          },
          {
            tipo: "lista",
            items: [
              "The key, public and secret, stops working immediately. The applications using it lose access.",
              "It can't be undone.",
              "The key isn't deleted: it stays in the list as “Revoked”, with who switched it off and when.",
              "Its public key can no longer be copied nor its sites changed, and it has no more actions.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Before revoking, make sure the application using that key already has the new one. Otherwise it stops working as soon as you confirm.",
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
              "One key per application — With a clear name. That way, if an application has a problem, you switch off only that key and the others keep working.",
              "Only the capabilities needed — They can't be changed afterwards, and a key with extra permissions can do more than it should.",
              "Fill in the “Allowed domains” — Without them, the public key is accepted from any site. Add them so it works only on your pages.",
              "The secret key, only in your own systems — Never on a web page. The “Customers · read” and “Customers · write” capabilities are used only with the secret key.",
              "Check “Last used” — A key that shows “Never used”, or that hasn't been used for a long time and is no longer needed, is a good candidate to revoke.",
              "Need other capabilities? — Create a new key with the right ones, switch the application over to it and revoke the old one.",
              "Can't see the option in the menu or can't create keys? — It's a matter of your group's permissions, which are set up in “Groups and roles”.",
            ],
          },
        ],
      },
    ],
  },
};
