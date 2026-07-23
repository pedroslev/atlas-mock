import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Marcas (rutas y código siguen diciendo "marcadores"): pool de marcas del
// tenant + grupos que las agrupan. El rótulo de sección sale de
// `common.nav.marcas`; acá va solo lo propio de estas pantallas.
export const marcas: NamespaceDict = {
  es: {
    descripcion:
      "Definí las marcas que los asesores pueden dejar sobre una gestión y agrupalas para asignarlas a tus campañas. Una marca puede reutilizarse en varios grupos.",

    "tabs.grupos": "Grupos",
    "tabs.catalogo": "Catálogo",

    nuevoGrupo: "Nuevo grupo",
    nuevaMarca: "Nueva marca",
    crearGrupo: "Crear grupo",
    crearMarca: "Crear marca",

    "col.grupo": "Grupo",
    "col.marca": "Marca",

    eliminarGrupo:
      "Se elimina el grupo. Las marcas del catálogo no se borran.",
    eliminarMarca:
      "Se quita del catálogo y de todos los grupos que lo usan.",

    "dialogoGrupo.titulo": "Nuevo grupo de marcas",
    "dialogoGrupo.descripcion":
      "Después le asignás marcas del catálogo desde su edición.",

    "dialogo.editar": "Editar {nombre}",
    "dialogo.descripcion":
      "Las marcas son reutilizables: podés asignarlas a varios grupos desde cada grupo.",
    "dialogo.placeholderNombre": "Ej: Cliente VIP",
    "dialogo.prompt": "Instrucciones para asistencia con IA",

    "detalle.subtitulo": "Grupo de marcas",
    "detalle.datos": "Datos del grupo",

    "miembros.titulo": "Marcas del grupo",
    "miembros.descripcion":
      "Se agregan desde el catálogo. Una misma marca puede estar en varios grupos; quitarla de este grupo no la elimina del catálogo.",
    "miembros.agregar": "Agregar del catálogo",
    "miembros.buscar": "Buscar marca…",
    "miembros.sinDisponibles":
      "No quedan marcas sin asignar. Creá nuevas desde el catálogo en Marcas.",
    "miembros.vacio": "Este grupo todavía no tiene marcas.",
    "miembros.quitar": "Quitar del grupo",
    "miembros.quitarAria": "Quitar {nombre} del grupo",
  },
  en: {
    descripcion:
      "Define the marks that agents can leave on an interaction and group them to assign them to your campaigns. A mark can be reused in several groups.",

    "tabs.grupos": "Groups",
    "tabs.catalogo": "Catalog",

    nuevoGrupo: "New group",
    nuevaMarca: "New mark",
    crearGrupo: "Create group",
    crearMarca: "Create mark",

    "col.grupo": "Group",
    "col.marca": "Mark",

    eliminarGrupo:
      "The group is deleted. The marks in the catalog are not removed.",
    eliminarMarca:
      "It is removed from the catalog and from every group that uses it.",

    "dialogoGrupo.titulo": "New mark group",
    "dialogoGrupo.descripcion":
      "You can assign marks from the catalog later, from the group's edit screen.",

    "dialogo.editar": "Edit {nombre}",
    "dialogo.descripcion":
      "Marks are reusable: you can assign them to several groups from each group.",
    "dialogo.placeholderNombre": "E.g.: Cliente VIP",
    "dialogo.prompt": "Instructions for AI assistance",

    "detalle.subtitulo": "Mark group",
    "detalle.datos": "Group details",

    "miembros.titulo": "Marks in this group",
    "miembros.descripcion":
      "They are added from the catalog. The same mark can belong to several groups; removing it from this group does not delete it from the catalog.",
    "miembros.agregar": "Add from catalog",
    "miembros.buscar": "Search mark…",
    "miembros.sinDisponibles":
      "There are no unassigned marks left. Create new ones from the catalog in Marks.",
    "miembros.vacio": "This group has no marks yet.",
    "miembros.quitar": "Remove from group",
    "miembros.quitarAria": "Remove {nombre} from the group",
  },
  pt: {
    descripcion:
      "Defina as marcas que os atendentes podem deixar em um atendimento e agrupe-as para atribuí-las às suas campanhas. Uma marca pode ser reutilizada em vários grupos.",

    "tabs.grupos": "Grupos",
    "tabs.catalogo": "Catálogo",

    nuevoGrupo: "Novo grupo",
    nuevaMarca: "Nova marca",
    crearGrupo: "Criar grupo",
    crearMarca: "Criar marca",

    "col.grupo": "Grupo",
    "col.marca": "Marca",

    eliminarGrupo:
      "O grupo é excluído. As marcas do catálogo não são apagadas.",
    eliminarMarca:
      "É removida do catálogo e de todos os grupos que a utilizam.",

    "dialogoGrupo.titulo": "Novo grupo de marcas",
    "dialogoGrupo.descripcion":
      "Depois você atribui marcas do catálogo na edição do grupo.",

    "dialogo.editar": "Editar {nombre}",
    "dialogo.descripcion":
      "As marcas são reutilizáveis: você pode atribuí-las a vários grupos a partir de cada grupo.",
    "dialogo.placeholderNombre": "Ex.: Cliente VIP",
    "dialogo.prompt": "Instruções para assistência com IA",

    "detalle.subtitulo": "Grupo de marcas",
    "detalle.datos": "Dados do grupo",

    "miembros.titulo": "Marcas do grupo",
    "miembros.descripcion":
      "Elas são adicionadas a partir do catálogo. Uma mesma marca pode estar em vários grupos; removê-la deste grupo não a exclui do catálogo.",
    "miembros.agregar": "Adicionar do catálogo",
    "miembros.buscar": "Pesquisar marca…",
    "miembros.sinDisponibles":
      "Não restam marcas sem atribuir. Crie novas no catálogo em Marcas.",
    "miembros.vacio": "Este grupo ainda não tem marcas.",
    "miembros.quitar": "Remover do grupo",
    "miembros.quitarAria": "Remover {nombre} do grupo",
  },
  ca: {
    descripcion:
      "Defineix les marques que els agents poden deixar sobre una gestió i agrupa-les per assignar-les a les teves campanyes. Una marca es pot reutilitzar en diversos grups.",

    "tabs.grupos": "Grups",
    "tabs.catalogo": "Catàleg",

    nuevoGrupo: "Nou grup",
    nuevaMarca: "Nova marca",
    crearGrupo: "Crea el grup",
    crearMarca: "Crea la marca",

    "col.grupo": "Grup",
    "col.marca": "Marca",

    eliminarGrupo:
      "S'elimina el grup. Les marques del catàleg no s'esborren.",
    eliminarMarca:
      "Es treu del catàleg i de tots els grups que la fan servir.",

    "dialogoGrupo.titulo": "Nou grup de marques",
    "dialogoGrupo.descripcion":
      "Després li assignes marques del catàleg des de la seva edició.",

    "dialogo.editar": "Edita {nombre}",
    "dialogo.descripcion":
      "Les marques són reutilitzables: pots assignar-les a diversos grups des de cada grup.",
    "dialogo.placeholderNombre": "Ex.: Cliente VIP",
    "dialogo.prompt": "Instruccions per a l'assistència amb IA",

    "detalle.subtitulo": "Grup de marques",
    "detalle.datos": "Dades del grup",

    "miembros.titulo": "Marques del grup",
    "miembros.descripcion":
      "S'afegeixen des del catàleg. Una mateixa marca pot ser a diversos grups; treure-la d'aquest grup no l'elimina del catàleg.",
    "miembros.agregar": "Afegeix del catàleg",
    "miembros.buscar": "Cerca una marca…",
    "miembros.sinDisponibles":
      "No queden marques sense assignar. Crea'n de noves des del catàleg a Marques.",
    "miembros.vacio": "Aquest grup encara no té marques.",
    "miembros.quitar": "Treu del grup",
    "miembros.quitarAria": "Treu {nombre} del grup",
  },
};
