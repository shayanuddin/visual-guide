import { useCallback, useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { M, ms } from "../motion";

// Microphone input level (0…1) for the waveform. Uses a Web Audio analyser on a
// getUserMedia stream; if the mic is denied/unavailable, or with ?voice=scripted,
// it plays a speech-like scripted pattern instead. The level is a ref, read by
// the waveform every frame, so it never re-renders React.

const forcedScripted = () =>
  typeof window !== "undefined" && new URLSearchParams(window.location.search).get("voice") === "scripted";

export function useMicLevel() {
  const level = useRef(0);
  const session = useRef(0);
  const cleanup = useRef<() => void>(() => {});

  const stop = useCallback(() => {
    session.current++;
    cleanup.current();
    cleanup.current = () => {};
    level.current = 0;
  }, []);

  /** Pattern for when there is no real mic: ~120ms steps, a few silent gaps. */
  const scripted = useCallback((id: number, durationMs: number) => {
    const timers: number[] = [];
    const begin = ms(M.voiceScriptDelay);
    for (let t = begin; t < begin + durationMs; t += ms(M.waveScriptStep)) {
      timers.push(window.setTimeout(() => {
        if (session.current !== id) return;
        level.current = Math.random() < 0.18 ? 0 : 0.35 + Math.random() * 0.65;
      }, t));
    }
    timers.push(window.setTimeout(() => { if (session.current === id) level.current = 0; }, begin + durationMs));
    cleanup.current = () => timers.forEach(t => window.clearTimeout(t));
  }, []);

  const start = useCallback((scriptedDurationMs: number) => {
    stop();
    const id = session.current;
    if (forcedScripted() || !navigator.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") {
      scripted(id, scriptedDurationMs);
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      if (session.current !== id) { stream.getTracks().forEach(t => t.stop()); return; }
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / buf.length);
        // Gate room noise, then scale speech into 0…1 and smooth.
        const target = Math.min(1, Math.max(0, (rms - 0.02) * 6));
        level.current += (target - level.current) * (target > level.current ? 0.5 : 0.15);
      };
      gsap.ticker.add(tick);
      cleanup.current = () => {
        gsap.ticker.remove(tick);
        stream.getTracks().forEach(t => t.stop());
        void ctx.close();
      };
    }).catch(() => {
      if (session.current === id) scripted(id, scriptedDurationMs);
    });
  }, [stop, scripted]);

  useEffect(() => stop, [stop]);

  return useMemo(() => ({ level, start, stop }), [start, stop]);
}
