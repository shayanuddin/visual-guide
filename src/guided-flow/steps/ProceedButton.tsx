import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { M } from "../motion";
import { ArrowRightIcon, ArrowUpRightIcon } from "./icons";

// The step's proceed action: a round button on the right edge that breathes
// (with two rings) once the step is ready.

// Figma start-button states (A / Variant3 / B). The light frames place it at
// 92.73px (11784:15975), i.e. the 120px component at 0.7727.
const SCALE = 92.727 / 120;
const PROCEED = 120 * SCALE; // A: button at rest
const PROCEED_MID = 130 * SCALE; // Variant3
const PROCEED_PEAK = 140 * SCALE; // B
const RING_INNER = 170 * SCALE; // B
const RING_OUTER_MID = 150 * SCALE; // Variant3
const RING_OUTER = 200 * SCALE; // B

export interface ProceedButtonProps {
  ready: boolean;
  /** A sub-view (e.g. a picker) is open: dim the button and stop the pulse. */
  dimmed?: boolean;
  /** Accessible name; say what's missing when not ready. */
  label: string;
  /** ↗ where the action starts the session; → just moves to the next step. */
  isLastStep: boolean;
  reducedMotion: boolean;
  onClick: () => void;
}

export default function ProceedButton({ ready, dimmed = false, label, isLastStep, reducedMotion: rm, onClick }: ProceedButtonProps) {
  const pulseRef = useRef<HTMLSpanElement>(null);
  const innerRingRef = useRef<HTMLSpanElement>(null);
  const outerRingRef = useRef<HTMLSpanElement>(null);
  const live = ready && !dimmed;

  // Proceed pulse: three circles breathing through the Figma states
  //   A        button 120, rings tucked behind it
  //   Variant3 button 130, outer ring 150
  //   B        button 140, inner ring 170, outer ring 200   (all × SCALE)
  useLayoutEffect(() => {
    const btn = pulseRef.current, inner = innerRingRef.current, outer = outerRingRef.current;
    if (!btn || !inner || !outer || !live) return;
    const A = { btn: 1, inner: PROCEED / RING_INNER, outer: PROCEED / RING_OUTER };
    if (rm) {
      // Static Variant3
      gsap.set(btn, { scale: PROCEED_MID / PROCEED });
      gsap.set(inner, { scale: A.inner });
      gsap.set(outer, { scale: RING_OUTER_MID / RING_OUTER });
      return;
    }
    gsap.set(btn, { scale: A.btn });
    gsap.set(inner, { scale: A.inner });
    gsap.set(outer, { scale: A.outer });
    // Built linear, then eased as a whole so it flows through Variant3 without a stop.
    const states = gsap.timeline({ paused: true, defaults: { ease: "none", duration: 1 } })
      .to(btn, { scale: PROCEED_MID / PROCEED }, 0)
      .to(outer, { scale: RING_OUTER_MID / RING_OUTER }, 0)
      .to(btn, { scale: PROCEED_PEAK / PROCEED }, 1)
      .to(outer, { scale: 1 }, 1)
      .to(inner, { scale: 1, duration: 0.9 }, 1.1);
    const driver = gsap.to(states, {
      progress: 1, duration: M.proceedPulse, ease: "sine.inOut",
      repeat: -1, yoyo: true, repeatDelay: M.proceedPulseHold,
    });
    return () => { driver.kill(); states.kill(); };
  }, [live, rm]); // rings unmount while dimmed

  return (
    <div className="absolute flex items-center justify-center"
      style={{ right: 55 + (170 - PROCEED) / 2, top: "50%", width: PROCEED, height: PROCEED, marginTop: -PROCEED / 2,
        opacity: dimmed ? 0.4 : 1, transition: "opacity 0.2s ease" }}>
      {live && (
        <>
          <span ref={outerRingRef} aria-hidden="true" className="gf-proceed-ring gf-proceed-ring-outer"
            style={{ width: RING_OUTER, height: RING_OUTER }} />
          <span ref={innerRingRef} aria-hidden="true" className="gf-proceed-ring gf-proceed-ring-inner"
            style={{ width: RING_INNER, height: RING_INNER }} />
        </>
      )}
      <span ref={pulseRef} className="relative flex">
        <button
          onClick={onClick}
          disabled={!live}
          aria-label={label}
          className={`relative rounded-full flex items-center justify-center ${live ? "gf-proceed" : "gf-surface gf-dock"}`}
          style={{ width: PROCEED, height: PROCEED }}
        >
          {isLastStep
            ? <ArrowUpRightIcon size={80 * SCALE} strokeWidth={0.9} />
            : <ArrowRightIcon size={80 * SCALE} strokeWidth={0.9} />}
        </button>
      </span>
    </div>
  );
}
