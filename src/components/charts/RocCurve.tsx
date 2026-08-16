const W = 340;
const H = 250;
const PAD = { l: 46, r: 14, t: 16, b: 40 };

/**
 * A receiver operating characteristic, drawn the way a journal would print it:
 * hairline axes, a dashed chance diagonal, a tinted area, and the AUC stated
 * plainly rather than implied by how good the curve looks.
 */
export function RocCurve({
  points,
  auc,
}: {
  points: { x: number; y: number }[];
  auc: number;
}) {
  const px = (v: number) => PAD.l + v * (W - PAD.l - PAD.r);
  const py = (v: number) => H - PAD.b - v * (H - PAD.t - PAD.b);

  const line = points
    .map((point, i) => `${i ? "L" : "M"}${px(point.x)},${py(point.y)}`)
    .join(" ");
  const area = `${line} L${px(1)},${py(0)} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ maxWidth: 420, overflow: "visible" }}
      role="img"
      aria-label={`ROC curve with area under curve of ${auc}`}
    >
      {/* Grid — dotted, so it recedes behind the data. */}
      {ticks.map((t) => (
        <g key={`g${t}`} style={{ color: "var(--rule)" }}>
          <line
            x1={px(t)}
            y1={py(0)}
            x2={px(t)}
            y2={py(1)}
            stroke="currentColor"
            strokeWidth="0.75"
            strokeDasharray="1 3"
          />
          <line
            x1={px(0)}
            y1={py(t)}
            x2={px(1)}
            y2={py(t)}
            stroke="currentColor"
            strokeWidth="0.75"
            strokeDasharray="1 3"
          />
        </g>
      ))}

      {/* Chance diagonal. */}
      <line
        x1={px(0)}
        y1={py(0)}
        x2={px(1)}
        y2={py(1)}
        stroke="var(--ink-faint)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />

      <path d={area} fill="var(--accent)" opacity="0.07" />

      {/* Plot frame. Without it a near-perfect curve looks like it has escaped. */}
      <rect
        x={px(0)}
        y={py(1)}
        width={px(1) - px(0)}
        height={py(0) - py(1)}
        fill="none"
        stroke="var(--rule)"
        strokeWidth="1"
      />

      <path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Axes, drawn last so they sit crisply over the tint. */}
      <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(0)} stroke="var(--ink)" strokeWidth="1" />
      <line x1={px(0)} y1={py(0)} x2={px(0)} y2={py(1)} stroke="var(--ink)" strokeWidth="1" />

      {ticks.map((t) => (
        <g key={`t${t}`}>
          <line
            x1={px(t)}
            y1={py(0)}
            x2={px(t)}
            y2={py(0) + 4}
            stroke="var(--ink)"
            strokeWidth="1"
          />
          <text
            x={px(t)}
            y={py(0) + 15}
            textAnchor="middle"
            fill="var(--ink-faint)"
            className="mono"
            style={{ fontSize: 8 }}
          >
            {t.toFixed(2)}
          </text>
          <line
            x1={px(0) - 4}
            y1={py(t)}
            x2={px(0)}
            y2={py(t)}
            stroke="var(--ink)"
            strokeWidth="1"
          />
          <text
            x={px(0) - 8}
            y={py(t) + 3}
            textAnchor="end"
            fill="var(--ink-faint)"
            className="mono"
            style={{ fontSize: 8 }}
          >
            {t.toFixed(2)}
          </text>
        </g>
      ))}

      <text
        x={px(0.5)}
        y={H - 4}
        textAnchor="middle"
        fill="var(--ink-muted)"
        className="mono"
        style={{ fontSize: 8, letterSpacing: "0.12em" }}
      >
        FALSE POSITIVE RATE
      </text>
      <text
        x={12}
        y={py(0.5)}
        textAnchor="middle"
        transform={`rotate(-90 12 ${py(0.5)})`}
        fill="var(--ink-muted)"
        className="mono"
        style={{ fontSize: 8, letterSpacing: "0.12em" }}
      >
        TRUE POSITIVE RATE
      </text>

      {/* The number, stated. */}
      <g transform={`translate(${px(0.42)} ${py(0.28)})`}>
        <text
          fill="var(--ink-faint)"
          className="mono"
          style={{ fontSize: 8, letterSpacing: "0.14em" }}
        >
          AUC-ROC
        </text>
        <text
          y={22}
          fill="var(--ink)"
          className="display"
          style={{ fontSize: 26 }}
        >
          {auc.toFixed(4)}
        </text>
      </g>
    </svg>
  );
}
