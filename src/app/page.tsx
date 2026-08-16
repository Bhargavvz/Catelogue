import { Suspense } from "react";
import Link from "next/link";

import { getContent } from "@/lib/content";
import { Shell, Label, SectionHead, Datum, RegistrationMark } from "@/components/press/primitives";
import { ProjectEntry } from "@/components/press/ProjectEntry";
import { TelemetrySection } from "@/components/press/TelemetrySection";
import { ContactForm } from "@/components/ContactForm";

export const revalidate = 3600;

const ROMAN: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

function toRoman(year: number): string {
  let n = year;
  let out = "";
  for (const [value, numeral] of ROMAN) {
    while (n >= value) {
      out += numeral;
      n -= value;
    }
  }
  return out;
}

/** Splits a long name across two lines at roughly the midpoint. */
function nameLines(name: string): [string, string] {
  const words = name.split(" ");
  if (words.length < 3) return [name, ""];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

export default async function FrontPage() {
  const { profile, projects, experience, awards, education } = await getContent();
  const featured = projects.filter((p) => p.featured);
  const gsoc = experience[0];
  const [line1, line2] = nameLines(profile.name);
  const year = new Date().getFullYear();

  return (
    <Shell as="div">
      {/* ── Masthead ────────────────────────────────────────────────────── */}
      <header className="pt-8 sm:pt-14">
        <div
          className="mono flex items-center justify-between gap-4 pb-2"
          style={{
            fontSize: "var(--t-2xs)",
            letterSpacing: "0.18em",
            color: "var(--ink-faint)",
          }}
        >
          <span>VOL. I · NO. 1</span>
          <span className="hidden sm:inline">{profile.location.toUpperCase()}</span>
          <span>{toRoman(year)}</span>
        </div>
        <hr className="rule-double" />

        <div className="grid gap-x-10 gap-y-8 pt-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <h1 className="display" style={{ fontSize: "var(--t-display)" }}>
              {line1}
              <br />
              {line2}
              <span style={{ color: "var(--accent)" }}>.</span>
            </h1>
          </div>

          {/* Standing facts. A masthead box, the sort a paper never changes. */}
          <aside
            className="self-end border-t pt-4 md:col-span-4 md:border-t-0 md:border-l md:pt-0 md:pl-7"
            style={{ borderColor: "var(--rule)" }}
          >
            <dl className="grid gap-4">
              {[
                { k: "Discipline", v: profile.role },
                { k: "Currently", v: `${education[0].qualification}, ${education[0].period}` },
                { k: "Open source", v: "GSoC 2025 · VideoLAN" },
                { k: "Based in", v: profile.location },
                { k: "Available", v: "Full-time, from 2026" },
              ].map((row) => (
                <div key={row.k} className="flex flex-col gap-0.5">
                  <dt className="label">{row.k}</dt>
                  <dd style={{ fontSize: "var(--t-sm)", textWrap: "pretty" }}>{row.v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {/* Lede, set in two columns with a rubricated initial. */}
        <div className="grid gap-x-10 gap-y-6 pt-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p
              className="dropcap"
              style={{ fontSize: "var(--t-md)", textWrap: "pretty" }}
            >
              {profile.lede[0]}
            </p>
            <p className="mt-4" style={{ textWrap: "pretty" }}>
              {profile.lede[1]}
            </p>
          </div>
          <div className="md:col-span-5">
            <p style={{ color: "var(--ink-muted)", textWrap: "pretty" }}>{profile.lede[2]}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href="/work"
                className="mono border px-4 py-2 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                style={{
                  borderColor: "var(--ink)",
                  fontSize: "var(--t-2xs)",
                  letterSpacing: "0.16em",
                }}
              >
                THE CATALOGUE →
              </Link>
              <a href={profile.resumeUrl} className="link-underline" style={{ fontSize: "var(--t-sm)" }}>
                Résumé (PDF)
              </a>
            </div>
          </div>
        </div>

        {/* The four numbers that matter, above the fold on most screens. */}
        <div
          className="mt-12 grid grid-cols-2 gap-x-8 gap-y-7 border-y py-7 sm:grid-cols-4"
          style={{ borderColor: "var(--rule-strong)" }}
        >
          {/* Each of these is reproducible from the linked repository. */}
          <Datum label="Open source" value="GSoC '25" note="VideoLAN · VLC" />
          <Datum label="Catalogued projects" value={String(projects.length)} note="shipped, not planned" />
          <Datum label="Largest training set" value="500K" note="records · AquaSafe" />
          <Datum label="Best measured result" value="99.95%" note="water-quality classifier" />
        </div>
      </header>

      {/* ── § 01 Experience ─────────────────────────────────────────────── */}
      <section className="mt-20" id="experience">
        <SectionHead no="§ 01" title="Experience" aside={gsoc.period} />
        <div className="grid gap-x-10 gap-y-6 pt-7 md:grid-cols-12">
          <div className="md:col-span-4">
            <h3 className="display" style={{ fontSize: "var(--t-lg)", lineHeight: 1 }}>
              {gsoc.org}
            </h3>
            <p className="mt-1" style={{ fontStyle: "italic", color: "var(--ink-muted)" }}>
              {gsoc.role}
            </p>
            <p className="label mt-3">{gsoc.location}</p>
            <p
              className="mono mt-5"
              style={{ fontSize: "var(--t-2xs)", color: "var(--ink-faint)" }}
            >
              {gsoc.stack.join("  ·  ")}
            </p>
          </div>
          <div className="md:col-span-8">
            <p style={{ fontSize: "var(--t-md)", textWrap: "pretty" }}>{gsoc.summary}</p>
            <ul className="mt-5 space-y-3">
              {gsoc.detail.map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    className="mono figures shrink-0"
                    style={{ color: "var(--accent)", fontSize: "var(--t-2xs)", paddingTop: "0.35em" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ textWrap: "pretty", color: "var(--ink-muted)" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── § 02 Selected work ──────────────────────────────────────────── */}
      <section className="mt-20" id="work">
        <SectionHead
          no="§ 02"
          title="Selected work"
          aside={`${featured.length} of ${projects.length}`}
        />
        <div className="pt-2">
          {featured.map((project) => (
            <ProjectEntry key={project.slug} project={project} />
          ))}
          <hr className="rule-thin" />
        </div>
        <div className="flex justify-end pt-4">
          <Link href="/work" className="mono link-underline" style={{ fontSize: "var(--t-xs)" }}>
            The full catalogue — all {projects.length} entries →
          </Link>
        </div>
      </section>

      {/* ── § 03 Telemetry ──────────────────────────────────────────────── */}
      <Suspense
        fallback={
          <section className="mt-20">
            <SectionHead no="§ 03" title="Telemetry" aside="reading…" />
            <div
              className="mt-7 animate-pulse"
              style={{ height: 96, backgroundColor: "var(--paper-sunk)" }}
            />
          </section>
        }
      >
        <TelemetrySection user={profile.githubUser} />
      </Suspense>

      {/* ── § 04 Recognition ────────────────────────────────────────────── */}
      <section className="mt-20" id="recognition">
        <SectionHead no="§ 04" title="Recognition" aside={`${awards.length} entries`} />
        <ul className="pt-2">
          {awards.map((award) => (
            <li key={award.title}>
              <hr className="rule-thin" />
              <div className="grid gap-x-8 gap-y-1 py-4 md:grid-cols-12">
                <div className="md:col-span-3">
                  <Label>{award.date}</Label>
                </div>
                <div className="md:col-span-5">
                  <h3 className="serif-head" style={{ fontSize: "var(--t-md)" }}>
                    {award.title}
                  </h3>
                  <p className="mt-1" style={{ color: "var(--ink-muted)", fontSize: "var(--t-sm)" }}>
                    {award.detail}
                  </p>
                </div>
                <div className="md:col-span-4 md:text-right">
                  <span className="mono" style={{ fontSize: "var(--t-xs)" }}>
                    {award.org}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <hr className="rule-thin" />
      </section>

      {/* ── § 05 Correspondence ─────────────────────────────────────────── */}
      <section className="mt-20" id="contact">
        <SectionHead no="§ 05" title="Correspondence" aside="replies within a day or two" />
        <div className="grid gap-x-10 gap-y-8 pt-7 md:grid-cols-12">
          <div className="md:col-span-4">
            <p style={{ textWrap: "pretty" }}>
              If you are hiring for systems, ML or infrastructure work — or you have
              read something here you want to argue with — this goes straight to my
              inbox.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <RegistrationMark />
              <Label>Warangal · Hyderabad · Remote</Label>
            </div>
          </div>
          <div className="md:col-span-8">
            <ContactForm email={profile.email} />
          </div>
        </div>
      </section>
    </Shell>
  );
}
