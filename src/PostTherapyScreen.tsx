import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CPT_CODES, NOTE_TYPES, SCALES, THERAPY_SETTINGS, cptLabel, fillTemplate, templatesFor, type ScaleSpec } from "./guided-flow/data";
import { PainFace } from "./guided-flow/steps/icons";
import type { PostTherapyContext } from "./guided-flow/flows/postTherapy";

// Post Therapy Documentation (Figma 11884:237848), opened pre-filled by the
// Scan QR guide. Device data is read-only; everything the clinician entered
// in the guide stays editable here, and the note text is rebuilt live.

const assetPathPrefix = `${import.meta.env.BASE_URL}assets/post-therapy`;
const imgQuestionMark = `${assetPathPrefix}/question-mark.svg`;
const imgQuestionMarkSmall = `${assetPathPrefix}/question-mark-small.svg`;
const imgChevronRight = `${assetPathPrefix}/chevron-right.svg`;
const imgArrowDown = `${assetPathPrefix}/arrow-down.svg`;
const imgArrowTilt = `${assetPathPrefix}/arrow-tilt.svg`;
const imgAdd = `${assetPathPrefix}/add.svg`;
const imgUpload = `${assetPathPrefix}/upload.svg`;

const SF = "system-ui, -apple-system, sans-serif";
const INK = "#212121";
const MUTED = "#a8a9aa";
const SUBTLE = "#999";
const GREEN = "#599400";
const STROKE = "#ececec";
const SLIDER_GRADIENT = "linear-gradient(90deg, #007A8B 0%, #3AAF4D 37%, #A8CB38 86%)";
const SKILLED_MAX = 60;

const card = "bg-white drop-shadow-[0px_0px_5px_rgba(77,77,79,0.1)] rounded-[14px] p-[24px] flex flex-col gap-[20px] w-full";
const field = "bg-white border-2 border-[#ececec] rounded-[10px] flex items-center";

/** 7.5 → "7:30" */
function mmss(minutes: string) {
  const n = parseFloat(minutes) || 0;
  return `${Math.floor(n)}:${String(Math.round((n % 1) * 60)).padStart(2, "0")}`;
}

/** Pain / Borg scale row (Figma "Add Scale" options). */
function ScaleSlider({ spec, value, onChange }: { spec: ScaleSpec; value: number; onChange: (n: number) => void }) {
  const range = spec.max - spec.min;
  const pct = ((value - spec.min) / range) * 100;
  const ticks = Array.from({ length: Math.floor(range / spec.tickEvery) + 1 }, (_, i) => spec.min + i * spec.tickEvery);
  const at = (p: number) => `calc(12px + (100% - 24px) * ${p / 100})`;
  return (
    <div className="flex flex-col gap-[22px] w-full">
      <div className="flex items-baseline justify-between text-[24px]" style={{ fontFamily: SF }}>
        <span style={{ color: "#58595c", fontWeight: 600 }}>{spec.label}</span>
        <span style={{ color: "#8b8c8e", fontWeight: 500 }}>
          {spec.levelLabel}: <span style={{ color: "#434343", fontWeight: 700 }}>{spec.level(value)}</span>
        </span>
      </div>
      <div className="relative" style={{ height: spec.faces ? 150 : 76 }}>
        <div className="relative h-[24px]">
          <span className="absolute left-0 right-0 top-[9px] h-[6px] rounded-full bg-[#eaf3da]" />
          <span className="absolute left-0 top-[9px] h-[6px] rounded-full" style={{ width: at(pct), backgroundImage: SLIDER_GRADIENT }} />
          <span aria-hidden="true" className="absolute top-0 size-[24px] rounded-[8px] flex items-center justify-center shadow-[0px_2px_5px_0px_rgba(30,49,0,0.2)] pointer-events-none"
            style={{ left: at(pct), marginLeft: -12, backgroundImage: "linear-gradient(135deg, #007A8B 0%, #3AAF4D 50%, #A8CB38 100%)" }}>
            <span className="size-[9px] rounded-[2px] bg-white" />
          </span>
          <input type="range" min={spec.min} max={spec.max} step={1} value={value} onChange={e => onChange(parseFloat(e.target.value))}
            aria-label={spec.label} aria-valuetext={`${spec.levelLabel}: ${spec.level(value)}`}
            className="absolute inset-0 w-full h-[24px] opacity-0 cursor-pointer m-0" />
        </div>
        {ticks.map(t => (
          <button key={t} tabIndex={-1} aria-hidden="true" onClick={() => onChange(t)}
            className="absolute top-[38px] flex flex-col items-center gap-[6px]" style={{ left: at(((t - spec.min) / range) * 100), translate: "-50% 0" }}>
            <span className="w-[1.5px] h-[12px] bg-[#c4c4c4]" />
            <span className="text-[18px] tabular-nums" style={{ fontFamily: SF, color: t === value ? "#434343" : "#c4c4c4", fontWeight: t === value ? 600 : 400 }}>{t}</span>
          </button>
        ))}
        {spec.faces && ([0, 1, 2, 3] as const).map(f => (
          <span key={f} aria-hidden="true" className="absolute top-[100px]" style={{ left: at((f / 3) * 100), translate: "-50% 0", color: "#a8a9aa" }}>
            <PainFace level={f} size={48} strokeWidth={1.3} />
          </span>
        ))}
      </div>
    </div>
  );
}

interface Props {
  context: Required<PostTherapyContext>;
  logo: ReactNode;
  cancelIcon: string;
  underline: string;
  onClose: () => void;
}

/** Figma camera (Camera_Outline) didn't export; drawn to match at 42.857px. */
function CameraOutline() {
  return (
    <svg width="42.857" height="42.857" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.6l1.4-2h7l1.4 2h2.6A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options?: string[]; onChange?: (v: string) => void }) {
  return (
    <label className={`${field} w-full relative h-[80px] p-[20px] gap-[12px]`}>
      <span className="flex-1 text-[20px]" style={{ fontFamily: SF, color: INK }}>{label}</span>
      <span className="flex items-center gap-[2px] text-[20px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 700, color: value ? INK : GREEN }}>
        {value || "Select"}
        <img alt="" className="size-[24px]" src={imgArrowTilt} />
      </span>
      {options && onChange && (
        <select aria-label={label} value={value} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer">
          {!value && <option value="">Select</option>}
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      )}
    </label>
  );
}

export default function PostTherapyScreen({ context, logo, cancelIcon, underline, onClose }: Props) {
  const { patient, session, noteInfo } = context;
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [skilled, setSkilled] = useState(context.treatment.skilledMinutes);
  const [setting, setSetting] = useState<string>(context.setting.label);
  const [location, setLocation] = useState(context.treatment.location);
  const [placement, setPlacement] = useState(context.treatment.placementNotes);
  const [clinician, setClinician] = useState(context.clinicianRecords);
  const [noteType, setNoteType] = useState(noteInfo.noteType);
  const [cpts, setCpts] = useState(context.billing.cpts);
  const templates = templatesFor(session.device);
  const [templateId, setTemplateId] = useState(context.billing.templateId);
  const template = templates.find(t => t.id === templateId);
  // A scale shows once it has a value; Load Scale adds the ones that don't
  const [pain, setPain] = useState(context.scales.pain);
  const [borg, setBorg] = useState(context.scales.borg);
  const hasScales = pain !== "" || borg !== "";

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, 340);
  }

  function save(message: string) {
    setSaved(message);
    setTimeout(close, 1400);
  }

  // The template's paragraph, written from what the guide collected
  const narrative = useMemo(() => template && fillTemplate(template.body, {
    device: session.device,
    mode: session.mode,
    location,
    skilled: `${mmss(skilled)} min`,
    setting: setting.toLowerCase(),
    pain: pain !== "" ? `${pain} (${SCALES.pain.level(parseFloat(pain))})` : "",
    borg: borg !== "" ? SCALES.borg.level(parseFloat(borg)) : "",
    ...Object.fromEntries(session.records.map(r => [r.id, r.value])),
  }), [template, session, location, skilled, setting, pain, borg]);

  const note = useMemo(() => [
    "DEVICE INFORMATION",
    `Device: ${session.device}`,
    `Mode: ${session.mode}`,
    `Skilled Time: ${mmss(skilled)}`,
    `Therapy Setting: ${setting}`,
    `Treatment Location: ${location || "—"} (${placement || "No additional placement notes"})`,
    ...session.records.map(r => `${r.label}: ${r.value || "N/A"}`),
    ...session.clinician.map(c => `${c.label}: ${clinician[c.id] ?? ""}`),
    ...(pain !== "" ? [`Pain Scale: ${pain} (${SCALES.pain.level(parseFloat(pain))})`] : []),
    ...(borg !== "" ? [`Borg Scale: ${SCALES.borg.level(parseFloat(borg))}`] : []),
    ...session.narrative,
  ], [session, skilled, setting, location, placement, clinician, pain, borg]);

  const skilledN = parseFloat(skilled) || 0;
  const pct = Math.min(100, (skilledN / SKILLED_MAX) * 100);
  const rows: { id: string; label: string; value: string; info?: string; edit?: (typeof session.clinician)[number] }[] = [
    ...session.records,
    ...session.clinician.map(c => ({ id: c.id, label: c.label, value: clinician[c.id] ?? "", edit: c })),
  ];

  return (
    <div className="fixed inset-0 z-40 bg-[#fcfcfc] flex flex-col overflow-hidden transition-transform duration-[340ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
      style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}>
      <div className="relative flex flex-col flex-1 min-h-0 px-[30px]">
        {/* Top nav */}
        <div className="relative flex items-center h-[68px] shrink-0">
          <button onClick={close} className="shrink-0 relative" style={{ width: 36, height: 36 }} aria-label="Close">
            <img alt="" className="absolute block inset-0 max-w-none" style={{ width: 34, height: "100%" }} src={cancelIcon} />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">{logo}</div>
        </div>

        {/* Heading + patient */}
        <div className="flex items-end justify-between shrink-0 mb-[20px] gap-6">
          <div>
            <h1 className="text-[#434343] text-[34px] leading-normal whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 700 }}>
              Post Therapy Documentation
            </h1>
            <div className="h-[8px] w-[60px] mt-1"><img alt="" className="block w-full h-full" src={underline} /></div>
          </div>
          <div className="flex items-center gap-3 bg-white border-2 border-[#ececec] rounded-[14px] px-[18px] py-[10px]">
            <span className="size-[40px] rounded-full bg-[#f7f7f7] flex items-center justify-center text-[#8b8c8e] text-[15px]" style={{ fontFamily: SF }}>{patient.initials}</span>
            <span className="flex flex-col">
              <span className="text-[18px] text-[#434343]" style={{ fontFamily: SF, fontWeight: 600 }}>{patient.name}</span>
              <span className="text-[14px]" style={{ fontFamily: SF, color: SUBTLE }}>{patient.mrn}</span>
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-[20px] flex-1 min-h-0 overflow-y-auto pb-[130px] px-[4px]" style={{ fontFamily: SF }}>
          {/* Device + mode */}
          <div className="flex gap-[20px] w-full">
            {[["Device", session.device], ["Mode", session.mode]].map(([k, v]) => (
              <div key={k} className="bg-[#f7f7f7] flex-1 h-[113px] p-[20px] rounded-[14px] flex flex-col justify-center gap-[10px] text-[18px]">
                <p style={{ color: MUTED }}>{k}</p>
                <p style={{ color: INK, fontWeight: 600 }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Skilled time */}
          <div className={card}>
            <p className="flex items-center gap-2 text-[18px] tracking-[-0.54px]" style={{ color: INK, fontWeight: 600 }}>
              Indicate the total amount of skilled time, including device run time, to be assigned to the CPT code by using the slider bar to adjust.
              <img alt="" className="size-[22px] shrink-0" src={imgQuestionMark} />
            </p>
            <div className="flex gap-[20px] h-[70px] items-center w-full">
              <div className="relative flex-1 h-[26px] flex items-center">
                <div className="w-full h-[6px] rounded-full bg-[#eaf3da] overflow-hidden">
                  <div className="h-full rounded-[10px]" style={{ width: `${pct}%`, backgroundImage: SLIDER_GRADIENT }} />
                </div>
                <div className="absolute -translate-y-1/2 top-1/2 size-[20px] bg-white border-[6px] rounded-[8px] shadow-[0px_2px_5px_0px_rgba(30,49,0,0.2)] pointer-events-none"
                  style={{ borderColor: GREEN, left: `calc(${pct}% - ${pct * 0.2}px)` }} />
                <input type="range" min={0} max={SKILLED_MAX} step={0.5} value={skilledN}
                  onChange={e => setSkilled(e.target.value)} aria-label="Skilled time in minutes"
                  className="absolute inset-0 w-full opacity-0 cursor-pointer" />
              </div>
              <div className={`${field} h-[72px] w-[148px] shrink-0 justify-center`}>
                <span className="text-[20px] tabular-nums" style={{ color: "#424242" }}>{skilledN}</span>
              </div>
            </div>
            <p className="text-[18px]" style={{ color: SUBTLE, fontWeight: 500 }}>(Setup, Therapeutic interaction, Assessment)</p>
          </div>

          {/* Setting, location, placement, photos */}
          <div className={card}>
            <div className="flex items-center gap-[10px] text-[20px]">
              <span className="flex items-center" style={{ color: SUBTLE }}>
                Therapy Setting <img alt="" className="size-[18px]" src={imgChevronRight} />
              </span>
              <label className="relative flex items-center gap-[2px] cursor-pointer" style={{ color: INK, fontWeight: 700 }}>
                {setting}
                <img alt="" className="size-[18px]" src={imgArrowDown} />
                <select aria-label="Therapy setting" value={setting} onChange={e => setSetting(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer">
                  {THERAPY_SETTINGS.map(t => <option key={t.id}>{t.label}</option>)}
                </select>
              </label>
            </div>
            <label className={`${field} w-full relative h-[80px] p-[20px] gap-[12px] cursor-pointer`}>
              <span className="flex-1 text-[20px]" style={{ color: location ? INK : MUTED }}>{location || "Select treatment location"}</span>
              <img alt="" className="size-[18px]" src={imgArrowDown} />
              <select aria-label="Treatment location" value={location} onChange={e => setLocation(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer">
                {!location && <option value="">Select treatment location</option>}
                {session.treatmentLocations.map(l => <option key={l}>{l}</option>)}
              </select>
            </label>
            <div className="flex flex-col gap-[10px] w-full">
              <span className="text-[20px]" style={{ color: INK, fontWeight: 600 }}>Placement Notes:</span>
              <textarea value={placement} onChange={e => setPlacement(e.target.value)} placeholder="Notes" aria-label="Placement notes"
                className="bg-white border-2 border-[#ececec] rounded-[14px] h-[160px] p-[25px] text-[20px] leading-[24px] outline-none resize-none placeholder:text-[#212121]"
                style={{ color: INK }} />
            </div>
            <div className="flex flex-col gap-[16px]">
              <span className="text-[20px]" style={{ color: INK, fontWeight: 500 }}>Take pictures of location attachments</span>
              <button aria-label="Take a picture" className="bg-[#f7faf2] rounded-full size-[80px] flex items-center justify-center hover:brightness-95">
                <CameraOutline />
              </button>
            </div>
          </div>

          {/* Treatment records */}
          <div className={card}>
            <p className="text-[24px]" style={{ color: INK, fontWeight: 700 }}>Treatment Records</p>
            <div className="grid grid-cols-2 gap-[24px] w-full">
              {rows.map(r => (
                <div key={r.id} className="relative bg-white border-2 border-[#ececec] rounded-[14px] h-[113px] p-[25px] flex flex-col justify-center gap-[10px] text-[18px] min-w-0">
                  {r.edit ? (
                    r.edit.input.kind === "text" ? (
                      <input value={r.value} placeholder="Tap to enter value" aria-label={r.label}
                        onChange={e => setClinician(c => ({ ...c, [r.edit!.id]: e.target.value }))}
                        className="outline-none bg-transparent placeholder:text-[#a8a9aa]" style={{ color: INK, fontWeight: 600 }} />
                    ) : (
                      <select value={r.value} aria-label={r.label}
                        onChange={e => setClinician(c => ({ ...c, [r.edit!.id]: e.target.value }))}
                        className="outline-none bg-transparent -ml-1" style={{ color: r.value ? INK : MUTED, fontWeight: 600 }}>
                        <option value="">Tap to select</option>
                        {r.edit.input.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    )
                  ) : (
                    <p className="truncate" style={{ color: INK, fontWeight: 600 }}>{r.value || "N/A"}</p>
                  )}
                  <p className="truncate" style={{ color: MUTED }}>{r.label}</p>
                  {r.info && (
                    <img alt={r.info} title={r.info} className="absolute right-[13px] top-[13px] size-[20px]" src={imgQuestionMarkSmall} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Note info */}
          <div className={`${card} !p-[20px] !gap-[24px]`}>
            <p className="text-[24px]" style={{ color: INK, fontWeight: 700 }}>Add Progress Note Info</p>
            <div className="grid grid-cols-2 gap-[24px] w-full">
              <SelectField label="Effective Date" value={noteInfo.date} />
              <SelectField label="Effective Time" value={noteInfo.time} />
              <SelectField label="Note Type" value={noteType} options={NOTE_TYPES} onChange={setNoteType} />
            </div>
          </div>

          {/* Scale */}
          <div className={`${card} items-end !gap-[12px]`}>
            {(pain === "" || borg === "") && (
              <button onClick={() => { if (pain === "") setPain("0"); if (borg === "") setBorg("0"); }}
                className="flex items-center gap-[4px] px-[20px] py-[10px] text-[20px]" style={{ color: GREEN, fontWeight: 600 }}>
                <img alt="" className="size-[24px]" src={imgAdd} /> Load Scale
              </button>
            )}
            {hasScales ? (
              <div className="w-full flex flex-col gap-[28px] px-[20px] pb-[8px]">
                {pain !== "" && <ScaleSlider spec={SCALES.pain} value={parseFloat(pain)} onChange={n => setPain(String(n))} />}
                {borg !== "" && <ScaleSlider spec={SCALES.borg} value={parseFloat(borg)} onChange={n => setBorg(String(n))} />}
              </div>
            ) : (
              <p className="w-full h-[128px] flex items-center justify-center text-[20px]" style={{ color: INK, fontWeight: 700 }}>No scale added</p>
            )}
          </div>

          {/* Note tools: codes and template came from the guide; these add codes or swap the template */}
          <div className="bg-[#f7faf2] rounded-[14px] flex items-center justify-end w-full">
            {[
              {
                label: "Add CPT Code", icon: imgAdd, value: "",
                options: [["", "Add CPT Code"], ...Object.keys(CPT_CODES).filter(c => !cpts.includes(c)).map(c => [c, cptLabel(c)])],
                onChange: (c: string) => c && setCpts(list => [...list, c]),
              },
              { label: "Change Template", icon: imgUpload, value: templateId, options: templates.map(t => [t.id, t.name]), onChange: setTemplateId },
              { label: "Load Active Notes", icon: imgUpload },
            ].map((tool, i) => (
              <div key={tool.label} className="flex items-center">
                {i > 0 && <span className="bg-[#ccc] h-[26px] w-[2px]" />}
                <label className="relative flex items-center gap-[4px] p-[20px] text-[20px] cursor-pointer" style={{ color: GREEN, fontWeight: 600 }}>
                  <span aria-hidden="true" className="size-[24px] shrink-0" style={{ backgroundColor: GREEN, WebkitMask: `url(${tool.icon}) center / contain no-repeat`, mask: `url(${tool.icon}) center / contain no-repeat` }} /> {tool.label}
                  {tool.options && (
                    <select aria-label={tool.label} value={tool.value} onChange={e => tool.onChange(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer">
                      {tool.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  )}
                </label>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className={`${card} !gap-[30px]`}>
            <div className="flex flex-col gap-[10px]">
              <p className="text-[24px]" style={{ color: INK, fontWeight: 700 }}>Notes</p>
              {template && (
                <p className="text-[18px]" style={{ color: SUBTLE, fontWeight: 500 }}>
                  Template: <span style={{ color: INK, fontWeight: 700 }}>{template.name} (CPT {template.cpt})</span>
                </p>
              )}
              {cpts.length ? (
                <div className="flex flex-wrap items-center gap-[10px] text-[18px]" style={{ color: SUBTLE, fontWeight: 500 }}>
                  CPT ({mmss(skilled)} min):
                  {cpts.map(c => (
                    <span key={c} className="flex items-center gap-[6px] bg-[#f7faf2] rounded-full pl-[14px] pr-[6px] py-[4px]" style={{ color: INK, fontWeight: 700 }}>
                      {cptLabel(c)}
                      <button onClick={() => setCpts(list => list.filter(x => x !== c))} aria-label={`Remove CPT ${c}`}
                        className="size-[26px] rounded-full flex items-center justify-center hover:bg-[#e8f0db]" style={{ color: SUBTLE }}>×</button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[18px]" style={{ color: SUBTLE, fontWeight: 500 }}>No CPT code assigned</p>
              )}
            </div>
            <div className="border border-[#ececec] rounded-[25px] p-[25px] w-full">
              {narrative && (
                <p className="text-[18px] leading-[28px] mb-[24px] pb-[24px] border-b border-dashed border-[#d4d4d4]" style={{ color: INK }}>{narrative}</p>
              )}
              {note.map((line, i) => (
                <p key={i} className="text-[18px] leading-[28px]" style={{ color: INK }}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-end gap-[16px] px-[30px] py-[20px] bg-[#fcfcfc]/90 backdrop-blur-sm border-t" style={{ borderColor: STROKE }}>
          <button onClick={() => save("Saved to Active Notes")}
            className="h-[56px] px-[28px] rounded-[10px] border-2 text-[18px] hover:bg-[#f2f8f9]"
            style={{ fontFamily: SF, fontWeight: 600, color: "#007a8b", borderColor: "#007a8b" }}>
            Save to Active Notes
          </button>
          <button onClick={() => save("Transmitted to EMR")}
            className="h-[56px] px-[28px] rounded-[10px] text-[18px] text-white bg-[#007a8b] hover:opacity-90"
            style={{ fontFamily: SF, fontWeight: 600 }}>
            Transmit to EMR
          </button>
        </div>
      </div>

      {saved && (
        <div role="status" className="absolute left-1/2 -translate-x-1/2 bottom-[100px] bg-[#434343] text-white rounded-full px-[24px] py-[12px] text-[17px] shadow-lg"
          style={{ fontFamily: SF, fontWeight: 600 }}>
          {saved}
        </div>
      )}
    </div>
  );
}
