import type { ReactNode } from "react";

/**
 * The furniture of a printed page: measures, rules, labels, folios.
 * Everything else on the site is built out of these.
 */

export function Shell({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "article";
}) {
  return (
    <Tag
      className={className}
      style={{
        maxWidth: "var(--shell)",
        marginInline: "auto",
        paddingInline: "var(--gutter)",
      }}
    >
      {children}
    </Tag>
  );
}

export function Label({
  children,
  className = "",
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`label ${className}`}
      style={accent ? { color: "var(--accent)" } : undefined}
    >
      {children}
    </span>
  );
}

/**
 * A section opener: hairline rule, number, title. The number is the point —
 * it tells the reader the page has a structure and they are somewhere in it.
 */
export function SectionHead({
  no,
  title,
  aside,
  id,
}: {
  no: string;
  title: string;
  aside?: ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <hr className="rule-thick" />
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pt-3">
        <div className="flex items-baseline gap-3">
          <Label accent>{no}</Label>
          <h2 className="serif-head" style={{ fontSize: "var(--t-md)" }}>
            {title}
          </h2>
        </div>
        {aside ? <Label>{aside}</Label> : null}
      </div>
    </div>
  );
}

/** Page-number-ish marker used down the left edge of long entries. */
export function Folio({ children }: { children: ReactNode }) {
  return (
    <span
      className="label"
      style={{
        writingMode: "vertical-rl",
        letterSpacing: "0.3em",
        color: "var(--ink-faint)",
      }}
    >
      {children}
    </span>
  );
}

/**
 * A note set in the margin on wide screens, inline on narrow ones.
 * Newspapers do this; websites almost never do, which is exactly why it works.
 */
export function Marginalia({ children }: { children: ReactNode }) {
  return (
    <aside
      className="margin-note my-6 border-l-2 pl-4 text-sm"
      style={{ borderColor: "var(--accent)", color: "var(--ink-muted)" }}
    >
      <span
        className="mono block pb-1"
        style={{ fontSize: "var(--t-2xs)", color: "var(--accent)", letterSpacing: "0.14em" }}
      >
        NOTE
      </span>
      <span style={{ fontStyle: "italic" }}>{children}</span>
    </aside>
  );
}

/** A metric in the style of a table of results: label above, value below. */
export function Datum({
  label,
  value,
  note,
  size = "md",
}: {
  label: string;
  value: string;
  note?: string;
  size?: "sm" | "md" | "lg";
}) {
  const fontSize =
    size === "lg" ? "var(--t-xl)" : size === "sm" ? "var(--t-md)" : "var(--t-lg)";
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <span
        className="display figures"
        style={{ fontSize, lineHeight: 1, color: "var(--ink)" }}
      >
        {value}
      </span>
      {note ? (
        <span
          className="mono"
          style={{ fontSize: "var(--t-2xs)", color: "var(--ink-faint)" }}
        >
          {note}
        </span>
      ) : null}
    </div>
  );
}

/** Registration marks. Purely a printer's joke, placed where a trim would be. */
export function RegistrationMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      style={{ width: 12, height: 12, color: "var(--ink-faint)" }}
    >
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}
