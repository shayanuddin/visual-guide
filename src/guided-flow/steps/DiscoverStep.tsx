import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { M, ms } from "../motion";
import type { StepApi } from "../flows/types";
import { SignalIcon } from "./icons";

export interface DiscoverStepProps<T, C extends object> extends StepApi<C> {
  /** Starts a scan. Calls onFound per discovery and onDone when finished; returns a cancel function. */
  scan: (onFound: (item: T) => void, onDone: () => void) => () => void;
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  icon: ReactNode;
  /** Singular noun for announcements, e.g. "device". */
  noun: string;
  toContext: (item: T) => Partial<C>;
}

type Phase = "scanning" | "found" | "done" | "empty" | "merging";

const BUBBLE = 200;
const slotX = (i: number, n: number) => (i - (n - 1) / 2) * (BUBBLE + M.bubbleGap);

export default function DiscoverStep<T, C extends object>(p: DiscoverStepProps<T, C>) {
  const { scan, getKey, announce, reducedMotion: rm, noun, setCommandHandler } = p;
  const [phase, setPhase] = useState<Phase>("scanning");
  const [items, setItems] = useState<T[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const bubbleRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ringRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const scanAgainRef = useRef<HTMLButtonElement>(null);
  const ringsTl = useRef<gsap.core.Timeline | null>(null);
  const cancelScan = useRef<() => void>(() => {});
  const emptyTimer = useRef<number>(undefined);
  const holdTimer = useRef<number>(undefined);
  const prevCount = useRef(0);

  // ── Scan lifecycle ──────────────────────────────────────────────────────────
  const startScan = useCallback(() => {
    let found = 0;
    let scanDone = false;
    const startedAt = performance.now();
    let nextRevealAt = startedAt + ms(M.scanMinDuration);
    const reveals: number[] = [];
    const finish = () => { if (scanDone && found && reveals.length === 0) setPhase("done"); };

    setItems([]);
    setPhase("scanning");
    announce(`Scanning for ${noun}s`);

    // Discoveries are revealed on a deliberate cadence: the radar always runs for
    // at least scanMinDuration, and arrivals are at least deviceStagger apart.
    const stopScan = scan(
      item => {
        found++;
        const at = Math.max(performance.now(), nextRevealAt);
        nextRevealAt = at + ms(M.deviceStagger);
        const t = window.setTimeout(() => {
          reveals.splice(reveals.indexOf(t), 1);
          setItems(prev => [...prev, item]);
          setPhase(ph => (ph === "scanning" ? "found" : ph));
          finish();
        }, at - performance.now());
        reveals.push(t);
      },
      () => { scanDone = true; finish(); },
    );
    cancelScan.current = () => { stopScan(); reveals.forEach(t => window.clearTimeout(t)); reveals.length = 0; };

    window.clearTimeout(emptyTimer.current);
    emptyTimer.current = window.setTimeout(() => {
      if (found) return;
      cancelScan.current();
      setPhase("empty");
      announce(`No ${noun}s found`);
    }, ms(M.scanEmptyAfter));
  }, [scan, announce, noun]);

  useEffect(() => {
    startScan();
    return () => {
      cancelScan.current();
      window.clearTimeout(emptyTimer.current);
      window.clearTimeout(holdTimer.current);
      ringsTl.current?.kill();
    };
  }, [startScan]);

  // ── 1. Scan bubble + radar rings while scanning ─────────────────────────────
  useLayoutEffect(() => {
    if (phase !== "scanning") return;
    gsap.set(bubbleRefs.current[0], { x: 0, scale: M.bubbleScanScale, opacity: 1 });
    if (rm) return;
    const rings = ringRefs.current.filter(Boolean) as HTMLElement[];
    const period = M.radarPeriod;
    const tl = gsap.timeline({ repeat: -1 });
    rings.forEach((ring, i) => {
      tl.fromTo(ring, { scale: 1, opacity: 0.7 }, { scale: M.radarScale, opacity: 0, duration: period, ease: "power1.out" }, (i * period) / rings.length);
    });
    tl.progress(0.34); // start with rings already in flight
    ringsTl.current = tl;
    return () => { tl.kill(); };
  }, [phase, rm]);

  // ── 2–3. First bubble grows, later ones split out sideways ──────────────────
  useLayoutEffect(() => {
    const n = items.length;
    const prev = prevCount.current;
    prevCount.current = n;
    if (n === 0 || n <= prev) return;

    const bubbles = bubbleRefs.current;
    const labels = labelRefs.current;
    if (n !== prev + 1 && prev !== 0) return;
    announce(`${n} ${noun}${n === 1 ? "" : "s"} found`);

    if (rm) {
      bubbles.slice(0, n).forEach((b, i) => b && gsap.set(b, { x: slotX(i, n), scale: 1 }));
      gsap.fromTo([bubbles[n - 1], labels[n - 1]], { opacity: 0 }, { opacity: 1, duration: M.itemIn });
      return;
    }

    if (n === 1) {
      gsap.to(ringRefs.current, { opacity: 0, duration: 0.2, overwrite: true });
      gsap.to(bubbles[0], { scale: 1, duration: M.bubbleGrow, ease: M.bubbleEase });
      gsap.fromTo(labels[0], { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: M.itemIn, delay: M.bubbleGrow * 0.5 });
      return;
    }

    const origin = Number(gsap.getProperty(bubbles[0]!, "x")) || 0;
    for (let i = 0; i < n - 1; i++) {
      gsap.to(bubbles[i], { x: slotX(i, n), duration: M.bubbleSplit, ease: M.bubbleEase });
    }
    gsap.fromTo(bubbles[n - 1],
      { x: origin, scale: 0.85, opacity: 0 },
      { x: slotX(n - 1, n), scale: 1, opacity: 1, duration: M.bubbleSplit, ease: M.bubbleEase });
    gsap.fromTo(labels[n - 1], { opacity: 0 }, { opacity: 1, duration: M.itemIn, delay: M.bubbleSplit * 0.5 });
  }, [items.length, rm, announce, noun]);

  // ── 4. Scan finished: Refresh fades in ───────────────────────────────────
  useLayoutEffect(() => {
    if (phase === "empty") gsap.to(ringRefs.current, { opacity: 0, duration: 0.3, overwrite: true });
    if ((phase === "done" || phase === "empty") && scanAgainRef.current) {
      gsap.fromTo(scanAgainRef.current, { opacity: 0 }, { opacity: 1, duration: M.itemIn, delay: phase === "done" ? M.bubbleSplit + M.scanDoneHold : 0 });
    }
  }, [phase]);

  // ── 5. Refresh: the sequence in reverse ──────────────────────────────────
  function scanAgain() {
    if (phase === "merging") return;
    cancelScan.current();
    window.clearTimeout(emptyTimer.current);
    setPhase("merging");
    announce(`Scanning for ${noun}s`);
    const bubbles = bubbleRefs.current.slice(0, Math.max(1, items.length)).filter(Boolean) as HTMLElement[];
    const labels = labelRefs.current.filter(Boolean) as HTMLElement[];
    const restart = () => { prevCount.current = 0; startScan(); };
    if (rm) {
      gsap.to([...bubbles.slice(1), ...labels, scanAgainRef.current], {
        opacity: 0, duration: M.itemIn,
        onComplete: () => { gsap.set(bubbles[0], { x: 0, scale: 1 }); restart(); },
      });
      return;
    }
    const tl = gsap.timeline({ onComplete: restart });
    tl.to(scanAgainRef.current, { opacity: 0, duration: 0.15 }, 0)
      .to(labels, { opacity: 0, duration: 0.15 }, 0)
      .to(bubbles, { x: 0, duration: M.bubbleMerge, ease: "power2.inOut" }, 0.1)
      .to(bubbles.slice(1), { opacity: 0, scale: 0.85, duration: M.bubbleMerge, ease: "power2.in" }, 0.1)
      .to(bubbles[0], { scale: M.bubbleScanScale, duration: M.bubbleMerge, ease: "power2.inOut" }, 0.1);
  }

  // External "rescan" (e.g. the assistant's Refresh chip)
  const rescanRef = useRef(scanAgain);
  rescanRef.current = scanAgain;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  useEffect(() => {
    setCommandHandler(cmd => {
      if (cmd.type !== "rescan") return false;
      if (phaseRef.current === "done" || phaseRef.current === "empty") rescanRef.current();
      return true;
    });
    return () => setCommandHandler(null);
  }, [setCommandHandler]);

  // ── 6. Select ───────────────────────────────────────────────────────────────
  function pick(i: number) {
    const item = items[i];
    if (!item || selected || phase === "merging") return;
    cancelScan.current();
    window.clearTimeout(emptyTimer.current);
    setSelected(getKey(item));
    const b = bubbleRefs.current[i];
    const others = bubbleRefs.current.slice(0, items.length).filter(el => el && el !== b);
    gsap.to(others, { opacity: M.dimOpacity, duration: M.select });
    if (b && !rm) gsap.to(b, { scale: M.selectScale, duration: M.select });
    holdTimer.current = window.setTimeout(() => p.complete(p.toContext(item)), ms(M.select + M.selectHold));
  }

  const count = Math.max(1, items.length);
  const scanning = phase === "scanning" || phase === "merging";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: 124, paddingBottom: 160 }}>
      <div className="relative w-full" style={{ height: 260 }}>
        {/* Radar rings (behind the first bubble) */}
        {!rm && Array.from({ length: M.radarRings }, (_, i) => (
          <span key={i} ref={el => { ringRefs.current[i] = el; }} aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              left: "50%", top: "50%", width: 140, height: 140, marginLeft: -70, marginTop: -70,
              border: "1.5px solid var(--gf-radar-ring)", opacity: 0,
            }} />
        ))}

        {Array.from({ length: count }, (_, i) => {
          const item = items[i];
          const key = item ? getKey(item) : "scan";
          const isSel = selected !== null && selected === key;
          return (
            <button
              key={i === 0 ? "first" : key}
              ref={el => { bubbleRefs.current[i] = el; }}
              type="button"
              disabled={!item || phase === "merging" || (selected !== null && !isSel)}
              onClick={() => pick(i)}
              aria-label={item ? `Select ${noun} ${p.getLabel(item)}` : `Scanning for ${noun}s`}
              className={`gf-surface gf-bubble absolute rounded-full flex flex-col items-center justify-center ${isSel ? "gf-selected" : ""}`}
              style={{
                left: "50%", top: "50%", width: BUBBLE, height: BUBBLE, marginLeft: -BUBBLE / 2, marginTop: -BUBBLE / 2,
                zIndex: i === 0 ? 2 : 1,
                cursor: item ? "pointer" : "default",
                gap: 17,
              }}
            >
              <span className="flex items-center justify-center" style={{ height: 70 }}>{p.icon}</span>
              {item && (
                <span ref={el => { labelRefs.current[i] = el; }}
                  className={`text-[18px] ${isSel ? "" : "gf-muted"}`} style={{ opacity: 0, lineHeight: "28px" }}>
                  {p.getLabel(item)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Below the row at Figma's offset (Refresh centre 154px under the bubbles' centre) */}
      <div className="absolute left-1/2 flex flex-col items-center" style={{ top: "calc(50% - 18px + 130px)", translate: "-50% 0" }}>
        {scanning && rm && <p className="gf-muted text-[18px]" role="status">Scanning…</p>}
        {phase === "empty" && <p className="text-[19px] mb-1">No {noun}s found</p>}
        {(phase === "done" || phase === "empty" || (phase === "merging" && items.length > 0)) && selected === null && (
          <button ref={scanAgainRef} onClick={scanAgain} aria-label={`Refresh ${noun}s`}
            className="flex items-center gap-2 text-[18px] font-semibold px-4 rounded-full" style={{ minHeight: 44, opacity: 0 }}>
            <SignalIcon size={20} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
