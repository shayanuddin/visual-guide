import { useCallback, useState, type KeyboardEvent } from "react";

// A/B test control for the overlay theme. Deliberately plain: it is a test
// switch, not product UI. ?gfTheme=dark|light|brand seeds it, the choice persists in
// localStorage, and ?abSwitcher=0 hides the control.

export type GuideTheme = "dark" | "light" | "brand";
const STORAGE_KEY = "gf-theme";
const THEMES: GuideTheme[] = ["dark", "light", "brand"];
const isTheme = (v: string | null): v is GuideTheme => THEMES.includes(v as GuideTheme);

/** The theme after `t`, wrapping around (T key, arrow keys). */
export const nextTheme = (t: GuideTheme, step = 1): GuideTheme =>
  THEMES[(THEMES.indexOf(t) + step + THEMES.length) % THEMES.length];

const params = () => new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

function initialTheme(): GuideTheme {
  const q = params().get("gfTheme");
  if (isTheme(q)) return q;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch { /* storage unavailable */ }
  return "dark";
}

export function useGuideTheme() {
  const [theme, setThemeState] = useState<GuideTheme>(initialTheme);
  const setTheme = useCallback((t: GuideTheme) => {
    setThemeState(t);
    try { window.localStorage.setItem(STORAGE_KEY, t); } catch { /* storage unavailable */ }
  }, []);
  return [theme, setTheme] as const;
}

export const switcherEnabled = () => params().get("abSwitcher") !== "0";

export default function ThemeSwitcher({ theme, onChange }: { theme: GuideTheme; onChange: (t: GuideTheme) => void }) {
  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = nextTheme(theme, e.key === "ArrowRight" ? 1 : -1);
    onChange(next);
    (e.currentTarget.querySelector(`[data-theme="${next}"]`) as HTMLElement | null)?.focus();
  }

  return (
    <div role="radiogroup" aria-label="Overlay theme (A/B test)" onKeyDown={onKeyDown}
      className="gf-ab absolute flex items-center gap-1 rounded-full"
      style={{ top: 20, left: 24, height: 32, padding: "0 4px" }}>
      {THEMES.map(t => (
        <button key={t} type="button" role="radio" data-theme={t}
          aria-checked={theme === t} tabIndex={theme === t ? 0 : -1}
          onClick={() => onChange(t)}
          className="rounded-full capitalize" style={{ height: 24, padding: "0 10px" }}>
          {t}
        </button>
      ))}
    </div>
  );
}
