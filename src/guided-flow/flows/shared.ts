import { createElement as h } from "react";
import type { FlowStep } from "./types";
import { PATIENTS, formatAdmission, type Patient } from "../data";
import SearchStep, { type StatusTone } from "../steps/SearchStep";

// Steps more than one flow starts with.

const STATUS_TONE: Record<Patient["status"], StatusTone> = {
  Active: "positive",
  Pending: "warning",
  Discharge: "neutral",
};

/** "Find patient": every Quick Connect flow begins here. */
export function patientStep<C extends { patient?: Patient }>(
  copy: { heading: string; subtitle: string },
): FlowStep<C> {
  return {
    id: "patient",
    label: "Find patient",
    prompt: "search for a patient",
    provides: ["patient"],
    ...copy,
    scene: "intro",
    render: api => h(SearchStep<Patient, C>, {
      ...api,
      items: PATIENTS,
      placeholder: "Search a patient to get started",
      hint: "The patients you search will appear here.",
      noun: "patients",
      getKey: p => p.mrn,
      getTitle: p => p.name,
      getSubtitle: p => [p.gender ?? "—", `Admission Date: ${formatAdmission(p.admissionDate)}`],
      getInitials: p => p.initials,
      getStatus: p => ({ label: p.status, tone: STATUS_TONE[p.status] }),
      matches: (p, q) => p.name.toLowerCase().includes(q.toLowerCase()) || p.mrn.toLowerCase().includes(q.toLowerCase()),
      toContext: patient => ({ patient } as Partial<C>),
    }),
  };
}
