import type { ReactNode } from "react";

/** An instruction from outside the overlay (e.g. a chat quick-reply) to the current step. */
export interface FlowCommand {
  type: string;
  value?: string;
}

/** What every step receives from the runner. Steps never know which flow they're in. */
export interface StepApi<C extends object> {
  context: Readonly<C>;
  /** Merge values into the flow context and advance to the next unfilled step. */
  complete: (patch: Partial<C>) => void;
  /** The step holds user input that Reset and Close must account for. */
  setDirty: (dirty: boolean) => void;
  /** Polite screen-reader announcement, e.g. "4 results". */
  announce: (message: string) => void;
  /** Darken the scrim and dim the dock while a sub-view (e.g. an inline picker) is open. */
  setFocusMode: (on: boolean) => void;
  /** While set, Escape calls this instead of closing the overlay. */
  setEscapeHandler: (handler: (() => void) | null) => void;
  /** Register how this step responds to external commands; return true if handled. */
  setCommandHandler: (handler: ((command: FlowCommand) => boolean) | null) => void;
  reducedMotion: boolean;
}

export interface FlowStep<C extends object> {
  id: string;
  /** Short human name, e.g. "Connect device" (shown to the assistant chat). */
  label: string;
  /** Announced as "Step n of N, <prompt>". */
  prompt: string;
  /** Context keys this step fills. A step whose keys are all present is skipped. */
  provides: (keyof C)[];
  render: (api: StepApi<C>) => ReactNode;
}

export interface FlowConfig<C extends object> {
  id: string;
  /** Accessible name of the overlay dialog. */
  label: string;
  steps: FlowStep<C>[];
}
