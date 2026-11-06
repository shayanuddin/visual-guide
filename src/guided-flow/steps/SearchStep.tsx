import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { gsap } from "gsap";
import { M, ms } from "../motion";
import type { StepApi } from "../flows/types";
import { SearchIcon } from "./icons";

export type StatusTone = "info" | "positive" | "warning" | "neutral";

export interface SearchStepProps<T, C extends object> extends StepApi<C> {
  items: T[];
  placeholder: string;
  /** Plural noun for announcements and the empty state, e.g. "patients". */
  noun: string;
  maxResults?: number;
  getKey: (item: T) => string;
  getTitle: (item: T) => string;
  getSubtitle: (item: T) => string[];
  getInitials: (item: T) => string;
  getStatus?: (item: T) => { label: string; tone: StatusTone };
  matches: (item: T, query: string) => boolean;
  toContext: (item: T) => Partial<C>;
  /** Brand only: shown under the empty field, e.g. "The patients you search will appear here." */
  hint?: string;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const i = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="gf-match">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

const PILL_W = 700;
const PILL_W_SELECTED = 744;

export default function SearchStep<T, C extends object>(p: SearchStepProps<T, C>) {
  const { items, maxResults = 4, getKey, setDirty, announce, reducedMotion: rm, setScene } = p;
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [active, setActive] = useState(0);
  const [keyNav, setKeyNav] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // A theme may show fewer rows (Brand's field sits lower): --gf-search-max-results
  const [cap, setCap] = useState(maxResults);
  useLayoutEffect(() => {
    const el = rootRef.current;
    const v = el ? parseInt(getComputedStyle(el).getPropertyValue("--gf-search-max-results")) : NaN;
    setCap(isNaN(v) ? maxResults : Math.min(v, maxResults));
  });
  const timer = useRef<number>(undefined);

  useEffect(() => { setDirty(query.length > 0); }, [query, setDirty]);
  // Brand: a hero until the first keystroke, then the heading and field rise
  useEffect(() => { setScene(query ? "focus" : "intro"); }, [query, setScene]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Live filtering, debounced
  useEffect(() => {
    const t = window.setTimeout(() => { setTerm(query.trim()); setActive(0); }, ms(M.searchDebounce));
    return () => window.clearTimeout(t);
  }, [query]);

  const results = useMemo(
    () => (term ? items.filter(it => p.matches(it, term)).slice(0, cap) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [term, items, cap],
  );
  const resultsKey = results.map(getKey).join("|");

  useEffect(() => {
    if (!term) return;
    announce(results.length ? `${results.length} result${results.length === 1 ? "" : "s"}` : `No ${p.noun} match ${term}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultsKey, term]);

  // Only rows that weren't already on screen animate in, so typing doesn't
  // make the whole list flicker.
  const shownKeys = useRef<Set<string>>(new Set());
  useLayoutEffect(() => {
    const els = listRef.current ? Array.from(listRef.current.children) as HTMLElement[] : [];
    const fresh = els.filter(el => !shownKeys.current.has(el.id));
    shownKeys.current = new Set(els.map(el => el.id));
    if (!fresh.length) return;
    gsap.fromTo(fresh,
      rm ? { opacity: 0 } : { opacity: 0, y: M.itemRise },
      { opacity: 1, y: 0, duration: M.itemIn, stagger: M.stagger, ease: M.stepInEase });
  }, [resultsKey, rm]);

  function pick(item: T) {
    if (selected) return;
    setSelected(getKey(item));
    timer.current = window.setTimeout(() => p.complete(p.toContext(item)), ms(M.select + M.selectHold));
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!results.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") setKeyNav(true);
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); pick(results[active]); }
  }

  return (
    <div ref={rootRef} className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
      style={{ top: "var(--gf-search-top, min(270px, calc(var(--stage-vh, 1vh) * 26.4)))", transition: "top 0.2s ease-out", width: 800, maxWidth: "calc(var(--stage-vw, 1vw) * 100 - 32px)" }}>

      <label className="gf-surface gf-search gf-pill w-full flex items-center" style={{ height: 104, padding: "0 35px", gap: 17 }}>
        <span className="shrink-0"><SearchIcon size={36} strokeWidth={1.6} /></span>
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={p.placeholder}
          aria-label={p.placeholder}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="gf-search-results"
          aria-activedescendant={results[active] ? `gf-opt-${getKey(results[active])}` : undefined}
          disabled={selected !== null}
          className="flex-1 min-w-0 bg-transparent text-[30px] font-medium outline-none border-none"
          style={{ color: "inherit", boxShadow: "none" }}
        />
      </label>

      {!query && p.hint && (
        <p className="gf-brand-only text-[28px] text-center" style={{ lineHeight: "26px", letterSpacing: "1.4px", opacity: 0.4, marginTop: 65 }}>
          {p.hint}
        </p>
      )}

      <div ref={listRef} id="gf-search-results" role="listbox" aria-label={`Matching ${p.noun}`}
        className="flex flex-col items-center w-full" style={{ gap: 18, marginTop: 31 }}>
        {term && results.length === 0 && (
          <p className="gf-muted text-[20px] text-center" style={{ paddingTop: 12 }}>
            No {p.noun} match &lsquo;{term}&rsquo;
          </p>
        )}
        {results.map((item, i) => {
          const key = getKey(item);
          const isSel = selected === key;
          const status = p.getStatus?.(item);
          return (
            <button
              key={key}
              id={`gf-opt-${key}`}
              role="option"
              aria-selected={isSel || (selected === null && i === active)}
              tabIndex={-1}
              onClick={() => pick(item)}
              onMouseEnter={() => selected === null && setActive(i)}
              className={`gf-item gf-pill flex items-center text-left ${isSel ? "gf-selected" : ""}`}
              style={{
                width: isSel ? PILL_W_SELECTED : PILL_W,
                maxWidth: "100%",
                height: isSel ? 110 : 104,
                // Avatar concentric with the pill's rounded end: equal space on the
                // left and above, measured inside the (theme-dependent) rim.
                paddingLeft: `calc(${isSel ? 20 : 19}px - var(--gf-item-border-width))`,
                paddingRight: "calc(29px - var(--gf-item-border-width))",
                gap: 17,
                transform: "none",
                opacity: selected && !isSel ? M.dimOpacity : 1,
                transition: selected
                  ? `width ${M.select}s ease, height ${M.select}s ease, opacity ${M.select}s ease, background-color ${M.select}s ease`
                  : undefined,
                outline: keyNav && selected === null && i === active && term ? "2px solid var(--gf-fg)" : "none",
                outlineOffset: -1,
              }}
            >
              <span className="gf-avatar rounded-full flex items-center justify-center shrink-0 font-medium uppercase"
                style={{ width: isSel ? 70 : 66, height: isSel ? 70 : 66, fontSize: isSel ? 21.4 : 19 }}>
                {p.getInitials(item)}
              </span>
              <span className="flex-1 min-w-0 flex flex-col" style={{ gap: 9 }}>
                <span className="text-[22px] font-bold truncate"><Highlight text={p.getTitle(item)} query={isSel ? "" : term} /></span>
                <span className="gf-muted text-[20px] flex items-center min-w-0" style={{ gap: 12 }}>
                  {p.getSubtitle(item).map((part, j) => (
                    <span key={j} className="flex items-center min-w-0" style={{ gap: 12 }}>
                      {j > 0 && <span aria-hidden="true" style={{ width: 1.5, height: 16, background: "currentColor", opacity: 0.6 }} />}
                      <span className="truncate">{part}</span>
                    </span>
                  ))}
                </span>
              </span>
              {status && (
                <span className="flex items-center shrink-0 text-[17.5px] font-medium" style={{ gap: 4.4 }}>
                  <span className="rounded-full" aria-hidden="true"
                    style={{ width: 6.5, height: 6.5, background: `var(--gf-status-${status.tone})` }} />
                  {status.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
