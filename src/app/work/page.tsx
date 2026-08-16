import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { Shell } from "@/components/press/primitives";
import { Catalogue } from "@/components/Catalogue";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The catalogue",
  description:
    "Every project, indexed: machine learning, systems, security and product work, with the headline result for each.",
  alternates: { canonical: "/work" },
};

export default async function WorkIndex() {
  const { projects } = await getContent();

  const rows = projects.map((project) => ({
    slug: project.slug,
    no: project.no,
    title: project.title,
    kicker: project.kicker,
    domain: project.domain,
    year: project.year,
    status: project.status,
    stack: project.stack,
    headline: project.metrics[0]?.value ?? "—",
    headlineLabel: project.metrics[0]?.label ?? "",
  }));

  return (
    <Shell as="div">
      <header className="pt-8 sm:pt-14">
        <div
          className="mono flex items-center justify-between pb-2"
          style={{ fontSize: "var(--t-2xs)", letterSpacing: "0.18em", color: "var(--ink-faint)" }}
        >
          <span>THE CATALOGUE</span>
          <span>{projects.length} ENTRIES</span>
        </div>
        <hr className="rule-double" />

        <div className="grid gap-x-10 gap-y-5 pt-8 md:grid-cols-12">
          <h1 className="display md:col-span-7" style={{ fontSize: "var(--t-2xl)" }}>
            Everything,
            <br />
            indexed
            <span style={{ color: "var(--accent)" }}>.</span>
          </h1>
          <p
            className="self-end md:col-span-5"
            style={{ color: "var(--ink-muted)", textWrap: "pretty" }}
          >
            Sorted by catalogue number by default, which is roughly the order I
            would want them read. Each entry carries its own headline result —
            if a project has no number attached to it, that is worth noticing too.
          </p>
        </div>
      </header>

      <div className="pt-12">
        <Catalogue rows={rows} />
      </div>
    </Shell>
  );
}
