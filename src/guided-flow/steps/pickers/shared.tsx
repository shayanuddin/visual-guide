import type { ReactNode } from "react";
import { CheckIcon } from "../icons";

export type Values = Record<string, string>;

/** How a review field is edited. Keys refer to entries in the review values. */
export type PickerSpec =
  | { kind: "options"; key: string; options: string[]; layout: "tiles" | "list" }
  | { kind: "date"; key: string }
  | { kind: "number"; key: string; min: number; max: number; unit: string; label: string }
  | { kind: "height"; ftKey: string; inKey: string };

export interface PickerProps<S extends PickerSpec> {
  spec: S;
  values: Values;
  onConfirm: (patch: Values) => void;
  /** data-flip-id for the element that morphs from the tapped tile. */
  flipId: string;
}

export function PickerPanel({ flipId, width = 520, children }: { flipId: string; width?: number; children: ReactNode }) {
  return (
    <div data-flip-id={flipId} className="gf-surface gf-tile gf-card flex flex-col" style={{ width, padding: 24, gap: 14 }}>
      {children}
    </div>
  );
}

export function ConfirmButton({ valid, onClick }: { valid: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Confirm"
      className={`gf-surface gf-dock rounded-full flex items-center justify-center shrink-0 ${valid ? "gf-selected" : ""}`}
      style={{ width: 60, height: 60, transform: "none" }}>
      <CheckIcon size={26} />
    </button>
  );
}

export function PickerError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-[16px] flex items-center gap-2">
      <span aria-hidden="true" className="rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
        style={{ width: 18, height: 18, border: "1.5px solid currentColor" }}>!</span>
      {message}
    </p>
  );
}

/** Bare input that inherits the glass text colour. */
export const inputClass = "bg-transparent outline-none border-none min-w-0";
export const inputStyle = { color: "inherit", boxShadow: "none" } as const;
