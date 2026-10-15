import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { M, ms } from "../motion";
import type { StepApi } from "../flows/types";
import { ArrowUpRightIcon } from "./icons";

export interface ChoiceOption {
  id: string;
  title: string;
  description?: string;
}

export interface ChoiceStepProps<C extends object> extends StepApi<C> {
  options: ChoiceOption[];
  toContext: (option: ChoiceOption) => Partial<C>;
  /** Cards per row; by default they wrap to the screen. */
  columns?: number;
  /** The option chosen before (after going back); outlined until another is picked. */
  current?: string;
}

const CARD_W = 397;
const CARD_GAP = 36;

export default function ChoiceStep<C extends object>(p: ChoiceStepProps<C>) {
  const { options, reducedMotion: rm, setCommandHandler } = p;
  const [selected, setSelected] = useState<string | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useLayoutEffect(() => {
    const els = rowRef.current ? Array.from(rowRef.current.children) : [];
    gsap.fromTo(els,
      rm ? { opacity: 0 } : { opacity: 0, y: M.itemRise },
      { opacity: 1, y: 0, duration: M.itemIn, stagger: M.stagger, ease: M.stepInEase, clearProps: "transform" });
  }, [rm]);

  function pick(o: ChoiceOption) {
    if (selected) return;
    setSelected(o.id);
    timer.current = window.setTimeout(() => p.complete(p.toContext(o)), ms(M.select + M.selectHold));
  }

  // External "choose" (e.g. the assistant's Choose … chip)
  const pickRef = useRef(pick);
  pickRef.current = pick;
  useEffect(() => {
    setCommandHandler(cmd => {
      const option = cmd.type === "choose" ? options.find(o => o.id === cmd.value) : undefined;
      if (!option) return false;
      pickRef.current(option);
      return true;
    });
    return () => setCommandHandler(null);
  }, [setCommandHandler, options]);

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: 200, paddingBottom: 120 }}>
      <div ref={rowRef} role="radiogroup" className="flex flex-wrap justify-center"
        style={{ gap: CARD_GAP, maxWidth: p.columns ? p.columns * CARD_W + (p.columns - 1) * CARD_GAP : undefined }}>
        {options.map(o => {
          const isSel = selected === o.id;
          const isCurrent = !selected && p.current === o.id;
          return (
            <button
              key={o.id}
              role="radio"
              aria-checked={selected ? isSel : isCurrent}
              onClick={() => pick(o)}
              className={`gf-surface gf-choice gf-card relative flex flex-col items-start text-left ${isSel || isCurrent ? "gf-selected" : "hover:scale-105 active:scale-105"}`}
              style={{
                width: CARD_W, minHeight: 212, padding: "26px 35px", gap: 12,
                opacity: selected && !isSel ? M.dimOpacity : 1,
                // Hover grow uses the CSS `scale` property, so it needs its own transition.
                transition: [
                  `scale ${M.hoverScale}s ${M.hoverEase}`,
                  `transform ${M.select}s ${M.hoverEase}`,
                  `background-color ${M.select}s ease`,
                  ...(selected ? [`opacity ${M.select}s ease`] : []),
                ].join(", "),
              }}
            >
              <span className="text-[24px] font-bold" style={{ lineHeight: "34px", paddingRight: 36 }}>{o.title}</span>
              {o.description && <span className="gf-muted text-[20px]" style={{ lineHeight: "28px" }}>{o.description}</span>}
              <span className="absolute" style={{ top: 18, right: 20 }}><ArrowUpRightIcon size={34} strokeWidth={1.4} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
