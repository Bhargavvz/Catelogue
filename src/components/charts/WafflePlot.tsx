const COLS = 20;
const ROWS = 5;
const CELL = 10;
const GAP = 3;

/**
 * One hundred cells. For a proportion this small, a pie would round it into
 * invisibility and a bar would need a caption to explain the sliver — a grid
 * of squares just shows you two cells out of a hundred.
 */
export function WafflePlot({ slices }: { slices: { label: string; value: number }[] }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 100;
  const minor = [...slices].sort((a, b) => a.value - b.value)[0];
  const minorPct = (minor.value / total) * 100;
  const filled = Math.max(1, Math.round(minorPct));

  const w = COLS * CELL + (COLS - 1) * GAP;
  const h = ROWS * CELL + (ROWS - 1) * GAP;

  return (
    <div className="flex flex-col gap-4">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        style={{ maxWidth: 340 }}
        role="img"
        aria-label={`${minor.label}: ${minorPct.toFixed(1)} percent of one hundred`}
      >
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const on = i < filled;
          return (
            <rect
              key={i}
              x={(i % COLS) * (CELL + GAP)}
              y={Math.floor(i / COLS) * (CELL + GAP)}
              width={CELL}
              height={CELL}
              fill={on ? "var(--accent)" : "none"}
              stroke={on ? "var(--accent)" : "var(--rule-strong)"}
              strokeWidth="1"
            />
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-x-6 gap-y-1.5">
        {slices.map((s) => {
          const isMinor = s.label === minor.label;
          return (
            <span
              key={s.label}
              className="mono flex items-center gap-2"
              style={{ fontSize: "var(--t-2xs)", color: "var(--ink-muted)" }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: isMinor ? "var(--accent)" : "transparent",
                  border: `1px solid ${isMinor ? "var(--accent)" : "var(--rule-strong)"}`,
                }}
              />
              {s.label}
              <span className="figures" style={{ color: "var(--ink)" }}>
                {s.value}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
