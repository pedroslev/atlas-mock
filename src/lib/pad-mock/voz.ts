"use client";

import { useEffect, useRef, useState } from "react";

// Voz en el chat, con lo que ya trae el navegador (sin servicios externos):
// - Escuchar un mensaje (texto a voz): speechSynthesis.
// - Dictar la respuesta (voz a texto): SpeechRecognition (Chrome y Edge;
//   Safari con permisos; Firefox no lo tiene).
// La voz se procesa en el navegador, sin servicios externos.
// - Notas de voz (grabar un audio para mandar por chat): MediaRecorder.

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

/** Nota de voz: graba con el micrófono y devuelve el audio como adjunto. */
export function useGrabacionAudio(alTerminar: (archivo: File) => void) {
  const [soportado, setSoportado] = useState(false);
  const [grabando, setGrabando] = useState(false);
  const [error, setError] = useState<"permiso" | "fallo" | null>(null);
  const grabador = useRef<MediaRecorder | null>(null);
  const alTerminarRef = useRef(alTerminar);
  useEffect(() => {
    alTerminarRef.current = alTerminar;
  }, [alTerminar]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSoportado(typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia);
    return () => {
      if (grabador.current?.state === "recording") grabador.current.stop();
    };
  }, []);

  async function empezar() {
    setError(null);
    try {
      const flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(flujo);
      const trozos: Blob[] = [];
      rec.ondataavailable = (e) => trozos.push(e.data);
      rec.onstop = () => {
        flujo.getTracks().forEach((p) => p.stop());
        setGrabando(false);
        grabador.current = null;
        const hora = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
        alTerminarRef.current(new File(trozos, `Nota-de-voz-${hora}.webm`, { type: "audio/webm" }));
      };
      grabador.current = rec;
      rec.start();
      setGrabando(true);
    } catch (e) {
      setError(e instanceof DOMException && e.name === "NotAllowedError" ? "permiso" : "fallo");
    }
  }

  function detener() {
    if (grabador.current?.state === "recording") grabador.current.stop();
  }

  return { soportado, grabando, error, alternar: () => (grabando ? detener() : void empezar()), detener };
}

/** Audio de muestra (un tono de 3 s) para las notas de voz del cliente que
 *  trae el mock: no hay archivo real del otro lado. */
export function urlAudioDemo(): string {
  const tasa = 8000;
  const muestras = tasa * 3;
  const buf = new ArrayBuffer(44 + muestras * 2);
  const v = new DataView(buf);
  const txt = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  txt(0, "RIFF");
  v.setUint32(4, 36 + muestras * 2, true);
  txt(8, "WAVEfmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, tasa, true);
  v.setUint32(28, tasa * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  txt(36, "data");
  v.setUint32(40, muestras * 2, true);
  for (let i = 0; i < muestras; i++) v.setInt16(44 + i * 2, Math.sin((2 * Math.PI * 440 * i) / tasa) * 3000, true);
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}
