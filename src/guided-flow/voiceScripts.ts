import type { FlowCommand } from "./flows/types";

// Scripted voice use cases for the spirometry guide, keyed by step id.
// The transcript is what the scripted fallback "hears"; `matches` lets real
// speech land on the same reply. Inline **bold** is supported in reply text.

export type ReplyBlock =
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] };

export type ChipAction =
  | { type: "back" }
  | { type: "command"; command: FlowCommand };

export interface ReplyChip {
  label: string;
  action: ChipAction;
}

export interface AssistantReply {
  blocks: ReplyBlock[];
  chips: ReplyChip[];
}

interface VoiceScript {
  transcript: string;
  matches: RegExp;
  reply: AssistantReply;
}

const BACK: ReplyChip = { label: "Back to guide", action: { type: "back" } };

export const VOICE_SCRIPTS: Record<string, VoiceScript> = {
  patient: {
    transcript: "I can't find my patient in the search.",
    matches: /\b(find|search|missing|patient|can'?t see|not (showing|there))\b/i,
    reply: {
      blocks: [
        { kind: "p", text: "Search matches patient name or MRN within your current facility. A few things to check:" },
        {
          kind: "ul",
          items: [
            "Try the last name or the MRN instead of the first name.",
            "Discharged patients don't appear by default.",
            "If the patient was admitted today, the EMR sync may take a few minutes.",
          ],
        },
        { kind: "p", text: "If they're still missing, you can add them from **All Patients → Add Patient**." },
      ],
      chips: [{ label: "Search by MRN", action: { type: "back" } }, BACK],
    },
  },

  device: {
    transcript: "My spirometer isn't showing up.",
    matches: /\b(spirometer|device|bluetooth|connect|pair|showing|scan)\b/i,
    reply: {
      blocks: [
        { kind: "p", text: "Let's get it connected:" },
        {
          kind: "ol",
          items: [
            "Make sure the spirometer is switched on and the battery isn't low.",
            "Keep it within about 1 metre of the iPad.",
            "Check that Bluetooth is turned on in iPad Settings.",
            "Tap **Refresh** under the devices.",
          ],
        },
        { kind: "p", text: "The serial number on the back of the device should match one of the bubbles (e.g. SE-011-E010832)." },
      ],
      chips: [{ label: "Refresh devices", action: { type: "command", command: { type: "rescan" } } }, BACK],
    },
  },

  test: {
    transcript: "What's the difference between the two maneuvers?",
    matches: /\b(difference|maneuver|manoeuvre|expiratory|inspiratory|which (one|test))\b/i,
    reply: {
      blocks: [
        {
          kind: "p",
          text: "**Expiratory Maneuver** measures forced exhalation only: the patient takes a full breath in, then blows out as hard and fast as possible. Use it for routine FVC/FEV1 testing.",
        },
        {
          kind: "p",
          text: "**Expiratory/Inspiratory Maneuver** adds a full forced inhalation after the exhale, which gives you the complete flow-volume loop. Use it when you need to look at the inspiratory limb, for example when assessing upper-airway obstruction.",
        },
      ],
      chips: [
        { label: "Choose Expiratory", action: { type: "command", command: { type: "choose", value: "expiratory" } } },
        { label: "Choose Expiratory/Inspiratory", action: { type: "command", command: { type: "choose", value: "exp_insp" } } },
        BACK,
      ],
    },
  },

  demographics: {
    transcript: "Why do you need height and ethnicity?",
    matches: /\b(height|ethnicity|weight|why|demographic|age|sex|gender)\b/i,
    reply: {
      blocks: [
        {
          kind: "p",
          text: "Spirometry results are compared against predicted normal values. The reference equations behind those predictions use age, sex and height, and some equations also use ethnicity.",
        },
        {
          kind: "p",
          text: "Wrong values here shift the % predicted figures, so please confirm them with the patient. You can tap any tile to edit it.",
        },
      ],
      chips: [{ label: "Edit height", action: { type: "command", command: { type: "edit", value: "height" } } }, BACK],
    },
  },
};

export const FALLBACK_REPLY: AssistantReply = {
  blocks: [{ kind: "p", text: "I can help with this step. Ask me about finding a patient, connecting a device, choosing the test, or the patient details." }],
  chips: [BACK],
};

/** What the scripted fallback "hears" on a given step. */
export function scriptedTranscript(stepId: string): string {
  return VOICE_SCRIPTS[stepId]?.transcript ?? "How do I complete this step?";
}

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

export function resolveReply(stepId: string, text: string): AssistantReply {
  const script = VOICE_SCRIPTS[stepId];
  if (script && (normalise(text) === normalise(script.transcript) || script.matches.test(text))) return script.reply;
  return FALLBACK_REPLY;
}
