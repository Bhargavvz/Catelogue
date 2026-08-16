"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

type Row = Pick<
  Project,
  "slug" | "no" | "title" | "kicker" | "domain" | "year" | "status" | "stack"
> & { headline: string; headlineLabel: string };

type SortKey = "no" | "year" | "title";

const DOMAINS: { id: Project["domain"] | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "ml", label: "Machine learning" },
  { id: "systems", label: "Systems" },
  { id: "security", label: "Security" },
  { id: "product", label: "Product" },
];

/**
 * The catalogue proper: one line per entry, sortable and filterable, no images.
 * Twenty projects with pictures is a gallery you scroll past; twenty projects
 * as an index is something you can actually read.
 */
export function Catalogue({ rows }: { rows: Row[] }) {
  const [domain, setDomain] = useState<Project["domain"] | "all">("all");
  const [sort, setSort] = useState<SortKey>("no");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((row) => (domain === "all" ? true : row.domain === domain))
      .filter((row) =>
        q
          ? `${row.title} ${row.kicker} ${row.stack.join(" ")}`.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "year") return b.year - a.year || a.no - b.no;
        return a.no - b.no;
      });
  }, [rows, domain, sort, query]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) map.set(row.domain, (map.get(row.domain) ?? 0) + 1);
    return map;
  }, [rows]);

  return (
    <>
      {/* Controls, set as a printed form rather than a toolbar. */}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 pb-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {DOMAINS.map((option) => {
            const active = domain === option.id;
            const n = option.id === "all" ? rows.length : (counts.get(option.id) ?? 0);
            if (!n) return null;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setDomain(option.id)}
                className="mono transition-colors"
                style={{
                  fontSize: "var(--t-2xs)",
                  letterSpacing: "0.12em",
                  color: active ? "var(--accent)" : "var(--ink-faint)",
                  textDecoration: active ? "underline" : "none",
                  textUnderlineOffset: "0.4em",
                }}
              >
                {option.label.toUpperCase()}
                <span style={{ opacity: 0.6 }}> {n}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2">
            <span className="label">Find</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="title or stack"
              className="mono w-32 border-0 border-b bg-transparent pb-1 outline-none focus:border-[var(--accent)] sm:w-44"
              style={{ fontSize: "var(--t-xs)" }}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="label">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="mono cursor-pointer border-0 border-b bg-transparent pb-1 outline-none"
              style={{ fontSize: "var(--t-xs)", color: "var(--ink)" }}
            >
              <option value="no">Catalogue no.</option>
              <option value="year">Most recent</option>
              <option value="title">Alphabetical</option>
            </select>
          </label>
        </div>
      </div>

      {/* Column heads. */}
      <div
        className="hidden grid-cols-12 gap-4 border-y py-2 md:grid"
        style={{ borderColor: "var(--ink)" }}
      >
        <span className="label col-span-1">No.</span>
        <span className="label col-span-5">Entry</span>
        <span className="label col-span-2">Field</span>
        <span className="label col-span-1">Year</span>
        <span className="label col-span-3 text-right">Headline result</span>
      </div>

      <ul>
        {visible.map((row) => (
          <li key={row.slug}>
            <Link
              href={`/work/${row.slug}`}
              className="group grid grid-cols-12 items-baseline gap-x-4 gap-y-1 border-b py-4 transition-colors hover:bg-[var(--paper-raised)]"
              style={{ borderColor: "var(--rule)" }}
            >
              <span
                className="mono figures col-span-2 md:col-span-1"
                style={{ fontSize: "var(--t-xs)", color: "var(--ink-faint)" }}
              >
                {String(row.no).padStart(2, "0")}
              </span>

              <div className="col-span-10 md:col-span-5">
                <h2
                  className="serif-head transition-colors group-hover:text-[var(--accent)]"
                  style={{ fontSize: "var(--t-md)" }}
                >
                  {row.title}
                </h2>
                <p
                  className="mt-0.5"
                  style={{ fontSize: "var(--t-xs)", color: "var(--ink-muted)", textWrap: "pretty" }}
                >
                  {row.kicker}
                </p>
                <p
                  className="mono mt-1.5 md:hidden"
                  style={{ fontSize: "var(--t-2xs)", color: "var(--ink-faint)" }}
                >
                  {row.year} · {row.headlineLabel}: {row.headline}
                </p>
              </div>

              <span
                className="mono col-span-2 hidden md:block"
                style={{ fontSize: "var(--t-2xs)", color: "var(--ink-muted)" }}
              >
                {row.domain.toUpperCase()}
              </span>
              <span
                className="mono figures col-span-1 hidden md:block"
                style={{ fontSize: "var(--t-2xs)", color: "var(--ink-muted)" }}
              >
                {row.year}
              </span>

              <div className="col-span-3 hidden text-right md:block">
                <span className="display figures" style={{ fontSize: "var(--t-md)" }}>
                  {row.headline}
                </span>
                <span
                  className="mono block"
                  style={{ fontSize: "var(--t-2xs)", color: "var(--ink-faint)" }}
                >
                  {row.headlineLabel}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="py-14 text-center" style={{ color: "var(--ink-faint)" }}>
          Nothing in the catalogue matches that.
        </p>
      ) : (
        <p className="label pt-4">
          Showing {visible.length} of {rows.length} entries
        </p>
      )}
    </>
  );
}
