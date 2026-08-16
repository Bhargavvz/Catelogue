import { getTelemetry } from "@/lib/github";
import { SectionHead, Label, Datum } from "./primitives";
import { SeriesPlot } from "@/components/charts/SeriesPlot";
import { LanguageBars } from "@/components/charts/LanguageBars";

/**
 * The instrumented half of the page. Everything here is read from the GitHub
 * API at build/revalidate time — if it is wrong, it is wrong because the API
 * said so, which is the only kind of wrong worth having on a portfolio.
 */
export async function TelemetrySection({ user }: { user: string }) {
  const t = await getTelemetry();

  if (!t.repos && !t.activity.some(Boolean)) {
    return (
      <section className="mt-20">
        <SectionHead no="§ 03" title="Telemetry" aside="github · unavailable" />
        <p className="mt-4" style={{ color: "var(--ink-muted)", fontSize: "var(--t-sm)" }}>
          The GitHub API did not answer for this build. Rather than print a
          plausible-looking chart, this space is left blank.
        </p>
      </section>
    );
  }

  const fetched = new Date(t.fetchedAt);
  const stamp = fetched.toISOString().slice(0, 16).replace("T", " ");
  const window = t.degraded ? "~90 days" : "52 weeks";

  return (
    <section className="mt-20">
      <SectionHead no="§ 03" title="Telemetry" aside={`read ${stamp} UTC`} />

      <div className="grid gap-x-10 gap-y-10 pt-7 md:grid-cols-12">
        <div className="md:col-span-8">
          <SeriesPlot
            series={[
              {
                label: t.degraded ? "Public events per week" : "Contributions per week",
                values: t.activity,
              },
            ]}
            ticks={t.degraded ? ["13 weeks ago", "now"] : ["1 year ago", "now"]}
          />
          <p
            className="mt-3"
            style={{ fontSize: "var(--t-xs)", color: "var(--ink-faint)" }}
          >
            {t.degraded ? (
              <>
                Drawn from the public events feed, which reaches back about ninety
                days. Set a <code className="mono">GITHUB_TOKEN</code> and this becomes
                the full contribution calendar.
              </>
            ) : (
              <>Contribution calendar for the trailing {window}, via the GitHub GraphQL API.</>
            )}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 md:col-span-4 md:grid-cols-1 md:gap-7">
          <Datum label="Public repositories" value={String(t.repos)} size="sm" />
          <Datum label="Stars received" value={String(t.stars)} size="sm" />
          <Datum label="Followers" value={String(t.followers)} size="sm" />
        </div>
      </div>

      <div className="grid gap-x-10 gap-y-8 pt-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <Label>What the repositories are written in</Label>
          <div className="mt-3">
            <LanguageBars languages={t.languages} />
          </div>
          <p
            className="mt-3"
            style={{ fontSize: "var(--t-xs)", color: "var(--ink-faint)" }}
          >
            Counted by each repository&rsquo;s primary language, not by bytes of code.
          </p>
        </div>

        <div className="md:col-span-5">
          <Label>Most-starred</Label>
          <ul className="mt-3 divide-y" style={{ borderColor: "var(--rule)" }}>
            {t.topRepos.map((repo) => (
              <li key={repo.name} className="flex items-baseline justify-between gap-4 py-1.5">
                <a
                  href={`https://github.com/${user}/${repo.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mono link-underline truncate"
                  style={{ fontSize: "var(--t-xs)" }}
                >
                  {repo.name}
                </a>
                <span
                  className="mono figures shrink-0"
                  style={{ fontSize: "var(--t-xs)", color: "var(--ink-faint)" }}
                >
                  {repo.language ?? "—"} · {repo.stars}★
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
