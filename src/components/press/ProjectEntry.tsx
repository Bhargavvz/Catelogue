import Link from "next/link";
import type { Project } from "@/lib/types";
import { Label, Datum } from "./primitives";

const DOMAIN_LABEL: Record<Project["domain"], string> = {
  systems: "Systems",
  ml: "Machine learning",
  product: "Product",
  infra: "Infrastructure",
  security: "Security",
};

/**
 * A catalogue entry, set the way a printed catalogue sets one: number in the
 * margin, title, a short standfirst, then the results table. The whole block is
 * one link — a row you can hit anywhere is kinder than a "Read more".
 */
export function ProjectEntry({ project }: { project: Project }) {
  return (
    <article className="group">
      <hr className="rule-thin" />
      <Link
        href={`/work/${project.slug}`}
        className="block py-7 outline-offset-4 transition-colors"
      >
        <div className="grid gap-x-10 gap-y-5 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="flex items-baseline gap-3">
              <span
                className="mono figures transition-colors group-hover:text-[var(--accent)]"
                style={{
                  fontSize: "var(--t-sm)",
                  color: "var(--ink-faint)",
                  letterSpacing: "0.06em",
                }}
              >
                {String(project.no).padStart(2, "0")}
              </span>
              <Label>
                {DOMAIN_LABEL[project.domain]} · {project.year} ·{" "}
                {project.status.toUpperCase()}
              </Label>
            </div>

            <h3
              className="display mt-2 transition-colors group-hover:text-[var(--accent)]"
              style={{ fontSize: "var(--t-xl)", lineHeight: 0.94 }}
            >
              {project.title}
            </h3>

            <p
              className="mt-1"
              style={{
                fontSize: "var(--t-md)",
                fontStyle: "italic",
                color: "var(--ink-muted)",
                textWrap: "pretty",
              }}
            >
              {project.kicker}
            </p>

            <p className="mt-4 max-w-prose" style={{ textWrap: "pretty" }}>
              {project.summary}
            </p>

            <p
              className="mono mt-4"
              style={{ fontSize: "var(--t-2xs)", color: "var(--ink-faint)" }}
            >
              {project.stack.slice(0, 7).join("  ·  ")}
              {project.stack.length > 7 ? `  ·  +${project.stack.length - 7}` : ""}
            </p>
          </div>

          <div className="md:col-span-5">
            <div
              className="grid grid-cols-2 gap-x-6 gap-y-5 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-8"
              style={{ borderColor: "var(--rule)" }}
            >
              {project.metrics.slice(0, 4).map((metric) => (
                <Datum
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  note={metric.note}
                  size="sm"
                />
              ))}
            </div>

            <span
              className="mono mt-6 hidden items-center gap-2 md:inline-flex md:pl-8"
              style={{ fontSize: "var(--t-2xs)", color: "var(--accent)" }}
            >
              READ THE CASE STUDY
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
