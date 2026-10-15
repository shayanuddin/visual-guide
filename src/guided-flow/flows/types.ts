import type { ReactNode } from "react";

/**
 * How the Brand backdrop sits behind a step: "intro" — sharp globe, heading
 * low (a hero); "focus" — blurred globe, heading at the top; "scan" — globe and
 * heading hidden while a scan animation owns the screen. Dark and Light ignore it.
 */
export type GuideScene = "intro" | "focus" | "scan";

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
  /** No step follows this one: its action finishes the guide. */
  isLastStep: boolean;
  /** Override the step's scene while it's on screen (e.g. search: intro until typing). */
  setScene: (scene: GuideScene) => void;
}

export interface FlowStep<C extends object> {
  id: string;
  /** Short human name, e.g. "Connect device" (shown to the assistant chat). */
  label: string;
  /** Announced as "Step n of N, <prompt>". */
  prompt: string;
  /** Context keys this step fills. A step whose keys all come with the initial context is skipped. */
  provides: (keyof C)[];
  /**
   * Later answers that depend on this one. Going back and changing this step's
   * answer clears them, so their steps start fresh (e.g. a new scan resets the
   * treatment details); otherwise later steps open with what was entered.
   */
  invalidates?: (keyof C)[];
  /** Brand mode's heading and subtitle above the step. */
  heading?: string | ((context: Partial<C>) => string);
  subtitle?: string | ((context: Partial<C>) => string);
  /** Starting scene for Brand mode; defaults to "focus". */
  scene?: GuideScene;
  /**
   * Shows the Back button on this step. Back goes straight to the step with
   * this id (e.g. the choice that opened the form), not one step at a time.
   * Steps without it have no Back button.
   */
  backTo?: string;
  render: (api: StepApi<C>) => ReactNode;
}

export interface FlowConfig<C extends object> {
  id: string;
  /** Accessible name of the overlay dialog. */
  label: string;
  steps: FlowStep<C>[];
  /**
   * An "All set" screen after the last step. Its action hands off
   * (onStart).
   */
  finale?: {
    message: (context: Partial<C>) => string;
    action: string;
  };
}
