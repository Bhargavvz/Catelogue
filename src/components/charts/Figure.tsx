import type { ReactNode } from "react";
import type { FigureSpec } from "@/lib/types";
import { RocCurve } from "./RocCurve";
import { BarPlot } from "./BarPlot";
import { WafflePlot } from "./WafflePlot";
import { SeriesPlot } from "./SeriesPlot";

/**
 * The frame every plate sits in: rule, plate, rule, numbered caption.
 * A figure without a number and a caption is decoration.
 */
export function Plate({
  n,
  caption,
  children,
  wide = false,
}: {
  n: number | string;
  caption: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <figure className={`my-8 ${wide ? "" : "max-w-2xl"}`}>
      <hr className="rule-thin" />
      <div className="py-5">{children}</div>
      <hr className="rule-thin" />
      <figcaption
        className="flex gap-3 pt-2"
        style={{ fontSize: "var(--t-xs)", color: "var(--ink-muted)" }}
      >
        <span
          className="mono shrink-0"
          style={{ color: "var(--accent)", letterSpacing: "0.1em" }}
        >
          FIG. {n}
        </span>
        <span style={{ textWrap: "pretty" }}>{caption}</span>
      </figcaption>
    </figure>
  );
}

/** Dispatches a spec to its plate. */
export function FigureBlock({ spec, n }: { spec: FigureSpec; n: number }) {
  return (
    <Plate n={n} caption={spec.caption}>
      {spec.kind === "roc" ? (
        <RocCurve points={spec.points} auc={spec.auc} />
      ) : spec.kind === "bars" ? (
        <BarPlot bars={spec.bars} unit={spec.unit} max={spec.max} />
      ) : spec.kind === "share" ? (
        <WafflePlot slices={spec.slices} />
      ) : (
        <SeriesPlot series={spec.series} ticks={spec.ticks} unit={spec.unit} />
      )}
    </Plate>
  );
}
