"use client";

import { useCallback, useEffect, useState } from "react";

const KINDS = [
  { id: "notable", mark: "✦", label: "Notable" },
  { id: "engineering", mark: "⌗", label: "Well engineered" },
  { id: "contact", mark: "✉", label: "Worth a conversation" },
] as const;

type Kind = (typeof KINDS)[number]["id"];
type Counts = Record<Kind, number>;

const EMPTY: Counts = { notable: 0, engineering: 0, contact: 0 };

/**
 * Three marks a reader can leave on an entry. Local storage remembers what this
 * browser has already marked so the counts stay roughly honest; nothing about
 * the reader is stored server-side.
 */
export function Reactions({ slug }: { slug: string }) {
  const [counts, setCounts] = useState<Counts>(EMPTY);
  const [mine, setMine] = useState<Set<Kind>>(new Set());
  const [views, setViews] = useState<number | null>(null);
  const [live, setLive] = useState(false);

  const storageKey = `marks:${slug}`;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let stored: Kind[] = [];
      try {
        stored = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Kind[];
      } catch {
        /* no prior marks from this browser */
      }

      try {
        const res = await fetch(`/api/reactions?slug=${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (cancelled || !json.ok) return;

        setMine(new Set(stored));
        setCounts({ ...EMPTY, ...json.counts });
        setViews(typeof json.views === "number" ? json.views : null);
        setLive(Boolean(json.live));
      } catch {
        /* counters stay hidden rather than showing zeroes as if they were real */
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, storageKey]);

  const toggle = useCallback(
    async (kind: Kind) => {
      const had = mine.has(kind);
      const delta = had ? -1 : 1;

      const next = new Set(mine);
      if (had) next.delete(kind);
      else next.add(kind);
      setMine(next);
      setCounts((c) => ({ ...c, [kind]: Math.max(0, c[kind] + delta) }));

      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }

      try {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, kind, delta }),
        });
        const json = await res.json();
        if (json.ok) setCounts({ ...EMPTY, ...json.counts });
      } catch {
        /* the optimistic value stands */
      }
    },
    [mine, slug, storageKey],
  );

  if (!live) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {KINDS.map((kind) => {
        const marked = mine.has(kind.id);
        return (
          <button
            key={kind.id}
            type="button"
            onClick={() => toggle(kind.id)}
            aria-pressed={marked}
            className="mono flex items-center gap-2 border px-3 py-1.5 transition-colors"
            style={{
              borderColor: marked ? "var(--accent)" : "var(--rule)",
              color: marked ? "var(--accent)" : "var(--ink-muted)",
              fontSize: "var(--t-2xs)",
              letterSpacing: "0.1em",
            }}
          >
            <span aria-hidden="true">{kind.mark}</span>
            <span>{kind.label.toUpperCase()}</span>
            <span className="figures" style={{ opacity: 0.75 }}>
              {counts[kind.id]}
            </span>
          </button>
        );
      })}

      {views !== null ? (
        <span className="label">
          {views.toLocaleString()} {views === 1 ? "reader" : "readers"}
        </span>
      ) : null}
    </div>
  );
}
