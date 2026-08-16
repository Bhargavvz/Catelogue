/**
 * A single stacked rule showing what the repositories are actually written in.
 * Ink opacity carries the ranking; the leader gets the accent.
 */
export function LanguageBars({
  languages,
}: {
  languages: { label: string; value: number }[];
}) {
  const total = languages.reduce((sum, l) => sum + l.value, 0);
  if (!total) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2.5 w-full overflow-hidden">
        {languages.map((lang, i) => (
          <div
            key={lang.label}
            title={`${lang.label} — ${((lang.value / total) * 100).toFixed(1)}%`}
            style={{
              width: `${(lang.value / total) * 100}%`,
              backgroundColor: i === 0 ? "var(--accent)" : "var(--ink)",
              opacity: i === 0 ? 1 : Math.max(0.12, 0.62 - i * 0.1),
              borderRight: "1px solid var(--paper)",
            }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1">
        {languages.map((lang, i) => (
          <li
            key={lang.label}
            className="mono flex items-baseline gap-1.5"
            style={{ fontSize: "var(--t-2xs)", color: "var(--ink-muted)" }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                display: "inline-block",
                backgroundColor: i === 0 ? "var(--accent)" : "var(--ink)",
                opacity: i === 0 ? 1 : Math.max(0.12, 0.62 - i * 0.1),
              }}
            />
            {lang.label}
            <span className="figures" style={{ color: "var(--ink)" }}>
              {((lang.value / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
