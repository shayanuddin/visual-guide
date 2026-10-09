import { createElement as h } from "react";
import type { FlowConfig } from "./types";
import {
  DEVICES, ETHNICITIES, PATIENTS, TEST_TYPES,
  formatAdmission, heightToCm, splitHeight,
  type Answers, type Device, type Patient, type TestType,
} from "../data";
import SearchStep, { type StatusTone } from "../steps/SearchStep";
import DiscoverStep from "../steps/DiscoverStep";
import ChoiceStep from "../steps/ChoiceStep";
import ReviewStep, { type ReviewField } from "../steps/ReviewStep";
import { SpirometerIcon } from "../steps/icons";
import type { Values } from "../steps/pickers/shared";

export interface SpirometryContext {
  patient?: Patient;
  device?: Device;
  test?: TestType;
  answers?: Answers;
}

const STATUS_TONE: Record<Patient["status"], StatusTone> = {
  Active: "positive",
  Pending: "warning",
  Discharge: "neutral",
};

/** Mock Bluetooth scan. Add `?gfNoDevices` to the URL to see the empty state. */
function mockScan(onFound: (d: Device) => void, onDone: () => void) {
  const none = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("gfNoDevices");
  const found = none ? [] : DEVICES;
  const timers = found.map(d => window.setTimeout(() => onFound(d), d.foundAfter));
  const last = Math.max(0, ...found.map(d => d.foundAfter));
  timers.push(window.setTimeout(onDone, last + 400));
  return () => timers.forEach(t => window.clearTimeout(t));
}

const REVIEW_FIELDS: ReviewField[] = [
  {
    id: "gender", label: "Gender", required: true,
    display: v => v.gender,
    picker: { kind: "options", key: "gender", options: ["Male", "Female", "Other"], layout: "tiles" },
  },
  {
    id: "dob", label: "Date of Birth", required: true,
    display: v => v.dob,
    picker: { kind: "date", key: "dob" },
  },
  {
    id: "weight", label: "Weight", required: true,
    display: v => (v.weight ? `${v.weight} lbs` : ""),
    picker: { kind: "number", key: "weight", min: 50, max: 600, unit: "lbs", label: "Weight" },
  },
  {
    id: "height", label: "Height", required: true,
    display: v => {
      if (!v.heightFt) return "";
      const cm = heightToCm(v.heightFt, v.heightIn);
      return `${v.heightFt}′${v.heightIn || "0"}″ • ${cm} cm`;
    },
    picker: { kind: "height", ftKey: "heightFt", inKey: "heightIn" },
  },
  {
    id: "ethnicity", label: "Ethnicity", required: true,
    display: v => v.ethnicity,
    picker: { kind: "options", key: "ethnicity", options: ETHNICITIES, layout: "list" },
  },
];

function answersFrom(p?: Patient): Values {
  const { ft, inches } = splitHeight(p?.height);
  return {
    gender: p?.gender ?? "",
    dob: p?.dob ?? "",
    weight: p?.weight ?? "",
    heightFt: ft,
    heightIn: inches,
    ethnicity: p?.ethnicity ?? "",
  };
}

export const spirometryFlow: FlowConfig<SpirometryContext> = {
  id: "spirometry",
  label: "Spirometry assessment guide",
  steps: [
    {
      id: "patient",
      label: "Find patient",
      prompt: "search for a patient",
      provides: ["patient"],
      render: api => h(SearchStep<Patient, SpirometryContext>, {
        ...api,
        items: PATIENTS,
        placeholder: "Search a patient to get started",
        noun: "patients",
        getKey: p => p.mrn,
        getTitle: p => p.name,
        getSubtitle: p => [p.gender ?? "—", `Admission Date: ${formatAdmission(p.admissionDate)}`],
        getInitials: p => p.initials,
        getStatus: p => ({ label: p.status, tone: STATUS_TONE[p.status] }),
        matches: (p, q) => p.name.toLowerCase().includes(q.toLowerCase()) || p.mrn.toLowerCase().includes(q.toLowerCase()),
        toContext: patient => ({ patient }),
      }),
    },
    {
      id: "device",
      label: "Connect device",
      prompt: "select a device",
      provides: ["device"],
      render: api => h(DiscoverStep<Device, SpirometryContext>, {
        ...api,
        scan: mockScan,
        getKey: d => d.serial,
        getLabel: d => d.serial,
        icon: h(SpirometerIcon, { size: 70 }),
        noun: "device",
        toContext: device => ({ device }),
      }),
    },
    {
      id: "test",
      label: "Choose exercise",
      prompt: "choose an exercise",
      provides: ["test"],
      render: api => h(ChoiceStep<SpirometryContext>, {
        ...api,
        options: TEST_TYPES.map(t => ({ id: t.id, title: t.label, description: t.desc })),
        toContext: o => ({ test: TEST_TYPES.find(t => t.id === o.id) }),
      }),
    },
    {
      id: "demographics",
      label: "Review details",
      prompt: "review demographics",
      provides: ["answers"],
      render: api => h(ReviewStep<SpirometryContext>, {
        ...api,
        fields: REVIEW_FIELDS,
        initialValues: ctx => answersFrom(ctx.patient),
        toContext: v => ({
          answers: {
            gender: v.gender, dob: v.dob, weight: v.weight,
            heightFt: v.heightFt, heightIn: v.heightIn, ethnicity: v.ethnicity,
          },
        }),
        proceedLabel: "Start test",
      }),
    },
  ],
};
