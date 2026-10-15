import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { M, ms } from "../motion";
import type { StepApi } from "../flows/types";
import { CheckIcon, QrIcon } from "./icons";

// Placeholder for the camera: a viewfinder with a sweeping scan line. When a
// code is read the brackets close on it, then the viewfinder reshapes into a
// card showing what was read and who it's for. The clinician must confirm the
// session belongs to that patient before the step continues.

export interface ScanStepProps<T, C extends object> extends StepApi<C> {
  /** Starts reading. Calls onRead once a code is decoded; returns a cancel function. */
  scan: (onRead: (item: T) => void) => () => void;
  getTitle: (item: T) => string;
  /** Lines under the title on the result card, e.g. serial and mode. */
  getDetails: (item: T) => string[];
  /** What the device recorded, shown read-only on the card so it's confirmed with the scan. */
  getReadings?: (item: T) => { label: string; value: string }[];
  /** Singular noun for announcements, e.g. "device". */
  noun: string;
  /**
   * Who the reading will be filed under. When given, the patient is the card's
   * headline (what the clinician must verify) and the device sits beneath.
   */
  subject?: { name: string; initials: string; details: string[] };
  toContext: (item: T) => Partial<C>;
}

type Phase = "scanning" | "locked" | "found" | "failed";

const VIEW = 300;
const CARD_W = 640;
const CARD_H = 300;
const READING_COLS = 3;
const READING_ROW = 58;
const BRACKET = 54;

/** A fake 21×21 code: three finder squares plus a fixed scatter of modules. */
function useQrModules() {
  return useMemo(() => {
    const n = 21, cells: [number, number][] = [];
    const finder = (x: number, y: number) => x < 7 && y < 7 && (x === 0 || x === 6 || y === 0 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5));
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const f = finder(x, y) || finder(n - 1 - x, y) || finder(x, n - 1 - y);
      const inFinderZone = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
      if (f || (!inFinderZone && rnd() > 0.52)) cells.push([x, y]);
    }
    return { n, cells };
  }, []);
}

export default function ScanStep<T, C extends object>(p: ScanStepProps<T, C>) {
  const { scan, announce, reducedMotion: rm, noun, setCommandHandler, setScene } = p;
  const [phase, setPhase] = useState<Phase>("scanning");
  const [item, setItem] = useState<T | null>(null);
  const cardHRef = useRef(CARD_H);
  const qr = useQrModules();

  // Brand: the viewfinder owns the screen until a code is read
  useEffect(() => { setScene(phase === "found" ? "focus" : "scan"); }, [phase, setScene]);

  const cardRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const bracketsRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<SVGSVGElement>(null);
  const checkRef = useRef<HTMLSpanElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const confirmed = useRef(false);
  const cancel = useRef<() => void>(() => {});
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, s: number) => { timers.current.push(window.setTimeout(fn, ms(s))); };
  const clearTimers = () => { timers.current.forEach(t => window.clearTimeout(t)); timers.current = []; };

  const start = useCallback(() => {
    clearTimers();
    confirmed.current = false;
    // Back to the viewfinder (a rescan can start from the result card)
    gsap.set(cardRef.current, { width: VIEW, height: VIEW });
    gsap.set(captionRef.current, { opacity: 1 });
    setItem(null);
    setPhase("scanning");
    announce(`Camera open. Point it at the ${noun}'s QR code`);
    cancel.current = scan(read => {
      setItem(read);
      setPhase("locked");
    });
    timers.current.push(window.setTimeout(() => {
      cancel.current();
      setPhase(ph => (ph === "scanning" ? "failed" : ph));
    }, ms(M.qrFailAfter)));
  }, [scan, announce, noun]);

  useEffect(() => {
    start();
    return () => { cancel.current(); clearTimers(); };
  }, [start]);

  // ── Scanning: the line sweeps up and down the viewfinder ───────────────────
  useLayoutEffect(() => {
    if (phase !== "scanning" || rm) return;
    gsap.set([bracketsRef.current, codeRef.current], { scale: 1, opacity: 1 });
    gsap.set(lineRef.current, { opacity: 1 });
    const tw = gsap.fromTo(lineRef.current, { y: 18 }, { y: VIEW - 20, duration: M.qrSweep, ease: "sine.inOut", repeat: -1, yoyo: true });
    return () => { tw.kill(); };
  }, [phase, rm]);

  // ── Locked → found: brackets close, then the viewfinder becomes the card ───
  useLayoutEffect(() => {
    if (phase !== "locked" || !item) return;
    announce(`${p.getTitle(item)} found`);
    const card = cardRef.current;
    if (rm) {
      setPhase("found");
      gsap.set(card, { width: CARD_W, height: cardHRef.current });
      return;
    }
    const tl = gsap.timeline({ onComplete: () => setPhase("found") });
    tl.to(lineRef.current, { opacity: 0, duration: 0.15 }, 0)
      .to(bracketsRef.current, { scale: 0.82, duration: M.qrLock, ease: "back.out(2)" }, 0)
      .fromTo(checkRef.current, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: M.qrLock, ease: M.bubbleEase }, 0.1)
      .to([bracketsRef.current, codeRef.current, checkRef.current], { opacity: 0, duration: 0.2 }, M.qrLock + 0.35)
      .to(captionRef.current, { opacity: 0, duration: 0.2 }, M.qrLock + 0.35)
      
      .to(card, { width: CARD_W, height: cardHRef.current, duration: M.qrMorph, ease: M.flipEase }, M.qrLock + 0.45);
    return () => { tl.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, item, rm]);

  // ── Found: card content and the consent question settle in ──────────────────
  useLayoutEffect(() => {
    if (phase !== "found" || !item) return;
    gsap.set(captionRef.current, { opacity: 1 });
    const els = [...(resultRef.current?.children ?? []), ...(captionRef.current?.children ?? [])];
    gsap.fromTo(els, rm ? { opacity: 0 } : { opacity: 0, y: M.itemRise },
      { opacity: 1, y: 0, duration: M.itemIn, stagger: M.stagger, ease: M.stepInEase });
    later(() => confirmRef.current?.focus({ preventScroll: true }), M.itemIn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, item, rm]);

  function confirm() {
    if (phase !== "found" || !item || confirmed.current) return;
    confirmed.current = true;
    p.complete(p.toContext(item));
  }

  useLayoutEffect(() => {
    if (phase !== "failed") return;
    announce(`Couldn't read a QR code`);
    gsap.to(lineRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(codeRef.current, { opacity: 0.35, duration: 0.3 });
    gsap.fromTo(retryRef.current, { opacity: 0 }, { opacity: 1, duration: M.itemIn });
  }, [phase, announce]);

  function retry() {
    if (phase !== "failed" && phase !== "found") return;
    start();
  }

  // External "rescan" / "confirm" (e.g. the assistant's chips)
  const retryFn = useRef(retry);
  retryFn.current = retry;
  const confirmFn = useRef(confirm);
  confirmFn.current = confirm;
  useEffect(() => {
    setCommandHandler(cmd => {
      if (cmd.type === "rescan") { retryFn.current(); return true; }
      if (cmd.type === "confirm") { confirmFn.current(); return true; }
      return false;
    });
    return () => setCommandHandler(null);
  }, [setCommandHandler]);

  // The card grows to fit the device's readings
  // Device readings (indication, protocol, channels...) are no longer shown on this card.
  const readings: { label: string; value: string }[] = [];
  const cardH = CARD_H + (readings.length ? Math.ceil(readings.length / READING_COLS) * READING_ROW + 18 : 0);

  cardHRef.current = cardH;
  const failed = phase === "failed";
  const showResult = phase === "found" && item;
  const unit = VIEW / (qr.n + 4);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: 100, paddingBottom: 160 }}>
      <div ref={cardRef} role={showResult ? "status" : "img"}
        aria-label={showResult ? undefined : failed ? "Viewfinder, no code read" : "Camera viewfinder, scanning"}
        className="gf-surface gf-bubble relative flex items-center justify-center overflow-hidden"
        style={{ width: VIEW, height: VIEW, borderRadius: 36 }}>

        {!showResult && (
          <>
            {/* Stand-in for the camera image */}
            <svg ref={codeRef} aria-hidden="true" width={VIEW} height={VIEW} className="absolute inset-0"
              style={{ opacity: 1, transformOrigin: "50% 50%" }}>
              <g opacity={0.2} fill="currentColor">
                {qr.cells.map(([x, y]) => (
                  <rect key={`${x}-${y}`} x={(x + 2) * unit} y={(y + 2) * unit} width={unit - 1} height={unit - 1} rx={1.5} />
                ))}
              </g>
            </svg>

            {/* Corner brackets */}
            <div ref={bracketsRef} aria-hidden="true" className="absolute" style={{ inset: 22, transformOrigin: "50% 50%" }}>
              {(["tl", "tr", "bl", "br"] as const).map(c => (
                <span key={c} className="absolute" style={{
                  width: BRACKET, height: BRACKET,
                  top: c[0] === "t" ? 0 : undefined, bottom: c[0] === "b" ? 0 : undefined,
                  left: c[1] === "l" ? 0 : undefined, right: c[1] === "r" ? 0 : undefined,
                  borderColor: "currentColor", borderStyle: "solid", borderWidth: 0,
                  [c[0] === "t" ? "borderTopWidth" : "borderBottomWidth"]: 4,
                  [c[1] === "l" ? "borderLeftWidth" : "borderRightWidth"]: 4,
                  [`border${c[0] === "t" ? "Top" : "Bottom"}${c[1] === "l" ? "Left" : "Right"}Radius`]: 18,
                  opacity: failed ? 0.45 : 1, transition: "opacity 0.3s ease",
                }} />
              ))}
            </div>

            {/* Scan line */}
            {!rm && (
              <span ref={lineRef} aria-hidden="true" className="absolute left-0 top-0 pointer-events-none" style={{
                width: "100%", height: 2, opacity: 0,
                background: "linear-gradient(90deg, transparent 6%, currentColor 30%, currentColor 70%, transparent 94%)",
                boxShadow: "0 0 18px 3px currentColor",
              }} />
            )}

            {/* Read */}
            <span ref={checkRef} aria-hidden="true" className="gf-proceed absolute rounded-full flex items-center justify-center"
              style={{ width: 72, height: 72, opacity: 0 }}>
              <CheckIcon size={34} />
            </span>
          </>
        )}

        {showResult && p.subject ? (
          // Patient first, device beneath (as the app's Scan Details dialog)
          <div ref={resultRef} className="flex flex-col w-full h-full" style={{ padding: "30px 36px 26px" }}>
            <span className="gf-muted text-[15px] font-semibold uppercase" style={{ letterSpacing: "0.08em" }}>Session for</span>
            <div className="flex items-center" style={{ gap: 20, marginTop: 14 }}>
              <span className="rounded-full flex items-center justify-center shrink-0 font-medium uppercase"
                style={{ width: 76, height: 76, fontSize: 24, background: "var(--gf-item-avatar-bg)", color: "var(--gf-item-avatar-text)" }}>
                {p.subject.initials}
              </span>
              <span className="flex flex-col min-w-0" style={{ gap: 4 }}>
                <span className="text-[32px] font-bold leading-tight truncate">{p.subject.name}</span>
                {p.subject.details.map(line => (
                  <span key={line} className="gf-muted text-[18px] tabular-nums truncate" style={{ lineHeight: "24px" }}>{line}</span>
                ))}
              </span>
            </div>
            <div aria-hidden="true" style={{ flex: "1 0 28px" }} />
            <div className="flex items-center" style={{ gap: 14, paddingTop: 22, borderTop: "1px solid var(--gf-surface-border-color)" }}>
              <span className="gf-proceed rounded-full flex items-center justify-center shrink-0" style={{ width: 30, height: 30 }} aria-hidden="true">
                <CheckIcon size={16} />
              </span>
              <span className="flex flex-col min-w-0" style={{ gap: 2 }}>
                <span className="text-[20px] font-bold leading-tight">{p.getTitle(item)}</span>
                <span className="gf-muted text-[16px] tabular-nums truncate">{p.getDetails(item).join(" · ")}</span>
              </span>
            </div>
            {readings.length > 0 && (
              <dl className="grid" style={{ gridTemplateColumns: `repeat(${READING_COLS}, 1fr)`, columnGap: 16, marginTop: 14 }}
                aria-label={`What the ${noun} recorded`}>
                {readings.map(r => (
                  <div key={r.label} className="flex flex-col min-w-0 justify-center" style={{ height: READING_ROW }}>
                    <dt className="gf-muted text-[14px] truncate" style={{ marginBottom: 2 }}>{r.label}</dt>
                    <dd className="text-[18px] font-bold leading-tight truncate tabular-nums">{r.value || "N/A"}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        ) : showResult && (
          <div ref={resultRef} className="flex flex-col items-center text-center" style={{ gap: 6, padding: "0 28px" }}>
            <span className="gf-muted text-[16px] font-semibold uppercase" style={{ letterSpacing: "0.08em" }}>Connected</span>
            <span className="text-[34px] font-bold leading-tight">{p.getTitle(item)}</span>
            {p.getDetails(item).map(line => (
              <span key={line} className="gf-muted text-[18px] tabular-nums" style={{ lineHeight: "26px" }}>{line}</span>
            ))}
          </div>
        )}
      </div>

      {/* Caption */}
      <div ref={captionRef} className="flex flex-col items-center text-center" style={{ marginTop: 36, minHeight: 100 }}>
        {showResult ? (
          <>
            <div className="flex items-center" style={{ gap: 16 }}>
              <button onClick={retry}
                className="gf-surface gf-secondary gf-pill text-[18px] font-semibold" style={{ height: 60, padding: "0 28px", minWidth: 190 }}>
                Scan again
              </button>
              <button ref={confirmRef} onClick={confirm}
                aria-label={p.subject ? `Confirm this ${p.getTitle(item)} session for ${p.subject.name}` : "Confirm"}
                className="gf-surface gf-dock gf-pill gf-selected text-[18px] font-semibold" style={{ height: 60, padding: "0 28px", minWidth: 190, transform: "none" }}>
                Confirm
              </button>
            </div>
          </>
        ) : failed ? (
          <>
            <p className="text-[24px] font-bold">Couldn&rsquo;t read a QR code</p>
            <p className="gf-muted text-[18px]" style={{ marginTop: 6, maxWidth: 460 }}>
              Wake the {noun}&rsquo;s screen and open the session summary, then try again.
            </p>
            <button ref={retryRef} onClick={retry}
              className="flex items-center gap-2 text-[18px] font-semibold px-4 rounded-full" style={{ minHeight: 44, marginTop: 10, opacity: 0 }}>
              <QrIcon size={20} />
              Scan again
            </button>
          </>
        ) : phase === "scanning" && (
          <>
            <p className="text-[24px] font-bold">Scan the QR code on the {noun}</p>
            <p className="gf-muted text-[18px]" style={{ marginTop: 6 }}>
              {rm ? "Scanning…" : "Hold the iPad steady, about 20 cm from the screen."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
