"use client";

import { useSyncExternalStore } from "react";
import { OPEN_PALETTE_EVENT } from "@/lib/events";

/** The platform never changes mid-session, so there is nothing to subscribe to. */
const noSubscribe = () => () => {};

function readModifier(): string {
  const ua = navigator.userAgent;
  return /Mac|iPhone|iPad|iPod/.test(ua) ? "⌘K" : "^K";
}

/** Rendered empty on the server — guessing the reader's keyboard would be worse. */
const serverModifier = () => "";

export function PaletteTrigger() {
  const key = useSyncExternalStore(noSubscribe, readModifier, serverModifier);

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
      aria-label="Open index"
      className="mono hidden items-center gap-1.5 border px-2 transition-colors sm:flex hover:text-[var(--accent)]"
      style={{
        height: "1.75rem",
        borderColor: "var(--rule)",
        color: "var(--ink-faint)",
        fontSize: "var(--t-2xs)",
        letterSpacing: "0.08em",
      }}
    >
      <span>INDEX</span>
      <span aria-hidden="true" style={{ opacity: 0.7, minWidth: "1.6em", textAlign: "right" }}>
        {key}
      </span>
    </button>
  );
}
