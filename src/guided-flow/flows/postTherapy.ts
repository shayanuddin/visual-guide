import { createElement as h } from "react";
import type { FlowConfig } from "./types";
import {
  CPT_CODES, NOTE_TYPES, QR_SESSIONS, SCALES, THERAPY_SETTINGS, cptLabel, formatAdmission, templatesFor,
  type Patient, type TherapySession, type TherapySetting,
} from "../data";
import { patientStep } from "./shared";
import ScanStep from "../steps/ScanStep";
import ChoiceStep from "../steps/ChoiceStep";
import ReviewStep, { type ReviewField } from "../steps/ReviewStep";
import { formatTime } from "../steps/pickers/TimePicker";
import type { Values } from "../steps/pickers/shared";
import { joinMulti, splitMulti } from "../steps/pickers/MultiPicker";

// Quick Connect → Scan QR: a therapy session already ran on an ACP device;
// the clinician picks the patient, scans the device (confirming what it
// recorded on the scan card) and adds what it can't know, including the CPT
// codes and note template. Ends on Post Therapy Documentation, complete.

export interface TreatmentDetails {
  skilledMinutes: string;
  location: string;
  placementNotes: string;
}

export interface NoteInfo {
  date: string;
  time: string;
  noteType: string;
}

/** How the session is billed and which facility template writes the note. */
export interface Billing {
  cpts: string[];
  templateId: string;
}

/** Scale values as strings; "" means the scale wasn't recorded. */
export interface ScaleValues {
  pain: string;
  borg: string;
}

export interface PostTherapyContext {
  patient?: Patient;
  session?: TherapySession;
  /** The clinician-entered record fields (e.g. Muscle support), by id. */
  clinicianRecords?: Values;
  setting?: TherapySetting;
  treatment?: TreatmentDetails;
  scales?: ScaleValues;
  billing?: Billing;
  noteInfo?: NoteInfo;
}

/**
 * Mock QR read. `?gfQr=omnicycle` scans the OmniCycle session instead of
 * OmniVersa; `?gfNoQr` never reads a code, to show the failure state.
 */
function mockQrScan(onRead: (s: TherapySession) => void) {
  const q = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  if (q?.has("gfNoQr")) return () => {};
  const session = QR_SESSIONS[q?.get("gfQr") ?? ""] ?? QR_SESSIONS.omniversa;
  const t = window.setTimeout(() => onRead(session), 2800);
  return () => window.clearTimeout(t);
}

/** What the device can't record (e.g. muscle support); asked with the treatment details. */
function clinicianFields(s: TherapySession): ReviewField[] {
  return s.clinician.map(c => ({
    id: c.id,
    label: c.label,
    display: v => v[c.id],
    picker: c.input.kind === "text"
      ? { kind: "text", key: c.id, label: c.label, placeholder: c.input.placeholder }
      : { kind: "options", key: c.id, options: c.input.options, layout: "list" },
  }));
}

const treatmentFields = (s: TherapySession): ReviewField[] => [
  {
    id: "skilled", label: "Skilled time", required: true,
    display: v => (v.skilledMinutes ? `${v.skilledMinutes} min` : ""),
    picker: {
      kind: "slider", key: "skilledMinutes", label: "Skilled time", min: 0, max: 60, step: 0.5, tickEvery: 5,
      readout: n => `${n} min`,
    },
  },
  {
    id: "location", label: "Treatment location", required: true,
    display: v => v.location,
    picker: { kind: "options", key: "location", options: s.treatmentLocations, layout: "list" },
  },
];

const scaleField = (key: keyof typeof SCALES): ReviewField => {
  const sc = SCALES[key];
  return {
    id: key, label: sc.label,
    // Pain reads "22 · Moderate"; Borg's level is the number itself ("01")
    display: v => (!v[key] ? "" : key === "pain" ? `${v[key]} · ${sc.level(parseFloat(v[key]))}` : sc.level(parseFloat(v[key]))),
    picker: {
      kind: "slider", key, label: sc.label, min: sc.min, max: sc.max, step: 1, tickEvery: sc.tickEvery,
      faces: "faces" in sc && sc.faces, readout: n => `${sc.levelLabel}: ${sc.level(n)}`,
    },
  };
};

/** "97032 · G0283", or "97032 · G0283 +1" past two codes. */
function cptDisplay(value: string) {
  const codes = splitMulti(value);
  return codes.length > 2 ? `${codes.slice(0, 2).join(" · ")} +${codes.length - 2}` : codes.join(" · ");
}

// The template picker holds names; the context holds ids
const billingFields = (s: TherapySession): ReviewField[] => {
  const templates = templatesFor(s.device);
  // The device's usual codes first, then everything else the facility bills
  const codes = [...s.cptCodes, ...Object.keys(CPT_CODES).filter(c => !s.cptCodes.includes(c))];
  return [
    {
      id: "cpt", label: "CPT codes", required: true,
      display: v => cptDisplay(v.cpt),
      picker: { kind: "multi", key: "cpt", label: "CPT codes", options: codes, labels: Object.fromEntries(codes.map(c => [c, cptLabel(c)])) },
    },
    {
      id: "template", label: "Note template", required: true,
      display: v => v.template,
      picker: {
        kind: "options", key: "template", options: templates.map(t => t.name), layout: "list",
        hints: Object.fromEntries(templates.map(t => [t.name, `CPT ${t.cpt} · ${t.summary}`])),
      },
    },
  ];
};

const NOTE_FIELDS: ReviewField[] = [
  {
    id: "date", label: "Effective date", required: true,
    display: v => v.date,
    picker: { kind: "date", key: "date", label: "Effective date" },
  },
  {
    id: "time", label: "Effective time", required: true,
    display: v => v.time,
    picker: { kind: "time", key: "time", label: "Effective time" },
  },
  {
    id: "noteType", label: "Note type", required: true,
    display: v => v.noteType,
    picker: { kind: "options", key: "noteType", options: NOTE_TYPES, layout: "tiles" },
  },
];

const today = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
};

export const postTherapyFlow: FlowConfig<PostTherapyContext> = {
  id: "post-therapy",
  label: "Post therapy documentation guide",
  steps: [
    patientStep<PostTherapyContext>(
      { heading: "Whose session are we documenting?", subtitle: "Select the patient who used the device" },
      ["session", "clinicianRecords", "setting", "treatment", "scales", "billing", "noteInfo"],
    ),
    {
      id: "scan",
      label: "Scan device",
      prompt: "scan the QR code on the therapy device",
      provides: ["session"],
      // A different session brings different records, locations and codes
      invalidates: ["clinicianRecords", "treatment", "billing"],
      heading: "Confirm the device session",
      subtitle: "Check the patient and what the device recorded",
      scene: "scan",
      render: api => h(ScanStep<TherapySession, PostTherapyContext>, {
        ...api,
        scan: mockQrScan,
        getTitle: s => s.device,
        getDetails: s => [`SN ${s.serial}`, `${s.mode} mode`, `ended ${s.endedAt}`],
        getReadings: s => s.records.map(r => ({ label: r.label, value: r.value })),
        noun: "device",
        subject: api.context.patient && {
          name: api.context.patient.name,
          initials: api.context.patient.initials,
          details: [
            [api.context.patient.gender, api.context.patient.dob && `DOB ${api.context.patient.dob}`].filter(Boolean).join(" · "),
            `${api.context.patient.mrn} · Admitted ${formatAdmission(api.context.patient.admissionDate)}`,
          ],
        },
        toContext: session => ({ session }),
      }),
    },
    {
      id: "setting",
      label: "Therapy setting",
      prompt: "choose the therapy setting",
      provides: ["setting"],
      heading: "How was the session delivered?",
      subtitle: "Choose the therapy setting",
      render: api => h(ChoiceStep<PostTherapyContext>, {
        ...api,
        options: THERAPY_SETTINGS.map(t => ({ id: t.id, title: t.label, description: t.desc })),
        columns: 2,
        current: api.context.setting?.id,
        toContext: o => ({ setting: THERAPY_SETTINGS.find(t => t.id === o.id) }),
      }),
    },
    {
      id: "treatment",
      label: "Treatment details",
      prompt: "add skilled time and treatment location",
      provides: ["treatment", "clinicianRecords"],
      heading: "Treatment details",
      subtitle: "Set skilled time and location, and add any placement notes",
      render: api => h(ReviewStep<PostTherapyContext>, {
        ...api,
        fields: [...treatmentFields(api.context.session!), ...clinicianFields(api.context.session!)],
        notes: { key: "placementNotes", label: "Placement notes", placeholder: "Type pad or strap placement, skin check…" },
        initialValues: ctx => {
          const clinician = Object.fromEntries(ctx.session!.clinician.map(c => [c.id, ctx.clinicianRecords?.[c.id] ?? ""]));
          if (ctx.treatment) return { ...ctx.treatment, ...clinician };
          // Start from where the device says it was used, when that's one of the options
          const deviceLoc = ctx.session?.records.find(r => r.id === "location")?.value ?? "";
          return {
            skilledMinutes: String(ctx.session?.runMinutes ?? ""),
            location: ctx.session?.treatmentLocations.includes(deviceLoc) ? deviceLoc : "",
            placementNotes: "",
            ...clinician,
          };
        },
        toContext: v => ({
          treatment: { skilledMinutes: v.skilledMinutes, location: v.location, placementNotes: (v.placementNotes ?? "").trim() },
          clinicianRecords: Object.fromEntries(api.context.session!.clinician.map(c => [c.id, v[c.id] ?? ""])),
        }),
        proceedLabel: "Continue",
      }),
    },
    {
      id: "scales",
      label: "Scales",
      prompt: "record the pain and Borg scales",
      provides: ["scales"],
      heading: "Record the scales",
      subtitle: "Optional: add the pain and Borg scales for this session",
      render: api => h(ReviewStep<PostTherapyContext>, {
        ...api,
        fields: [scaleField("pain"), scaleField("borg")],
        initialValues: ctx => (ctx.scales ? { ...ctx.scales } : { pain: "", borg: "" }),
        toContext: v => ({ scales: { pain: v.pain, borg: v.borg } }),
        proceedLabel: "Continue",
      }),
    },
    {
      id: "note",
      label: "Billing and note",
      prompt: "confirm the CPT codes, template and note details",
      provides: ["billing", "noteInfo"],
      heading: "Almost done",
      subtitle: "Confirm billing and the note details",
      render: api => h(ReviewStep<PostTherapyContext>, {
        ...api,
        fields: [...billingFields(api.context.session!), ...NOTE_FIELDS],
        // Codes and template are suggested from the device; going back keeps the edits
        initialValues: ctx => {
          const s = ctx.session!;
          const templates = templatesFor(s.device);
          const cpts = ctx.billing?.cpts ?? [s.cptCodes[0]];
          const template = templates.find(t => t.id === ctx.billing?.templateId) ?? templates.find(t => t.cpt === cpts[0]) ?? templates[0];
          return {
            cpt: joinMulti(cpts),
            template: template?.name ?? "",
            ...(ctx.noteInfo ?? { date: today(), time: formatTime(new Date()), noteType: "Progress Note" }),
          };
        },
        toContext: v => ({
          billing: {
            cpts: splitMulti(v.cpt),
            templateId: templatesFor(api.context.session!.device).find(t => t.name === v.template)?.id ?? "",
          },
          noteInfo: { date: v.date, time: v.time, noteType: v.noteType },
        }),
        proceedLabel: "Open documentation",
      }),
    },
  ],
};
