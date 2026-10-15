import { useState } from "react";
import { calcAge } from "../../data";
import { ChevronIcon } from "../icons";
import { ConfirmButton, PickerError, PickerPanel, inputClass, inputStyle, type PickerProps, type PickerSpec } from "./shared";

type Spec = Extract<PickerSpec, { kind: "date" }>;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDob(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

function parseDob(v: string): { m: number; d: number; y: number } | null {
  const [ms, ds, ys] = v.split("/");
  const m = parseInt(ms) - 1, d = parseInt(ds), y = parseInt(ys);
  if (isNaN(m) || isNaN(d) || isNaN(y) || y < 1900 || m < 0 || m > 11 || d < 1 || d > daysIn(y, m)) return null;
  return { m, d, y };
}

export function validateDob(v: string): string {
  if (!v) return "Date of birth is required.";
  const p = parseDob(v);
  if (!p || ys(v) < 4 || !calcAge(v)) return "Enter a valid date (MM/DD/YYYY).";
  return "";
}

/** Any real date up to today (e.g. a note's effective date). */
export function validatePastDate(v: string, label: string): string {
  if (!v) return `${label} is required.`;
  const p = parseDob(v);
  if (!p || ys(v) < 4) return "Enter a valid date (MM/DD/YYYY).";
  if (new Date(p.y, p.m, p.d) > new Date()) return `${label} can't be in the future.`;
  return "";
}
const ys = (v: string) => (v.split("/")[2] ?? "").length;

export default function DatePicker({ spec, values, onConfirm, flipId }: PickerProps<Spec>) {
  const dob = !spec.label;
  const label = spec.label ?? "Date of birth";
  const validate = (v: string) => (dob ? validateDob(v) : validatePastDate(v, label));
  const [value, setValue] = useState(values[spec.key] ?? "");
  const [error, setError] = useState("");
  const parsed = parseDob(value);
  const today = new Date();
  const [viewYear, setViewYear] = useState(parsed?.y ?? today.getFullYear() - (dob ? 40 : 0));
  const [viewMonth, setViewMonth] = useState(parsed?.m ?? (dob ? 0 : today.getMonth()));
  const [mode, setMode] = useState<"days" | "months" | "years">("days");
  const age = dob && validateDob(value) === "" ? calcAge(value) : "";

  function confirm(v = value) {
    const err = validate(v);
    if (err) { setError(err); return; }
    onConfirm({ [spec.key]: v });
  }

  function type(raw: string) {
    const v = formatDob(raw);
    setValue(v);
    setError("");
    const p = parseDob(v);
    if (p && ys(v) === 4) { setViewYear(p.y); setViewMonth(p.m); }
  }

  function selectDay(d: number) {
    const v = `${String(viewMonth + 1).padStart(2, "0")}/${String(d).padStart(2, "0")}/${viewYear}`;
    setValue(v);
    setError("");
  }

  function shiftMonth(delta: number) {
    const m = viewMonth + delta;
    setViewMonth((m + 12) % 12);
    if (m < 0) setViewYear(y => y - 1);
    if (m > 11) setViewYear(y => y + 1);
  }

  const first = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [
    ...Array<null>(first).fill(null),
    ...Array.from({ length: daysIn(viewYear, viewMonth) }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const years = Array.from({ length: dob ? 100 : 3 }, (_, i) => today.getFullYear() - i);

  const cellBtn = (sel: boolean) => ({
    background: sel ? "var(--gf-selected-bg)" : "transparent",
    color: sel ? "var(--gf-selected-text)" : "inherit",
  });

  return (
    <PickerPanel flipId={flipId} width={480}>
      <div className="flex items-center gap-4">
        <input
          autoFocus
          type="text"
          inputMode="numeric"
          value={value}
          placeholder="MM/DD/YYYY"
          onChange={e => type(e.target.value)}
          onKeyDown={e => e.key === "Enter" && confirm()}
          aria-label={`${label}, MM/DD/YYYY`}
          aria-invalid={!!error}
          className={`${inputClass} flex-1 text-[32px] font-semibold tracking-wide tabular-nums`}
          style={inputStyle}
        />
        {age && <span className="gf-muted text-[17px] tabular-nums shrink-0">{age} yrs</span>}
        <ConfirmButton valid={validate(value) === ""} onClick={() => confirm()} />
      </div>
      <PickerError message={error} />

      <div style={{ borderTop: "1px solid var(--gf-surface-border-color)", paddingTop: 12 }}>
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month"
            className="size-11 rounded-full flex items-center justify-center" style={{ visibility: mode === "days" ? "visible" : "hidden" }}>
            <ChevronIcon dir="left" />
          </button>
          <button type="button" className="text-[17px] font-semibold px-3 h-11 rounded-full"
            onClick={() => setMode(m => (m === "days" ? "months" : m === "months" ? "years" : "days"))}>
            {mode === "days" ? `${MONTHS[viewMonth]} ${viewYear}` : mode === "months" ? viewYear : "Select year"}
          </button>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month"
            className="size-11 rounded-full flex items-center justify-center" style={{ visibility: mode === "days" ? "visible" : "hidden" }}>
            <ChevronIcon dir="right" />
          </button>
        </div>

        {mode === "days" && (
          <>
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => <span key={d} className="gf-muted text-center text-[13px] font-semibold">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((day, i) => {
                const sel = day !== null && parsed?.d === day && parsed.m === viewMonth && parsed.y === viewYear;
                const future = day !== null && new Date(viewYear, viewMonth, day) > today;
                return (
                  <button key={i} type="button" disabled={!day || future} onClick={() => day && selectDay(day)}
                    aria-label={day ? `${MONTHS[viewMonth]} ${day}, ${viewYear}` : undefined}
                    className="mx-auto rounded-full text-[15px] tabular-nums disabled:opacity-35"
                    style={{ width: 44, height: 44, visibility: day ? "visible" : "hidden", ...cellBtn(sel) }}>
                    {day ?? ""}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {mode === "months" && (
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((name, i) => (
              <button key={name} type="button" onClick={() => { setViewMonth(i); setMode("days"); }}
                className="h-11 rounded-full text-[15px]" style={cellBtn(i === viewMonth)}>
                {name.slice(0, 3)}
              </button>
            ))}
          </div>
        )}

        {mode === "years" && (
          <div className="grid grid-cols-4 gap-1 overflow-y-auto gf-no-scroll" style={{ maxHeight: 264 }}>
            {years.map(y => (
              <button key={y} type="button" onClick={() => { setViewYear(y); setMode("months"); }}
                className="h-11 rounded-full text-[15px] tabular-nums" style={cellBtn(y === viewYear)}>
                {y}
              </button>
            ))}
          </div>
        )}
      </div>
    </PickerPanel>
  );
}
