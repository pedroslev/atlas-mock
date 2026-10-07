import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Pantalla "Claves de acceso API" (/configuracion/claves-api, en
// Configuración). El título reusa `common.nav.clavesApi`. Las capacidades van como
// `capacidad.<id>.titulo` / `.descripcion`, con los ids de mock-claves-api.ts.
export const clavesApi: NamespaceDict = {
  es: {
    "descripcion":
      "Claves con las que aplicaciones propias se conectan a Atlas: páginas y widgets de chat o videollamada, CRMs que usan Customer360, integraciones con el PAD. Cada clave hace solo lo que sus capacidades permiten.",
    "crear": "Crear clave",
    "sinPermiso":
      "Podés ver las claves del tenant, pero crearlas, editarlas o revocarlas requiere los permisos de tu grupo en Grupos y roles.",
    "sinAcceso":
      "No tenés permiso para ver las claves de acceso API. Lo da el permiso «Ver» en Grupos y roles.",
    "nuncaUsada": "Nunca usada",
    "revocar": "Revocar",
    "revocarConfirmacion":
      "La clave «{nombre}» (la pública y la secreta) deja de funcionar en el momento y las aplicaciones que la usen pierden el acceso. No se puede deshacer.",
    "revocadaPor": "por {nombre}",

    "col.nombre": "Nombre",
    "col.clave": "Claves",
    "col.capacidades": "Capacidades",
    "col.creadaPor": "Creada por",
    "col.ultimoUso": "Último uso",

    "clave.publica": "Pública",
    "clave.secreta": "Secreta",
    "clave.copiarPublica": "Copiar clave pública",

    "uso.ambas": "Pública y secreta",
    "uso.secreta": "Solo secreta",

    "dominios.titulo": "Dominios permitidos",
    "dominios.placeholder": "www.bancosur.com.ar",
    "dominios.invalido": "No es un dominio válido. Ej.: www.bancosur.com.ar o https://ayuda.bancosur.com.ar",
    "dominios.quitar": "Quitar {dominio}",
    "dominios.ayudaVacio": "Sin dominios, la clave pública se acepta desde cualquier sitio. Cargalos para que solo funcione en tus páginas. Solo aplica a la pública.",
    "dominios.ayuda": "La clave pública solo se acepta desde estos dominios. Solo aplica a la pública.",
    "dominios.cualquiera": "Cualquier dominio",
    "dominios.varios": "{dominio} y {n} más",

    "nueva.datos": "Datos de la clave",
    "detalle.noExiste": "Esta clave no existe.",
    "detalle.datos": "Datos de la clave",
    "detalle.capacidadesFijas": "Se eligen al crear la clave y no se editan: para cambiarlas, creá otra clave y revocá esta.",
    "detalle.revocarDescripcion": "La clave (pública y secreta) deja de funcionar en el momento. No se puede deshacer.",
    "detalle.revocarTitulo": "¿Revocar la clave?",

    "estado.activa": "Activa",
    "estado.revocada": "Revocada",

    "nueva.titulo": "Nueva clave de acceso API",
    "nueva.descripcion":
      "Ponele un nombre que diga para qué aplicación es y elegí qué va a poder hacer.",
    "nueva.placeholderNombre": "Ej. Widget de chat del sitio web",
    "nueva.capacidades": "Capacidades",
    "nueva.capacidadesAyuda":
      "Elegí solo lo que la aplicación necesita. Las marcadas «Solo secreta» se usan desde un servidor, nunca desde el navegador. No se pueden cambiar después: para eso se crea otra clave y se revoca esta.",

    "creada.titulo": "Clave creada",
    "creada.descripcion": "Cada clave es un par: la pública, para lo que corre en el navegador, y la secreta, para tu servidor.",
    "creada.copiar": "Copiar",
    "creada.copiada": "Copiada",
    "creada.publicaAyuda":
      "Va en el código de tu página o app: widget de chat, videollamada, botones del agente. No es un secreto y la podés volver a copiar desde la lista cuando quieras.",
    "creada.secretaAyuda":
      "Va solo en tu servidor (Customer360 y todo lo que maneja datos de clientes). Nunca la pongas en el navegador. Es la única vez que la vas a ver completa: si la perdés, revocá la clave y creá otra.",
    "creada.listo": "Listo, ya la guardé",

    "capacidad.chat.titulo": "Chat",
    "capacidad.chat.descripcion":
      "Abrir conversaciones y enviar y recibir mensajes. Para widgets y páginas de atención propias.",
    "capacidad.videollamada.titulo": "Videollamada",
    "capacidad.videollamada.descripcion":
      "Iniciar videollamadas entrantes desde una página propia.",
    "capacidad.customer360.lectura.titulo": "Customer360 · lectura",
    "capacidad.customer360.lectura.descripcion":
      "Consultar los datos y el historial de contacto de los clientes.",
    "capacidad.customer360.escritura.titulo": "Customer360 · escritura",
    "capacidad.customer360.escritura.descripcion":
      "Crear y actualizar datos de clientes desde un CRM.",
    "capacidad.hermes.control-agente.titulo": "Control del agente",
    "capacidad.hermes.control-agente.descripcion":
      "Operar el PAD del agente logueado desde otra aplicación web, con su propia sesión.",
  },
  en: {
    "descripcion":
      "Keys your own applications use to connect to Atlas: chat or video call pages and widgets, CRMs using Customer360, PAD integrations. Each key can only do what its capabilities allow.",
    "crear": "Create key",
    "sinPermiso":
      "You can see the tenant's keys, but creating, editing or revoking them requires your group's permissions in Groups and roles.",
    "sinAcceso":
      "You don't have permission to see the API access keys. It's granted by the “View” permission in Groups and roles.",
    "nuncaUsada": "Never used",
    "revocar": "Revoke",
    "revocarConfirmacion":
      "The key “{nombre}” (public and secret) stops working immediately and the applications using it lose access. This cannot be undone.",
    "revocadaPor": "by {nombre}",

    "col.nombre": "Name",
    "col.clave": "Keys",
    "col.capacidades": "Capabilities",
    "col.creadaPor": "Created by",
    "col.ultimoUso": "Last used",

    "clave.publica": "Public",
    "clave.secreta": "Secret",
    "clave.copiarPublica": "Copy public key",

    "uso.ambas": "Public and secret",
    "uso.secreta": "Secret only",

    "dominios.titulo": "Allowed domains",
    "dominios.placeholder": "www.bancosur.com.ar",
    "dominios.invalido": "Not a valid domain. E.g.: www.bancosur.com.ar or https://ayuda.bancosur.com.ar",
    "dominios.quitar": "Remove {dominio}",
    "dominios.ayudaVacio": "With no domains, the public key is accepted from any site. Add them so it only works on your pages. Applies to the public key only.",
    "dominios.ayuda": "The public key is only accepted from these domains. Applies to the public key only.",
    "dominios.cualquiera": "Any domain",
    "dominios.varios": "{dominio} and {n} more",

    "nueva.datos": "Key details",
    "detalle.noExiste": "This key does not exist.",
    "detalle.datos": "Key details",
    "detalle.capacidadesFijas": "Chosen when the key is created and cannot be edited: to change them, create another key and revoke this one.",
    "detalle.revocarDescripcion": "The key (public and secret) stops working immediately. This cannot be undone.",
    "detalle.revocarTitulo": "Revoke the key?",

    "estado.activa": "Active",
    "estado.revocada": "Revoked",

    "nueva.titulo": "New API access key",
    "nueva.descripcion":
      "Give it a name that says which application it is for and choose what it will be able to do.",
    "nueva.placeholderNombre": "E.g. Website chat widget",
    "nueva.capacidades": "Capabilities",
    "nueva.capacidadesAyuda":
      "Choose only what the application needs. Those marked “Secret only” are used from a server, never from the browser. They can't be changed later: create another key and revoke this one instead.",

    "creada.titulo": "Key created",
    "creada.descripcion": "Each key is a pair: the public one, for code running in the browser, and the secret one, for your server.",
    "creada.copiar": "Copy",
    "creada.copiada": "Copied",
    "creada.publicaAyuda":
      "Goes in your page or app code: chat widget, video call, agent buttons. It is not a secret and you can copy it again from the list at any time.",
    "creada.secretaAyuda":
      "Goes only on your server (Customer360 and anything handling customer data). Never put it in the browser. This is the only time you will see it in full: if you lose it, revoke the key and create another one.",
    "creada.listo": "Done, I saved it",

    "capacidad.chat.titulo": "Chat",
    "capacidad.chat.descripcion":
      "Open conversations and send and receive messages. For your own widgets and service pages.",
    "capacidad.videollamada.titulo": "Video call",
    "capacidad.videollamada.descripcion":
      "Start inbound video calls from your own page.",
    "capacidad.customer360.lectura.titulo": "Customer360 · read",
    "capacidad.customer360.lectura.descripcion":
      "Look up customer data and contact history.",
    "capacidad.customer360.escritura.titulo": "Customer360 · write",
    "capacidad.customer360.escritura.descripcion":
      "Create and update customer data from a CRM.",
    "capacidad.hermes.control-agente.titulo": "Agent control",
    "capacidad.hermes.control-agente.descripcion":
      "Operate the logged-in agent's PAD from another web application, using their own session.",
  },
  pt: {
    "descripcion":
      "Chaves com que aplicações próprias se conectam ao Atlas: páginas e widgets de chat ou videochamada, CRMs que usam o Customer360, integrações com o PAD. Cada chave faz apenas o que suas capacidades permitem.",
    "crear": "Criar chave",
    "sinPermiso":
      "Você pode ver as chaves do tenant, mas criá-las, editá-las ou revogá-las exige as permissões do seu grupo em Grupos e funções.",
    "sinAcceso":
      "Você não tem permissão para ver as chaves de acesso API. Ela é dada pela permissão «Ver» em Grupos e funções.",
    "nuncaUsada": "Nunca usada",
    "revocar": "Revogar",
    "revocarConfirmacion":
      "A chave «{nombre}» (a pública e a secreta) deixa de funcionar na hora e as aplicações que a usam perdem o acesso. Não é possível desfazer.",
    "revocadaPor": "por {nombre}",

    "col.nombre": "Nome",
    "col.clave": "Chaves",
    "col.capacidades": "Capacidades",
    "col.creadaPor": "Criada por",
    "col.ultimoUso": "Último uso",

    "clave.publica": "Pública",
    "clave.secreta": "Secreta",
    "clave.copiarPublica": "Copiar chave pública",

    "uso.ambas": "Pública e secreta",
    "uso.secreta": "Só secreta",

    "dominios.titulo": "Domínios permitidos",
    "dominios.placeholder": "www.bancosur.com.ar",
    "dominios.invalido": "Não é um domínio válido. Ex.: www.bancosur.com.ar ou https://ayuda.bancosur.com.ar",
    "dominios.quitar": "Remover {dominio}",
    "dominios.ayudaVacio": "Sem domínios, a chave pública é aceita de qualquer site. Cadastre-os para que funcione só nas suas páginas. Aplica-se só à pública.",
    "dominios.ayuda": "A chave pública só é aceita a partir destes domínios. Aplica-se só à pública.",
    "dominios.cualquiera": "Qualquer domínio",
    "dominios.varios": "{dominio} e mais {n}",

    "nueva.datos": "Dados da chave",
    "detalle.noExiste": "Esta chave não existe.",
    "detalle.datos": "Dados da chave",
    "detalle.capacidadesFijas": "São escolhidas ao criar a chave e não podem ser editadas: para mudá-las, crie outra chave e revogue esta.",
    "detalle.revocarDescripcion": "A chave (pública e secreta) deixa de funcionar na hora. Não é possível desfazer.",
    "detalle.revocarTitulo": "Revogar a chave?",

    "estado.activa": "Ativa",
    "estado.revocada": "Revogada",

    "nueva.titulo": "Nova chave de acesso API",
    "nueva.descripcion":
      "Dê um nome que diga para qual aplicação ela é e escolha o que ela vai poder fazer.",
    "nueva.placeholderNombre": "Ex. Widget de chat do site",
    "nueva.capacidades": "Capacidades",
    "nueva.capacidadesAyuda":
      "Escolha só o que a aplicação precisa. As marcadas «Só secreta» são usadas a partir de um servidor, nunca do navegador. Não podem ser alteradas depois: para isso, crie outra chave e revogue esta.",

    "creada.titulo": "Chave criada",
    "creada.descripcion": "Cada chave é um par: a pública, para o que roda no navegador, e a secreta, para o seu servidor.",
    "creada.copiar": "Copiar",
    "creada.copiada": "Copiada",
    "creada.publicaAyuda":
      "Vai no código da sua página ou app: widget de chat, videochamada, botões do agente. Não é um segredo e você pode copiá-la de novo na lista quando quiser.",
    "creada.secretaAyuda":
      "Vai só no seu servidor (Customer360 e tudo o que lida com dados de clientes). Nunca a coloque no navegador. É a única vez que você a verá completa: se perdê-la, revogue a chave e crie outra.",
    "creada.listo": "Pronto, já guardei",

    "capacidad.chat.titulo": "Chat",
    "capacidad.chat.descripcion":
      "Abrir conversas e enviar e receber mensagens. Para widgets e páginas de atendimento próprias.",
    "capacidad.videollamada.titulo": "Videochamada",
    "capacidad.videollamada.descripcion":
      "Iniciar videochamadas de entrada a partir de uma página própria.",
    "capacidad.customer360.lectura.titulo": "Customer360 · leitura",
    "capacidad.customer360.lectura.descripcion":
      "Consultar os dados e o histórico de contato dos clientes.",
    "capacidad.customer360.escritura.titulo": "Customer360 · escrita",
    "capacidad.customer360.escritura.descripcion":
      "Criar e atualizar dados de clientes a partir de um CRM.",
    "capacidad.hermes.control-agente.titulo": "Controle do agente",
    "capacidad.hermes.control-agente.descripcion":
      "Operar o PAD do agente logado a partir de outra aplicação web, com a própria sessão dele.",
  },
  ca: {
    "descripcion":
      "Claus amb què les aplicacions pròpies es connecten a Atlas: pàgines i widgets de xat o videotrucada, CRMs que fan servir Customer360, integracions amb el PAD. Cada clau només fa el que permeten les seves capacitats.",
    "crear": "Crear clau",
    "sinPermiso":
      "Pots veure les claus del tenant, però crear-les, editar-les o revocar-les requereix els permisos del teu grup a Grups i rols.",
    "sinAcceso":
      "No tens permís per veure les claus d'accés API. El dona el permís «Veure» a Grups i rols.",
    "nuncaUsada": "Mai utilitzada",
    "revocar": "Revocar",
    "revocarConfirmacion":
      "La clau «{nombre}» (la pública i la secreta) deixa de funcionar a l'instant i les aplicacions que la fan servir perden l'accés. No es pot desfer.",
    "revocadaPor": "per {nombre}",

    "col.nombre": "Nom",
    "col.clave": "Claus",
    "col.capacidades": "Capacitats",
    "col.creadaPor": "Creada per",
    "col.ultimoUso": "Últim ús",

    "clave.publica": "Pública",
    "clave.secreta": "Secreta",
    "clave.copiarPublica": "Copiar clau pública",

    "uso.ambas": "Pública i secreta",
    "uso.secreta": "Només secreta",

    "dominios.titulo": "Dominis permesos",
    "dominios.placeholder": "www.bancosur.com.ar",
    "dominios.invalido": "No és un domini vàlid. Ex.: www.bancosur.com.ar o https://ayuda.bancosur.com.ar",
    "dominios.quitar": "Treure {dominio}",
    "dominios.ayudaVacio": "Sense dominis, la clau pública s'accepta des de qualsevol lloc. Afegeix-los perquè només funcioni a les teves pàgines. Només s'aplica a la pública.",
    "dominios.ayuda": "La clau pública només s'accepta des d'aquests dominis. Només s'aplica a la pública.",
    "dominios.cualquiera": "Qualsevol domini",
    "dominios.varios": "{dominio} i {n} més",

    "nueva.datos": "Dades de la clau",
    "detalle.noExiste": "Aquesta clau no existeix.",
    "detalle.datos": "Dades de la clau",
    "detalle.capacidadesFijas": "Es trien en crear la clau i no es poden editar: per canviar-les, crea una altra clau i revoca aquesta.",
    "detalle.revocarDescripcion": "La clau (pública i secreta) deixa de funcionar a l'instant. No es pot desfer.",
    "detalle.revocarTitulo": "Revocar la clau?",

    "estado.activa": "Activa",
    "estado.revocada": "Revocada",

    "nueva.titulo": "Nova clau d'accés API",
    "nueva.descripcion":
      "Posa-li un nom que digui per a quina aplicació és i tria què podrà fer.",
    "nueva.placeholderNombre": "Ex. Widget de xat del lloc web",
    "nueva.capacidades": "Capacitats",
    "nueva.capacidadesAyuda":
      "Tria només el que l'aplicació necessita. Les marcades «Només secreta» es fan servir des d'un servidor, mai des del navegador. No es poden canviar després: per fer-ho es crea una altra clau i es revoca aquesta.",

    "creada.titulo": "Clau creada",
    "creada.descripcion": "Cada clau és un parell: la pública, per al que s'executa al navegador, i la secreta, per al teu servidor.",
    "creada.copiar": "Copiar",
    "creada.copiada": "Copiada",
    "creada.publicaAyuda":
      "Va al codi de la teva pàgina o app: widget de xat, videotrucada, botons de l'agent. No és un secret i la pots tornar a copiar des de la llista quan vulguis.",
    "creada.secretaAyuda":
      "Va només al teu servidor (Customer360 i tot el que gestiona dades de clients). No la posis mai al navegador. És l'única vegada que la veuràs completa: si la perds, revoca la clau i crea'n una altra.",
    "creada.listo": "Fet, ja l'he guardada",

    "capacidad.chat.titulo": "Xat",
    "capacidad.chat.descripcion":
      "Obrir converses i enviar i rebre missatges. Per a widgets i pàgines d'atenció pròpies.",
    "capacidad.videollamada.titulo": "Videotrucada",
    "capacidad.videollamada.descripcion":
      "Iniciar videotrucades entrants des d'una pàgina pròpia.",
    "capacidad.customer360.lectura.titulo": "Customer360 · lectura",
    "capacidad.customer360.lectura.descripcion":
      "Consultar les dades i l'historial de contacte dels clients.",
    "capacidad.customer360.escritura.titulo": "Customer360 · escriptura",
    "capacidad.customer360.escritura.descripcion":
      "Crear i actualitzar dades de clients des d'un CRM.",
    "capacidad.hermes.control-agente.titulo": "Control de l'agent",
    "capacidad.hermes.control-agente.descripcion":
      "Operar el PAD de l'agent connectat des d'una altra aplicació web, amb la seva pròpia sessió.",
  },
};
