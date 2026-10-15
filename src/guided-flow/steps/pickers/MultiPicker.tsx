import { useState } from "react";
import { CheckIcon } from "../icons";
import { ConfirmButton, PickerPanel, type PickerProps, type PickerSpec } from "./shared";

type Spec = Extract<PickerSpec, { kind: "multi" }>;

export const joinMulti = (items: string[]) => items.join(", ");
export const splitMulti = (value = "") => value.split(",").map(s => s.trim()).filter(Boolean);

/** Toggle any number of options (e.g. CPT codes), then confirm. Picks keep their order of selection. */
export default function MultiPicker({ spec, values, onConfirm, flipId }: PickerProps<Spec>) {
  const [picked, setPicked] = useState(() => splitMulti(values[spec.key]));
  const min = spec.min ?? 1;
  const valid = picked.length >= min;

  function toggle(o: string) {
    setPicked(p => (p.includes(o) ? p.filter(x => x !== o) : [...p, o]));
  }

  return (
    <PickerPanel flipId={flipId} width={720}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-[22px] font-bold">{spec.label}</span>
        <span className="gf-muted text-[17px] tabular-nums">{picked.length ? `${picked.length} selected` : "Select at least one"}</span>
      </div>
      <div role="group" aria-label={spec.label} className="grid grid-cols-2" style={{ gap: 10 }}>
        {spec.options.map(o => {
          const on = picked.includes(o);
          return (
            <button key={o} type="button" role="checkbox" aria-checked={on} onClick={() => toggle(o)}
              className={`gf-surface gf-tile gf-pill flex items-center text-left ${on ? "gf-selected" : ""}`}
              style={{ minHeight: 56, padding: "8px 18px", gap: 12, transform: "none" }}>
              <span aria-hidden="true" className="rounded-full flex items-center justify-center shrink-0"
                style={{ width: 24, height: 24, border: "1.5px solid currentColor", background: on ? "currentColor" : "transparent" }}>
                {on && <span style={{ color: "var(--gf-solid-selected-bg, #222)", display: "flex" }}><CheckIcon size={14} /></span>}
              </span>
              <span className="text-[17px] font-medium leading-snug">{spec.labels?.[o] ?? o}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <ConfirmButton valid={valid} onClick={() => valid && onConfirm({ [spec.key]: joinMulti(picked) })} />
      </div>
    </PickerPanel>
  );
}
