import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Clasificaciones: catálogo del tenant + grupos que las agrupan para asignarlas
// a campañas. Las claves `tipo.*` traducen el valor de `Clasificacion["tipo"]`
// de mock-data (el dato queda en castellano; se mapea en el punto de render).
export const clasificaciones: NamespaceDict = {
  es: {
    "titulo": "Clasificaciones",
    "descripcion":
      "Definí con qué resultados se cierra cada gestión y agrupalos para asignarlos a tus campañas. Una clasificación puede reutilizarse en varios grupos.",

    "tab.grupos": "Grupos",
    "tab.catalogo": "Catálogo",

    "nuevoGrupo": "Nuevo grupo",
    "nuevaClasificacion": "Nueva clasificación",

    "col.grupo": "Grupo",
    "col.clasificacion": "Clasificación",
    "col.tipo": "Tipo",

    "tipo.exitoso": "Exitoso",
    "tipo.noExitoso": "No exitoso",
    "tipo.noEfectivo": "No efectivo",
    "tipo.neutro": "Neutro",

    "grupo.eliminarConfirm":
      "Se elimina el grupo. Las clasificaciones del catálogo no se borran.",
    "pool.eliminarConfirm":
      "Se quita del catálogo y de todos los grupos que la usan.",

    "nuevoGrupo.titulo": "Nuevo grupo de clasificaciones",
    "nuevoGrupo.descripcion":
      "Después le asignás clasificaciones del catálogo desde su edición.",
    "nuevoGrupo.crear": "Crear grupo",

    "dialog.editar": "Editar {nombre}",
    "dialog.descripcion":
      "Las clasificaciones son reutilizables: podés asignarlas a varios grupos desde cada grupo.",
    "dialog.crear": "Crear clasificación",

    "campo.nombrePlaceholder": "Ej: Venta exitosa",
    "campo.idExt": "ID externo",
    "campo.idExtPlaceholder": "Para integraciones (opcional)",
    "campo.callingTime": "Tiempo de rellamada (min)",
    "campo.padre": "Clasificación padre",
    "campo.sinPadre": "Sin padre (raíz)",
    "campo.buscar": "Buscar clasificación...",
    "campo.sinRaices": "No se encontró ninguna clasificación raíz.",

    "grupo.subtitulo": "Grupo de clasificaciones",
    "grupo.datos": "Datos del grupo",

    "miembros.titulo": "Clasificaciones del grupo",
    "miembros.descripcion":
      "Se agregan desde el catálogo. Una misma clasificación puede estar en varios grupos; quitarla de este grupo no la elimina del catálogo.",
    "miembros.agregar": "Agregar del catálogo",
    "miembros.sinDisponibles":
      "No quedan clasificaciones sin asignar. Creá nuevas desde el catálogo en Clasificaciones.",
    "miembros.vacio": "Este grupo todavía no tiene clasificaciones.",
    "miembros.quitar": "Quitar del grupo",
    "miembros.quitarAria": "Quitar {nombre} del grupo",
  },
  en: {
    "titulo": "Classifications",
    "descripcion":
      "Define the outcomes each interaction is closed with and group them to assign them to your campaigns. A classification can be reused in several groups.",

    "tab.grupos": "Groups",
    "tab.catalogo": "Catalog",

    "nuevoGrupo": "New group",
    "nuevaClasificacion": "New classification",

    "col.grupo": "Group",
    "col.clasificacion": "Classification",
    "col.tipo": "Type",

    "tipo.exitoso": "Successful",
    "tipo.noExitoso": "Unsuccessful",
    "tipo.noEfectivo": "Ineffective",
    "tipo.neutro": "Neutral",

    "grupo.eliminarConfirm":
      "The group is deleted. The classifications in the catalog are not removed.",
    "pool.eliminarConfirm":
      "It is removed from the catalog and from every group using it.",

    "nuevoGrupo.titulo": "New classification group",
    "nuevoGrupo.descripcion":
      "You can assign classifications from the catalog later, when editing it.",
    "nuevoGrupo.crear": "Create group",

    "dialog.editar": "Edit {nombre}",
    "dialog.descripcion":
      "Classifications are reusable: you can assign them to several groups from each group.",
    "dialog.crear": "Create classification",

    "campo.nombrePlaceholder": "E.g. Successful sale",
    "campo.idExt": "External ID",
    "campo.idExtPlaceholder": "For integrations (optional)",
    "campo.callingTime": "Recall time (min)",
    "campo.padre": "Parent classification",
    "campo.sinPadre": "No parent (root)",
    "campo.buscar": "Search classification...",
    "campo.sinRaices": "No root classification found.",

    "grupo.subtitulo": "Classification group",
    "grupo.datos": "Group details",

    "miembros.titulo": "Classifications in the group",
    "miembros.descripcion":
      "They are added from the catalog. The same classification can belong to several groups; removing it from this group does not delete it from the catalog.",
    "miembros.agregar": "Add from catalog",
    "miembros.sinDisponibles":
      "There are no unassigned classifications left. Create new ones from the catalog in Classifications.",
    "miembros.vacio": "This group has no classifications yet.",
    "miembros.quitar": "Remove from group",
    "miembros.quitarAria": "Remove {nombre} from the group",
  },
  pt: {
    "titulo": "Classificações",
    "descripcion":
      "Defina com quais resultados cada atendimento é encerrado e agrupe-os para atribuí-los às suas campanhas. Uma classificação pode ser reutilizada em vários grupos.",

    "tab.grupos": "Grupos",
    "tab.catalogo": "Catálogo",

    "nuevoGrupo": "Novo grupo",
    "nuevaClasificacion": "Nova classificação",

    "col.grupo": "Grupo",
    "col.clasificacion": "Classificação",
    "col.tipo": "Tipo",

    "tipo.exitoso": "Bem-sucedido",
    "tipo.noExitoso": "Malsucedido",
    "tipo.noEfectivo": "Não efetivo",
    "tipo.neutro": "Neutro",

    "grupo.eliminarConfirm":
      "O grupo é excluído. As classificações do catálogo não são apagadas.",
    "pool.eliminarConfirm":
      "É removida do catálogo e de todos os grupos que a utilizam.",

    "nuevoGrupo.titulo": "Novo grupo de classificações",
    "nuevoGrupo.descripcion":
      "Depois você atribui classificações do catálogo pela edição do grupo.",
    "nuevoGrupo.crear": "Criar grupo",

    "dialog.editar": "Editar {nombre}",
    "dialog.descripcion":
      "As classificações são reutilizáveis: você pode atribuí-las a vários grupos a partir de cada grupo.",
    "dialog.crear": "Criar classificação",

    "campo.nombrePlaceholder": "Ex.: Venda bem-sucedida",
    "campo.idExt": "ID externo",
    "campo.idExtPlaceholder": "Para integrações (opcional)",
    "campo.callingTime": "Tempo de rechamada (min)",
    "campo.padre": "Classificação pai",
    "campo.sinPadre": "Sem pai (raiz)",
    "campo.buscar": "Buscar classificação...",
    "campo.sinRaices": "Nenhuma classificação raiz encontrada.",

    "grupo.subtitulo": "Grupo de classificações",
    "grupo.datos": "Dados do grupo",

    "miembros.titulo": "Classificações do grupo",
    "miembros.descripcion":
      "São adicionadas a partir do catálogo. Uma mesma classificação pode estar em vários grupos; removê-la deste grupo não a exclui do catálogo.",
    "miembros.agregar": "Adicionar do catálogo",
    "miembros.sinDisponibles":
      "Não restam classificações sem atribuir. Crie novas no catálogo em Classificações.",
    "miembros.vacio": "Este grupo ainda não tem classificações.",
    "miembros.quitar": "Remover do grupo",
    "miembros.quitarAria": "Remover {nombre} do grupo",
  },
  ca: {
    "titulo": "Classificacions",
    "descripcion":
      "Defineix amb quins resultats es tanca cada gestió i agrupa'ls per assignar-los a les teves campanyes. Una classificació es pot reutilitzar en diversos grups.",

    "tab.grupos": "Grups",
    "tab.catalogo": "Catàleg",

    "nuevoGrupo": "Grup nou",
    "nuevaClasificacion": "Classificació nova",

    "col.grupo": "Grup",
    "col.clasificacion": "Classificació",
    "col.tipo": "Tipus",

    "tipo.exitoso": "Reeixit",
    "tipo.noExitoso": "No reeixit",
    "tipo.noEfectivo": "No efectiu",
    "tipo.neutro": "Neutre",

    "grupo.eliminarConfirm":
      "S'elimina el grup. Les classificacions del catàleg no s'esborren.",
    "pool.eliminarConfirm":
      "Es treu del catàleg i de tots els grups que la fan servir.",

    "nuevoGrupo.titulo": "Grup de classificacions nou",
    "nuevoGrupo.descripcion":
      "Després li assignes classificacions del catàleg des de la seva edició.",
    "nuevoGrupo.crear": "Crea el grup",

    "dialog.editar": "Edita {nombre}",
    "dialog.descripcion":
      "Les classificacions són reutilitzables: pots assignar-les a diversos grups des de cada grup.",
    "dialog.crear": "Crea la classificació",

    "campo.nombrePlaceholder": "Ex.: Venda reeixida",
    "campo.idExt": "ID extern",
    "campo.idExtPlaceholder": "Per a integracions (opcional)",
    "campo.callingTime": "Temps de retrucada (min)",
    "campo.padre": "Classificació pare",
    "campo.sinPadre": "Sense pare (arrel)",
    "campo.buscar": "Cerca una classificació...",
    "campo.sinRaices": "No s'ha trobat cap classificació arrel.",

    "grupo.subtitulo": "Grup de classificacions",
    "grupo.datos": "Dades del grup",

    "miembros.titulo": "Classificacions del grup",
    "miembros.descripcion":
      "S'afegeixen des del catàleg. Una mateixa classificació pot ser a diversos grups; treure-la d'aquest grup no l'elimina del catàleg.",
    "miembros.agregar": "Afegeix del catàleg",
    "miembros.sinDisponibles":
      "No queden classificacions sense assignar. Crea'n de noves des del catàleg a Classificacions.",
    "miembros.vacio": "Aquest grup encara no té classificacions.",
    "miembros.quitar": "Treu del grup",
    "miembros.quitarAria": "Treu {nombre} del grup",
  },
};
