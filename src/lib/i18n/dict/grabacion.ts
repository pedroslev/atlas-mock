import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Grabación: se configura igual en la campaña y en el grupo de trabajo, así
// que los textos viven en su propio diccionario y no duplicados en cada uno.
export const grabacion: NamespaceDict = {
  es: {
    "titulo": "Grabación",
    "descCampania":
      "Qué se graba en esta campaña, y en qué momentos.",
    "descGrupo":
      "Qué se graba cuando atiende un agente de este grupo, y en qué momentos.",

    "modoInteraccion": "Solo las interacciones",
    "modoInteraccionDesc":
      "Se graba cuando hay una llamada. Entre llamada y llamada no se graba nada.",
    "modoSesion": "Toda la sesión del agente",
    "modoSesionDesc":
      "Se graba desde que el agente se conecta hasta que se desconecta, haya llamada o no.",
    "incluidoEnSesion": "Incluido: se graba toda la sesión del agente.",

    "interaccion": "Grabar la interacción",
    "interaccionDesc":
      "Graba la conversación entre el agente y el cliente. Si está apagado no se graba nada.",
    "hold": "Grabar durante la espera",
    "holdDesc":
      "Sigue grabando mientras la llamada está en espera (hold).",
    "acw": "Grabar el trabajo posterior",
    "acwDesc":
      "Graba el tiempo posterior a la llamada, mientras el agente tipifica la gestión (ACW).",

    "dependeInteraccion": "Se habilita al activar «Grabar la interacción».",
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

    "modoInteraccion": "Interactions only",
    "modoInteraccionDesc":
      "Records while there's a call. Between calls nothing is recorded.",
    "modoSesion": "The agent's whole session",
    "modoSesionDesc":
      "Records from the moment the agent logs in until they log out, call or no call.",
    "incluidoEnSesion": "Included: the agent's whole session is recorded.",

    "interaccion": "Record the interaction",
    "interaccionDesc":
      "Records the conversation between agent and customer. With this off, nothing is recorded.",
    "hold": "Record while on hold",
    "holdDesc": "Keeps recording while the call is on hold.",
    "acw": "Record after-call work",
    "acwDesc":
      "Records the time after the call, while the agent classifies the interaction (ACW).",

    "dependeInteraccion": "Enabled by turning on “Record the interaction”.",
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

    "modoInteraccion": "Apenas as interações",
    "modoInteraccionDesc":
      "Grava quando há uma chamada. Entre uma chamada e outra não grava nada.",
    "modoSesion": "Toda a sessão do agente",
    "modoSesionDesc":
      "Grava desde que o agente se conecta até se desconectar, haja chamada ou não.",
    "incluidoEnSesion": "Incluído: grava-se toda a sessão do agente.",

    "interaccion": "Gravar a interação",
    "interaccionDesc":
      "Grava a conversa entre o agente e o cliente. Se estiver desligado, nada é gravado.",
    "hold": "Gravar durante a espera",
    "holdDesc": "Continua gravando enquanto a chamada está em espera (hold).",
    "acw": "Gravar o trabalho posterior",
    "acwDesc":
      "Grava o período posterior à chamada, enquanto o agente tipifica o atendimento (ACW).",

    "dependeInteraccion": "É habilitado ao ativar “Gravar a interação”.",
    "dependeHold": "É habilitado se a campanha permitir colocar a chamada em espera.",

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

    "modoInteraccion": "Només les interaccions",
    "modoInteraccionDesc":
      "Es grava quan hi ha una trucada. Entre trucada i trucada no es grava res.",
    "modoSesion": "Tota la sessió de l'agent",
    "modoSesionDesc":
      "Es grava des que l'agent es connecta fins que es desconnecta, hi hagi trucada o no.",
    "incluidoEnSesion": "Inclòs: es grava tota la sessió de l'agent.",

    "interaccion": "Gravar la interacció",
    "interaccionDesc":
      "Grava la conversa entre l'agent i el client. Si està apagat no es grava res.",
    "hold": "Gravar durant l'espera",
    "holdDesc": "Continua gravant mentre la trucada està en espera (hold).",
    "acw": "Gravar la feina posterior",
    "acwDesc":
      "Grava el temps posterior a la trucada, mentre l'agent tipifica la gestió (ACW).",

    "dependeInteraccion": "S'habilita en activar «Gravar la interacció».",
    "dependeHold": "S'habilita si la campanya permet posar la trucada en espera.",

    "reglaDesdeCampania":
      "Entre la campanya i el grup de treball guanya el més restrictiu: si el grup que atén té alguna cosa apagada, això no es grava encara que aquí estigui encès.",
    "reglaDesdeGrupo":
      "Entre la campanya i el grup de treball guanya el més restrictiu: si la campanya té alguna cosa apagada, això no es grava encara que aquí estigui encès.",
  },
};
