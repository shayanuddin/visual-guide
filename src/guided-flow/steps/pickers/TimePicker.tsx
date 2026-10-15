import { useState } from "react";
import { ConfirmButton, PickerError, PickerPanel, inputClass, inputStyle, type PickerProps, type PickerSpec } from "./shared";

type Spec = Extract<PickerSpec, { kind: "time" }>;

/** Values are stored as "h:mm AM". */
export function parseTime(v = ""): { h: string; m: string; pm: boolean } {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(v.trim());
  if (!match) return { h: "", m: "", pm: false };
  return { h: match[1], m: match[2], pm: match[3].toUpperCase() === "PM" };
}

export function formatTime(d: Date): string {
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`;
}

function validate(h: string, m: string, label: string): string {
  if (!h || !m) return `${label} is required.`;
  const hn = parseInt(h), mn = parseInt(m);
  if (isNaN(hn) || hn < 1 || hn > 12) return "Hour must be 1–12.";
  if (isNaN(mn) || mn < 0 || mn > 59) return "Minutes must be 0–59.";
  return "";
}

export default function TimePicker({ spec, values, onConfirm, flipId }: PickerProps<Spec>) {
  const initial = parseTime(values[spec.key]);
  const [h, setH] = useState(initial.h);
  const [m, setM] = useState(initial.m);
  const [pm, setPm] = useState(initial.pm);
  const [error, setError] = useState("");
  const valid = validate(h, m, spec.label) === "";

  function confirm() {
    const err = validate(h, m, spec.label);
    if (err) { setError(err); return; }
    onConfirm({ [spec.key]: `${parseInt(h)}:${String(parseInt(m)).padStart(2, "0")} ${pm ? "PM" : "AM"}` });
  }

  const field = (value: string, set: (v: string) => void, label: string, max: number, auto = false) => (
    <input
      autoFocus={auto}
      type="number"
      inputMode="numeric"
      min={0}
      max={max}
      value={value}
      placeholder="--"
      onChange={e => { set(e.target.value.slice(0, 2)); setError(""); }}
      onKeyDown={e => e.key === "Enter" && confirm()}
      aria-label={label}
      aria-invalid={!!error}
      className={`${inputClass} text-[38px] font-semibold text-center tabular-nums`}
      style={{ ...inputStyle, width: 64 }}
    />
  );

  const half = (isPm: boolean) => (
    <button type="button" role="radio" aria-checked={pm === isPm} onClick={() => setPm(isPm)}
      className="gf-pill text-[17px] font-semibold" style={{
        height: 44, padding: "0 16px",
        background: pm === isPm ? "var(--gf-selected-bg)" : "transparent",
        color: pm === isPm ? "var(--gf-selected-text)" : "inherit",
      }}>
      {isPm ? "PM" : "AM"}
    </button>
  );

  return (
    <PickerPanel flipId={flipId} width={480}>
      <div className="flex items-center gap-3">
        {field(h, setH, `${spec.label} hour`, 12, true)}
        <span className="text-[38px] font-semibold" aria-hidden="true">:</span>
        {field(m, setM, `${spec.label} minutes`, 59)}
        <div role="radiogroup" aria-label="AM or PM" className="flex flex-1 justify-center gap-1">
          {half(false)}
          {half(true)}
        </div>
        <ConfirmButton valid={valid} onClick={confirm} />
      </div>
      <PickerError message={error} />
    </PickerPanel>
  );
}
