import { useState } from "react";
import { heightToCm } from "../../data";
import { ConfirmButton, PickerError, PickerPanel, inputClass, inputStyle, type PickerProps, type PickerSpec } from "./shared";

type Spec = Extract<PickerSpec, { kind: "height" }>;

export function validateHeight(ft: string, inches: string): string {
  if (!ft) return "Height (ft) is required.";
  const f = parseFloat(ft);
  if (isNaN(f) || f < 3 || f > 8) return "Enter a height between 3 and 8 ft.";
  if (inches) {
    const i = parseFloat(inches);
    if (isNaN(i) || i < 0 || i > 11) return "Inches must be 0–11.";
  }
  return "";
}

export default function HeightPicker({ spec, values, onConfirm, flipId }: PickerProps<Spec>) {
  const [ft, setFt] = useState(values[spec.ftKey] ?? "");
  const [inches, setInches] = useState(values[spec.inKey] ?? "");
  const [error, setError] = useState("");
  const valid = validateHeight(ft, inches) === "";
  const cm = heightToCm(ft, inches);

  function confirm() {
    const err = validateHeight(ft, inches);
    if (err) { setError(err); return; }
    onConfirm({ [spec.ftKey]: String(parseFloat(ft)), [spec.inKey]: inches ? String(parseFloat(inches)) : "0" });
  }

  const field = (value: string, set: (v: string) => void, unit: string, label: string, max: number, auto = false) => (
    <span className="flex items-baseline gap-2">
      <input
        autoFocus={auto}
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={value}
        onChange={e => { set(e.target.value); setError(""); }}
        onKeyDown={e => e.key === "Enter" && confirm()}
        aria-label={label}
        aria-invalid={!!error}
        className={`${inputClass} text-[38px] font-semibold text-right tabular-nums`}
        style={{ ...inputStyle, width: 64 }}
      />
      <span className="gf-muted text-[22px]">{unit}</span>
    </span>
  );

  return (
    <PickerPanel flipId={flipId}>
      <div className="flex items-center gap-5">
        {field(ft, setFt, "ft", "Height feet", 8, true)}
        {field(inches, setInches, "in", "Height inches", 11)}
        <span className="flex-1 text-right gf-muted text-[20px] tabular-nums">{cm > 0 ? `${cm} cm` : ""}</span>
        <ConfirmButton valid={valid} onClick={confirm} />
      </div>
      <PickerError message={error} />
    </PickerPanel>
  );
}
