import { useState } from "react";
import { ConfirmButton, PickerError, PickerPanel, inputClass, inputStyle, type PickerProps, type PickerSpec } from "./shared";

type Spec = Extract<PickerSpec, { kind: "number" }>;

export function validateNumber(raw: string, spec: Spec): string {
  if (!raw) return `${spec.label} is required.`;
  const n = parseFloat(raw);
  if (isNaN(n) || n < spec.min || n > spec.max) return `${spec.label} must be between ${spec.min} and ${spec.max} ${spec.unit}.`;
  return "";
}

export default function NumberPicker({ spec, values, onConfirm, flipId }: PickerProps<Spec>) {
  const [value, setValue] = useState(values[spec.key] ?? "");
  const [error, setError] = useState("");
  const valid = validateNumber(value, spec) === "";

  function step(delta: number) {
    const n = parseFloat(value) || spec.min;
    setValue(String(Math.max(spec.min, Math.min(spec.max, n + delta))));
    setError("");
  }

  function confirm() {
    const err = validateNumber(value, spec);
    if (err) { setError(err); return; }
    onConfirm({ [spec.key]: String(parseFloat(value)) });
  }

  return (
    <PickerPanel flipId={flipId}>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => step(-1)} aria-label={`Decrease ${spec.label.toLowerCase()}`}
          className="gf-surface gf-dock rounded-full shrink-0 flex items-center justify-center text-[28px] font-light" style={{ width: 56, height: 56 }}>−</button>
        <div className="flex-1 flex items-baseline justify-center gap-2">
          <input
            autoFocus
            type="number"
            inputMode="decimal"
            min={spec.min}
            max={spec.max}
            value={value}
            onChange={e => { setValue(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && confirm()}
            aria-label={`${spec.label} in ${spec.unit}`}
            aria-invalid={!!error}
            className={`${inputClass} text-[38px] font-semibold text-right tabular-nums`}
            style={{ ...inputStyle, width: 120 }}
          />
          <span className="gf-muted text-[22px]">{spec.unit}</span>
        </div>
        <button type="button" onClick={() => step(1)} aria-label={`Increase ${spec.label.toLowerCase()}`}
          className="gf-surface gf-dock rounded-full shrink-0 flex items-center justify-center text-[28px] font-light" style={{ width: 56, height: 56 }}>+</button>
        <ConfirmButton valid={valid} onClick={confirm} />
      </div>
      <PickerError message={error} />
    </PickerPanel>
  );
}
