/**
 * Horizontal bars on a shared baseline. Labels sit outside the plot so the
 * bars themselves stay comparable — the whole reason to use bars at all.
 */
export function BarPlot({
  bars,
  unit = "",
  max,
}: {
  bars: { label: string; value: number; note?: string }[];
  unit?: string;
  max?: number;
}) {
  const ceiling = max ?? Math.max(...bars.map((b) => b.value)) * 1.05;
  const decimals = ceiling <= 1 ? 3 : 2;

  return (
    <div className="flex flex-col gap-4">
      {bars.map((bar) => {
        const pct = Math.max(0, Math.min(100, (bar.value / ceiling) * 100));
        return (
          <div key={bar.label} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-4">
              <span
                className="mono"
                style={{ fontSize: "var(--t-xs)", color: "var(--ink-muted)" }}
              >
                {bar.label}
                {bar.note ? (
                  <span style={{ color: "var(--ink-faint)" }}> · {bar.note}</span>
                ) : null}
              </span>
              <span
                className="figures shrink-0"
                style={{ fontSize: "var(--t-sm)", fontWeight: 500 }}
              >
                {unit === "%" ? bar.value.toFixed(2) : bar.value.toFixed(decimals)}
                {unit === "%" ? (
                  <span style={{ color: "var(--ink-faint)" }}>%</span>
                ) : null}
              </span>
            </div>
            <div
              className="relative"
              style={{ height: 10, backgroundColor: "var(--paper-sunk)" }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${pct}%`,
                  backgroundColor: "var(--accent)",
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Baseline scale, so a bar means something absolute. */}
      <div
        className="mono flex justify-between border-t pt-1"
        style={{
          borderColor: "var(--ink)",
          fontSize: "var(--t-2xs)",
          color: "var(--ink-faint)",
        }}
      >
        <span>0</span>
        <span>
          {ceiling <= 1 ? ceiling.toFixed(2) : Math.round(ceiling)}
          {unit && unit !== "R²" ? unit : ""}
          {unit === "R²" ? " R²" : ""}
        </span>
      </div>
    </div>
  );
}
