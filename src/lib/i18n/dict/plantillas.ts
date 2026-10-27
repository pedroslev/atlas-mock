import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Plantillas de mensajes (ATLAS-1191): catálogo del tenant + grupos que las
// agrupan, mismo modelo que Marcas. El rótulo de sección sale de
// `common.nav.plantillas`; acá va lo propio de estas pantallas y del
// selector de plantillas en Hermes.
export const plantillas: NamespaceDict = {
  es: {
    descripcion:
      "Dejá precargados los mensajes que tus asesores usan todo el tiempo en chat, email y SMS, y agrupalos para asignarlos a tus campañas. Una plantilla puede estar en varios grupos.",

    "tabs.grupos": "Grupos",
    "tabs.catalogo": "Catálogo",
    "tabs.variables": "Variables",
    "variables.descripcion": "Los datos que se completan solos en las plantillas: del cliente, de la campaña y del asesor. Si el dato falta, se usa el valor de respaldo; sin respaldo, Atlas avisa al asesor antes de enviar. Vale para todas las plantillas.",
    "variables.col.variable": "Variable",
    "variables.col.origen": "Origen",
    "variables.col.ejemplo": "Ejemplo",
    "variables.col.respaldo": "Si falta el dato",
    "variables.placeholderRespaldo": "Avisar al asesor",

    nuevoGrupo: "Nuevo grupo",
    nuevaPlantilla: "Nueva plantilla",
    crearGrupo: "Crear grupo",
    crearPlantilla: "Crear plantilla",

    "col.grupo": "Grupo",
    "col.plantilla": "Plantilla",
    "col.canales": "Canales",
    "col.adjuntos": "Adjuntos",
    "col.cantidad": "Plantillas",

    eliminarGrupo:
      "Se elimina el grupo. Las plantillas del catálogo no se borran. Las campañas que lo usaban quedan sin grupo de plantillas.",
    eliminarPlantilla:
      "Se quita del catálogo y de todos los grupos que la usan.",

    "dialogoGrupo.titulo": "Nuevo grupo de plantillas",
    "dialogoGrupo.descripcion":
      "Después le asignás plantillas del catálogo desde su edición.",

    "detalle.subtitulo": "Grupo de plantillas",
    "detalle.datos": "Datos del grupo",

    "miembros.titulo": "Plantillas del grupo",
    "miembros.descripcion":
      "Se agregan desde el catálogo. Una misma plantilla puede estar en varios grupos; quitarla de este grupo no la elimina del catálogo.",
    "miembros.agregar": "Agregar del catálogo",
    "miembros.buscar": "Buscar plantilla…",
    "miembros.sinDisponibles":
      "No quedan plantillas sin asignar. Creá nuevas desde el catálogo.",
    "miembros.vacio": "Este grupo todavía no tiene plantillas.",
    "miembros.quitar": "Quitar del grupo",
    "miembros.quitarAria": "Quitar {nombre} del grupo",

    // Editor de plantilla
    "editor.nueva": "Nueva plantilla",
    "editor.subtitulo":
      "Se escribe una vez; Atlas la adapta a lo que soporta cada canal.",
    "editor.datos": "Datos",
    "editor.continuar": "Continuar al mensaje",
    "editor.placeholderNombre": "Ej: Saludo inicial",
    "editor.placeholderDescripcion":
      "Cuándo conviene usarla. El asesor la ve al elegirla.",
    "editor.activa": "Activa",
    "editor.activaAyuda":
      "Inactiva no se ofrece al asesor, pero no se pierde.",
    "editor.canales": "Canales en los que se ofrece",
    "editor.canalesAyuda":
      "Por defecto todos los escritos. Restringila si solo tiene sentido en uno.",
    "editor.contenido": "Mensaje",
    "editor.asunto": "Asunto (solo email)",
    "editor.placeholderAsunto": "Opcional. Puede llevar variables.",
    "editor.placeholderContenido":
      "Escribí el mensaje. Usá negrita, cursiva, listas y variables desde la barra.",
    "editor.negrita": "Negrita",
    "editor.cursiva": "Cursiva",
    "editor.lista": "Lista",
    "editor.insertarVariable": "Insertar variable",
    "editor.buscarVariable": "Buscar variable…",
    "editor.sinVariables": "Sin resultados.",
    "editor.insertarArchivo": "Insertar archivo",
    "editor.archivosAyuda": "En chat, el archivo se envía como mensaje aparte en el punto donde lo insertaste; en email va adjunto; SMS no lo admite.",
    "editor.variablesUsadas": "Variables usadas: {lista}",
    "editor.variablesConfig": "Si falta un dato, se usa lo configurado en la solapa Variables.",
    "editor.sinVariablesUsadas":
      "Este mensaje no usa variables.",
    "editor.quitarArchivo": "Quitar {nombre}",
    "editor.vistaPrevia": "Vista previa",
    "editor.vistaPreviaAyuda":
      "Cómo lo recibe el cliente en cada canal, con datos de ejemplo.",
    "editor.vistaPreviaVacia": "Escribí el mensaje para ver la vista previa.",
    "editor.sinCanales": "Elegí al menos un canal.",
    "editor.asuntoPreview": "Asunto",
    "editor.adjuntosPreview": "{cantidad} adjunto(s)",
    "editor.smsSinAdjuntos": "SMS no admite adjuntos: se envía solo el texto.",
    "editor.guardado": "Los cambios se guardan al confirmar.",

    "origen.cliente": "Cliente",
    "origen.campania": "Campaña",
    "origen.asesor": "Asesor",

    "variable.nombre": "Nombre del cliente",
    "variable.apellido": "Apellido del cliente",
    "variable.documento": "Documento",
    "variable.telefono": "Teléfono",
    "variable.email": "Email",
    "variable.numeroCliente": "Número de cliente",
    "variable.campania": "Nombre de la campaña",
    "variable.asesor": "Nombre del asesor",

    "canal.chat": "Chat",
    "canal.email": "Email",
    "canal.sms": "SMS",

    // Campaña: grupo y plantilla por defecto por canal
    "campania.grupo": "Grupo de plantillas",
    "campania.buscarGrupo": "Buscar grupo de plantillas...",
    "campania.vacioGrupo": "No se encontró ningún grupo de plantillas.",
    "campania.ver": "Ver plantillas del grupo",
    "campania.dialogo": "Plantillas — {nombre}",
    "campania.soloLectura":
      "Vista de solo lectura. Para editar el grupo, hacelo desde Plantillas de mensajes.",
    "campania.defaultTitulo": "Plantilla por defecto",
    "campania.defaultAyuda":
      "Hermes la deja precargada en el cuadro de mensaje al abrir la conversación. El asesor la revisa y la envía; no se envía sola.",
    "campania.defaultChat": "Al abrir un chat",
    "campania.defaultEmail": "Al responder un email",
    "campania.sinDefault": "Ninguna",
    "campania.buscarDefault": "Buscar plantilla...",
    "campania.vacioDefault": "No hay plantillas de ese canal en el grupo.",
    "campania.elegirGrupoPrimero": "Elegí primero un grupo de plantillas.",

    // Hermes: selector en el redactor
    "selector.boton": "Plantillas",
    "selector.atajo": "Escribí / para buscar",
    "selector.buscar": "Buscar por nombre o contenido…",
    "selector.sinResultados": "Ninguna plantilla coincide.",
    "selector.favoritas": "Favoritas",
    "selector.masUsadas": "Más usadas",
    "selector.marcarFavorita": "Marcar como favorita",
    "selector.quitarFavorita": "Quitar de favoritas",
    "selector.conAdjuntos": "{cantidad} adjunto(s)",
    "selector.precargada": "Plantilla por defecto de la campaña. Revisala antes de enviar.",
    "selector.sinDato":
      "Faltan datos del cliente para: {variables}. Completalo a mano antes de enviar.",
    "selector.reemplazarTitulo": "Ya hay texto escrito",
    "selector.reemplazarDescripcion":
      "¿Querés agregar la plantilla debajo de lo que escribiste o reemplazarlo?",
    "selector.insertar": "Insertar debajo",
    "selector.reemplazar": "Reemplazar",
    "selector.adjuntoAgregado": "Archivos de la plantilla: en chat van como mensaje aparte, donde está el 📎 en el texto.",
  },
  en: {
    descripcion:
      "Preload the messages your agents use all the time on chat, email and SMS, and group them to assign them to your campaigns. A template can belong to several groups.",

    "tabs.grupos": "Groups",
    "tabs.catalogo": "Catalog",
    "tabs.variables": "Variables",
    "variables.descripcion": "The data that fills itself in on templates: from the customer, the campaign and the agent. If the data is missing, the fallback value is used; without one, Atlas warns the agent before sending. Applies to every template.",
    "variables.col.variable": "Variable",
    "variables.col.origen": "Source",
    "variables.col.ejemplo": "Example",
    "variables.col.respaldo": "If the data is missing",
    "variables.placeholderRespaldo": "Warn the agent",

    nuevoGrupo: "New group",
    nuevaPlantilla: "New template",
    crearGrupo: "Create group",
    crearPlantilla: "Create template",

    "col.grupo": "Group",
    "col.plantilla": "Template",
    "col.canales": "Channels",
    "col.adjuntos": "Attachments",
    "col.cantidad": "Templates",

    eliminarGrupo:
      "The group is deleted. Templates in the catalog are not removed. Campaigns that used it are left without a template group.",
    eliminarPlantilla:
      "It is removed from the catalog and from every group that uses it.",

    "dialogoGrupo.titulo": "New template group",
    "dialogoGrupo.descripcion":
      "You can assign templates from the catalog later, from the group's edit screen.",

    "detalle.subtitulo": "Template group",
    "detalle.datos": "Group details",

    "miembros.titulo": "Templates in this group",
    "miembros.descripcion":
      "They are added from the catalog. The same template can belong to several groups; removing it from this group does not delete it from the catalog.",
    "miembros.agregar": "Add from catalog",
    "miembros.buscar": "Search template…",
    "miembros.sinDisponibles":
      "There are no unassigned templates left. Create new ones from the catalog.",
    "miembros.vacio": "This group has no templates yet.",
    "miembros.quitar": "Remove from group",
    "miembros.quitarAria": "Remove {nombre} from the group",

    "editor.nueva": "New template",
    "editor.subtitulo":
      "Written once; Atlas adapts it to what each channel supports.",
    "editor.datos": "Details",
    "editor.continuar": "Continue to message",
    "editor.placeholderNombre": "E.g.: Opening greeting",
    "editor.placeholderDescripcion":
      "When to use it. Agents see it when picking the template.",
    "editor.activa": "Active",
    "editor.activaAyuda": "Inactive templates are hidden from agents but kept.",
    "editor.canales": "Offered on channels",
    "editor.canalesAyuda":
      "All written channels by default. Restrict it if it only makes sense on one.",
    "editor.contenido": "Message",
    "editor.asunto": "Subject (email only)",
    "editor.placeholderAsunto": "Optional. May contain variables.",
    "editor.placeholderContenido":
      "Write the message. Use bold, italics, lists and variables from the toolbar.",
    "editor.negrita": "Bold",
    "editor.cursiva": "Italic",
    "editor.lista": "List",
    "editor.insertarVariable": "Insert variable",
    "editor.buscarVariable": "Search variable…",
    "editor.sinVariables": "No results.",
    "editor.insertarArchivo": "Insert file",
    "editor.archivosAyuda": "In chat the file is sent as a separate message right where you inserted it; in email it goes as an attachment; SMS does not support it.",
    "editor.variablesUsadas": "Variables used: {lista}",
    "editor.variablesConfig": "If a value is missing, the Variables tab settings apply.",
    "editor.sinVariablesUsadas":
      "This message uses no variables.",
    "editor.quitarArchivo": "Remove {nombre}",
    "editor.vistaPrevia": "Preview",
    "editor.vistaPreviaAyuda":
      "How the customer receives it on each channel, with sample data.",
    "editor.vistaPreviaVacia": "Write the message to see the preview.",
    "editor.sinCanales": "Pick at least one channel.",
    "editor.asuntoPreview": "Subject",
    "editor.adjuntosPreview": "{cantidad} attachment(s)",
    "editor.smsSinAdjuntos": "SMS does not support attachments: only the text is sent.",
    "editor.guardado": "Changes are saved on confirm.",

    "origen.cliente": "Customer",
    "origen.campania": "Campaign",
    "origen.asesor": "Agent",

    "variable.nombre": "Customer first name",
    "variable.apellido": "Customer last name",
    "variable.documento": "ID number",
    "variable.telefono": "Phone",
    "variable.email": "Email",
    "variable.numeroCliente": "Customer number",
    "variable.campania": "Campaign name",
    "variable.asesor": "Agent name",

    "canal.chat": "Chat",
    "canal.email": "Email",
    "canal.sms": "SMS",

    "campania.grupo": "Template group",
    "campania.buscarGrupo": "Search template group...",
    "campania.vacioGrupo": "No template groups found.",
    "campania.ver": "View the group's templates",
    "campania.dialogo": "Templates — {nombre}",
    "campania.soloLectura":
      "Read-only view. To edit the group, go to Message templates.",
    "campania.defaultTitulo": "Default template",
    "campania.defaultAyuda":
      "Hermes preloads it in the message box when the conversation opens. The agent reviews and sends it; it is never sent on its own.",
    "campania.defaultChat": "When a chat opens",
    "campania.defaultEmail": "When replying to an email",
    "campania.sinDefault": "None",
    "campania.buscarDefault": "Search template...",
    "campania.vacioDefault": "The group has no templates for that channel.",
    "campania.elegirGrupoPrimero": "Pick a template group first.",

    "selector.boton": "Templates",
    "selector.atajo": "Type / to search",
    "selector.buscar": "Search by name or content…",
    "selector.sinResultados": "No template matches.",
    "selector.favoritas": "Favorites",
    "selector.masUsadas": "Most used",
    "selector.marcarFavorita": "Mark as favorite",
    "selector.quitarFavorita": "Remove from favorites",
    "selector.conAdjuntos": "{cantidad} attachment(s)",
    "selector.precargada": "Campaign default template. Review it before sending.",
    "selector.sinDato":
      "Customer data missing for: {variables}. Fill it in by hand before sending.",
    "selector.reemplazarTitulo": "There is text already",
    "selector.reemplazarDescripcion":
      "Insert the template below what you wrote, or replace it?",
    "selector.insertar": "Insert below",
    "selector.reemplazar": "Replace",
    "selector.adjuntoAgregado": "Template files: in chat they go as a separate message, where the 📎 is in the text.",
  },
  pt: {
    descripcion:
      "Deixe pré-carregadas as mensagens que seus atendentes usam o tempo todo em chat, e-mail e SMS, e agrupe-as para atribuí-las às suas campanhas. Um modelo pode estar em vários grupos.",

    "tabs.grupos": "Grupos",
    "tabs.catalogo": "Catálogo",
    "tabs.variables": "Variáveis",
    "variables.descripcion": "Os dados que se preenchem sozinhos nos modelos: do cliente, da campanha e do agente. Se o dado faltar, usa-se o valor de reserva; sem reserva, o Atlas avisa o agente antes de enviar. Vale para todos os modelos.",
    "variables.col.variable": "Variável",
    "variables.col.origen": "Origem",
    "variables.col.ejemplo": "Exemplo",
    "variables.col.respaldo": "Se o dado faltar",
    "variables.placeholderRespaldo": "Avisar o agente",

    nuevoGrupo: "Novo grupo",
    nuevaPlantilla: "Novo modelo",
    crearGrupo: "Criar grupo",
    crearPlantilla: "Criar modelo",

    "col.grupo": "Grupo",
    "col.plantilla": "Modelo",
    "col.canales": "Canais",
    "col.adjuntos": "Anexos",
    "col.cantidad": "Modelos",

    eliminarGrupo:
      "O grupo é excluído. Os modelos do catálogo não são apagados. As campanhas que o usavam ficam sem grupo de modelos.",
    eliminarPlantilla:
      "É removido do catálogo e de todos os grupos que o utilizam.",

    "dialogoGrupo.titulo": "Novo grupo de modelos",
    "dialogoGrupo.descripcion":
      "Depois você atribui modelos do catálogo na edição do grupo.",

    "detalle.subtitulo": "Grupo de modelos",
    "detalle.datos": "Dados do grupo",

    "miembros.titulo": "Modelos do grupo",
    "miembros.descripcion":
      "São adicionados a partir do catálogo. Um mesmo modelo pode estar em vários grupos; removê-lo deste grupo não o exclui do catálogo.",
    "miembros.agregar": "Adicionar do catálogo",
    "miembros.buscar": "Pesquisar modelo…",
    "miembros.sinDisponibles":
      "Não restam modelos sem atribuir. Crie novos no catálogo.",
    "miembros.vacio": "Este grupo ainda não tem modelos.",
    "miembros.quitar": "Remover do grupo",
    "miembros.quitarAria": "Remover {nombre} do grupo",

    "editor.nueva": "Novo modelo",
    "editor.subtitulo":
      "Escrito uma vez; o Atlas o adapta ao que cada canal suporta.",
    "editor.datos": "Dados",
    "editor.continuar": "Continuar para a mensagem",
    "editor.placeholderNombre": "Ex.: Saudação inicial",
    "editor.placeholderDescripcion":
      "Quando convém usá-lo. O atendente o vê ao escolher.",
    "editor.activa": "Ativo",
    "editor.activaAyuda": "Inativo não é oferecido ao atendente, mas não se perde.",
    "editor.canales": "Canais em que é oferecido",
    "editor.canalesAyuda":
      "Por padrão, todos os escritos. Restrinja se só faz sentido em um.",
    "editor.contenido": "Mensagem",
    "editor.asunto": "Assunto (somente e-mail)",
    "editor.placeholderAsunto": "Opcional. Pode conter variáveis.",
    "editor.placeholderContenido":
      "Escreva a mensagem. Use negrito, itálico, listas e variáveis pela barra.",
    "editor.negrita": "Negrito",
    "editor.cursiva": "Itálico",
    "editor.lista": "Lista",
    "editor.insertarVariable": "Inserir variável",
    "editor.buscarVariable": "Pesquisar variável…",
    "editor.sinVariables": "Sem resultados.",
    "editor.insertarArchivo": "Inserir arquivo",
    "editor.archivosAyuda": "No chat, o arquivo é enviado como mensagem separada no ponto onde você o inseriu; no e-mail vai anexado; SMS não admite.",
    "editor.variablesUsadas": "Variáveis usadas: {lista}",
    "editor.variablesConfig": "Se um dado faltar, usa-se o configurado na aba Variáveis.",
    "editor.sinVariablesUsadas":
      "Esta mensagem não usa variáveis.",
    "editor.quitarArchivo": "Remover {nombre}",
    "editor.vistaPrevia": "Pré-visualização",
    "editor.vistaPreviaAyuda":
      "Como o cliente recebe em cada canal, com dados de exemplo.",
    "editor.vistaPreviaVacia": "Escreva a mensagem para ver a pré-visualização.",
    "editor.sinCanales": "Escolha pelo menos um canal.",
    "editor.asuntoPreview": "Assunto",
    "editor.adjuntosPreview": "{cantidad} anexo(s)",
    "editor.smsSinAdjuntos": "SMS não admite anexos: envia-se só o texto.",
    "editor.guardado": "As alterações são salvas ao confirmar.",

    "origen.cliente": "Cliente",
    "origen.campania": "Campanha",
    "origen.asesor": "Atendente",

    "variable.nombre": "Nome do cliente",
    "variable.apellido": "Sobrenome do cliente",
    "variable.documento": "Documento",
    "variable.telefono": "Telefone",
    "variable.email": "E-mail",
    "variable.numeroCliente": "Número do cliente",
    "variable.campania": "Nome da campanha",
    "variable.asesor": "Nome do atendente",

    "canal.chat": "Chat",
    "canal.email": "E-mail",
    "canal.sms": "SMS",

    "campania.grupo": "Grupo de modelos",
    "campania.buscarGrupo": "Pesquisar grupo de modelos...",
    "campania.vacioGrupo": "Nenhum grupo de modelos encontrado.",
    "campania.ver": "Ver modelos do grupo",
    "campania.dialogo": "Modelos — {nombre}",
    "campania.soloLectura":
      "Visualização somente leitura. Para editar o grupo, vá em Modelos de mensagens.",
    "campania.defaultTitulo": "Modelo padrão",
    "campania.defaultAyuda":
      "O Hermes o deixa pré-carregado na caixa de mensagem ao abrir a conversa. O atendente revisa e envia; nunca é enviado sozinho.",
    "campania.defaultChat": "Ao abrir um chat",
    "campania.defaultEmail": "Ao responder um e-mail",
    "campania.sinDefault": "Nenhum",
    "campania.buscarDefault": "Pesquisar modelo...",
    "campania.vacioDefault": "Não há modelos desse canal no grupo.",
    "campania.elegirGrupoPrimero": "Escolha primeiro um grupo de modelos.",

    "selector.boton": "Modelos",
    "selector.atajo": "Digite / para pesquisar",
    "selector.buscar": "Pesquisar por nome ou conteúdo…",
    "selector.sinResultados": "Nenhum modelo corresponde.",
    "selector.favoritas": "Favoritos",
    "selector.masUsadas": "Mais usados",
    "selector.marcarFavorita": "Marcar como favorito",
    "selector.quitarFavorita": "Remover dos favoritos",
    "selector.conAdjuntos": "{cantidad} anexo(s)",
    "selector.precargada": "Modelo padrão da campanha. Revise antes de enviar.",
    "selector.sinDato":
      "Faltam dados do cliente para: {variables}. Complete à mão antes de enviar.",
    "selector.reemplazarTitulo": "Já há texto escrito",
    "selector.reemplazarDescripcion":
      "Inserir o modelo abaixo do que você escreveu ou substituí-lo?",
    "selector.insertar": "Inserir abaixo",
    "selector.reemplazar": "Substituir",
    "selector.adjuntoAgregado": "Arquivos do modelo: no chat vão como mensagem separada, onde está o 📎 no texto.",
  },
  ca: {
    descripcion:
      "Deixa precarregats els missatges que els teus agents fan servir tot el temps al xat, al correu i als SMS, i agrupa'ls per assignar-los a les teves campanyes. Una plantilla pot ser a diversos grups.",

    "tabs.grupos": "Grups",
    "tabs.catalogo": "Catàleg",
    "tabs.variables": "Variables",
    "variables.descripcion": "Les dades que s'omplen soles a les plantilles: del client, de la campanya i de l'assessor. Si la dada falta, es fa servir el valor de reserva; sense reserva, Atlas avisa l'assessor abans d'enviar. Val per a totes les plantilles.",
    "variables.col.variable": "Variable",
    "variables.col.origen": "Origen",
    "variables.col.ejemplo": "Exemple",
    "variables.col.respaldo": "Si falta la dada",
    "variables.placeholderRespaldo": "Avisar l'assessor",

    nuevoGrupo: "Nou grup",
    nuevaPlantilla: "Nova plantilla",
    crearGrupo: "Crea el grup",
    crearPlantilla: "Crea la plantilla",

    "col.grupo": "Grup",
    "col.plantilla": "Plantilla",
    "col.canales": "Canals",
    "col.adjuntos": "Adjunts",
    "col.cantidad": "Plantilles",

    eliminarGrupo:
      "S'elimina el grup. Les plantilles del catàleg no s'esborren. Les campanyes que el feien servir queden sense grup de plantilles.",
    eliminarPlantilla:
      "Es treu del catàleg i de tots els grups que la fan servir.",

    "dialogoGrupo.titulo": "Nou grup de plantilles",
    "dialogoGrupo.descripcion":
      "Després li assignes plantilles del catàleg des de la seva edició.",

    "detalle.subtitulo": "Grup de plantilles",
    "detalle.datos": "Dades del grup",

    "miembros.titulo": "Plantilles del grup",
    "miembros.descripcion":
      "S'afegeixen des del catàleg. Una mateixa plantilla pot ser a diversos grups; treure-la d'aquest grup no l'elimina del catàleg.",
    "miembros.agregar": "Afegeix del catàleg",
    "miembros.buscar": "Cerca una plantilla…",
    "miembros.sinDisponibles":
      "No queden plantilles sense assignar. Crea'n de noves des del catàleg.",
    "miembros.vacio": "Aquest grup encara no té plantilles.",
    "miembros.quitar": "Treu del grup",
    "miembros.quitarAria": "Treu {nombre} del grup",

    "editor.nueva": "Nova plantilla",
    "editor.subtitulo":
      "S'escriu un cop; Atlas l'adapta al que admet cada canal.",
    "editor.datos": "Dades",
    "editor.continuar": "Continua al missatge",
    "editor.placeholderNombre": "Ex.: Salutació inicial",
    "editor.placeholderDescripcion":
      "Quan convé fer-la servir. L'agent la veu en triar-la.",
    "editor.activa": "Activa",
    "editor.activaAyuda": "Inactiva no s'ofereix a l'agent, però no es perd.",
    "editor.canales": "Canals en què s'ofereix",
    "editor.canalesAyuda":
      "Per defecte tots els escrits. Restringeix-la si només té sentit en un.",
    "editor.contenido": "Missatge",
    "editor.asunto": "Assumpte (només correu)",
    "editor.placeholderAsunto": "Opcional. Pot portar variables.",
    "editor.placeholderContenido":
      "Escriu el missatge. Fes servir negreta, cursiva, llistes i variables des de la barra.",
    "editor.negrita": "Negreta",
    "editor.cursiva": "Cursiva",
    "editor.lista": "Llista",
    "editor.insertarVariable": "Insereix una variable",
    "editor.buscarVariable": "Cerca una variable…",
    "editor.sinVariables": "Sense resultats.",
    "editor.insertarArchivo": "Insereix fitxer",
    "editor.archivosAyuda": "Al xat, el fitxer s'envia com a missatge a part al punt on l'has inserit; al correu va adjunt; l'SMS no l'admet.",
    "editor.variablesUsadas": "Variables usades: {lista}",
    "editor.variablesConfig": "Si falta una dada, es fa servir el que hi ha configurat a la pestanya Variables.",
    "editor.sinVariablesUsadas":
      "Aquest missatge no fa servir variables.",
    "editor.quitarArchivo": "Treu {nombre}",
    "editor.vistaPrevia": "Vista prèvia",
    "editor.vistaPreviaAyuda":
      "Com ho rep el client a cada canal, amb dades d'exemple.",
    "editor.vistaPreviaVacia": "Escriu el missatge per veure la vista prèvia.",
    "editor.sinCanales": "Tria almenys un canal.",
    "editor.asuntoPreview": "Assumpte",
    "editor.adjuntosPreview": "{cantidad} adjunt(s)",
    "editor.smsSinAdjuntos": "L'SMS no admet adjunts: només s'envia el text.",
    "editor.guardado": "Els canvis es desen en confirmar.",

    "origen.cliente": "Client",
    "origen.campania": "Campanya",
    "origen.asesor": "Agent",

    "variable.nombre": "Nom del client",
    "variable.apellido": "Cognom del client",
    "variable.documento": "Document",
    "variable.telefono": "Telèfon",
    "variable.email": "Correu",
    "variable.numeroCliente": "Número de client",
    "variable.campania": "Nom de la campanya",
    "variable.asesor": "Nom de l'agent",

    "canal.chat": "Xat",
    "canal.email": "Correu",
    "canal.sms": "SMS",

    "campania.grupo": "Grup de plantilles",
    "campania.buscarGrupo": "Cerca un grup de plantilles...",
    "campania.vacioGrupo": "No s'ha trobat cap grup de plantilles.",
    "campania.ver": "Mostra les plantilles del grup",
    "campania.dialogo": "Plantilles — {nombre}",
    "campania.soloLectura":
      "Vista només de lectura. Per editar el grup, fes-ho des de Plantilles de missatges.",
    "campania.defaultTitulo": "Plantilla per defecte",
    "campania.defaultAyuda":
      "Hermes la deixa precarregada al quadre de missatge en obrir la conversa. L'agent la revisa i l'envia; mai s'envia sola.",
    "campania.defaultChat": "En obrir un xat",
    "campania.defaultEmail": "En respondre un correu",
    "campania.sinDefault": "Cap",
    "campania.buscarDefault": "Cerca una plantilla...",
    "campania.vacioDefault": "No hi ha plantilles d'aquest canal al grup.",
    "campania.elegirGrupoPrimero": "Tria primer un grup de plantilles.",

    "selector.boton": "Plantilles",
    "selector.atajo": "Escriu / per cercar",
    "selector.buscar": "Cerca per nom o contingut…",
    "selector.sinResultados": "Cap plantilla coincideix.",
    "selector.favoritas": "Preferides",
    "selector.masUsadas": "Més usades",
    "selector.marcarFavorita": "Marca com a preferida",
    "selector.quitarFavorita": "Treu de preferides",
    "selector.conAdjuntos": "{cantidad} adjunt(s)",
    "selector.precargada": "Plantilla per defecte de la campanya. Revisa-la abans d'enviar.",
    "selector.sinDato":
      "Falten dades del client per a: {variables}. Completa-ho a mà abans d'enviar.",
    "selector.reemplazarTitulo": "Ja hi ha text escrit",
    "selector.reemplazarDescripcion":
      "Vols afegir la plantilla sota el que has escrit o substituir-lo?",
    "selector.insertar": "Insereix a sota",
    "selector.reemplazar": "Substitueix",
    "selector.adjuntoAgregado": "Fitxers de la plantilla: al xat van com a missatge a part, on hi ha el 📎 al text.",
  },
};
