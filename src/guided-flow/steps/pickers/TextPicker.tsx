import { useState } from "react";
import { ConfirmButton, PickerError, PickerPanel, inputClass, inputStyle, type PickerProps, type PickerSpec } from "./shared";

type Spec = Extract<PickerSpec, { kind: "text" }>;

export default function TextPicker({ spec, values, onConfirm, flipId }: PickerProps<Spec>) {
  const [value, setValue] = useState(values[spec.key] ?? "");
  const [error, setError] = useState("");
  const valid = !spec.required || value.trim() !== "";

  function confirm() {
    if (!valid) { setError(`${spec.label} is required.`); return; }
    onConfirm({ [spec.key]: value.trim() });
  }

  const common = {
    autoFocus: true,
    value,
    placeholder: spec.placeholder ?? `Enter ${spec.label.toLowerCase()}`,
    "aria-label": spec.label,
    "aria-invalid": !!error,
  };

  return (
    <PickerPanel flipId={flipId} width={560}>
      <span className="gf-muted text-[16px]">{spec.label}</span>
      <div className={`flex gap-4 ${spec.multiline ? "items-end" : "items-center"}`}>
        {spec.multiline ? (
          <textarea
            {...common}
            rows={4}
            onChange={e => { setValue(e.target.value); setError(""); }}
            // Enter adds a line; Cmd/Ctrl+Enter confirms
            onKeyDown={e => e.key === "Enter" && (e.metaKey || e.ctrlKey) && confirm()}
            className={`${inputClass} flex-1 resize-none text-[20px] leading-snug`}
            style={inputStyle}
          />
        ) : (
          <input
            {...common}
            type="text"
            onChange={e => { setValue(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && confirm()}
            className={`${inputClass} flex-1 text-[28px] font-semibold`}
            style={inputStyle}
          />
        )}
        <ConfirmButton valid={valid} onClick={confirm} />
      </div>
      <PickerError message={error} />
    </PickerPanel>
  );
}
