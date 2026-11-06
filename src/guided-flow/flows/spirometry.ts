import { createElement as h } from "react";
import type { FlowConfig } from "./types";
import {
  DEVICES, ETHNICITIES, TEST_INSTRUCTIONS, TEST_TYPES,
  heightToCm, splitHeight,
  type Answers, type Device, type Patient, type TestType,
} from "../data";
import { patientStep } from "./shared";
import DiscoverStep from "../steps/DiscoverStep";
import ChoiceStep from "../steps/ChoiceStep";
import ReviewStep, { type ReviewField } from "../steps/ReviewStep";
import InstructionsStep from "../steps/InstructionsStep";
import { SpirometerIcon } from "../steps/icons";
import type { Values } from "../steps/pickers/shared";

export interface SpirometryContext {
  patient?: Patient;
  device?: Device;
  test?: TestType;
  answers?: Answers;
  /** The clinician went through the test instructions with the patient. */
  briefed?: boolean;
}

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
    id: "gender", label: "Gender", required: true, placeholder: "N/A",
    display: v => v.gender,
    picker: { kind: "options", key: "gender", options: ["Male", "Female", "Other"], layout: "tiles" },
  },
  {
    id: "dob", label: "Date of Birth", required: true, placeholder: "--/--/----",
    display: v => v.dob,
    picker: { kind: "date", key: "dob" },
  },
  {
    id: "weight", label: "Weight", required: true, placeholder: "N/A",
    display: v => (v.weight ? `${v.weight} lbs` : ""),
    picker: { kind: "number", key: "weight", min: 50, max: 600, unit: "lbs", label: "Weight" },
  },
  {
    id: "height", label: "Height", required: true, placeholder: "N/A",
    display: v => {
      if (!v.heightFt) return "";
      const cm = heightToCm(v.heightFt, v.heightIn);
      return `${v.heightFt}′${v.heightIn || "0"}″ • ${cm} cm`;
    },
    picker: { kind: "height", ftKey: "heightFt", inKey: "heightIn" },
  },
  {
    id: "ethnicity", label: "Ethnicity", required: true, placeholder: "N/A",
    display: v => v.ethnicity,
    picker: { kind: "options", key: "ethnicity", options: ETHNICITIES, layout: "list" },
  },
];

const firstName = (p?: Patient) => p?.name.split(" ")[0] ?? "Patient";

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
    patientStep<SpirometryContext>({ heading: "Who are we assessing today?", subtitle: "Select a patient to assess" }, ["answers", "briefed"]),
    {
      id: "device",
      label: "Connect device",
      prompt: "select a device",
      provides: ["device"],
      heading: "These nearby devices are found",
      subtitle: "Select a device to connect",
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
      heading: "Choose the test",
      subtitle: "Select the protocol for this assessment",
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
      heading: ctx => `${firstName(ctx.patient)}’s demographics`,
      subtitle: "Patient's demographics are pre-filled, review and edit if needed",
      render: api => h(ReviewStep<SpirometryContext>, {
        ...api,
        fields: REVIEW_FIELDS,
        // Back from the instructions keeps the clinician's edits
        initialValues: ctx => (ctx.answers ? { ...ctx.answers } : answersFrom(ctx.patient)),
        toContext: v => ({
          answers: {
            gender: v.gender, dob: v.dob, weight: v.weight,
            heightFt: v.heightFt, heightIn: v.heightIn, ethnicity: v.ethnicity,
          },
        }),
        proceedLabel: "Continue to test instructions",
      }),
    },
    {
      id: "instructions",
      label: "Test instructions",
      prompt: "read the test instructions to the patient",
      provides: ["briefed"],
      heading: "Test instructions",
      subtitle: ctx => `${ctx.test?.label ?? "Spirometry"} · guide ${firstName(ctx.patient)} through these steps`,
      render: api => h(InstructionsStep<SpirometryContext>, {
        ...api,
        title: `Instructions for ${api.context.test?.label ?? "the test"}`,
        instructions: TEST_INSTRUCTIONS[api.context.test?.id ?? ""] ?? TEST_INSTRUCTIONS.expiratory,
        caption: "Start the test when ready!",
        captionDetail: "A 10-second countdown begins Trial 1.",
        toContext: () => ({ briefed: true }),
        proceedLabel: "Start test",
      }),
    },
  ],
};
