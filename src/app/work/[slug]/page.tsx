import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getContent, getProject } from "@/lib/content";
import { Shell, Label, Datum, RegistrationMark } from "@/components/press/primitives";
import { BlockRenderer } from "@/components/press/BlockRenderer";
import { FigureBlock } from "@/components/charts/Figure";
import { Reactions } from "@/components/Reactions";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { projects } = await getContent();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<"/work/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) return { title: "Not in the catalogue" };

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: `${project.title} — ${project.kicker}`,
      description: project.summary,
      type: "article",
    },
    alternates: { canonical: `/work/${project.slug}` },
  };
}

const DOMAIN_LABEL: Record<string, string> = {
  systems: "Systems",
  ml: "Machine learning",
  product: "Product",
  infra: "Infrastructure",
  security: "Security",
};

export default async function CaseStudy(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const [project, { projects }] = await Promise.all([getProject(slug), getContent()]);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const previous = projects[index - 1];
  const next = projects[index + 1];

  // Plates referenced from the prose are numbered there; anything left over is
  // printed after the text rather than dropped.
  const referenced = new Set(
    (project.body ?? []).flatMap((block) => (block.t === "figure" ? [block.ref] : [])),
  );
  const orphans = (project.figures ?? []).filter((figure) => !referenced.has(figure.id));

  return (
    <Shell as="article">
      <div className="pt-8 sm:pt-12">
        <Link href="/work" className="label hover:text-[var(--accent)]">
          ← The catalogue
        </Link>
      </div>

      {/* ── Entry head ──────────────────────────────────────────────────── */}
      <header className="pt-5">
        <div
          className="mono flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pb-2"
          style={{ fontSize: "var(--t-2xs)", letterSpacing: "0.16em", color: "var(--ink-faint)" }}
        >
          <span style={{ color: "var(--accent)" }}>
            NO. {String(project.no).padStart(2, "0")}
          </span>
          <span>
            {DOMAIN_LABEL[project.domain]?.toUpperCase()} · {project.status.toUpperCase()}
          </span>
          <span>{project.period.toUpperCase()}</span>
        </div>
        <hr className="rule-double" />

        <h1
          className="display pt-7"
          style={{ fontSize: "var(--t-2xl)", maxWidth: "18ch" }}
        >
          {project.title}
        </h1>
        <p
          className="mt-2"
          style={{
            fontSize: "var(--t-lg)",
            fontStyle: "italic",
            color: "var(--ink-muted)",
            maxWidth: "34ch",
            textWrap: "pretty",
          }}
        >
          {project.kicker}
        </p>

        {project.standfirst ? (
          <p
            className="mt-7"
            style={{ fontSize: "var(--t-md)", maxWidth: "52ch", textWrap: "pretty" }}
          >
            {project.standfirst}
          </p>
        ) : null}

        {/* Results table. */}
        <div
          className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7 border-y py-7 md:grid-cols-4"
          style={{ borderColor: "var(--rule-strong)" }}
        >
          {project.metrics.map((metric) => (
            <Datum
              key={metric.label}
              label={metric.label}
              value={metric.value}
              note={metric.note}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 pt-5">
          <p
            className="mono"
            style={{ fontSize: "var(--t-2xs)", color: "var(--ink-faint)", maxWidth: "60ch" }}
          >
            {project.stack.join("  ·  ")}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="mono link-underline"
                style={{ fontSize: "var(--t-xs)" }}
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="pt-12">
        {project.body?.length ? (
          <BlockRenderer blocks={project.body} figures={project.figures} />
        ) : (
          <p style={{ color: "var(--ink-muted)", maxWidth: "36rem" }}>
            A longer write-up for this entry hasn&rsquo;t been set yet. The source is
            linked above.
          </p>
        )}

        {orphans.map((figure, i) => (
          <div key={figure.id} style={{ maxWidth: "36rem" }}>
            <FigureBlock spec={figure} n={(project.figures ?? []).indexOf(figure) + 1 || i + 1} />
          </div>
        ))}

        {project.footnotes?.length ? (
          <aside className="mt-14" style={{ maxWidth: "36rem" }}>
            <hr className="rule-thin" />
            <ol className="pt-3">
              {project.footnotes.map((note, i) => (
                <li key={note.id} className="flex gap-3 py-1">
                  <span
                    className="mono shrink-0"
                    style={{ fontSize: "var(--t-2xs)", color: "var(--accent)" }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: "var(--t-xs)", color: "var(--ink-muted)" }}>
                    {note.text}
                  </span>
                </li>
              ))}
            </ol>
          </aside>
        ) : null}
      </div>

      {/* ── Marks ───────────────────────────────────────────────────────── */}
      <div className="mt-16">
        <hr className="rule-thin" />
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5">
          <Reactions slug={project.slug} />
          <RegistrationMark />
        </div>
      </div>

      {/* ── Turn the page ───────────────────────────────────────────────── */}
      <nav className="mt-14 grid gap-px sm:grid-cols-2" style={{ backgroundColor: "var(--rule)" }}>
        {[previous, next].map((entry, i) => (
          <div key={i} style={{ backgroundColor: "var(--paper)" }}>
            {entry ? (
              <Link
                href={`/work/${entry.slug}`}
                className={`group block py-6 ${i === 1 ? "sm:pl-8 sm:text-right" : "sm:pr-8"}`}
              >
                <Label>{i === 0 ? "← Previous entry" : "Next entry →"}</Label>
                <p
                  className="display mt-1 transition-colors group-hover:text-[var(--accent)]"
                  style={{ fontSize: "var(--t-lg)" }}
                >
                  {entry.title}
                </p>
                <p
                  className="mt-0.5"
                  style={{ fontSize: "var(--t-xs)", color: "var(--ink-muted)" }}
                >
                  {entry.kicker}
                </p>
              </Link>
            ) : (
              <div className="py-6">
                <Label>{i === 0 ? "Start of catalogue" : "End of catalogue"}</Label>
              </div>
            )}
          </div>
        ))}
      </nav>
    </Shell>
  );
}
