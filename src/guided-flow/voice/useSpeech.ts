import { useCallback, useEffect, useMemo, useRef } from "react";
import { M, ms } from "../motion";

// Live speech-to-text. Uses the Web Speech API when it is available and allowed;
// otherwise (or with ?voice=scripted) it types a scripted transcript so the
// prototype always demos.

interface RecognitionResult { isFinal: boolean; 0: { transcript: string } }
interface RecognitionEvent { resultIndex: number; results: ArrayLike<RecognitionResult> }
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionCtor = new () => Recognition;

const FALLBACK_ERRORS = new Set(["not-allowed", "service-not-allowed", "audio-capture", "network", "language-not-supported"]);

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  if (new URLSearchParams(window.location.search).get("voice") === "scripted") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface SpeechSession {
  /** Called with the full transcript so far whenever it changes. */
  onText: (text: string) => void;
  /** Transcript to type if real recognition is unavailable. */
  script: string;
}

export function useSpeech() {
  const rec = useRef<Recognition | null>(null);
  const timers = useRef<number[]>([]);
  const session = useRef<SpeechSession | null>(null);
  const text = useRef("");
  const typing = useRef(false);

  const clearTimers = () => { timers.current.forEach(t => window.clearTimeout(t)); timers.current = []; };

  const emit = (t: string) => { text.current = t; session.current?.onText(t); };

  const typeScript = useCallback(() => {
    const s = session.current;
    if (!s) return;
    rec.current?.abort();
    rec.current = null;
    typing.current = true;
    const script = s.script;
    const begin = Math.max(0, ms(M.voiceScriptDelay));
    for (let i = 1; i <= script.length; i++) {
      timers.current.push(window.setTimeout(() => {
        emit(script.slice(0, i));
        if (i === script.length) typing.current = false;
      }, begin + i * ms(M.voiceTypeChar)));
    }
  }, []);

  const start = useCallback((s: SpeechSession) => {
    session.current = s;
    text.current = "";
    clearTimers();
    const Ctor = recognitionCtor();
    if (!Ctor) { typeScript(); return; }
    try {
      const r = new Ctor();
      r.lang = "en-US";
      r.interimResults = true;
      r.continuous = true;
      r.onresult = e => {
        let t = "";
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        emit(t.trim());
      };
      r.onerror = e => { if (FALLBACK_ERRORS.has(e.error) && !text.current) typeScript(); };
      r.onend = () => { if (rec.current === r) rec.current = null; };
      rec.current = r;
      r.start();
    } catch {
      typeScript();
    }
  }, [typeScript]);

  /** Stop listening and return the final transcript. A scripted transcript is completed instantly. */
  const stop = useCallback(() => {
    clearTimers();
    // A scripted transcript that has started appearing is completed; one that
    // hasn't started yet counts as nothing heard.
    if (typing.current && session.current && text.current) emit(session.current.script);
    typing.current = false;
    rec.current?.stop();
    rec.current = null;
    const final = text.current.trim();
    session.current = null;
    return final;
  }, []);

  const cancel = useCallback(() => {
    clearTimers();
    typing.current = false;
    rec.current?.abort();
    rec.current = null;
    session.current = null;
    text.current = "";
  }, []);

  useEffect(() => cancel, [cancel]);

  return useMemo(() => ({ start, stop, cancel }), [start, stop, cancel]);
}
