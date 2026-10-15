import { useEffect, useState, type ReactNode } from "react";

// The app is drawn for a 12.9" iPad (1366 x 1024 CSS px). We fit it to a slightly smaller 1280 x 940 so it never feels tiny. On anything smaller
// (iPad 11", a laptop browser window) every pixel size would look too big, so
// the whole app is scaled down to fit. It never scales up past 1.
// Test a size by hand with ?scale=0.8
const DESIGN_W = 1280;
const DESIGN_H = 940;
const MIN_SCALE = 0.5;

function readScale(): number {
  try {
    const forced = parseFloat(new URLSearchParams(window.location.search).get("scale") ?? "");
    if (forced > 0) return Math.min(Math.max(forced, MIN_SCALE), 1.5);
  } catch { /* ignore */ }
  const s = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
  return Math.min(1, Math.max(MIN_SCALE, s));
}

export default function Stage({ children }: { children: ReactNode }) {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight, s: readScale() }));

  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight, s: readScale() });
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  const w = size.w / size.s;
  const h = size.h / size.s;
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute", left: 0, top: 0, width: w, height: h,
          transform: `scale(${size.s})`, transformOrigin: "0 0",
          // viewport units inside the app use these, so they follow the scaled stage
          ["--stage-vw" as string]: `${w / 100}px`,
          ["--stage-vh" as string]: `${h / 100}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
