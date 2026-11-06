// Single source of truth for all GuidedFlow motion tokens. Durations in seconds.
export const M = {
  // Overlay in / out
  overlayIn: 0.25,
  overlayOut: 0.3,
  overlayEase: "power2.out",
  stageRise: 12,

  // Step change — one surface reshaping itself, never a sideways slide
  stepOut: 0.2,
  stepIn: 0.36,
  stepScale: 0.985,
  stepRise: 6, // the incoming step settles up from 6px below
  stepOutEase: "power1.in",
  stepInEase: "power3.out",

  // Lists and grids
  stagger: 0.05,
  itemIn: 0.3,
  itemRise: 8,

  // Hover: cards grow gently; CSS easing (expo-like out)
  hoverScale: 0.35,
  hoverEase: "cubic-bezier(0.22, 1, 0.36, 1)",

  // Selection: white state, then hold before the step change
  select: 0.22,
  selectHold: 0.25,
  selectScale: 1.04,
  dimOpacity: 0.35,

  // Search
  searchDebounce: 0.15,

  // Device discovery
  radarPeriod: 1.6,
  radarRings: 3,
  radarScale: 2.4,
  bubbleScanScale: 0.7, // 140px scan bubble drawn from a 200px bubble
  bubbleGrow: 0.4,
  bubbleSplit: 0.6,
  bubbleEase: "back.out(1.4)",
  bubbleMerge: 0.45,
  bubbleGap: 40,
  scanMinDuration: 3.2, // radar always runs at least this long before the first device appears
  deviceStagger: 0.9, // minimum gap between device arrivals
  scanDoneHold: 0.4, // pause after the last arrival before Refresh fades in
  scanEmptyAfter: 8,

  // QR scan (placeholder for the camera)
  qrSweep: 1.7, // scan line, one pass top → bottom
  qrLock: 0.35, // brackets close on the code
  qrMorph: 0.5, // viewfinder reshapes into the device card
  qrFailAfter: 7,

  // Review
  flip: 0.45,
  flipEase: "power2.inOut",
  proceedPulse: 1.2, // one way, A → B (and back, yoyo)
  proceedPulseHold: 0.15, // rest at each end of the pulse

  // Voice — the Speak button morphs circle ↔ pill
  micPillWidth: 176,
  micExpand: 0.48,
  micExpandEase: "power2.out",
  micPopEase: "back.out(1.8)", // springy overshoot when the pill opens
  micTickEase: "back.out(2.6)",
  micCollapse: 0.3,
  micCollapseEase: "power2.inOut",
  micFadeReduced: 0.15,
  micShake: 0.3,
  waveScriptStep: 0.12, // scripted waveform changes level every 120ms
  voiceScriptDelay: 0.7, // silence before the scripted transcript/pattern starts
  voiceTypeChar: 0.03, // scripted transcript pace (also sets the scripted pattern length)


} as const;

export const ms = (s: number) => Math.round(s * 1000);
