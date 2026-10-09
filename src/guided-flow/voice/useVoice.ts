import { useCallback, useEffect, useRef, useState } from "react";
import { M, ms } from "../motion";
import { useSpeech } from "./useSpeech";
import { useMicLevel } from "./useMicLevel";

interface Options {
  /** Transcript the scripted fallback produces for the current step. */
  script: () => string;
  onSend: (transcript: string) => void;
  announce: (message: string) => void;
}

// Voice session: idle → listening → (✓) collapse → send, or shake if nothing was
// heard. Escape/Close/Reset cancel: collapse without sending. Speech recognition
// builds the transcript in the background; it is never shown on screen.
export function useVoice({ script, onSend, announce }: Options) {
  const [listening, setListening] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const speech = useSpeech();
  const mic = useMicLevel();
  const collapsing = useRef(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = useCallback(() => {
    const text = script();
    setListening(true);
    announce("Listening");
    speech.start({ script: text, onText: () => {} });
    // Scripted level pattern runs at least 2.5s so the wave has time to show off
    mic.start(Math.max(2500, text.length * ms(M.voiceTypeChar)));
  }, [script, announce, speech, mic]);

  const collapse = useCallback((then?: () => void) => {
    mic.stop();
    setListening(false);
    collapsing.current = true;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { collapsing.current = false; then?.(); }, ms(M.micCollapse));
  }, [mic]);

  const finish = useCallback(() => {
    const transcript = speech.stop();
    collapse(() => {
      if (!transcript) { setShakeKey(k => k + 1); return; }
      announce("Sent to assistant");
      onSend(transcript);
    });
  }, [speech, collapse, announce, onSend]);

  const cancel = useCallback(() => {
    if (!listening) return;
    speech.cancel();
    collapse();
  }, [listening, speech, collapse]);

  const toggle = useCallback(() => {
    if (collapsing.current) return;
    if (listening) finish(); else start();
  }, [listening, start, finish]);

  return {
    listening,
    level: mic.level,
    shakeKey,
    label: listening ? "Done speaking, send" : "Speak to assistant",
    toggle,
    cancel,
  };
}
