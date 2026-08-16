const H = 90;

/**
 * Columns on a hairline baseline. Used for commit activity, where the shape of
 * the year matters more than any individual value.
 */
export function SeriesPlot({
  series,
  ticks,
  unit = "",
}: {
  series: { label: string; values: number[] }[];
  ticks?: string[];
  unit?: string;
}) {
  const primary = series[0];
  if (!primary || primary.values.length === 0) return null;

  const peak = Math.max(...primary.values, 1);
  const n = primary.values.length;
  const gap = n > 80 ? 0.35 : 1;
  const colW = (600 - gap * (n - 1)) / n;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="label">{primary.label}</span>
        <span className="mono" style={{ fontSize: "var(--t-2xs)", color: "var(--ink-faint)" }}>
          PEAK {peak}
          {unit}
        </span>
      </div>

      <svg
        viewBox={`0 0 600 ${H + 6}`}
        className="w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${primary.label}: ${n} intervals, peak ${peak}`}
        style={{ height: 96 }}
      >
        {primary.values.map((v, i) => {
          const barH = Math.max(v > 0 ? 1.5 : 0, (v / peak) * H);
          return (
            <rect
              key={i}
              x={i * (colW + gap)}
              y={H - barH}
              width={colW}
              height={barH}
              fill={v > 0 ? "var(--accent)" : "var(--rule)"}
              opacity={v > 0 ? 0.35 + 0.65 * (v / peak) : 1}
            />
          );
        })}
        <line x1="0" y1={H} x2="600" y2={H} stroke="var(--ink)" strokeWidth="1" />
      </svg>

      {ticks && ticks.length > 0 ? (
        <div
          className="mono flex justify-between"
          style={{ fontSize: "var(--t-2xs)", color: "var(--ink-faint)" }}
        >
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
