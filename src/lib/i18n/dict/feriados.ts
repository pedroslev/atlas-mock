import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Grupos de feriados: listado, alta y el editor anual de fechas marcadas.
//
// Los nombres de los feriados concretos ("Día de la Independencia", "Muerte de
// San Martín") son DATOS del calendario del cliente, no copy de interfaz: no se
// traducen ni acá ni en el placeholder de ejemplo del diálogo.
export const feriados: NamespaceDict = {
  es: {
    titulo: "Feriados",
    descripcion:
      "Armá grupos de fechas no laborables y asignalos a tus proyectos y campañas para que no se opere esos días.",
    nuevoGrupo: "Nuevo grupo de feriados",
    crearGrupo: "Crear grupo",
    nombreGrupo: "Nombre del grupo",
    nombreGrupoPlaceholder: "Ej: Feriados Argentina 2027",

    "col.fechas": "Fechas",
    "col.primeraFecha": "Primera fecha",
    cantidadFechas: "{n} fecha(s)",

    "calendario.titulo": "Calendario {anio}",
    "calendario.anio": "Año",
    "calendario.ayuda":
      "Hacé click en un día para marcarlo como no laborable con su motivo. Click en un día marcado para editarlo o quitarlo.",
    "calendario.fechasMarcadas": "Fechas marcadas",
    "calendario.sinFechas": "Todavía no hay fechas marcadas.",
    "calendario.quitarFecha": "Quitar fecha",
    "calendario.quitarFechaAria": "Quitar {fecha}",

    "dialogo.editar": "Editá el motivo o quitá la fecha del grupo.",
    "dialogo.marcar": "Marcá esta fecha como no laborable.",
    "dialogo.motivo": "Motivo",
    "dialogo.motivoPlaceholder": "Ej: Muerte de San Martín",
    "dialogo.marcarFeriado": "Marcar feriado",
  },
  en: {
    titulo: "Holidays",
    descripcion:
      "Build groups of non-working dates and assign them to your projects and campaigns so no work happens on those days.",
    nuevoGrupo: "New holiday group",
    crearGrupo: "Create group",
    nombreGrupo: "Group name",
    nombreGrupoPlaceholder: "e.g. Argentina Holidays 2027",

    "col.fechas": "Dates",
    "col.primeraFecha": "First date",
    cantidadFechas: "{n} date(s)",

    "calendario.titulo": "Calendar {anio}",
    "calendario.anio": "Year",
    "calendario.ayuda":
      "Click a day to mark it as non-working with its reason. Click a marked day to edit or remove it.",
    "calendario.fechasMarcadas": "Marked dates",
    "calendario.sinFechas": "No dates marked yet.",
    "calendario.quitarFecha": "Remove date",
    "calendario.quitarFechaAria": "Remove {fecha}",

    "dialogo.editar": "Edit the reason or remove the date from the group.",
    "dialogo.marcar": "Mark this date as non-working.",
    "dialogo.motivo": "Reason",
    "dialogo.motivoPlaceholder": "e.g. Muerte de San Martín",
    "dialogo.marcarFeriado": "Mark holiday",
  },
  pt: {
    titulo: "Feriados",
    descripcion:
      "Monte grupos de datas não úteis e atribua-os aos seus projetos e campanhas para que não se opere nesses dias.",
    nuevoGrupo: "Novo grupo de feriados",
    crearGrupo: "Criar grupo",
    nombreGrupo: "Nome do grupo",
    nombreGrupoPlaceholder: "Ex.: Feriados Argentina 2027",

    "col.fechas": "Datas",
    "col.primeraFecha": "Primeira data",
    cantidadFechas: "{n} data(s)",

    "calendario.titulo": "Calendário {anio}",
    "calendario.anio": "Ano",
    "calendario.ayuda":
      "Clique em um dia para marcá-lo como não útil com o motivo. Clique em um dia marcado para editá-lo ou removê-lo.",
    "calendario.fechasMarcadas": "Datas marcadas",
    "calendario.sinFechas": "Ainda não há datas marcadas.",
    "calendario.quitarFecha": "Remover data",
    "calendario.quitarFechaAria": "Remover {fecha}",

    "dialogo.editar": "Edite o motivo ou remova a data do grupo.",
    "dialogo.marcar": "Marque esta data como não útil.",
    "dialogo.motivo": "Motivo",
    "dialogo.motivoPlaceholder": "Ex.: Muerte de San Martín",
    "dialogo.marcarFeriado": "Marcar feriado",
  },
  ca: {
    titulo: "Festius",
    descripcion:
      "Crea grups de dates no laborables i assigna'ls als teus projectes i campanyes perquè no s'operi aquests dies.",
    nuevoGrupo: "Nou grup de festius",
    crearGrupo: "Crea el grup",
    nombreGrupo: "Nom del grup",
    nombreGrupoPlaceholder: "Ex.: Festius Argentina 2027",

    "col.fechas": "Dates",
    "col.primeraFecha": "Primera data",
    cantidadFechas: "{n} data/es",

    "calendario.titulo": "Calendari {anio}",
    "calendario.anio": "Any",
    "calendario.ayuda":
      "Fes clic en un dia per marcar-lo com a no laborable amb el seu motiu. Fes clic en un dia marcat per editar-lo o treure'l.",
    "calendario.fechasMarcadas": "Dates marcades",
    "calendario.sinFechas": "Encara no hi ha dates marcades.",
    "calendario.quitarFecha": "Treu la data",
    "calendario.quitarFechaAria": "Treu {fecha}",

    "dialogo.editar": "Edita el motiu o treu la data del grup.",
    "dialogo.marcar": "Marca aquesta data com a no laborable.",
    "dialogo.motivo": "Motiu",
    "dialogo.motivoPlaceholder": "Ex.: Muerte de San Martín",
    "dialogo.marcarFeriado": "Marca el festiu",
  },
};
