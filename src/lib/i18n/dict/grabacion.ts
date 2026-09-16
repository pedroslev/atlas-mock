import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Grabación: se configura igual en la campaña y en el grupo de trabajo, así
// que los textos viven en su propio diccionario y no duplicados en cada uno.
export const grabacion: NamespaceDict = {
  es: {
    "audioTitulo": "Grabación de audio",
    "pantallaTitulo": "Grabación de pantalla",
    "pantallaDesc":
      "La pantalla se graba aparte del audio, y se activa por separado.",
    "pantalla": "Grabar la pantalla",
    "pantallaToggleDesc":
      "Graba lo que el agente ve y hace en su pantalla mientras trabaja.",
    "alcanceTitulo": "¿Hasta cuándo se graba la pantalla?",
    "alcanceInteraccion": "Solo durante las interacciones",
    "alcanceInteraccionDesc":
      "Se graba mientras hay una llamada y durante el trabajo posterior. Es lo que hacen las plataformas del mercado.",
    "alcanceSesion": "Toda la sesión del agente",
    "alcanceSesionDesc":
      "Se graba desde que el agente se conecta hasta que se desconecta, haya llamada o no.",
    "alcanceSesionAviso":
      "A validar: ninguna plataforma del mercado graba la pantalla fuera de las interacciones. Grabar el turno completo exige aviso previo al agente y una evaluación de impacto, y las autoridades de protección de datos consideran desproporcionado grabar durante las pausas.",
    "descCampania":
      "Qué se graba en esta campaña, y en qué momentos.",
    "descGrupo":
      "Qué se graba cuando atiende un agente de este grupo, y en qué momentos.",


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
    "audioTitulo": "Audio recording",
    "pantallaTitulo": "Screen recording",
    "pantallaDesc": "The screen is recorded separately from the audio, and is turned on separately.",
    "pantalla": "Record the screen",
    "pantallaToggleDesc": "Records what the agent sees and does on screen while working.",
    "alcanceTitulo": "How long is the screen recorded?",
    "alcanceInteraccion": "Only during interactions",
    "alcanceInteraccionDesc":
      "Records while there's a call and during after-call work. This is what platforms on the market do.",
    "alcanceSesion": "The agent's whole session",
    "alcanceSesionDesc":
      "Records from the moment the agent logs in until they log out, call or no call.",
    "alcanceSesionAviso":
      "To be validated: no platform on the market records the screen outside interactions. Recording a full shift requires prior notice to the agent and an impact assessment, and data protection authorities consider recording during breaks disproportionate.",
    "descCampania": "What gets recorded in this campaign, and at which moments.",
    "descGrupo":
      "What gets recorded when an agent from this group handles the call, and at which moments.",


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
    "audioTitulo": "Gravação de áudio",
    "pantallaTitulo": "Gravação de tela",
    "pantallaDesc": "A tela é gravada à parte do áudio e é ativada separadamente.",
    "pantalla": "Gravar a tela",
    "pantallaToggleDesc": "Grava o que o agente vê e faz na tela enquanto trabalha.",
    "alcanceTitulo": "Até quando se grava a tela?",
    "alcanceInteraccion": "Apenas durante as interações",
    "alcanceInteraccionDesc":
      "Grava enquanto há uma chamada e durante o trabalho posterior. É o que fazem as plataformas do mercado.",
    "alcanceSesion": "Toda a sessão do agente",
    "alcanceSesionDesc":
      "Grava desde que o agente se conecta até se desconectar, haja chamada ou não.",
    "alcanceSesionAviso":
      "A validar: nenhuma plataforma do mercado grava a tela fora das interações. Gravar o turno completo exige aviso prévio ao agente e uma avaliação de impacto, e as autoridades de proteção de dados consideram desproporcional gravar durante as pausas.",
    "descCampania": "O que se grava nesta campanha, e em que momentos.",
    "descGrupo":
      "O que se grava quando atende um agente deste grupo, e em que momentos.",


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
    "audioTitulo": "Gravació d'àudio",
    "pantallaTitulo": "Gravació de pantalla",
    "pantallaDesc": "La pantalla es grava a part de l'àudio, i s'activa per separat.",
    "pantalla": "Gravar la pantalla",
    "pantallaToggleDesc": "Grava el que l'agent veu i fa a la pantalla mentre treballa.",
    "alcanceTitulo": "Fins quan es grava la pantalla?",
    "alcanceInteraccion": "Només durant les interaccions",
    "alcanceInteraccionDesc":
      "Es grava mentre hi ha una trucada i durant la feina posterior. És el que fan les plataformes del mercat.",
    "alcanceSesion": "Tota la sessió de l'agent",
    "alcanceSesionDesc":
      "Es grava des que l'agent es connecta fins que es desconnecta, hi hagi trucada o no.",
    "alcanceSesionAviso":
      "A validar: cap plataforma del mercat grava la pantalla fora de les interaccions. Gravar el torn complet exigeix avís previ a l'agent i una avaluació d'impacte, i les autoritats de protecció de dades consideren desproporcionat gravar durant les pauses.",
    "descCampania": "Què es grava en aquesta campanya, i en quins moments.",
    "descGrupo":
      "Què es grava quan atén un agent d'aquest grup, i en quins moments.",


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
