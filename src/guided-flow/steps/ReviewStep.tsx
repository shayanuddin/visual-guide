import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { M } from "../motion";
import type { StepApi } from "../flows/types";
import ProceedButton from "./ProceedButton";
import type { PickerSpec, Values } from "./pickers/shared";
import OptionPicker from "./pickers/OptionPicker";
import DatePicker from "./pickers/DatePicker";
import NumberPicker from "./pickers/NumberPicker";
import HeightPicker from "./pickers/HeightPicker";
import TextPicker from "./pickers/TextPicker";
import TimePicker from "./pickers/TimePicker";
import SliderPicker from "./pickers/SliderPicker";
import MultiPicker from "./pickers/MultiPicker";

export interface ReviewField {
  id: string;
  label: string;
  required?: boolean;
  /** Tile value; "" means missing. */
  display: (values: Values) => string;
  /** Omitted: the value came from elsewhere (e.g. the device) and can't be edited here. */
  picker?: PickerSpec;
}

export interface ReviewStepProps<C extends object> extends StepApi<C> {
  fields: ReviewField[];
  initialValues: (context: Readonly<C>) => Values;
  toContext: (values: Values) => Partial<C>;
  proceedLabel: string;
  /** "compact" fits a 4 × 3 grid, for long read-outs like device records; "wide" gives two long values room. */
  density?: "regular" | "compact" | "wide";
  /** A free-text box under the tiles, typed into directly (no picker). */
  notes?: { key: string; label: string; placeholder: string };
}

/** What an empty tile asks for. */
const emptyLabel = (spec?: PickerSpec) => (spec?.kind === "text" ? "Type" : spec?.kind === "slider" ? "Set" : "Select");

const GRID = {
  regular: { cols: 3, w: 220, h: 146, gap: 20, pad: "12px 28px", value: 24, label: 18 },
  compact: { cols: 4, w: 200, h: 112, gap: 16, pad: "10px 22px", value: 21, label: 15 },
  wide: { cols: 2, w: 340, h: 146, gap: 20, pad: "12px 28px", value: 24, label: 18 },
} as const;

function Picker({ field, values, onConfirm, flipId }: { field: ReviewField; values: Values; onConfirm: (p: Values) => void; flipId: string }) {
  const spec = field.picker;
  if (!spec) return null;
  switch (spec.kind) {
    case "options": return <OptionPicker spec={spec} values={values} onConfirm={onConfirm} flipId={flipId} />;
    case "date": return <DatePicker spec={spec} values={values} onConfirm={onConfirm} flipId={flipId} />;
    case "number": return <NumberPicker spec={spec} values={values} onConfirm={onConfirm} flipId={flipId} />;
    case "height": return <HeightPicker spec={spec} values={values} onConfirm={onConfirm} flipId={flipId} />;
    case "text": return <TextPicker spec={spec} values={values} onConfirm={onConfirm} flipId={flipId} />;
    case "time": return <TimePicker spec={spec} values={values} onConfirm={onConfirm} flipId={flipId} />;
    case "slider": return <SliderPicker spec={spec} values={values} onConfirm={onConfirm} flipId={flipId} />;
    case "multi": return <MultiPicker spec={spec} values={values} onConfirm={onConfirm} flipId={flipId} />;
  }
}

export default function ReviewStep<C extends object>(p: ReviewStepProps<C>) {
  const { fields, reducedMotion: rm, setFocusMode, setEscapeHandler, setCommandHandler, announce } = p;
  const g = GRID[p.density ?? "regular"];
  const cols = Math.min(g.cols, fields.length);
  const rows = Math.ceil(fields.length / cols);
  const gridW = g.w * cols + g.gap * (cols - 1);
  const NOTES_H = 180;
  const [values, setValues] = useState<Values>(() => p.initialValues(p.context));
  const [editing, setEditing] = useState<number | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const returnFocus = useRef<number | null>(null);
  const morphing = useRef(false);

  const missing = fields.filter(f => f.required && !f.display(values));
  const ready = missing.length === 0;

  useEffect(() => { setFocusMode(editing !== null); }, [editing, setFocusMode]);
  useEffect(() => () => setEscapeHandler(null), [setEscapeHandler]);

  // Grid entrance
  useLayoutEffect(() => {
    const tiles = surfaceRef.current?.querySelectorAll("[data-flip-id]");
    if (!tiles?.length) return;
    gsap.fromTo(tiles, rm ? { opacity: 0 } : { opacity: 0, y: M.itemRise },
      { opacity: 1, y: 0, duration: M.itemIn, stagger: M.stagger, ease: M.stepInEase, clearProps: "transform" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function capture() {
    const el = surfaceRef.current;
    flipState.current = el ? Flip.getState(el.querySelectorAll("[data-flip-id]")) : null;
  }

  function open(i: number) {
    if (editing !== null || morphing.current || !fields[i].picker) return;
    capture();
    returnFocus.current = i;
    setEditing(i);
    setEscapeHandler(() => close());
    announce(`Editing ${fields[i].label}`);
  }

  function close(patch?: Values) {
    if (morphing.current) return;
    capture();
    if (patch) setValues(v => ({ ...v, ...patch }));
    setEditing(null);
    setEscapeHandler(null);
  }

  // Morph between grid and picker
  useLayoutEffect(() => {
    const state = flipState.current;
    const el = surfaceRef.current;
    if (!state || !el) return;
    flipState.current = null;
    const targets = el.querySelectorAll<HTMLElement>("[data-flip-id]");
    const focusAfter = () => {
      morphing.current = false;
      const target = editing === null
        ? el.querySelector<HTMLElement>(`[data-flip-id="slot-${returnFocus.current}"]`)
        : el.querySelector<HTMLElement>("input,button");
      target?.focus({ preventScroll: true });
    };
    if (rm) {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: M.itemIn });
      focusAfter();
      return;
    }
    morphing.current = true;
    Flip.from(state, {
      targets,
      duration: M.flip,
      ease: M.flipEase,
      nested: true,
      onEnter: els => gsap.fromTo(els, { opacity: 0, scale: M.stepScale },
        { opacity: 1, scale: 1, duration: M.itemIn, delay: M.flip * 0.4, stagger: M.stagger }),
      onComplete: focusAfter,
    });
    // Contents of a morphing panel fade in once it has its new shape
    el.querySelectorAll<HTMLElement>("[data-flip-id] > *").forEach(child =>
      gsap.fromTo(child, { opacity: 0 }, { opacity: 1, duration: M.itemIn, delay: M.flip * 0.6 }));
  }, [editing, rm]);

  // External "edit" (e.g. the assistant's Edit height chip)
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    setCommandHandler(cmd => {
      const i = cmd.type === "edit" ? fields.findIndex(f => f.id === cmd.value && f.picker) : -1;
      if (i < 0) return false;
      openRef.current(i);
      return true;
    });
    return () => setCommandHandler(null);
  }, [setCommandHandler, fields]);

  function proceed() {
    if (!ready || editing !== null || morphing.current) return;
    p.complete(p.toContext(values));
  }

  const field = editing !== null ? fields[editing] : null;

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: 120, paddingBottom: 120 }}>
      {/* Surface keeps the grid's footprint so pickers grow from where the tiles were */}
      <div ref={surfaceRef} className="flex justify-center items-start"
        style={{ minHeight: g.h * rows + g.gap * (rows - 1) + (p.notes ? g.gap + NOTES_H : 0) }}>
        {field === null ? (
          <div className="flex flex-col" style={{ gap: g.gap }}>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, ${g.w}px)`, gap: g.gap }}>
            {fields.map((f, i) => {
              const v = f.display(values);
              if (!f.picker) return (
                // Read-only: no hover, not a button
                <div
                  key={f.id}
                  data-flip-id={`slot-${i}`}
                  role="group"
                  aria-label={`${f.label}: ${v || "not recorded"}, from device`}
                  className="gf-surface gf-tile gf-card relative flex flex-col justify-center items-start text-left"
                  style={{ width: g.w, height: g.h, padding: g.pad, gap: 8 }}
                >
                  <span className={`font-bold leading-tight line-clamp-2 break-words tabular-nums ${v ? "" : "gf-muted"}`} style={{ fontSize: g.value }}>{v || "N/A"}</span>
                  <span className="gf-muted leading-snug line-clamp-2" style={{ fontSize: g.label }}>{f.label}</span>
                </div>
              );
              return (
                <button
                  key={f.id}
                  data-flip-id={`slot-${i}`}
                  onClick={() => open(i)}
                  aria-label={`${f.label}: ${v || "not set"}. Edit`}
                  className="gf-surface gf-tile gf-card relative flex flex-col justify-center items-start text-left"
                  style={{ width: g.w, height: g.h, padding: g.pad, gap: p.density === "compact" ? 8 : 15 }}
                >
                  {v ? (
                    <span className="font-bold leading-tight line-clamp-2 break-words" style={{ fontSize: g.value }}>{v}</span>
                  ) : (
                    <span className="font-bold leading-tight gf-muted" style={{ fontSize: g.value }}>{emptyLabel(f.picker)}</span>
                  )}
                  <span className="gf-muted leading-snug line-clamp-2" style={{ fontSize: g.label }}>{f.label}</span>
                </button>
              );
            })}
          </div>
          {p.notes && (
            <label data-flip-id="notes" className="gf-surface gf-tile gf-card flex flex-col"
              style={{ width: gridW, height: NOTES_H, padding: "14px 22px", gap: 6 }}>
              <span className="gf-muted text-[16px]">{p.notes.label}</span>
              <textarea
                value={values[p.notes.key] ?? ""}
                onChange={e => { const v = e.target.value; setValues(prev => ({ ...prev, [p.notes!.key]: v })); }}
                placeholder={p.notes.placeholder}
                className="gf-scroll flex-1 resize-none bg-transparent outline-none border-none text-[19px] leading-snug"
                style={{ color: "inherit", boxShadow: "none", paddingRight: 6 }}
              />
            </label>
          )}
          </div>
        ) : (
          <Picker field={field} values={values} onConfirm={patch => close(patch)} flipId={`slot-${editing}`} />
        )}
      </div>

      <ProceedButton
        ready={ready}
        dimmed={editing !== null}
        label={ready ? p.proceedLabel : `${p.proceedLabel} — add ${missing.map(f => f.label).join(", ")} first`}
        isLastStep={p.isLastStep}
        reducedMotion={rm}
        onClick={proceed}
      />
    </div>
  );
}
