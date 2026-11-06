import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import "./guided-flow.css";
import { M } from "./motion";
import type { FlowCommand, FlowConfig, GuideScene, StepApi } from "./flows/types";
import BrandBackdrop from "./BrandBackdrop";
import { ArrowLeftIcon, CloseIcon } from "./steps/icons";
import { guideTheme } from "./theme";
import { MicButton } from "./voice/VoiceControls";
import { useVoice } from "./voice/useVoice";

gsap.registerPlugin(useGSAP, Flip);

// Generic flow runner: scrim, stage, dock, voice and exit dialog. Knows nothing
// about any particular flow — steps and their order come from `flow`.

export interface GuidedFlowHandle {
  /** Forward a command (e.g. from a chat quick-reply) to the current step. */
  sendCommand: (command: FlowCommand) => boolean;
}

export interface GuideStepState<C> {
  stepId: string;
  stepLabel: string;
  context: Partial<C>;
}

export interface GuideVoice {
  /** Transcript the scripted fallback types on a given step. */
  scriptFor: (stepId: string) => string;
  /** The transcript was sent; the host opens its assistant chat. */
  onSend: (transcript: string, stepId: string) => void;
  /**
   * Float the Speak button at this viewport position (e.g. beside the host's
   * assistant button) instead of in the dock. The pill grows away from `right`.
   */
  anchor?: { right: number; bottom: number };
}

interface Props<C extends object> {
  flow: FlowConfig<C>;
  initialContext?: Partial<C>;
  onClose: () => void;
  /** Called once with the collected context after the last step (the flow's onComplete). */
  onStart: (context: C) => void;
  /** Host UI (e.g. the assistant chat) is on top: keep state, dim, ignore input. */
  paused?: boolean;
  onStepChange?: (state: GuideStepState<C>) => void;
  /** Enables the dock's Speak button. */
  voice?: GuideVoice;
  ref?: Ref<GuidedFlowHandle>;
}

const FOCUSABLE = 'input:not([disabled]),button:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function isFilled<C extends object>(ctx: Partial<C>, keys: (keyof C)[]) {
  return keys.length > 0 && keys.every(k => ctx[k] !== undefined && ctx[k] !== null);
}

export default function GuidedFlow<C extends object>({ flow, initialContext, onClose, onStart, paused = false, onStepChange, voice, ref }: Props<C>) {
  const steps = flow.steps;
  const initialRef = useRef<Partial<C>>(initialContext ?? {});

  // Only steps answered by the initial context are skipped: after going back,
  // the steps ahead are walked again, opening with what was entered.
  const nextIndex = useCallback((from: number) => {
    for (let i = from + 1; i < steps.length; i++) if (!isFilled(initialRef.current, steps[i].provides)) return i;
    return -1;
  }, [steps]);

  const firstIndex = useMemo(() => Math.max(0, nextIndex(-1)), [nextIndex]);

  const [context, setContext] = useState<Partial<C>>(initialRef.current);
  const [index, setIndex] = useState(firstIndex);
  // Steps completed on the way here, most recent last (what Back returns to)
  const [history, setHistory] = useState<number[]>([]);
  const [dirty, setDirty] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  // Exit asks first, in the guide's own space
  const [showExit, setShowExit] = useState(false);
  const [liveMsg, setLiveMsg] = useState("");
  const [voiceMsg, setVoiceMsg] = useState("");
  // Brand backdrop/heading arrangement; a step may override its default
  const [sceneOverride, setSceneOverride] = useState<GuideScene | null>(null);

  const ctxRef = useRef(context);
  const indexRef = useRef(index);
  const historyRef = useRef(history);
  historyRef.current = history;
  const busyRef = useRef(false);
  const escapeRef = useRef<(() => void) | null>(null);
  const commandRef = useRef<((c: FlowCommand) => boolean) | null>(null);
  indexRef.current = index;
  const theme = guideTheme();

  const rootRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const micRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const stepWrapRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  const rm = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  // ── Scrim blur (tweened through a proxy so it can go to 0) ──────────────────
  const blur = useRef({ px: 0 });
  const hostBlur = useCallback(() => {
    const raw = rootRef.current ? getComputedStyle(rootRef.current).getPropertyValue("--gf-host-blur") : "";
    return parseFloat(raw) || 22;
  }, []);
  const applyBlur = useCallback(() => {
    const el = scrimRef.current;
    if (!el) return;
    const v = `blur(${blur.current.px}px)`;
    el.style.backdropFilter = v;
    el.style.setProperty("-webkit-backdrop-filter", v);
  }, []);

  // ── Focus helpers ───────────────────────────────────────────────────────────
  const focusFirst = useCallback(() => {
    requestAnimationFrame(() => {
      const stage = stageRef.current;
      if (!stage) return;
      const el = stage.querySelector<HTMLElement>(FOCUSABLE);
      (el ?? stage).focus({ preventScroll: true });
    });
  }, []);

  // ── Overlay in ──────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const scrim = scrimRef.current, stage = stageRef.current, dock = dockRef.current;
    const chrome = [dock, micRef.current, backRef.current].filter(Boolean) as HTMLElement[];
    if (!scrim || !stage || !dock) return;
    const full = hostBlur();
    if (rm) {
      blur.current.px = full;
      applyBlur();
      gsap.fromTo([scrim, brandRef.current, stage, ...chrome].filter(Boolean), { opacity: 0 }, { opacity: 1, duration: M.overlayIn });
    } else {
      const tl = gsap.timeline({ defaults: { duration: M.overlayIn, ease: M.overlayEase } });
      tl.fromTo([scrim, brandRef.current].filter(Boolean), { opacity: 0 }, { opacity: 1 }, 0)
        .fromTo(blur.current, { px: 0 }, { px: full, onUpdate: applyBlur }, 0)
        .fromTo([stage, ...chrome], { opacity: 0, y: M.stageRise }, { opacity: 1, y: 0 }, 0.05);
    }
    focusFirst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step in (after every step change or reset) ──────────────────────────────
  const mounted = useRef(false);
  useLayoutEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const stage = stageRef.current;
    if (!stage) return;
    const from = rm ? { opacity: 0 } : { opacity: 0, scale: M.stepScale, y: M.stepRise };
    const to = rm ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 };
    gsap.fromTo(stage, from, {
      ...to, duration: M.stepIn, ease: M.stepInEase,
      onComplete: () => { busyRef.current = false; },
    });
    focusFirst();
  }, [index, rm, focusFirst]);

  const stepOut = useCallback((then: () => void) => {
    const stage = stageRef.current;
    if (!stage) { then(); return; }
    gsap.to(stage, {
      opacity: 0, ...(rm ? {} : { scale: M.stepScale, y: -M.stepRise / 2 }),
      duration: M.stepOut, ease: M.stepOutEase, onComplete: then,
    });
  }, [rm]);

  const clearStepChrome = () => {
    setDirty(false);
    setFocusMode(false);
    setSceneOverride(null);
    escapeRef.current = null;
    commandRef.current = null;
  };

  // ── Leaving the overlay ─────────────────────────────────────────────────────
  const fadeOut = useCallback((then: () => void) => {
    const targets = [stageRef.current, dockRef.current, micRef.current, backRef.current].filter(Boolean);
    const tl = gsap.timeline({ onComplete: then, defaults: { duration: M.overlayOut, ease: "power2.inOut" } });
    tl.to(targets, { opacity: 0, duration: M.stepOut }, 0)
      .to([scrimRef.current, brandRef.current].filter(Boolean), { opacity: 0 }, 0);
    if (!rm) tl.to(blur.current, { px: 0, onUpdate: applyBlur }, 0);
  }, [rm, applyBlur]);

  const finish = useCallback((ctx: Partial<C>) => {
    // Every step's values are present here, so the context is complete.
    fadeOut(() => onStart(ctx as C));
  }, [fadeOut, onStart]);

  // ── Step API ────────────────────────────────────────────────────────────────
  const complete = useCallback((patch: Partial<C>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    const from = indexRef.current;
    const prev = ctxRef.current;
    const next = { ...prev, ...patch };
    // A changed answer (after going back) clears the answers that depended on it
    const step = steps[from];
    if (step.invalidates && step.provides.some(k => prev[k] !== undefined && prev[k] !== next[k])) {
      for (const k of step.invalidates) delete next[k];
    }
    ctxRef.current = next;
    setContext(next);
    const ni = nextIndex(from);
    if (ni === -1) {
      finish(next);
      return;
    }
    stepOut(() => {
      clearStepChrome();
      setHistory(h => [...h, from]);
      setIndex(ni);
    });
  }, [nextIndex, finish, stepOut, steps]);

  // Back returns to the previous screen, which opens with its answer from the
  // context (a changed answer there clears what depended on it).
  const back = useCallback(() => {
    const h = historyRef.current;
    if (busyRef.current || !h.length) return;
    const target = h[h.length - 1];
    busyRef.current = true;
    stepOut(() => {
      clearStepChrome();
      setHistory(h.slice(0, -1));
      setIndex(target);
    });
  }, [stepOut]);

  const announce = useCallback((msg: string) => setLiveMsg(msg), []);
  const setEscapeHandler = useCallback((fn: (() => void) | null) => { escapeRef.current = fn; }, []);
  const setCommandHandler = useCallback((fn: ((c: FlowCommand) => boolean) | null) => { commandRef.current = fn; }, []);
  const setScene = useCallback((s: GuideScene) => setSceneOverride(s), []);

  const api: StepApi<C> = useMemo(() => ({
    context: context as C,
    complete,
    setDirty,
    announce,
    setFocusMode,
    setEscapeHandler,
    setCommandHandler,
    reducedMotion: rm,
    isLastStep: index === steps.length - 1,
    setScene,
  }), [context, complete, announce, setEscapeHandler, setCommandHandler, rm, index, steps.length, setScene]);

  useImperativeHandle(ref, () => ({
    sendCommand: command => commandRef.current?.(command) ?? false,
  }), []);

  const step = steps[index];
  const scene = sceneOverride ?? step.scene ?? "focus";
  const brand = theme === "brand";
  const text = (v: typeof step.heading) => (typeof v === "function" ? v(context) : v);
  const heading = text(step.heading);
  const subtitle = text(step.subtitle);

  useEffect(() => {
    onStepChange?.({ stepId: step.id, stepLabel: step.label, context });
  }, [step, context, onStepChange]);

  // ── Voice ───────────────────────────────────────────────────────────────────
  const stepIdRef = useRef(step.id);
  stepIdRef.current = step.id;
  const voiceRef = useRef(voice);
  voiceRef.current = voice;
  const voiceScript = useCallback(() => voiceRef.current?.scriptFor(stepIdRef.current) ?? "", []);
  const voiceSend = useCallback((t: string) => voiceRef.current?.onSend(t, stepIdRef.current), []);
  const speak = useVoice({ script: voiceScript, onSend: voiceSend, announce: setVoiceMsg });
  const cancelVoice = speak.cancel;

  // ── Paused under host UI ────────────────────────────────────────────────────
  const wasPaused = useRef(paused);
  useEffect(() => {
    if (paused && !wasPaused.current) cancelVoice();
    if (!paused && wasPaused.current) focusFirst();
    wasPaused.current = paused;
  }, [paused, cancelVoice, focusFirst]);

  // ── Dock actions ────────────────────────────────────────────────────────────
  const hasProgress =
    index !== firstIndex || dirty || Object.keys(context).length > Object.keys(initialRef.current).length;

  function requestClose() {
    cancelVoice();
    if (hasProgress) { setShowExit(true); return; }
    fadeOut(onClose);
  }

  function confirmed() {
    setShowExit(false);
    fadeOut(onClose);
  }

  function requestBack() {
    cancelVoice();
    back();
  }
  // Every screen after the first has Back
  const canGoBack = history.length > 0;

  // ── Exit confirmation: the step and controls give way to the question ──────
  const exitShown = useRef(false);
  useLayoutEffect(() => {
    const view = exitRef.current, step = stepWrapRef.current;
    if (!view || exitShown.current === showExit) return;
    exitShown.current = showExit;
    const chrome = [dockRef.current, micRef.current, backRef.current, headingRef.current].filter(Boolean);
    const out = rm ? { autoAlpha: 0 } : { autoAlpha: 0, scale: M.stepScale, y: -M.stepRise / 2 };
    const settle = rm ? { autoAlpha: 1 } : { autoAlpha: 1, scale: 1, y: 0 };
    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
    if (showExit) {
      tl.to([step, ...chrome], { ...out, duration: M.stepOut, ease: M.stepOutEase }, 0)
        .fromTo(view, rm ? { autoAlpha: 0 } : { autoAlpha: 0, scale: M.stepScale, y: M.stepRise },
          { ...settle, duration: M.stepIn, ease: M.stepInEase }, M.stepOut * 0.6)
        .add(() => continueRef.current?.focus({ preventScroll: true }), M.stepOut * 0.6);
    } else {
      tl.to(view, { ...out, duration: M.stepOut, ease: M.stepOutEase }, 0)
        .fromTo([step, ...chrome], rm ? { autoAlpha: 0 } : { autoAlpha: 0, scale: M.stepScale, y: M.stepRise },
          { ...settle, duration: M.stepIn, ease: M.stepInEase }, M.stepOut * 0.6)
        .add(focusFirst, M.stepOut * 0.6);
    }
  }, [showExit, rm, focusFirst]);

  // ── Keyboard: Escape + focus trap ───────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (paused) return;
      if (e.key === "Escape") {
        e.preventDefault();
        if (showExit) { setShowExit(false); return; }
        if (speak.listening) { cancelVoice(); return; }
        if (escapeRef.current) { escapeRef.current(); return; }
        requestClose();
        return;
      }
      if (e.key !== "Tab") return;
      const scope = showExit ? exitRef.current : rootRef.current;
      if (!scope) return;
      const focusable = Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter(el => el.offsetParent !== null);
      if (!focusable.length) { e.preventDefault(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active || !scope.contains(active)) { e.preventDefault(); first.focus(); return; }
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div ref={rootRef} role="dialog" aria-modal={!paused} aria-label={flow.label}
      data-gf-theme={theme} data-gf-scene={scene} inert={paused}
      className="gf-root fixed inset-0 z-50 overflow-hidden select-none">

      {/* Scrim — blurs the host screen; taps do nothing */}
      <div ref={scrimRef} className="gf-scrim absolute inset-0" style={{ opacity: 0 }} aria-hidden="true" />
      {brand && <BrandBackdrop ref={brandRef} reducedMotion={rm} />}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-200"
        style={{ background: "var(--gf-picker-scrim)", backdropFilter: "blur(var(--gf-picker-blur))", WebkitBackdropFilter: "blur(var(--gf-picker-blur))", opacity: focusMode || showExit ? 1 : 0 }} aria-hidden="true" />

      {/* Announcements */}
      <p className="sr-only" aria-live="polite">{`Step ${index + 1} of ${steps.length}, ${step.prompt}`}</p>
      <p className="sr-only" aria-live="polite">{liveMsg}</p>
      <p className="sr-only" aria-live="polite">{voiceMsg}</p>

      {/* Stage — the current step renders and swaps in place */}
      <div ref={stageRef} tabIndex={-1} className="absolute inset-0 outline-none" style={{ opacity: 0 }}>
        {/* Brand: heading, subtitle and separator above the step */}
        {brand && heading && (
          <div ref={headingRef} className="gf-brand-heading" aria-hidden={showExit || undefined}
            style={{ opacity: focusMode ? 0.25 : undefined }}>
            <h2 className="gf-brand-title">{heading}</h2>
            {subtitle && <p className="gf-brand-subtitle">{subtitle}</p>}
            <span className="gf-brand-separator" aria-hidden="true" />
          </div>
        )}
          <div key={step.id} ref={stepWrapRef} className="gf-step-wrap absolute inset-0" aria-hidden={showExit || undefined}>
            {step.render(api)}
          </div>
      </div>

      {/* Back: bottom-left, level with the dock (Figma 11784:15940) */}
      <div ref={backRef} className="absolute" style={{ left: 50, bottom: 52, opacity: 0 }}>
        <button onClick={requestBack} aria-label="Back to the previous screen" tabIndex={canGoBack ? undefined : -1}
          aria-hidden={!canGoBack || undefined}
          className="gf-surface gf-dock rounded-full flex items-center justify-center"
          style={{
            width: 60, height: 60,
            opacity: !canGoBack ? 0 : focusMode ? 0.4 : 1,
            pointerEvents: canGoBack ? undefined : "none",
            transform: canGoBack || rm ? "none" : "translateX(-12px)",
            transition: "opacity 0.24s ease, transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
          <ArrowLeftIcon size={28} strokeWidth={1.6} />
        </button>
      </div>

      {/* Dock */}
      <div ref={dockRef}
        className="absolute left-1/2 -translate-x-1/2 flex items-center transition-opacity duration-200"
        style={{ bottom: 52, opacity: 0 }}>
        <div style={{ opacity: focusMode ? 0.4 : 1 }} className="flex items-center transition-opacity duration-200">
          <button onClick={requestClose} aria-label="Close guide"
            className="gf-surface gf-dock gf-close rounded-full flex items-center justify-center" style={{ width: 60, height: 60, marginRight: voice && !voice.anchor ? 17 : 0 }}>
            <CloseIcon size={34} strokeWidth={1.5} />
          </button>
          {voice && !voice.anchor && (
            <MicButton listening={speak.listening} level={speak.level} shakeKey={speak.shakeKey}
              label={speak.label} onToggle={speak.toggle} reducedMotion={rm} brand />
          )}
        </div>
      </div>

      {/* Speak, floated beside the host's assistant button */}
      {voice?.anchor && (
        <div ref={micRef} className="absolute flex justify-end transition-opacity duration-200"
          style={{ right: voice.anchor.right, bottom: voice.anchor.bottom, opacity: 0 }}>
          <div style={{ opacity: focusMode ? 0.4 : 1 }} className="flex transition-opacity duration-200">
            <MicButton listening={speak.listening} level={speak.level} shakeKey={speak.shakeKey}
              label={speak.label} onToggle={speak.toggle} reducedMotion={rm} />
          </div>
        </div>
      )}

      {/* Paused under host UI (assistant chat) */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-200"
        style={{ background: "var(--gf-dim-paused)", opacity: paused ? 1 : 0 }} aria-hidden="true" />

      {/* Exit confirmation, in the guide's own space (replaces the step) */}
      <div ref={exitRef} role="alertdialog" aria-modal="true"
        aria-labelledby="gf-exit-title" aria-describedby="gf-exit-body"
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ visibility: "hidden", opacity: 0, padding: "0 32px" }}>
        <h2 id="gf-exit-title" className="text-[34px] font-bold" style={{ lineHeight: 1.2 }}>
          Exit the guide?
        </h2>
        <p id="gf-exit-body" className="gf-muted text-[20px] leading-snug" style={{ marginTop: 12, maxWidth: 520 }}>
          You haven’t finished this session yet. If you exit now, your progress will be lost.
        </p>
        <div className="flex items-center" style={{ gap: 16, marginTop: 36 }}>
          <button onClick={confirmed}
            className="gf-surface gf-secondary gf-pill text-[18px] font-semibold" style={{ height: 60, padding: "0 32px", minWidth: 180 }}>
            Exit guide
          </button>
          <button ref={continueRef} onClick={() => setShowExit(false)}
            className="gf-surface gf-dock gf-pill gf-selected text-[18px] font-semibold" style={{ height: 60, padding: "0 32px", minWidth: 180, transform: "none" }}>
            Continue guide
          </button>
        </div>
      </div>
    </div>
  );
}
