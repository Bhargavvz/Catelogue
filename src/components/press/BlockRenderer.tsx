import type { Block, FigureSpec } from "@/lib/types";
import { Marginalia } from "./primitives";
import { FigureBlock } from "@/components/charts/Figure";

/**
 * Renders a case-study body. Figures are referenced by id from the text so the
 * numbering follows reading order, the way a paper numbers its plates.
 */
export function BlockRenderer({
  blocks,
  figures = [],
}: {
  blocks: Block[];
  figures?: FigureSpec[];
}) {
  const numbering = new Map(figures.map((figure, i) => [figure.id, i + 1]));

  // Which paragraphs open a passage. Computed up front so rendering stays pure —
  // the first paragraph after any break is set flush, the rest are indented,
  // which is how a printed column distinguishes a new thought from a continued one.
  const opensPassage: boolean[] = [];
  let sinceBreak = 0;
  for (const block of blocks) {
    if (block.t === "p") {
      opensPassage.push(sinceBreak === 0);
      sinceBreak += 1;
    } else {
      opensPassage.push(false);
      // A margin note interrupts nothing; everything else does.
      if (block.t !== "note") sinceBreak = 0;
    }
  }

  return (
    <div className="prose-column" style={{ maxWidth: "36rem" }}>
      {blocks.map((block, i) => {
        switch (block.t) {
          case "h": {
            return (
              <h2
                key={i}
                className="serif-head mt-12 mb-3"
                style={{ fontSize: "var(--t-lg)" }}
              >
                {block.text}
              </h2>
            );
          }

          case "p":
            return (
              <p key={i} className={opensPassage[i] ? "no-indent" : undefined}>
                {block.text}
              </p>
            );

          case "list":
            return (
              <ul key={i} className="my-6 space-y-2.5">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3.5">
                    <span
                      className="mono figures shrink-0"
                      style={{
                        color: "var(--accent)",
                        fontSize: "var(--t-2xs)",
                        paddingTop: "0.45em",
                      }}
                    >
                      {String(j + 1).padStart(2, "0")}
                    </span>
                    <span style={{ textWrap: "pretty" }}>{item}</span>
                  </li>
                ))}
              </ul>
            );

          case "quote":
            return (
              <blockquote key={i} className="my-9">
                <p
                  className="display"
                  style={{
                    fontSize: "var(--t-lg)",
                    lineHeight: 1.14,
                    textIndent: "-0.4em",
                  }}
                >
                  &ldquo;{block.text}&rdquo;
                </p>
                {block.attribution ? (
                  <cite
                    className="label mt-3 block"
                    style={{ fontStyle: "normal" }}
                  >
                    {block.attribution}
                  </cite>
                ) : null}
              </blockquote>
            );

          case "note":
            return <Marginalia key={i}>{block.text}</Marginalia>;

          case "figure": {
            const spec = figures.find((f) => f.id === block.ref);
            if (!spec) return null;
            return (
              <FigureBlock key={i} spec={spec} n={numbering.get(spec.id) ?? 1} />
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
