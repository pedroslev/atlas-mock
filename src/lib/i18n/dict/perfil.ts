import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Pantalla "Mi perfil" (/perfil). El título reusa `common.header.miPerfil` y el
// label del selector de idioma reusa `common.header.idioma`, así que no se
// duplican acá. Los datos del usuario (nombre, email) salen del mock y no se
// traducen; sí se traducen los valores de fecha/hora de ejemplo, que cambian de
// formato según el idioma.
export const perfil: NamespaceDict = {
  es: {
    "descripcion":
      "Consultá los datos de tu cuenta y ajustá tus preferencias personales.",
    "guardarCambios": "Guardar cambios",

    "habilitado": "Habilitado",
    "deshabilitado": "Deshabilitado",

    "cuenta.titulo": "Datos de la cuenta",
    "cuenta.descripcion":
      "Estos datos los administra el responsable de tu organización. Si hay algo para corregir, escribile a quien gestiona los usuarios.",
    "cuenta.email": "Email",
    "cuenta.alta": "Alta",
    "cuenta.altaValor": "12 de marzo de 2025",
    "cuenta.ultimoAcceso": "Último acceso",
    "cuenta.ultimoAccesoValor": "Hoy, 08:42",

    "preferencias.titulo": "Preferencias",
    "preferencias.descripcion": "Ajustes personales de cómo ves la plataforma.",
    "preferencias.tema": "Tema",
    "preferencias.temaClaro": "Claro",
    "preferencias.temaOscuro": "Oscuro",
    "preferencias.temaSistema": "Según el sistema",
  },
  en: {
    "descripcion":
      "Review your account details and adjust your personal preferences.",
    "guardarCambios": "Save changes",

    "habilitado": "Enabled",
    "deshabilitado": "Disabled",

    "cuenta.titulo": "Account details",
    "cuenta.descripcion":
      "These details are managed by your organization's administrator. If something needs fixing, reach out to whoever manages users.",
    "cuenta.email": "Email",
    "cuenta.alta": "Created",
    "cuenta.altaValor": "March 12, 2025",
    "cuenta.ultimoAcceso": "Last access",
    "cuenta.ultimoAccesoValor": "Today, 08:42",

    "preferencias.titulo": "Preferences",
    "preferencias.descripcion":
      "Personal settings for how you see the platform.",
    "preferencias.tema": "Theme",
    "preferencias.temaClaro": "Light",
    "preferencias.temaOscuro": "Dark",
    "preferencias.temaSistema": "Match system",
  },
  pt: {
    "descripcion":
      "Consulte os dados da sua conta e ajuste suas preferências pessoais.",
    "guardarCambios": "Salvar alterações",

    "habilitado": "Habilitado",
    "deshabilitado": "Desabilitado",

    "cuenta.titulo": "Dados da conta",
    "cuenta.descripcion":
      "Estes dados são administrados pelo responsável da sua organização. Se houver algo para corrigir, fale com quem gerencia os usuários.",
    "cuenta.email": "E-mail",
    "cuenta.alta": "Cadastro",
    "cuenta.altaValor": "12 de março de 2025",
    "cuenta.ultimoAcceso": "Último acesso",
    "cuenta.ultimoAccesoValor": "Hoje, 08:42",

    "preferencias.titulo": "Preferências",
    "preferencias.descripcion":
      "Ajustes pessoais de como você vê a plataforma.",
    "preferencias.tema": "Tema",
    "preferencias.temaClaro": "Claro",
    "preferencias.temaOscuro": "Escuro",
    "preferencias.temaSistema": "Conforme o sistema",
  },
  ca: {
    "descripcion":
      "Consulta les dades del teu compte i ajusta les teves preferències personals.",
    "guardarCambios": "Desa els canvis",

    "habilitado": "Habilitat",
    "deshabilitado": "Deshabilitat",

    "cuenta.titulo": "Dades del compte",
    "cuenta.descripcion":
      "Aquestes dades les administra el responsable de la teva organització. Si hi ha res per corregir, escriu a qui gestiona els usuaris.",
    "cuenta.email": "Correu electrònic",
    "cuenta.alta": "Alta",
    "cuenta.altaValor": "12 de març de 2025",
    "cuenta.ultimoAcceso": "Últim accés",
    "cuenta.ultimoAccesoValor": "Avui, 08:42",

    "preferencias.titulo": "Preferències",
    "preferencias.descripcion":
      "Configuració personal de com veus la plataforma.",
    "preferencias.tema": "Tema",
    "preferencias.temaClaro": "Clar",
    "preferencias.temaOscuro": "Fosc",
    "preferencias.temaSistema": "Segons el sistema",
  },
};
