import Link from "next/link";
import type { Profile } from "@/lib/types";
import { Shell, Label, RegistrationMark } from "./primitives";

/**
 * A colophon, in the original sense: what the thing is set in and how it was
 * made. Books have carried these for five hundred years; websites dropped them
 * somewhere around the time footers became link farms.
 */
export function Colophon({ profile }: { profile: Profile }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-24 pb-14" style={{ backgroundColor: "var(--paper)" }}>
      <Shell>
        <hr className="rule-double" />

        <div className="grid gap-10 pt-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2
              className="display"
              style={{ fontSize: "var(--t-xl)", lineHeight: 0.95 }}
            >
              Say something
              <span style={{ color: "var(--accent)" }}>.</span>
            </h2>
            <p
              className="mt-3 max-w-xs"
              style={{ color: "var(--ink-muted)", fontSize: "var(--t-sm)" }}
            >
              Open to systems, ML and infrastructure roles from 2026. I answer
              everything that isn&rsquo;t a recruiter template.
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="link-underline mt-4 inline-block"
              style={{ fontSize: "var(--t-md)" }}
            >
              {profile.email}
            </a>
          </div>

          <nav className="md:col-span-3">
            <Label>Elsewhere</Label>
            <ul className="mt-3 space-y-1.5" style={{ fontSize: "var(--t-sm)" }}>
              <li>
                <a href={profile.github} className="link-underline" rel="me noreferrer" target="_blank">
                  GitHub
                </a>
              </li>
              <li>
                <a href={profile.linkedin} className="link-underline" rel="me noreferrer" target="_blank">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={profile.resumeUrl} className="link-underline">
                  Résumé (PDF)
                </a>
              </li>
              <li>
                <Link href="/work" className="link-underline">
                  Full catalogue
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-4">
            <Label>Colophon</Label>
            <p
              className="mt-3"
              style={{ color: "var(--ink-muted)", fontSize: "var(--t-sm)" }}
            >
              Set in <em>Instrument Serif</em> for display, <em>Newsreader</em> for
              running text, and <em>IBM Plex Mono</em> for anything that has to line
              up in a column. Built with Next.js and Firebase; the figures are drawn
              from live data, not decoration.
            </p>
          </div>
        </div>

        <hr className="rule-thin mt-10" />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <Label>
            © {year} {profile.name} · {profile.location}
          </Label>
          <div className="flex items-center gap-3">
            <Label>Set and printed in Hyderabad</Label>
            <RegistrationMark />
          </div>
        </div>
      </Shell>
    </footer>
  );
}
