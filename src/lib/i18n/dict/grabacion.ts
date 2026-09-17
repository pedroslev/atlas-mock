import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Grabación: se configura igual en la campaña y en el grupo de trabajo, así
// que los textos viven en su propio diccionario y no duplicados en cada uno.
export const grabacion: NamespaceDict = {
  es: {
    "titulo": "Grabación",
    "descCampania": "Qué se graba en esta campaña, y en qué momentos.",
    "descGrupo":
      "Qué se graba cuando atiende un agente de este grupo, y en qué momentos.",

    "queTitulo": "¿Qué se graba?",
    "audio": "Audio",
    "audioDesc": "La conversación entre el agente y el cliente.",
    "pantalla": "Pantalla",
    "pantallaDesc": "Lo que el agente ve y hace en su pantalla.",

    "cuandoTitulo": "¿En qué momentos?",
    "momentoConversacion": "La conversación",
    "momentoConversacionDesc": "Siempre: es el momento que se graba por defecto.",
    "no": "No",
    "sinGrabacion": "No hay nada para grabar: activá audio o pantalla.",

    "hold": "La espera",
    "holdDesc": "Sigue grabando mientras la llamada está en espera (hold).",
    "acw": "El trabajo posterior",
    "acwDesc":
      "Graba el tiempo posterior a la llamada, mientras el agente tipifica la gestión (ACW).",


    "dependeHold":
      "Se habilita si la campaña permite poner la llamada en espera.",

    "reglaDesdeCampania":
      "Entre la campaña y el grupo de trabajo gana lo más restrictivo: si el grupo que atiende tiene algo apagado, eso no se graba aunque acá esté encendido.",
    "reglaDesdeGrupo":
      "Entre la campaña y el grupo de trabajo gana lo más restrictivo: si la campaña tiene algo apagado, eso no se graba aunque acá esté encendido.",
  },
  en: {
    "titulo": "Recording",
    "descCampania": "What gets recorded in this campaign, and at which moments.",
    "descGrupo":
      "What gets recorded when an agent from this group handles the call, and at which moments.",

    "queTitulo": "What gets recorded?",
    "audio": "Audio",
    "audioDesc": "The conversation between agent and customer.",
    "pantalla": "Screen",
    "pantallaDesc": "What the agent sees and does on screen.",

    "cuandoTitulo": "At which moments?",
    "momentoConversacion": "The conversation",
    "momentoConversacionDesc": "Always: this is the moment recorded by default.",
    "no": "No",
    "sinGrabacion": "Nothing to record: turn on audio or screen.",

    "hold": "The hold",
    "holdDesc": "Keeps recording while the call is on hold.",
    "acw": "The after-call work",
    "acwDesc":
      "Records the time after the call, while the agent classifies the interaction (ACW).",


    "dependeHold": "Enabled if the campaign allows putting calls on hold.",

    "reglaDesdeCampania":
      "Between the campaign and the working group, the most restrictive one wins: if the group handling the call has something off, that isn't recorded even if it's on here.",
    "reglaDesdeGrupo":
      "Between the campaign and the working group, the most restrictive one wins: if the campaign has something off, that isn't recorded even if it's on here.",
  },
  pt: {
    "titulo": "Gravação",
    "descCampania": "O que se grava nesta campanha, e em que momentos.",
    "descGrupo":
      "O que se grava quando atende um agente deste grupo, e em que momentos.",

    "queTitulo": "O que se grava?",
    "audio": "Áudio",
    "audioDesc": "A conversa entre o agente e o cliente.",
    "pantalla": "Tela",
    "pantallaDesc": "O que o agente vê e faz na sua tela.",

    "cuandoTitulo": "Em que momentos?",
    "momentoConversacion": "A conversa",
    "momentoConversacionDesc": "Sempre: é o momento gravado por padrão.",
    "no": "Não",
    "sinGrabacion": "Não há nada para gravar: ative áudio ou tela.",

    "hold": "A espera",
    "holdDesc": "Continua gravando enquanto a chamada está em espera (hold).",
    "acw": "O trabalho posterior",
    "acwDesc":
      "Grava o período posterior à chamada, enquanto o agente tipifica o atendimento (ACW).",


    "dependeHold":
      "É habilitado se a campanha permitir colocar a chamada em espera.",

    "reglaDesdeCampania":
      "Entre a campanha e o grupo de trabalho vence o mais restritivo: se o grupo que atende tiver algo desligado, isso não é gravado mesmo que aqui esteja ligado.",
    "reglaDesdeGrupo":
      "Entre a campanha e o grupo de trabalho vence o mais restritivo: se a campanha tiver algo desligado, isso não é gravado mesmo que aqui esteja ligado.",
  },
  ca: {
    "titulo": "Gravació",
    "descCampania": "Què es grava en aquesta campanya, i en quins moments.",
    "descGrupo":
      "Què es grava quan atén un agent d'aquest grup, i en quins moments.",

    "queTitulo": "Què es grava?",
    "audio": "Àudio",
    "audioDesc": "La conversa entre l'agent i el client.",
    "pantalla": "Pantalla",
    "pantallaDesc": "El que l'agent veu i fa a la seva pantalla.",

    "cuandoTitulo": "En quins moments?",
    "momentoConversacion": "La conversa",
    "momentoConversacionDesc": "Sempre: és el moment que es grava per defecte.",
    "no": "No",
    "sinGrabacion": "No hi ha res per gravar: activa àudio o pantalla.",

    "hold": "L'espera",
    "holdDesc": "Continua gravant mentre la trucada està en espera (hold).",
    "acw": "La feina posterior",
    "acwDesc":
      "Grava el temps posterior a la trucada, mentre l'agent tipifica la gestió (ACW).",


    "dependeHold":
      "S'habilita si la campanya permet posar la trucada en espera.",

    "reglaDesdeCampania":
      "Entre la campanya i el grup de treball guanya el més restrictiu: si el grup que atén té alguna cosa apagada, això no es grava encara que aquí estigui encès.",
    "reglaDesdeGrupo":
      "Entre la campanya i el grup de treball guanya el més restrictiu: si la campanya té alguna cosa apagada, això no es grava encara que aquí estigui encès.",
  },
};
