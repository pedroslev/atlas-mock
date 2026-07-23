import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Listas de exclusión: listado, alta, edición y los contactos excluidos de
// cada lista. El rótulo de sección sale de `common.nav.listasExclusion`.
export const listas: NamespaceDict = {
  es: {
    descripcion:
      "Administrá los contactos que no deben ser contactados en tus campañas, ya sea por decisión propia o por registros oficiales de no-llame.",

    nuevaLista: "Nueva lista",
    descargar: "Descargar",

    "col.tipo": "Tipo",
    "col.contactos": "Contactos",

    "tipo.tareas": "Exclusión de tareas",
    "tipo.gubernamental": "Gubernamental",

    "nueva.titulo": "Nueva lista de exclusión",
    "nueva.crear": "Crear lista",

    datos: "Datos de la lista",
    placeholderNombre: "Ej: Excluidos Cobranzas Q4",
    contactosCount: "{n} contactos",

    "contactos.titulo": "Contactos excluidos",
    "contactos.uno": "{n} contacto excluido",
    "contactos.varios": "{n} contactos excluidos",
    "contactos.agregar": "Agregar contacto",
    "contactos.agregarTitulo": "Agregar contacto excluido",
    "contactos.contacto": "Contacto",
    "contactos.tipoLlamada": "Llamada",
    "contactos.tipoWhatsapp": "WhatsApp",
    "contactos.tipoEmail": "Email",
    "contactos.vacio": "Todavía no hay contactos excluidos en esta lista.",
    "contactos.buscarPlaceholder": "Buscar por contacto o tipo…",
    "contactos.buscarAria": "Buscar contactos excluidos",
    "contactos.sinCoincidencias": "No hay contactos que coincidan con “{q}”.",
    "contactos.quitar": "Quitar contacto",
    "contactos.quitarAria": "Quitar {contacto}",
  },
  en: {
    descripcion:
      "Manage the contacts that must not be reached in your campaigns, whether by your own decision or because of official do-not-call registries.",

    nuevaLista: "New list",
    descargar: "Download",

    "col.tipo": "Type",
    "col.contactos": "Contacts",

    "tipo.tareas": "Task exclusion",
    "tipo.gubernamental": "Government",

    "nueva.titulo": "New exclusion list",
    "nueva.crear": "Create list",

    datos: "List details",
    placeholderNombre: "E.g.: Excluidos Cobranzas Q4",
    contactosCount: "{n} contacts",

    "contactos.titulo": "Excluded contacts",
    "contactos.uno": "{n} excluded contact",
    "contactos.varios": "{n} excluded contacts",
    "contactos.agregar": "Add contact",
    "contactos.agregarTitulo": "Add excluded contact",
    "contactos.contacto": "Contact",
    "contactos.tipoLlamada": "Call",
    "contactos.tipoWhatsapp": "WhatsApp",
    "contactos.tipoEmail": "Email",
    "contactos.vacio": "There are no excluded contacts in this list yet.",
    "contactos.buscarPlaceholder": "Search by contact or type…",
    "contactos.buscarAria": "Search excluded contacts",
    "contactos.sinCoincidencias": "No contacts match “{q}”.",
    "contactos.quitar": "Remove contact",
    "contactos.quitarAria": "Remove {contacto}",
  },
  pt: {
    descripcion:
      "Gerencie os contatos que não devem ser contatados nas suas campanhas, seja por decisão própria ou por registros oficiais de não perturbe.",

    nuevaLista: "Nova lista",
    descargar: "Baixar",

    "col.tipo": "Tipo",
    "col.contactos": "Contatos",

    "tipo.tareas": "Exclusão de tarefas",
    "tipo.gubernamental": "Governamental",

    "nueva.titulo": "Nova lista de exclusão",
    "nueva.crear": "Criar lista",

    datos: "Dados da lista",
    placeholderNombre: "Ex.: Excluidos Cobranzas Q4",
    contactosCount: "{n} contatos",

    "contactos.titulo": "Contatos excluídos",
    "contactos.uno": "{n} contato excluído",
    "contactos.varios": "{n} contatos excluídos",
    "contactos.agregar": "Adicionar contato",
    "contactos.agregarTitulo": "Adicionar contato excluído",
    "contactos.contacto": "Contato",
    "contactos.tipoLlamada": "Chamada",
    "contactos.tipoWhatsapp": "WhatsApp",
    "contactos.tipoEmail": "E-mail",
    "contactos.vacio": "Ainda não há contatos excluídos nesta lista.",
    "contactos.buscarPlaceholder": "Pesquisar por contato ou tipo…",
    "contactos.buscarAria": "Pesquisar contatos excluídos",
    "contactos.sinCoincidencias": "Nenhum contato corresponde a “{q}”.",
    "contactos.quitar": "Remover contato",
    "contactos.quitarAria": "Remover {contacto}",
  },
  ca: {
    descripcion:
      "Gestiona els contactes que no s'han de contactar a les teves campanyes, ja sigui per decisió pròpia o per registres oficials de no trucar.",

    nuevaLista: "Nova llista",
    descargar: "Descarrega",

    "col.tipo": "Tipus",
    "col.contactos": "Contactes",

    "tipo.tareas": "Exclusió de tasques",
    "tipo.gubernamental": "Governamental",

    "nueva.titulo": "Nova llista d'exclusió",
    "nueva.crear": "Crea la llista",

    datos: "Dades de la llista",
    placeholderNombre: "Ex.: Excluidos Cobranzas Q4",
    contactosCount: "{n} contactes",

    "contactos.titulo": "Contactes exclosos",
    "contactos.uno": "{n} contacte exclòs",
    "contactos.varios": "{n} contactes exclosos",
    "contactos.agregar": "Afegeix un contacte",
    "contactos.agregarTitulo": "Afegeix un contacte exclòs",
    "contactos.contacto": "Contacte",
    "contactos.tipoLlamada": "Trucada",
    "contactos.tipoWhatsapp": "WhatsApp",
    "contactos.tipoEmail": "Correu",
    "contactos.vacio": "Encara no hi ha contactes exclosos en aquesta llista.",
    "contactos.buscarPlaceholder": "Cerca per contacte o tipus…",
    "contactos.buscarAria": "Cerca contactes exclosos",
    "contactos.sinCoincidencias": "Cap contacte no coincideix amb «{q}».",
    "contactos.quitar": "Treu el contacte",
    "contactos.quitarAria": "Treu {contacto}",
  },
};
