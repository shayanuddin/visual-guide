import { useState } from "react";
import { PainFace } from "../icons";
import { ConfirmButton, PickerPanel, type PickerProps, type PickerSpec } from "./shared";

type Spec = Extract<PickerSpec, { kind: "slider" }>;

const HANDLE = 24;

/** A scale on a rail: drag, tap a tick, or use the arrow keys. */
export default function SliderPicker({ spec, values, onConfirm, flipId }: PickerProps<Spec>) {
  const initial = parseFloat(values[spec.key] ?? "");
  const [n, setN] = useState(isNaN(initial) ? spec.min : initial);
  const range = spec.max - spec.min;
  const pct = ((n - spec.min) / range) * 100;
  const ticks = Array.from({ length: Math.floor(range / spec.tickEvery) + 1 }, (_, i) => spec.min + i * spec.tickEvery);
  // Handle centre runs from HANDLE/2 to width − HANDLE/2 so it never overhangs the rail
  const at = (p: number) => `calc(${HANDLE / 2}px + (100% - ${HANDLE}px) * ${p / 100})`;

  return (
    <PickerPanel flipId={flipId} width={680}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[22px] font-bold">{spec.label}</span>
        <span className="text-[22px] font-bold tabular-nums">{spec.readout(n)}</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative flex-1" style={{ paddingBottom: spec.faces ? 66 : 34 }}>
          {/* Rail */}
          <div className="relative" style={{ height: HANDLE }}>
            <span className="absolute left-0 right-0 rounded-full" style={{ top: HANDLE / 2 - 3, height: 6, background: "var(--gf-fg)", opacity: 0.22 }} />
            <span className="absolute left-0 rounded-full" style={{ top: HANDLE / 2 - 3, height: 6, width: at(pct), background: "var(--gf-fg)" }} />
            <span aria-hidden="true" className="absolute rounded-[9px] pointer-events-none" style={{
              top: 0, left: at(pct), width: HANDLE, height: HANDLE, marginLeft: -HANDLE / 2,
              // Figma handle: thick rim, small hollow centre
              border: "7px solid var(--gf-fg)", background: "var(--gf-tile-bg)",
            }} />
            <input
              autoFocus
              type="range" min={spec.min} max={spec.max} step={spec.step} value={n}
              onChange={e => setN(parseFloat(e.target.value))}
              onKeyDown={e => e.key === "Enter" && onConfirm({ [spec.key]: String(n) })}
              aria-label={spec.label}
              aria-valuetext={spec.readout(n)}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{ height: HANDLE, margin: 0 }}
            />
          </div>

          {/* Ticks — tappable shortcuts */}
          {ticks.map(t => {
            const p = ((t - spec.min) / range) * 100;
            return (
              <button key={t} type="button" tabIndex={-1} onClick={() => setN(t)} aria-hidden="true"
                className="absolute flex flex-col items-center gf-muted" style={{ left: at(p), top: HANDLE + 8, translate: "-50% 0", gap: 4 }}>
                <span style={{ width: 1.5, height: 10, background: "currentColor", opacity: 0.6 }} />
                <span className="text-[14px] tabular-nums" style={{ fontWeight: t === n ? 700 : 400, color: t === n ? "var(--gf-fg)" : undefined }}>{t}</span>
              </button>
            );
          })}

          {/* Pain faces at the quarter points */}
          {spec.faces && ([0, 1, 2, 3] as const).map(f => (
            <span key={f} aria-hidden="true" className="absolute gf-muted" style={{ left: at((f / 3) * 100), top: HANDLE + 44, translate: "-50% 0" }}>
              <PainFace level={f} size={26} />
            </span>
          ))}
        </div>
        <span className="self-start" style={{ marginTop: -18 }}>
          <ConfirmButton valid onClick={() => onConfirm({ [spec.key]: String(n) })} />
        </span>
      </div>
    </PickerPanel>
  );
}
