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
    "centerColumn.conversacion": "Conversación",

    // ConversationPanel
    "conversationPanel.llamadaEnCurso": "Llamada en curso.",
    "conversationPanel.volverAlVivo": "Volver al vivo",
    "conversationPanel.plantillas": "Plantillas de mensajes…",
    "conversationPanel.buscarPlantilla": "Buscar plantilla…",
    "conversationPanel.adjuntar": "Adjuntar archivo",
    "conversationPanel.emoji": "Emojis",
    "conversationPanel.buscarEmoji": "Buscar emoji…",
    "conversationPanel.formato": "Formato",
    "conversationPanel.negrita": "Negrita",
    "conversationPanel.cursiva": "Cursiva",
    "conversationPanel.tachado": "Tachado",
    "conversationPanel.lista": "Lista con viñetas",
    "conversationPanel.listaNumerada": "Lista numerada",
    "conversationPanel.enlace": "Enlace",
    "conversationPanel.enlaceTexto": "Texto que se ve",
    "conversationPanel.enlaceTextoPlaceholder": "Ej: Seguí tu pedido",
    "conversationPanel.enlaceUrl": "Dirección",
    "conversationPanel.insertarEnlace": "Insertar enlace",
    "conversationPanel.quitarAdjunto": "Quitar {nombre}",
    "conversationPanel.adjuntoRechazadoTitulo": "Este archivo no se puede enviar",
    "conversationPanel.adjuntosRechazadosTitulo": "{n} archivos no se pueden enviar",
    "conversationPanel.adjuntoTipoNoSoportado": "El tipo de archivo no se puede mandar por chat.",
    "conversationPanel.adjuntoMuyGrande": "Pesa más de {mb} MB.",
    "conversationPanel.adjuntosPermitidos":
      "Se pueden mandar imágenes {imagenes} de hasta {mbImagen} MB y archivos {archivos} de hasta {mbArchivo} MB.",
    "conversationPanel.entendido": "Entendido",

    // Categorías del selector de emojis del chat
    "emojiCat.suggested": "Recientes",
    "emojiCat.smileys_people": "Caritas y personas",
    "emojiCat.animals_nature": "Animales y naturaleza",
    "emojiCat.food_drink": "Comida y bebida",
    "emojiCat.travel_places": "Viajes y lugares",
    "emojiCat.activities": "Actividades",
    "emojiCat.objects": "Objetos",
    "emojiCat.symbols": "Símbolos",
    "emojiCat.flags": "Banderas",
    "conversationPanel.enviar": "Enviar",
    "conversationPanel.placeholder": "Escribí tu respuesta… (Enter para enviar, Shift+Enter para salto de línea)",

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
    "callControls.finalizarChat": "Finalizar chat",
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
    "contextColumn.historialVacio": "Sin interacciones anteriores.",
    "contextColumn.expandirContexto": "Expandir contexto",
    "contextColumn.contexto": "Contexto",
    "contextColumn.colapsarContexto": "Colapsar contexto",
    "contextColumn.telefono": "Teléfono",
    "contextColumn.nombre": "Nombre",
    "contextColumn.campania": "Campaña",
    "contextColumn.verMas": "Ver {n} más",
    "contextColumn.verMasDetalle": "Ver más",

    // InicioPanel — pantalla de entrada al pad (sin interacción activa) y,
    // desde el menú, destino fijo que unifica lo que antes eran "Mi turno" e
    // "Historial" como solapas separadas.
    "inicio.esperando": "Esperando que el sistema te derive una interacción.",
    "inicio.noRecibiendo": "No estás recibiendo interacciones.",
    "inicio.pasarADisponible": "Pasar a Disponible",
    "inicio.simularTitulo": "Solo para probar el mock: hacer llegar una interacción",
    "inicio.simularOcupado": "No puede llegar: ya tenés una llamada, webcall o videollamada en curso.",
    "inicio.simularConChat": "con chat",
    "inicio.simularSinChat": "sin chat",
    "inicio.simularForzada": "entra directo",
    "inicio.simularNoForzada": "para atender",
    "inicio.simularNoForzadaChat": "para aceptar",
    "inicio.nuevaInteraccion": "Nueva interacción",
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
    "newInteractionDialog.externo": "Externo",
    "newInteractionDialog.interno": "Interno",
    "newInteractionDialog.descripcionInterno": "Elegí a qué agente querés llamar.",

    // LlamadaInternaDirectorio
    "llamadaInterna.buscar": "Buscar agente por nombre…",
    "llamadaInterna.llamar": "Llamar",
    "llamadaInterna.soloDisponibles": "Solo podés llamar a agentes en Disponible.",
    "llamadaInterna.sinResultados": "Ningún agente conectado coincide con la búsqueda.",
    "llamadaInterna.sinHabilitados":
      "No tenés agentes habilitados para llamadas internas. Consultá con tu administrador.",
    "llamadaInterna.simularSinReglas": "Simular grupo sin reglas",
    "llamadaInterna.simularEntrante": "Simular llamada interna entrante",
    "llamadaInterna.entrante": "Llamada interna entrante",
    "chatEntrante.titulo": "Chat entrante",
    "chatEntrante.aceptar": "Aceptar",
    "chatEntrante.rechazar": "Rechazar",
    "chatEntrante.porAceptar": "Por aceptar",
    "webcallEntrante.titulo": "Webcall entrante",
    "webcallEntrante.atender": "Atender",
    "webcallEntrante.sonando": "Sonando",
    "centerColumn.webcall": "Webcall",
    "videollamadaEntrante.titulo": "Videollamada entrante",
    "llamadaEntrante.titulo": "Llamada entrante",
    "centerColumn.video": "Video",
    "centerColumn.chat": "Chat",
    "video.compartiendo": "Estás compartiendo tu pantalla",
    "video.dejarDeCompartir": "Dejar de compartir",
    "video.tuCamara": "Vos",
    "video.enPip": "El video está en la ventana Picture-in-Picture",
    "video.volverAca": "Traerlo acá",
    "video.ventanita": "Video de la videollamada",
    "video.volverAlVideo": "Volver al video",
    "video.pantallaDe": "Pantalla de {nombre}",
    "video.volverALaPantalla": "Volver a la pantalla",
    "video.ventanitaPantalla": "Pantalla del cliente",
    "video.fijar": "Fijar en el recuadro grande: {fuente}",
    "centerColumn.pantallaCliente": "Pantalla del cliente",
    "simularComparte.titulo": "Solo para probar el mock:",
    "simularComparte.empieza": "el cliente comparte su pantalla",
    "simularComparte.termina": "el cliente deja de compartir",
    "callControls.compartirPantalla": "Compartir pantalla",
    "callControls.dejarDeCompartir": "Dejar de compartir",
    "callControls.captura": "Captura de imagen",
    "callControls.pip": "Picture-in-Picture",
    "callControls.cerrarPip": "Cerrar Picture-in-Picture",
    "llamadaInterna.atender": "Atender",
    "llamadaInterna.rechazar": "Rechazar",
    "llamadaInterna.titulo": "Llamada interna",
    "llamadaInterna.llamando": "Llamando a {nombre}…",
    "llamadaInterna.enCursoCon": "En llamada interna con {nombre}",
    "llamadaInterna.retenida": "En espera por una llamada con atención forzada.",
    "llamadaInterna.simularForzada": "Simular entrante con atención forzada",
    "llamadaInterna.simularRechazo": "Simular que el otro agente rechaza",

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
    "historial.verConversacion": "Ver conversación",
    "historial.chat": "Chat",
    "historialDetalle.bookmarks": "Bookmarks",
  },
  // Vacíos a propósito: translate() cae al fallback en español (ver
  // dictionary.ts) para cualquier clave que falte acá. Se completan cuando
  // se cierre el contenido de esta fase.
  en: {},
  pt: {},
  ca: {},
};
