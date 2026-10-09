import { useEffect, useRef, useState } from "react";
import { M, ms } from "../../motion";
import type { PickerProps, PickerSpec } from "./shared";

type Spec = Extract<PickerSpec, { kind: "options" }>;

// Options take over the review tiles' slots (option i ↔ slot i) so the grid
// reshapes into the choices and back. Options beyond the slots fade in.
export default function OptionPicker({ spec, values, onConfirm }: PickerProps<Spec>) {
  const [picked, setPicked] = useState<string | null>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const current = values[spec.key];
  const tiles = spec.layout === "tiles";

  function pick(o: string) {
    if (picked) return;
    setPicked(o);
    timer.current = window.setTimeout(() => onConfirm({ [spec.key]: o }), ms(M.select + M.selectHold));
  }

  return (
    <div role="radiogroup" className={tiles ? "flex flex-wrap justify-center" : "grid grid-cols-2"}
      style={{ gap: tiles ? 20 : 16, maxWidth: tiles ? 700 : 760 }}>
      {spec.options.map((o, i) => {
        const isSel = picked === o;
        const isCurrent = !picked && current === o;
        return (
          <button
            key={o}
            data-flip-id={`slot-${i}`}
            role="radio"
            aria-checked={picked ? isSel : isCurrent}
            onClick={() => pick(o)}
            className={`gf-surface gf-tile ${tiles ? "gf-card justify-center text-center" : "gf-pill text-left"} flex items-center ${isSel ? "gf-selected" : ""}`}
            style={{
              ...(tiles ? { width: 220, height: 146.5, padding: 16 } : { width: 372, minHeight: 64, padding: "10px 26px" }),
              opacity: picked && !isSel ? M.dimOpacity : undefined,
              transition: picked ? `opacity ${M.select}s ease, background-color ${M.select}s ease` : undefined,
              outline: isCurrent ? "2px solid var(--gf-fg)" : "none",
              outlineOffset: -2,
            }}
          >
            <span className={tiles ? "text-[24px] font-bold" : "text-[18px] font-medium leading-snug"}>{o}</span>
          </button>
        );
      })}
    </div>
  );
}
