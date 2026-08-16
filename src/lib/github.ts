import "server-only";

import { cache } from "react";
import type { Telemetry } from "@/lib/types";

/**
 * Live numbers from GitHub.
 *
 * Two paths. With a token we ask GraphQL for the real contribution calendar —
 * a full year, exact counts. Without one we fall back to the public events feed,
 * which only reaches back about ninety days, and we mark the result `degraded`
 * so the page can say so rather than quietly showing a shorter year.
 */

const USER = process.env.NEXT_PUBLIC_GITHUB_USER ?? "bhargavvz";
const TOKEN = process.env.GITHUB_TOKEN;
const REVALIDATE = 21_600; // six hours — well inside the unauthenticated rate limit

const EMPTY: Telemetry = {
  repos: 0,
  stars: 0,
  followers: 0,
  languages: [],
  activity: [],
  topRepos: [],
  fetchedAt: new Date(0).toISOString(),
  degraded: true,
};

type Repo = {
  name: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  pushed_at: string;
};

async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "bhargav-portfolio",
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) {
      console.warn(`[github] ${path} → ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`[github] ${path} failed:`, error);
    return null;
  }
}

/** Real contribution calendar. Requires any classic or fine-grained token. */
async function contributionWeeks(): Promise<number[] | null> {
  if (!TOKEN) return null;
  const query = `query($login:String!){
    user(login:$login){
      contributionsCollection{
        contributionCalendar{
          weeks{ contributionDays{ contributionCount } }
        }
      }
    }
  }`;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "bhargav-portfolio",
      },
      body: JSON.stringify({ query, variables: { login: USER } }),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: {
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              weeks?: { contributionDays: { contributionCount: number }[] }[];
            };
          };
        };
      };
    };

    const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (!weeks?.length) return null;
    return weeks.map((w) =>
      w.contributionDays.reduce((sum, d) => sum + d.contributionCount, 0),
    );
  } catch {
    return null;
  }
}

/** Fallback: bucket the public events feed into weeks. Shallow, but honest. */
async function eventWeeks(): Promise<number[]> {
  const events = await gh<{ created_at: string; type: string }[]>(
    `/users/${USER}/events/public?per_page=100`,
  );
  const weeks = new Array(13).fill(0) as number[];
  if (!events) return weeks;

  const now = Date.now();
  for (const event of events) {
    const age = now - new Date(event.created_at).getTime();
    const index = 12 - Math.floor(age / (7 * 24 * 3600 * 1000));
    if (index >= 0 && index < weeks.length) weeks[index] += 1;
  }
  return weeks;
}

export const getTelemetry = cache(async (): Promise<Telemetry> => {
  const [user, page1, page2] = await Promise.all([
    gh<{ public_repos: number; followers: number }>(`/users/${USER}`),
    gh<Repo[]>(`/users/${USER}/repos?per_page=100&sort=pushed`),
    gh<Repo[]>(`/users/${USER}/repos?per_page=100&sort=pushed&page=2`),
  ]);

  if (!user && !page1) return EMPTY;

  const repos = [...(page1 ?? []), ...(page2 ?? [])];
  const own = repos.filter((r) => !r.fork);

  // Primary language per repository — not bytes. Cheaper, and stated as such.
  const byLanguage = new Map<string, number>();
  for (const repo of own) {
    if (!repo.language) continue;
    byLanguage.set(repo.language, (byLanguage.get(repo.language) ?? 0) + 1);
  }
  const languages = [...byLanguage.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const calendar = await contributionWeeks();
  const activity = calendar ?? (await eventWeeks());

  return {
    repos: user?.public_repos ?? own.length,
    stars: own.reduce((sum, r) => sum + r.stargazers_count, 0),
    followers: user?.followers ?? 0,
    languages,
    activity,
    topRepos: own
      .slice()
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((r) => ({ name: r.name, stars: r.stargazers_count, language: r.language })),
    fetchedAt: new Date().toISOString(),
    degraded: calendar === null,
  };
});
