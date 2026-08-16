"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OPEN_PALETTE_EVENT } from "@/lib/events";

type Item = {
  id: string;
  label: string;
  hint: string;
  group: string;
  run: () => void;
};

/**
 * The index, in the back-of-the-book sense. Keyboard-first, because the fastest
 * way through a catalogue of twenty entries is to type three letters of one.
 */
export function CommandPalette({
  projects,
  profile,
}: {
  projects: { slug: string; title: string; no: number }[];
  profile: { github: string; linkedin: string; email: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => {
      close();
      router.push(href);
    };
    const away = (href: string) => () => {
      close();
      window.open(href, "_blank", "noopener,noreferrer");
    };

    return [
      { id: "front", label: "Front page", hint: "/", group: "Pages", run: go("/") },
      { id: "work", label: "The catalogue", hint: "/work", group: "Pages", run: go("/work") },
      { id: "about", label: "About", hint: "/about", group: "Pages", run: go("/about") },
      {
        id: "contact",
        label: "Correspondence",
        hint: "/#contact",
        group: "Pages",
        run: go("/#contact"),
      },
      ...projects.map((p) => ({
        id: p.slug,
        label: p.title,
        hint: `No. ${String(p.no).padStart(2, "0")}`,
        group: "Catalogue",
        run: go(`/work/${p.slug}`),
      })),
      {
        id: "github",
        label: "GitHub",
        hint: "external",
        group: "Elsewhere",
        run: away(profile.github),
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        hint: "external",
        group: "Elsewhere",
        run: away(profile.linkedin),
      },
      {
        id: "email",
        label: "Email",
        hint: profile.email,
        group: "Elsewhere",
        run: () => {
          close();
          window.location.href = `mailto:${profile.email}`;
        },
      },
      {
        id: "resume",
        label: "Résumé (PDF)",
        hint: "/resume.pdf",
        group: "Elsewhere",
        run: away("/resume.pdf"),
      },
    ];
  }, [projects, profile, router, close]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    // Subsequence match — "aqs" finds AquaSafe, which is how people actually type.
    return items.filter((item) => {
      const haystack = `${item.label} ${item.hint} ${item.group}`.toLowerCase();
      let i = 0;
      for (const char of q) {
        i = haystack.indexOf(char, i);
        if (i === -1) return false;
        i += 1;
      }
      return true;
    });
  }, [items, query]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        close();
      }
    }
    function onOpen() {
      setOpen(true);
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      document.documentElement.style.overflow = "hidden";
      return () => {
        cancelAnimationFrame(id);
        document.documentElement.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  function onInputKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      results[active]?.run();
    }
  }

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
      style={{ backgroundColor: "color-mix(in srgb, var(--paper) 72%, transparent)" }}
      onClick={close}
      role="presentation"
      data-print-hide
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Index"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg border shadow-[6px_6px_0_0_var(--rule)]"
        style={{ backgroundColor: "var(--paper)", borderColor: "var(--ink)" }}
      >
        <div
          className="flex items-center gap-3 border-b px-4"
          style={{ borderColor: "var(--rule)", height: "3rem" }}
        >
          <span className="mono shrink-0" style={{ fontSize: "var(--t-2xs)", color: "var(--accent)", letterSpacing: "0.16em" }}>
            INDEX
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              // The old highlight means nothing against a new result set.
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Type to filter…"
            aria-label="Filter the index"
            className="mono w-full border-0 bg-transparent outline-none"
            style={{ fontSize: "var(--t-sm)" }}
          />
        </div>

        <ul ref={listRef} className="max-h-[52vh] overflow-y-auto py-1">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center" style={{ color: "var(--ink-faint)", fontSize: "var(--t-sm)" }}>
              Nothing under that heading.
            </li>
          ) : (
            results.map((item, i) => {
              const showGroup = item.group !== lastGroup;
              lastGroup = item.group;
              const isActive = i === active;
              return (
                <li key={item.id}>
                  {showGroup ? (
                    <div className="label px-4 pt-3 pb-1">{item.group}</div>
                  ) : null}
                  <button
                    type="button"
                    data-active={isActive}
                    onMouseEnter={() => setActive(i)}
                    onClick={item.run}
                    className="flex w-full items-baseline justify-between gap-4 px-4 py-1.5 text-left"
                    style={{
                      backgroundColor: isActive ? "var(--accent)" : "transparent",
                      color: isActive ? "var(--paper)" : "var(--ink)",
                    }}
                  >
                    <span style={{ fontSize: "var(--t-sm)" }}>{item.label}</span>
                    <span
                      className="mono shrink-0"
                      style={{
                        fontSize: "var(--t-2xs)",
                        opacity: isActive ? 0.8 : 0.5,
                      }}
                    >
                      {item.hint}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div
          className="mono flex justify-between border-t px-4 py-2"
          style={{ borderColor: "var(--rule)", fontSize: "var(--t-2xs)", color: "var(--ink-faint)" }}
        >
          <span>↑↓ move · ↵ open · esc close</span>
          <span>
            {results.length} {results.length === 1 ? "entry" : "entries"}
          </span>
        </div>
      </div>
    </div>
  );
}
