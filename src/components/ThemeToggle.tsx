"use client";

import { useSyncExternalStore } from "react";

type Mode = "light" | "dark" | "system";

const THEME_CHANGED = "press:theme-changed";

/**
 * Reads the stored theme as an external store rather than through an effect —
 * localStorage genuinely is external state, and treating it that way means no
 * cascading render on mount and no hydration warning.
 */
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_CHANGED, onChange);
  };
}

function readMode(): Mode {
  try {
    const stored = localStorage.getItem("theme");
    return stored === "dark" || stored === "light" ? stored : "system";
  } catch {
    return "system";
  }
}

/** The server has no idea what the reader prefers, so it says so. */
const serverMode = (): Mode => "system";

const GLYPH: Record<Mode, string> = { light: "○", dark: "●", system: "◐" };
const TITLE: Record<Mode, string> = {
  light: "Theme: light",
  dark: "Theme: dark",
  system: "Theme: follows system",
};

/** Three states, not two — "system" is a real choice and hiding it is a small lie. */
export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, readMode, serverMode);

  function cycle() {
    const next: Mode = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    try {
      if (next === "system") {
        localStorage.removeItem("theme");
        document.documentElement.removeAttribute("data-theme");
      } else {
        localStorage.setItem("theme", next);
        document.documentElement.setAttribute("data-theme", next);
      }
    } catch {
      /* storage unavailable — the attribute change still applies for this page */
    }
    window.dispatchEvent(new Event(THEME_CHANGED));
  }

  return (
    <button
      type="button"
      onClick={cycle}
      title={TITLE[mode]}
      aria-label={TITLE[mode]}
      className="mono grid place-items-center border transition-colors"
      style={{
        width: "1.75rem",
        height: "1.75rem",
        borderColor: "var(--rule)",
        color: "var(--ink-muted)",
        fontSize: "0.7rem",
        lineHeight: 1,
      }}
    >
      <span aria-hidden="true">{GLYPH[mode]}</span>
    </button>
  );
}
