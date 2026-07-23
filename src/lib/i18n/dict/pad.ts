import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Copy del PAD (Hermes): la consola del asesor. Incluye los rótulos de UI que
// viven en constantes de `lib/mock-pad.ts` (fases de la interacción, estados del
// agente, descripciones de los atajos): esas constantes guardan la CLAVE y el
// texto se resuelve con `t()` en el punto de render. Los DATOS de ejemplo del
// mock (nombres de contactos, teléfonos, nombres de marcas/clasificaciones,
// campañas) no viven acá: son datos, no interfaz.
export const pad: NamespaceDict = {
  es: {
    // Sidenav
    "nav.miEstado": "Mi estado",
    "nav.llamada": "Llamada",
    "nav.historial": "Historial",

    // Fase de la interacción activa (INTERACTION_PHASE_META)
    "fase.conectando": "Conectando",
    "fase.enVivo": "En vivo",
    "fase.enEspera": "En espera",
    "fase.posllamada": "Posllamada",

    // Estado del agente (STATUS_META)
    "estado.disponible": "Disponible",
    "estado.noDisponible": "No disponible",
    "estado.ausente": "Ausente",
    "estado.conectando": "Conectando",
    "estado.enLlamada": "En llamada",
    "estado.trabajoPosLlamada": "Trabajo pos-llamada",
    "estado.auxiliar": "Auxiliar",

    // Selector de estado
    "estado.cambiar": "Cambiar estado",
    "estado.forzadoAria": "Estado forzado: {estado}",
    "estado.selectorAria": "Estado del agente: {estado}. {accion}",
    "estado.buscarPlaceholder": "Buscar estado o auxiliar…",
    "estado.sinResultados": "No se encontró ningún estado.",
    "estado.principales": "Principales",
    "estado.auxiliares": "Auxiliares (AUX)",

    // Vista sin interacción
    "idle.listo":
      "Listo para recibir interacciones. Podés discar manualmente desde el panel de la izquierda o simular una llamada entrante del ACD.",
    "idle.noDisponible":
      "Estás en “{estado}”. Pasá a “{disponible}” para recibir llamadas del ACD, o discá manualmente.",

    // Llamada activa
    "llamada.entrante": "Llamada entrante",
    "llamada.saliente": "Llamada saliente",
    "llamada.sonando": "Sonando…",
    "llamada.conectando": "Conectando…",
    "llamada.enEspera": "En espera",
    "llamada.finalizada": "Llamada finalizada",
    "llamada.posllamadaAyuda":
      "La llamada terminó. Revisá el resultado de la gestión y cerrala cuando estés listo — el pad queda operativo mientras tanto.",
    "llamada.atender": "Atender",
    "llamada.rechazar": "Rechazar",
    "llamada.colgar": "Colgar",
    "llamada.ponerEnEspera": "Poner en espera",
    "llamada.retomar": "Retomar",
    "llamada.silenciar": "Silenciar",
    "llamada.reactivarMicrofono": "Reactivar micrófono",

    // Marcas de calidad y pins
    "marcas.titulo": "Marcas de calidad",
    "marcas.buscarPlaceholder": "Buscar marca…",
    "marcas.buscarAria": "Buscar marcas disponibles",
    "marcas.sinCoincidencias": "Ninguna marca coincide con “{q}”.",
    "pins.titulo": "Pins en esta llamada",
    "pins.buscarPlaceholder": "Buscar pin…",
    "pins.buscarAria": "Buscar pins de la llamada",
    "pins.vacioActivo":
      "Todavía no marcaste nada. Tocá una marca y queda anclada al minuto de la llamada para revisión de calidad.",
    "pins.vacioCerrado": "No marcaste nada durante esta llamada.",
    "pins.sinCoincidencias": "Ningún pin coincide con “{q}”.",

    // Resultado de la gestión (posllamada)
    "gestion.titulo": "Resultado de la gestión",
    "gestion.sinClasificaciones":
      "Esta campaña no tiene clasificaciones configuradas.",
    "gestion.elegirClasificacion": "Elegí una clasificación…",
    "gestion.clasificacionAria": "Clasificación de la gestión",
    "gestion.buscarClasificacion": "Buscar clasificación…",
    "gestion.sinResultadosClasificacion": "No se encontró ninguna clasificación.",
    "gestion.finalizar": "Finalizar gestión",
    "gestion.ayudaEnCurso":
      "Cargalo mientras hablás. Se habilita cuando termina la llamada.",
    "gestion.ayudaFaltaClasificacion":
      "Elegí una clasificación para cerrar la gestión.",
    "gestion.ayudaFinalizada": "Llamada finalizada · {duracion}",

    // Discador
    "discador.titulo": "Discado manual",
    "discador.numeroPlaceholder": "Número a discar",
    "discador.borrarDigito": "Borrar último dígito",
    "discador.digito": "Dígito {n}",
    "discador.campaniaAria": "Campaña saliente",
    "discador.llamar": "Llamar",
    "discador.simularEntrante": "Simular llamada entrante",
    "discador.simularAyuda":
      "Mock: simula una interacción entrante derivada por el ACD.",

    // Historial
    "historial.titulo": "Historial de llamadas",
    "historial.tipo": "Tipo",
    "historial.entrante": "Entrante",
    "historial.saliente": "Saliente",
    "historial.fechaHora": "Fecha y hora",
    "historial.contacto": "Contacto",
    "historial.duracion": "Duración",
    "historial.sinClasificar": "Sin clasificar",

    // Campos compartidos entre discador e historial
    "campo.campania": "Campaña",
    "campo.clasificacion": "Clasificación",
  },
  en: {
    "nav.miEstado": "My status",
    "nav.llamada": "Call",
    "nav.historial": "History",

    "fase.conectando": "Connecting",
    "fase.enVivo": "Live",
    "fase.enEspera": "On hold",
    "fase.posllamada": "After-call",

    "estado.disponible": "Available",
    "estado.noDisponible": "Not available",
    "estado.ausente": "Away",
    "estado.conectando": "Connecting",
    "estado.enLlamada": "On a call",
    "estado.trabajoPosLlamada": "After-call work",
    "estado.auxiliar": "Auxiliary",

    "estado.cambiar": "Change status",
    "estado.forzadoAria": "Forced status: {estado}",
    "estado.selectorAria": "Agent status: {estado}. {accion}",
    "estado.buscarPlaceholder": "Search status or auxiliary…",
    "estado.sinResultados": "No status found.",
    "estado.principales": "Main",
    "estado.auxiliares": "Auxiliary (AUX)",

    "idle.listo":
      "Ready to receive interactions. You can dial manually from the panel on the left or simulate an inbound call from the ACD.",
    "idle.noDisponible":
      "You are in “{estado}”. Switch to “{disponible}” to receive ACD calls, or dial manually.",

    "llamada.entrante": "Inbound call",
    "llamada.saliente": "Outbound call",
    "llamada.sonando": "Ringing…",
    "llamada.conectando": "Connecting…",
    "llamada.enEspera": "On hold",
    "llamada.finalizada": "Call ended",
    "llamada.posllamadaAyuda":
      "The call has ended. Review the interaction outcome and close it when you are ready — the pad stays operational in the meantime.",
    "llamada.atender": "Answer",
    "llamada.rechazar": "Reject",
    "llamada.colgar": "Hang up",
    "llamada.ponerEnEspera": "Hold",
    "llamada.retomar": "Resume",
    "llamada.silenciar": "Mute",
    "llamada.reactivarMicrofono": "Unmute",

    "marcas.titulo": "Quality marks",
    "marcas.buscarPlaceholder": "Search mark…",
    "marcas.buscarAria": "Search available marks",
    "marcas.sinCoincidencias": "No mark matches “{q}”.",
    "pins.titulo": "Pins on this call",
    "pins.buscarPlaceholder": "Search pin…",
    "pins.buscarAria": "Search call pins",
    "pins.vacioActivo":
      "You haven't marked anything yet. Tap a mark and it stays anchored to the call time for quality review.",
    "pins.vacioCerrado": "You didn't mark anything during this call.",
    "pins.sinCoincidencias": "No pin matches “{q}”.",

    "gestion.titulo": "Interaction outcome",
    "gestion.sinClasificaciones":
      "This campaign has no classifications configured.",
    "gestion.elegirClasificacion": "Choose a classification…",
    "gestion.clasificacionAria": "Interaction classification",
    "gestion.buscarClasificacion": "Search classification…",
    "gestion.sinResultadosClasificacion": "No classification found.",
    "gestion.finalizar": "Finish interaction",
    "gestion.ayudaEnCurso":
      "Fill it in while you talk. It becomes available when the call ends.",
    "gestion.ayudaFaltaClasificacion":
      "Choose a classification to close the interaction.",
    "gestion.ayudaFinalizada": "Call ended · {duracion}",

    "discador.titulo": "Manual dialing",
    "discador.numeroPlaceholder": "Number to dial",
    "discador.borrarDigito": "Delete last digit",
    "discador.digito": "Digit {n}",
    "discador.campaniaAria": "Outbound campaign",
    "discador.llamar": "Call",
    "discador.simularEntrante": "Simulate inbound call",
    "discador.simularAyuda":
      "Mock: simulates an inbound interaction routed by the ACD.",

    "historial.titulo": "Call history",
    "historial.tipo": "Type",
    "historial.entrante": "Inbound",
    "historial.saliente": "Outbound",
    "historial.fechaHora": "Date and time",
    "historial.contacto": "Contact",
    "historial.duracion": "Duration",
    "historial.sinClasificar": "Unclassified",

    "campo.campania": "Campaign",
    "campo.clasificacion": "Classification",
  },
  pt: {
    "nav.miEstado": "Meu status",
    "nav.llamada": "Chamada",
    "nav.historial": "Histórico",

    "fase.conectando": "Conectando",
    "fase.enVivo": "Ao vivo",
    "fase.enEspera": "Em espera",
    "fase.posllamada": "Pós-chamada",

    "estado.disponible": "Disponível",
    "estado.noDisponible": "Indisponível",
    "estado.ausente": "Ausente",
    "estado.conectando": "Conectando",
    "estado.enLlamada": "Em chamada",
    "estado.trabajoPosLlamada": "Trabalho pós-chamada",
    "estado.auxiliar": "Auxiliar",

    "estado.cambiar": "Alterar status",
    "estado.forzadoAria": "Status forçado: {estado}",
    "estado.selectorAria": "Status do agente: {estado}. {accion}",
    "estado.buscarPlaceholder": "Pesquisar status ou auxiliar…",
    "estado.sinResultados": "Nenhum status encontrado.",
    "estado.principales": "Principais",
    "estado.auxiliares": "Auxiliares (AUX)",

    "idle.listo":
      "Pronto para receber interações. Você pode discar manualmente pelo painel à esquerda ou simular uma chamada recebida do ACD.",
    "idle.noDisponible":
      "Você está em “{estado}”. Mude para “{disponible}” para receber chamadas do ACD, ou disque manualmente.",

    "llamada.entrante": "Chamada recebida",
    "llamada.saliente": "Chamada realizada",
    "llamada.sonando": "Tocando…",
    "llamada.conectando": "Conectando…",
    "llamada.enEspera": "Em espera",
    "llamada.finalizada": "Chamada finalizada",
    "llamada.posllamadaAyuda":
      "A chamada terminou. Revise o resultado do atendimento e feche-o quando estiver pronto — o pad continua operacional enquanto isso.",
    "llamada.atender": "Atender",
    "llamada.rechazar": "Rejeitar",
    "llamada.colgar": "Desligar",
    "llamada.ponerEnEspera": "Colocar em espera",
    "llamada.retomar": "Retomar",
    "llamada.silenciar": "Silenciar",
    "llamada.reactivarMicrofono": "Reativar microfone",

    "marcas.titulo": "Marcas de qualidade",
    "marcas.buscarPlaceholder": "Pesquisar marca…",
    "marcas.buscarAria": "Pesquisar marcas disponíveis",
    "marcas.sinCoincidencias": "Nenhuma marca corresponde a “{q}”.",
    "pins.titulo": "Pins nesta chamada",
    "pins.buscarPlaceholder": "Pesquisar pin…",
    "pins.buscarAria": "Pesquisar pins da chamada",
    "pins.vacioActivo":
      "Você ainda não marcou nada. Toque em uma marca e ela fica ancorada ao minuto da chamada para revisão de qualidade.",
    "pins.vacioCerrado": "Você não marcou nada durante esta chamada.",
    "pins.sinCoincidencias": "Nenhum pin corresponde a “{q}”.",

    "gestion.titulo": "Resultado do atendimento",
    "gestion.sinClasificaciones":
      "Esta campanha não tem classificações configuradas.",
    "gestion.elegirClasificacion": "Escolha uma classificação…",
    "gestion.clasificacionAria": "Classificação do atendimento",
    "gestion.buscarClasificacion": "Pesquisar classificação…",
    "gestion.sinResultadosClasificacion": "Nenhuma classificação encontrada.",
    "gestion.finalizar": "Finalizar atendimento",
    "gestion.ayudaEnCurso":
      "Preencha enquanto fala. Fica habilitado quando a chamada termina.",
    "gestion.ayudaFaltaClasificacion":
      "Escolha uma classificação para fechar o atendimento.",
    "gestion.ayudaFinalizada": "Chamada finalizada · {duracion}",

    "discador.titulo": "Discagem manual",
    "discador.numeroPlaceholder": "Número para discar",
    "discador.borrarDigito": "Apagar último dígito",
    "discador.digito": "Dígito {n}",
    "discador.campaniaAria": "Campanha de saída",
    "discador.llamar": "Ligar",
    "discador.simularEntrante": "Simular chamada recebida",
    "discador.simularAyuda":
      "Mock: simula uma interação recebida encaminhada pelo ACD.",

    "historial.titulo": "Histórico de chamadas",
    "historial.tipo": "Tipo",
    "historial.entrante": "Recebida",
    "historial.saliente": "Realizada",
    "historial.fechaHora": "Data e hora",
    "historial.contacto": "Contato",
    "historial.duracion": "Duração",
    "historial.sinClasificar": "Sem classificação",

    "campo.campania": "Campanha",
    "campo.clasificacion": "Classificação",
  },
  ca: {
    "nav.miEstado": "El meu estat",
    "nav.llamada": "Trucada",
    "nav.historial": "Historial",

    "fase.conectando": "Connectant",
    "fase.enVivo": "En directe",
    "fase.enEspera": "En espera",
    "fase.posllamada": "Postrucada",

    "estado.disponible": "Disponible",
    "estado.noDisponible": "No disponible",
    "estado.ausente": "Absent",
    "estado.conectando": "Connectant",
    "estado.enLlamada": "En trucada",
    "estado.trabajoPosLlamada": "Feina postrucada",
    "estado.auxiliar": "Auxiliar",

    "estado.cambiar": "Canvia l'estat",
    "estado.forzadoAria": "Estat forçat: {estado}",
    "estado.selectorAria": "Estat de l'agent: {estado}. {accion}",
    "estado.buscarPlaceholder": "Cerca un estat o auxiliar…",
    "estado.sinResultados": "No s'ha trobat cap estat.",
    "estado.principales": "Principals",
    "estado.auxiliares": "Auxiliars (AUX)",

    "idle.listo":
      "A punt per rebre interaccions. Pots marcar manualment des del plafó de l'esquerra o simular una trucada entrant de l'ACD.",
    "idle.noDisponible":
      "Estàs en “{estado}”. Passa a “{disponible}” per rebre trucades de l'ACD, o marca manualment.",

    "llamada.entrante": "Trucada entrant",
    "llamada.saliente": "Trucada sortint",
    "llamada.sonando": "Sonant…",
    "llamada.conectando": "Connectant…",
    "llamada.enEspera": "En espera",
    "llamada.finalizada": "Trucada finalitzada",
    "llamada.posllamadaAyuda":
      "La trucada ha acabat. Revisa el resultat de la gestió i tanca-la quan estiguis a punt: mentrestant el pad continua operatiu.",
    "llamada.atender": "Atén",
    "llamada.rechazar": "Rebutja",
    "llamada.colgar": "Penja",
    "llamada.ponerEnEspera": "Posa en espera",
    "llamada.retomar": "Reprèn",
    "llamada.silenciar": "Silencia",
    "llamada.reactivarMicrofono": "Reactiva el micròfon",

    "marcas.titulo": "Marques de qualitat",
    "marcas.buscarPlaceholder": "Cerca una marca…",
    "marcas.buscarAria": "Cerca marques disponibles",
    "marcas.sinCoincidencias": "Cap marca no coincideix amb “{q}”.",
    "pins.titulo": "Pins d'aquesta trucada",
    "pins.buscarPlaceholder": "Cerca un pin…",
    "pins.buscarAria": "Cerca pins de la trucada",
    "pins.vacioActivo":
      "Encara no has marcat res. Toca una marca i queda ancorada al minut de la trucada per a la revisió de qualitat.",
    "pins.vacioCerrado": "No has marcat res durant aquesta trucada.",
    "pins.sinCoincidencias": "Cap pin no coincideix amb “{q}”.",

    "gestion.titulo": "Resultat de la gestió",
    "gestion.sinClasificaciones":
      "Aquesta campanya no té classificacions configurades.",
    "gestion.elegirClasificacion": "Tria una classificació…",
    "gestion.clasificacionAria": "Classificació de la gestió",
    "gestion.buscarClasificacion": "Cerca una classificació…",
    "gestion.sinResultadosClasificacion": "No s'ha trobat cap classificació.",
    "gestion.finalizar": "Finalitza la gestió",
    "gestion.ayudaEnCurso":
      "Omple-ho mentre parles. S'habilita quan acaba la trucada.",
    "gestion.ayudaFaltaClasificacion":
      "Tria una classificació per tancar la gestió.",
    "gestion.ayudaFinalizada": "Trucada finalitzada · {duracion}",

    "discador.titulo": "Marcatge manual",
    "discador.numeroPlaceholder": "Número a marcar",
    "discador.borrarDigito": "Esborra l'últim dígit",
    "discador.digito": "Dígit {n}",
    "discador.campaniaAria": "Campanya sortint",
    "discador.llamar": "Truca",
    "discador.simularEntrante": "Simula una trucada entrant",
    "discador.simularAyuda":
      "Mock: simula una interacció entrant derivada per l'ACD.",

    "historial.titulo": "Historial de trucades",
    "historial.tipo": "Tipus",
    "historial.entrante": "Entrant",
    "historial.saliente": "Sortint",
    "historial.fechaHora": "Data i hora",
    "historial.contacto": "Contacte",
    "historial.duracion": "Durada",
    "historial.sinClasificar": "Sense classificar",

    "campo.campania": "Campanya",
    "campo.clasificacion": "Classificació",
  },
};
