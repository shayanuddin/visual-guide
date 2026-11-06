import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { M } from "../motion";
import type { StepApi } from "../flows/types";
import type { InstructionIcon, TestInstructions } from "../data";
import ProceedButton from "./ProceedButton";

// Read-aloud instructions before a test begins: a scrolling glass card of
// icon + text lines, and the proceed button that starts the test. Nothing to
// fill in, so it's ready from the start.

export interface InstructionsStepProps<C extends object> extends StepApi<C> {
  /** Shown in the card where the theme has no step heading (Dark, Light). */
  title: string;
  instructions: TestInstructions;
  proceedLabel: string;
  toContext: () => Partial<C>;
}

// The ACPlus instruction drawings (also used by the app's own Instructions screen)
const ICON_SRC: Record<InstructionIcon, string> = {
  mouthpiece: "2b7e1.svg",
  inhale: "af918.svg",
  exhale: "fc90b.svg",
  rest: "9bac3.svg",
  repeat: "99b94.svg",
};
const iconUrl = (icon: InstructionIcon) => `url("${import.meta.env.BASE_URL}assets/${ICON_SRC[icon]}")`;

export default function InstructionsStep<C extends object>(p: InstructionsStepProps<C>) {
  const { reducedMotion: rm, setCommandHandler } = p;
  const scrollRef = useRef<HTMLDivElement>(null);
  // Fade the bottom edge while there's more to read
  const [more, setMore] = useState(false);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (el) setMore(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  useLayoutEffect(() => {
    measure();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  // Lines arrive one after another
  useLayoutEffect(() => {
    const rows = scrollRef.current?.querySelectorAll("[data-instr-row]");
    if (!rows?.length) return;
    gsap.fromTo(rows, rm ? { opacity: 0 } : { opacity: 0, y: M.itemRise },
      { opacity: 1, y: 0, duration: M.itemIn, stagger: M.stagger, ease: M.stepInEase, clearProps: "transform" });
  }, [rm]);

  const proceed = () => p.complete(p.toContext());

  // External "start" (e.g. the assistant's Start the test chip)
  const proceedRef = useRef(proceed);
  proceedRef.current = proceed;
  useEffect(() => {
    setCommandHandler(cmd => {
      if (cmd.type !== "start") return false;
      proceedRef.current();
      return true;
    });
    return () => setCommandHandler(null);
  }, [setCommandHandler]);

  const { intro, lines, outro } = p.instructions;

  return (
    <div className="gf-instructions absolute inset-0 flex justify-center">
      <section aria-label={p.title} className="gf-surface gf-tile gf-card flex flex-col overflow-hidden"
        style={{ width: 820, maxHeight: "100%" }}>
        <div ref={scrollRef} onScroll={measure} tabIndex={0} role="region" aria-label={`${p.title}, scrollable`}
          className={`gf-scroll gf-instr-scroll overflow-y-auto ${more ? "gf-instr-more" : ""}`}
          style={{ padding: "30px 40px 34px 40px", userSelect: "text" }}>
          <h3 className="gf-not-brand text-[28px] font-bold" style={{ lineHeight: 1.25, marginBottom: 14 }}>{p.title}</h3>
          <p className="gf-muted text-[19px]" style={{ lineHeight: "28px" }}>{intro}</p>
          <ol className="flex flex-col" style={{ gap: 18, margin: "24px 0" }}>
            {lines.map((l, i) => (
              <li key={i} data-instr-row className="flex items-center" style={{ gap: 26 }}>
                <span aria-hidden="true" className="gf-instr-icon shrink-0"
                  style={{ width: 58, height: 58, ["--icon" as string]: iconUrl(l.icon),
                    ...(l.icon === "repeat" ? { transform: "scaleX(-1)" } : {}) } as CSSProperties} />
                <span className="text-[21px] font-semibold" style={{ lineHeight: "30px" }}>{l.text}</span>
              </li>
            ))}
          </ol>
          <p className="gf-muted text-[19px]" style={{ lineHeight: "28px" }}>{outro}</p>
        </div>
      </section>

      <ProceedButton ready label={p.proceedLabel} isLastStep={p.isLastStep} reducedMotion={rm} onClick={proceed} />
    </div>
  );
}
