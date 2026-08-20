import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Copy de /pad-mock (wireframe conceptual del pad omnicanal — ver
// src/lib/pad-mock/data.ts). A pedido: "que todo respete el idioma que se
// coloca" — hasta ahora pad-mock tenía todo el texto hardcodeado en
// español, desacoplado del selector de idioma real (LanguageMenu, ya
// presente en el navbar que este mock reusa de pad-header.tsx). Acá solo
// van las claves de INTERFAZ (labels, botones, tooltips, placeholders,
// encabezados). Los DATOS de ejemplo (nombres de campañas, clientes,
// tipificaciones, marcas, mensajes) siguen viviendo sin traducir en
// data.ts — mismo criterio que campanias.ts en Olimpo: son datos de un
// tenant de prueba, no interfaz.
//
// Solo ES por ahora (como en campanias.ts/grupos.ts): el resto de los
// idiomas cae al fallback en español ya definido en dictionary.ts, se
// completa cuando se cierre el contenido de esta fase.
export const padMock: NamespaceDict = {
  es: {
    // LeftNav
    "leftNav.expandirMenu": "Expandir menú",
    "leftNav.miEstado": "Mi estado",
    "leftNav.contraerMenu": "Contraer menú",
    "leftNav.interaccionesEnCurso": "Interacciones en curso",
    "leftNav.iniciarInteraccion": "Iniciar nueva interacción",
    "leftNav.sinInteracciones": "Sin interacciones en curso.",
    "leftNav.accesosRapidos": "Accesos rápidos",
    "leftNav.inicio": "Inicio",

    // CenterColumn
    "centerColumn.llamada": "Llamada",

    // ConversationPanel
    "conversationPanel.llamadaEnCurso": "Llamada en curso.",

    // InteractionControls (call-controls.tsx)
    "callControls.buscarTipificacion": "Buscar tipificación…",
    "callControls.sinResultados": "Sin resultados.",
    "callControls.tipificacionPlaceholder": "Tipificación…",
    "callControls.espera": "Espera",
    "callControls.retomar": "Retomar",
    "callControls.reactivar": "Reactivar",
    "callControls.silenciar": "Silenciar",
    "callControls.tecladoNumerico": "Teclado numérico",
    "callControls.marcar": "Marcar",
    "callControls.cerrarInteraccion": "Cerrar interacción",
    "callControls.cortar": "Cortar",
    "callControls.enviarTonos": "Enviar tonos (DTMF)",
    "callControls.sinDigitos": "Sin dígitos",
    "callControls.borrar": "Borrar",
    "callControls.marcarEstaInteraccion": "Marcar esta interacción",
    "callControls.buscarMarca": "Buscar marca…",
    "callControls.comentarioPlaceholder": "Agregar un comentario (opcional)…",
    "callControls.agregarMarca": "Agregar marca",

    // ContextColumn
    "contextColumn.cliente": "Cliente",
    "contextColumn.historial": "Historial",
    "contextColumn.expandirContexto": "Expandir contexto",
    "contextColumn.contexto": "Contexto",
    "contextColumn.colapsarContexto": "Colapsar contexto",
    "contextColumn.numeroCliente": "N° cliente",
    "contextColumn.nombre": "Nombre",
    "contextColumn.telefono": "Teléfono",
    "contextColumn.verMas": "Ver {n} más",
    "contextColumn.verMasDetalle": "Ver más",

    // InicioPanel — pantalla de entrada al pad (sin interacción activa) y,
    // desde el menú, destino fijo que unifica lo que antes eran "Mi turno" e
    // "Historial" como solapas separadas.
    "inicio.esperando": "Esperando que el sistema te derive una interacción.",
    "inicio.noRecibiendo": "No estás recibiendo interacciones.",
    "inicio.pasarADisponible": "Pasar a Disponible",
    "inicio.nuevaInteraccion": "Nueva interacción saliente",
    "inicio.campanias": "Campañas",
    "inicio.historial": "Historial",
    "inicio.colCanal": "Canal",
    "inicio.colFecha": "Fecha y hora",
    "inicio.colCliente": "Cliente",
    "inicio.colDuracion": "Duración",
    "inicio.colTipificacion": "Tipificación",

    // NuevaInteraccionForm
    "nuevaInteraccion.campania": "Campaña",
    "nuevaInteraccion.cuenta": "Cuenta",
    "nuevaInteraccion.numero": "Número",
    "nuevaInteraccion.elegirCampania": "Elegir campaña…",
    "nuevaInteraccion.elegirCuenta": "Elegir cuenta…",
    "nuevaInteraccion.numeroPlaceholderSms": "Número o contacto…",
    "nuevaInteraccion.numeroPlaceholderDefault": "+54 11 xxxx-xxxx",
    "nuevaInteraccion.contactar": "Contactar",

    // NewInteractionDialog
    "newInteractionDialog.titulo": "Nueva interacción",
    "newInteractionDialog.descripcion": "Elegí la campaña y la cuenta por la que vas a contactar.",

    // QuickAccessOverlay
    "quickAccess.cerrar": "Cerrar",

    // ExternalPagePanel
    "externalPage.embebido": "Embebido",
    "externalPage.abrirPestana": "Abrir en otra pestaña",

    // AgentStatusSelectorMock
    "agentStatus.principales": "Principales",
    "agentStatus.auxiliares": "Auxiliares",

    // HistorialDetailDialog
    "historialDetalle.tipificacion": "Tipificación",
    "historialDetalle.bookmarks": "Bookmarks",
  },
  // Vacíos a propósito: translate() cae al fallback en español (ver
  // dictionary.ts) para cualquier clave que falte acá. Se completan cuando
  // se cierre el contenido de esta fase.
  en: {},
  pt: {},
  ca: {},
};
