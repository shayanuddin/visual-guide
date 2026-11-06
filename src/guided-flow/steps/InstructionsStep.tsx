import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { gsap } from "gsap";
import type { StepApi } from "../flows/types";
import type { InstructionIcon, TestInstructions } from "../data";
import ProceedButton from "./ProceedButton";

// Pre-test instructions as a wheel (Figma 12063:110216): one numbered step in
// focus, the others shrinking and fading with distance. The focused pill fills
// up ("fuel") over a few seconds, then the wheel rolls on to the next; the
// clinician can also drag, scroll, tap or use the arrow keys. Reading every
// step isn't required: the test can start any time.

export interface InstructionsStepProps<C extends object> extends StepApi<C> {
  /** Accessible name of the wheel, e.g. "Instructions for Expiratory Maneuver". */
  title: string;
  instructions: TestInstructions;
  /** Under the wheel, e.g. "Start the test when ready!" */
  caption: string;
  captionDetail?: string;
  proceedLabel: string;
  toContext: () => Partial<C>;
}

// The ACPlus instruction drawings (also used by the app's own Instructions screen)
const ICON_SRC: Record<InstructionIcon, string> = {
  mouthpiece: "2b7e1.svg",
  inhale: "af918.svg",
  spirometer: "fc90b.svg",
  rest: "9bac3.svg",
  repeat: "99b94.svg",
};
const iconUrl = (icon: InstructionIcon) => `url("${import.meta.env.BASE_URL}assets/${ICON_SRC[icon]}")`;

// Geometry from the Figma frame. The focused pill is 623.7 × 89.1; each step
// away scales it by 1/11 (89.1 → 81 → 72.9 → 64.8) with an 18px gap between pills.
const PILL_W = 623.7;
const PILL_H = 89.1;
const GAP = 18;
const SHRINK = 1 / 11;
/** Element opacity at 0, 1, 2, 3 and 4 steps away (fill reads 0.87 → 0.12 over white). */
const FADE = [1, 0.8, 0.6, 0.14, 0];
/** Centre-to-centre distance next to the focused pill: one "notch" of drag. */
const NOTCH = PILL_H * (1 - SHRINK / 2) + GAP;

const FUEL = 3; // seconds the focused pill takes to fill before the wheel rolls on
const ROLL = 0.6; // one step
const REWIND = 1.1; // last step back to the first
const ROLL_EASE = "power2.inOut";

/** Vertical offset of a pill `x` steps (fractional) from focus: the sum of half-heights and gaps. */
const offsetAt = (x: number) => PILL_H * (x - (x * x * SHRINK) / 2) + GAP * x;

function fadeAt(x: number) {
  if (x >= FADE.length - 1) return 0;
  const i = Math.floor(x);
  return FADE[i] + (FADE[i + 1] - FADE[i]) * (x - i);
}

export default function InstructionsStep<C extends object>(p: InstructionsStepProps<C>) {
  const { reducedMotion: rm, setCommandHandler, announce } = p;
  const { lines } = p.instructions;
  const last = lines.length - 1;

  const rowsRef = useRef<(HTMLLIElement | null)[]>([]);
  const fuelRef = useRef<(HTMLSpanElement | null)[]>([]);
  const pos = useRef({ v: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const timer = useRef<gsap.core.Tween | null>(null); // the running fuel-up
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  // Place every pill for the current (possibly fractional) position
  const layout = useCallback(() => {
    const at = pos.current.v;
    rowsRef.current.forEach((row, i) => {
      if (!row) return;
      const d = i - at;
      const x = Math.abs(d);
      const opacity = fadeAt(x);
      row.style.transform = `translate(-50%, -50%) translateY(${Math.sign(d) * offsetAt(x)}px) scale(${Math.max(0.5, 1 - x * SHRINK)})`;
      row.style.opacity = String(opacity);
      row.style.visibility = opacity > 0 ? "visible" : "hidden";
      row.style.zIndex = String(100 - Math.round(x * 10));
      row.style.pointerEvents = x < 3.5 ? "auto" : "none";
    });
  }, []);

  useLayoutEffect(layout, [layout]);

  const settle = useCallback((i: number) => {
    activeRef.current = i;
    setActive(i);
  }, []);

  // ── Auto-roll: the focused pill fuels up, then the next one takes focus ───
  const stopAuto = useCallback(() => {
    timer.current?.kill();
    timer.current = null;
    // The fill drains away from the pill that loses focus
    const fuel = fuelRef.current[activeRef.current];
    if (fuel) gsap.to(fuel, { opacity: 0, duration: 0.25, overwrite: true, onComplete: () => { gsap.set(fuel, { xPercent: -100 }); } });
  }, []);
  const goRef = useRef<(i: number, opts?: { duration?: number; manual?: boolean }) => void>(() => {});
  const scheduleAuto = useCallback(() => {
    stopAuto();
    if (rm) return; // moving content stays put for reduced motion; the hand controls still work
    const fuel = fuelRef.current[activeRef.current];
    if (!fuel) return;
    timer.current = gsap.fromTo(fuel, { xPercent: -100, opacity: 1 }, {
      xPercent: 0, duration: FUEL, ease: "none", overwrite: true,
      onComplete: () => {
        const i = activeRef.current;
        goRef.current(i >= last ? 0 : i + 1, { duration: i >= last ? REWIND : ROLL });
      },
    });
  }, [rm, last, stopAuto]);

  const go = useCallback((target: number, { duration = ROLL, manual = false } = {}) => {
    const i = Math.max(0, Math.min(last, target));
    tween.current?.kill();
    stopAuto();
    settle(i);
    if (manual) announce(`Step ${i + 1} of ${lines.length}: ${lines[i].text}`);
    tween.current = gsap.to(pos.current, {
      v: i, duration: rm ? 0 : duration, ease: ROLL_EASE, onUpdate: layout,
      onComplete: () => { layout(); scheduleAuto(); },
    });
  }, [last, rm, layout, settle, stopAuto, scheduleAuto, announce, lines]);
  goRef.current = go;

  useEffect(() => {
    scheduleAuto();
    return () => { stopAuto(); tween.current?.kill(); };
  }, [scheduleAuto, stopAuto]);

  // ── By hand: drag (with flick), tap a pill, scroll, arrow keys ────────────
  const drag = useRef<{ id: number; y0: number; v0: number; moved: boolean; lastY: number; lastT: number; vel: number } | null>(null);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    tween.current?.kill();
    stopAuto();
    drag.current = { id: e.pointerId, y0: e.clientY, v0: pos.current.v, moved: false, lastY: e.clientY, lastT: e.timeStamp, vel: 0 };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    const dy = e.clientY - g.y0;
    if (!g.moved && Math.abs(dy) < 6) return;
    if (!g.moved) { g.moved = true; e.currentTarget.setPointerCapture(e.pointerId); }
    const dt = Math.max(1, e.timeStamp - g.lastT);
    g.vel = 0.8 * ((e.clientY - g.lastY) / dt) + 0.2 * g.vel; // px per ms
    g.lastY = e.clientY;
    g.lastT = e.timeStamp;
    let v = g.v0 - dy / NOTCH;
    // Rubber band past either end
    if (v < 0) v *= 0.3;
    else if (v > last) v = last + (v - last) * 0.3;
    pos.current.v = v;
    layout();
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    drag.current = null;
    if (g.moved) {
      // A flick carries on a little before snapping
      const fling = e.timeStamp - g.lastT < 80 ? Math.max(-2, Math.min(2, -(g.vel * 160) / NOTCH)) : 0;
      go(Math.round(pos.current.v + fling), { manual: true });
      return;
    }
    // A tap: the pill under the finger comes to focus
    const row = (e.target as HTMLElement).closest<HTMLElement>("[data-instr-row]");
    const i = row ? Number(row.dataset.instrRow) : activeRef.current;
    go(i, { manual: i !== activeRef.current });
  }

  const wheelAcc = useRef({ sum: 0, at: 0 });
  function onWheel(e: WheelEvent<HTMLDivElement>) {
    const w = wheelAcc.current;
    if (e.timeStamp - w.at > 220) w.sum = 0;
    w.at = e.timeStamp;
    w.sum += e.deltaY;
    if (Math.abs(w.sum) < 40) return;
    const dir = Math.sign(w.sum);
    w.sum = -dir * 400; // one notch per gesture burst, until it pauses
    go(activeRef.current + dir, { manual: true });
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const to = { ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: last }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    go(to, { manual: true });
  }

  // ── Proceed ───────────────────────────────────────────────────────────────
  const proceed = () => { stopAuto(); p.complete(p.toContext()); };
  const proceedRef = useRef(proceed);
  proceedRef.current = proceed;
  useEffect(() => {
    // External commands (e.g. the assistant's Start the test chip)
    setCommandHandler(cmd => {
      if (cmd.type === "start") { proceedRef.current(); return true; }
      if (cmd.type === "next") { goRef.current(activeRef.current + 1, { manual: true }); return true; }
      if (cmd.type === "previous") { goRef.current(activeRef.current - 1, { manual: true }); return true; }
      return false;
    });
    return () => setCommandHandler(null);
  }, [setCommandHandler]);

  return (
    <div className="absolute inset-0">
      <span id="gf-instr-hint" className="sr-only">Use the up and down arrow keys to move between steps.</span>
      <div className="gf-instr-wheel absolute top-0 bottom-0 left-1/2"
        role="list" aria-label={p.title} tabIndex={0}
        aria-describedby="gf-instr-hint"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onWheel={onWheel} onKeyDown={onKeyDown}
        style={{ width: PILL_W + 80, marginLeft: -(PILL_W + 80) / 2 }}>
        {lines.map((l, i) => (
          <li key={i} ref={el => { rowsRef.current[i] = el; }} data-instr-row={i}
            aria-current={i === active ? "step" : undefined}
            className="gf-instr-pill absolute flex items-center"
            style={{ width: PILL_W, height: PILL_H, left: "50%", top: "calc(50% - 23px)" }}>
            <span ref={el => { fuelRef.current[i] = el; }} className="gf-instr-fuel" aria-hidden="true">
              <svg viewBox="0 0 30 100" preserveAspectRatio="none" width="30" height="100%">
                <path d="M0 0H22C30 18 27 38 17 55C9 69 6 85 4 100H0Z" />
              </svg>
            </span>
            <span className="gf-instr-avatar relative shrink-0 flex items-center justify-center" aria-hidden="true">
              <span className="gf-instr-icon"
                style={{ ["--icon" as string]: iconUrl(l.icon), ...(l.icon === "repeat" ? { transform: "scaleX(-1)" } : {}) } as CSSProperties} />
              <span className="gf-instr-badge">{i + 1}</span>
            </span>
            <span className="sr-only">Step {i + 1}: </span>
            <span className="gf-instr-text">{l.text}</span>
          </li>
        ))}
      </div>

      <div className="absolute left-0 right-0 text-center pointer-events-none" style={{ bottom: 141 }}>
        <p className="text-[28px] font-bold" style={{ lineHeight: "32px" }}>{p.caption}</p>
        {p.captionDetail && <p className="gf-muted text-[19px]" style={{ lineHeight: "24px", marginTop: 14 }}>{p.captionDetail}</p>}
      </div>

      <ProceedButton ready label={p.proceedLabel} isLastStep={p.isLastStep} reducedMotion={rm} onClick={proceed} />
    </div>
  );
}
