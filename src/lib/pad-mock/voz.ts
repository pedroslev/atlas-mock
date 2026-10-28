"use client";

import { useEffect, useRef, useState } from "react";

// Voz en el chat, con lo que ya trae el navegador (sin servicios externos):
// - Escuchar un mensaje (texto a voz): speechSynthesis.
// - Dictar la respuesta (voz a texto): SpeechRecognition (Chrome y Edge;
//   Safari con permisos; Firefox no lo tiene).
// Dónde se procesa la voz en el producto real (el navegador o un servicio
// externo, por los datos del cliente) queda por definir con el Architect.

type Reconocimiento = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function crearReconocimiento(): Reconocimiento | null {
  const w = window as unknown as Record<string, (new () => Reconocimiento) | undefined>;
  const Clase = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Clase ? new Clase() : null;
}

/** Dictado: lo que el asesor dice se va escribiendo después del texto que ya había. */
export function useDictado(texto: string, setTexto: (t: string) => void) {
  const [soportado, setSoportado] = useState(false);
  const [dictando, setDictando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<Reconocimiento | null>(null);
  const textoRef = useRef(texto);
  useEffect(() => {
    textoRef.current = texto;
  }, [texto]);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSoportado(!!(w.SpeechRecognition ?? w.webkitSpeechRecognition));
    return () => rec.current?.stop();
  }, []);

  function empezar() {
    const r = crearReconocimiento();
    if (!r) return;
    r.lang = "es-AR";
    r.continuous = true;
    r.interimResults = true;
    // Lo ya escrito queda fijo; lo dictado se suma a continuación.
    let base = textoRef.current && !/\s$/.test(textoRef.current) ? `${textoRef.current} ` : textoRef.current;
    r.onresult = (e) => {
      let parcial = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) base += `${res[0].transcript.trim()} `;
        else parcial += res[0].transcript;
      }
      setTexto(base + parcial);
    };
    r.onerror = (e) => {
      setError(e.error === "not-allowed" ? "permiso" : "fallo");
    };
    r.onend = () => {
      setDictando(false);
      rec.current = null;
    };
    setError(null);
    rec.current = r;
    r.start();
    setDictando(true);
  }

  function detener() {
    rec.current?.stop();
  }

  return { soportado, dictando, error, alternar: () => (dictando ? detener() : empezar()), detener };
}

/** Escuchar un mensaje: lee en voz alta un texto; uno a la vez. */
export function useLeerEnVozAlta() {
  const [leyendo, setLeyendo] = useState<number | null>(null);
  const [soportado, setSoportado] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSoportado("speechSynthesis" in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  function alternar(id: number, texto: string) {
    const s = window.speechSynthesis;
    s.cancel();
    if (leyendo === id) {
      setLeyendo(null);
      return;
    }
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-AR";
    const voz = s.getVoices().find((v) => v.lang.startsWith("es"));
    if (voz) u.voice = voz;
    u.onend = () => setLeyendo((cur) => (cur === id ? null : cur));
    u.onerror = u.onend;
    setLeyendo(id);
    s.speak(u);
  }

  return { soportado, leyendo, alternar };
}
