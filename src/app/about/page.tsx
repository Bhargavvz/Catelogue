import type { Metadata } from "next";
import Link from "next/link";

import { getContent } from "@/lib/content";
import { Shell, Label, SectionHead, Marginalia } from "@/components/press/primitives";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description:
    "Systems and machine learning engineer, GSoC 2025 at VideoLAN, finishing a B.Tech at CMRCET. What I work on and what I am looking for.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const { profile, education, credentials, skills, awards } = await getContent();

  return (
    <Shell as="div">
      <header className="pt-8 sm:pt-14">
        <div
          className="mono flex items-center justify-between pb-2"
          style={{ fontSize: "var(--t-2xs)", letterSpacing: "0.18em", color: "var(--ink-faint)" }}
        >
          <span>ABOUT</span>
          <span>{profile.location.toUpperCase()}</span>
        </div>
        <hr className="rule-double" />

        <h1 className="display pt-8" style={{ fontSize: "var(--t-2xl)", maxWidth: "16ch" }}>
          A short account
          <span style={{ color: "var(--accent)" }}>.</span>
        </h1>
      </header>

      {/* The essay. Marginalia sits in the true margin above 1100px. */}
      <div className="pt-12">
        <div className="prose-column" style={{ maxWidth: "36rem" }}>
          <p className="dropcap no-indent" style={{ fontSize: "var(--t-md)" }}>
            I am a final-year Computer Science student at CMR College of Engineering
            &amp; Technology in Hyderabad, graduating in 2026. That is the shortest
            true sentence about me, and also the least interesting one, so here is
            the rest.
          </p>

          <h2 className="serif-head mt-12 mb-3" style={{ fontSize: "var(--t-lg)" }}>
            The summer that changed the shape of things
          </h2>

          <p className="no-indent">
            In 2025 I was selected as a Google Summer of Code contributor with
            VideoLAN — the organisation behind VLC — to build an AI-powered media
            recommendation engine. For five months I worked inside a C/C++ and
            Qt/QML codebase that is older than my degree, alongside a distributed
            mentor team, in a review culture where nothing lands because you say it
            works.
          </p>

          <Marginalia>
            Before VideoLAN, most of my code had exactly one reader. Upstream review
            is a different discipline: you are not defending a design, you are
            explaining it well enough that a stranger can disagree with it precisely.
          </Marginalia>

          <p>
            That project rearranged how I think about software. Writing a model that
            scores well in a notebook is one problem. Making it live inside an
            application that millions of people already have installed — without
            regressing startup time, without breaking a platform you cannot test on,
            without asking users to care that it exists — is a different one, and it
            is the one I got interested in.
          </p>

          <h2 className="serif-head mt-12 mb-3" style={{ fontSize: "var(--t-lg)" }}>
            What I actually work on
          </h2>

          <p className="no-indent">
            Two threads, and they keep converging. The first is machine learning with
            consequences attached: a waterborne-disease model trained on 5.25 million
            calibrated records; a medical vision-language model fine-tuned with LoRA
            that shows you its own attention map before you trust it; a blood-group
            classifier built on EfficientNet-B3 with attention, because the cheap
            version of that test is a real problem worth solving.
          </p>

          <p>
            The second is the unglamorous work that decides whether any of it
            survives: the Flask API in front of the model, the PostgreSQL query that
            was doing a sequential scan, the Docker image, the Nginx config, the CI
            gate. I am not a researcher who throws artefacts over a wall. Every model
            in the catalogue is behind an interface somebody can use.
          </p>

          <Marginalia>
            I am equally happy being told a number is wrong. Every figure on this site
            is reproducible from the linked repository — if one of them does not hold
            up, I would rather hear it than not.
          </Marginalia>

          <p>
            Three hackathons taught me the other half: 2nd Runner-Up at HackByte, an
            Honorable Mention in the SDG 11 track at IIT Hyderabad&rsquo;s Hack4SDG
            among more than two hundred projects, and a finalist place at a 36-hour
            Specathon. Building under a clock with people you met that morning is an
            unreasonably good way to learn what parts of your process are real.
          </p>

          <h2 className="serif-head mt-12 mb-3" style={{ fontSize: "var(--t-lg)" }}>
            What I am looking for
          </h2>

          <p className="no-indent">
            Full-time systems, machine learning, or infrastructure engineering from
            2026 — ideally somewhere the model and the thing serving the model are
            the same person&rsquo;s problem. I like being close to production. I like
            being told the measurement is wrong.
          </p>

          <p>
            If that sounds like something you are hiring for, the{" "}
            <Link href="/#contact" className="link-underline">
              form on the front page
            </Link>{" "}
            reaches me directly, or{" "}
            <a href={`mailto:${profile.email}`} className="link-underline">
              {profile.email}
            </a>{" "}
            works just as well.
          </p>
        </div>
      </div>

      {/* ── Tools ───────────────────────────────────────────────────────── */}
      <section className="mt-20">
        <SectionHead no="§ A" title="Tools" aside="in rough order of hours spent" />
        <div className="grid gap-x-10 gap-y-9 pt-7 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group) => (
            <div key={group.group}>
              <h3 className="serif-head" style={{ fontSize: "var(--t-md)" }}>
                {group.group}
              </h3>
              <p
                className="mt-1"
                style={{ fontSize: "var(--t-xs)", fontStyle: "italic", color: "var(--ink-faint)" }}
              >
                {group.note}
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="mono"
                    style={{ fontSize: "var(--t-2xs)", color: "var(--ink-muted)" }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Record ──────────────────────────────────────────────────────── */}
      <section className="mt-20">
        <SectionHead no="§ B" title="Record" aside="education & credentials" />
        <div className="grid gap-x-10 gap-y-9 pt-7 md:grid-cols-12">
          <div className="md:col-span-7">
            <Label>Education</Label>
            {education.map((entry) => (
              <div key={entry.school} className="mt-3">
                <h3 className="serif-head" style={{ fontSize: "var(--t-md)" }}>
                  {entry.school}
                </h3>
                <p style={{ color: "var(--ink-muted)" }}>{entry.qualification}</p>
                <p className="mono mt-1" style={{ fontSize: "var(--t-xs)", color: "var(--ink-faint)" }}>
                  {entry.period} · {entry.result}
                </p>
              </div>
            ))}

            <Label className="mt-9 block">Recognition</Label>
            <ul className="mt-3 space-y-2">
              {awards.map((award) => (
                <li key={award.title} className="flex flex-wrap items-baseline gap-x-3">
                  <span style={{ fontSize: "var(--t-sm)" }}>{award.title}</span>
                  <span
                    className="mono"
                    style={{ fontSize: "var(--t-2xs)", color: "var(--ink-faint)" }}
                  >
                    {award.org} · {award.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-5">
            <Label>Certifications</Label>
            <ul className="mt-3 divide-y" style={{ borderColor: "var(--rule)" }}>
              {credentials.map((credential) => (
                <li key={credential.title} className="py-2">
                  <p style={{ fontSize: "var(--t-sm)" }}>{credential.title}</p>
                  <p
                    className="mono"
                    style={{ fontSize: "var(--t-2xs)", color: "var(--ink-faint)" }}
                  >
                    {credential.issuer}
                    {credential.id ? ` · ${credential.id}` : ""}
                  </p>
                </li>
              ))}
            </ul>

            <a
              href={profile.resumeUrl}
              className="mono mt-7 inline-block border px-4 py-2 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
              style={{
                borderColor: "var(--ink)",
                fontSize: "var(--t-2xs)",
                letterSpacing: "0.16em",
              }}
            >
              DOWNLOAD RÉSUMÉ (PDF) ↓
            </a>
          </div>
        </div>
      </section>
    </Shell>
  );
}
