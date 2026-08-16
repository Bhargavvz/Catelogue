import { NextResponse } from "next/server";
import { adminDb, verifyOwner } from "@/lib/firebase/admin";
import { serverError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Reading statistics.
 *
 * The question worth answering is not "how many hits" — it is which entries get
 * opened and whether anyone reaches the bottom of them. So depth and dwell are
 * aggregated per path alongside the raw counts.
 */
export async function GET(request: Request) {
  const auth = await verifyOwner(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    return await collect();
  } catch (error) {
    return serverError("Reading reader statistics", error);
  }
}

async function collect() {
  const db = adminDb()!;
  const [viewsSnap, eventsSnap] = await Promise.all([
    db.collection("views").orderBy("count", "desc").limit(50).get(),
    db.collection("events").orderBy("at", "desc").limit(1000).get(),
  ]);

  const views = viewsSnap.docs.map((doc) => ({
    path: (doc.data().path as string) ?? doc.id,
    count: (doc.data().count as number) ?? 0,
    lastSeen: doc.data().lastSeen?.toDate?.()?.toISOString() ?? null,
  }));

  const depthByPath = new Map<string, { total: number; n: number; dwell: number }>();
  const referrers = new Map<string, number>();
  let totalEvents = 0;

  for (const doc of eventsSnap.docs) {
    const data = doc.data();
    totalEvents += 1;

    if (data.type === "depth" && typeof data.depth === "number") {
      const path = (data.path as string) ?? "/";
      const entry = depthByPath.get(path) ?? { total: 0, n: 0, dwell: 0 };
      entry.total += data.depth;
      entry.dwell += typeof data.dwellMs === "number" ? data.dwellMs : 0;
      entry.n += 1;
      depthByPath.set(path, entry);
    }

    if (data.type === "view" && typeof data.referrer === "string" && data.referrer) {
      try {
        const host = new URL(data.referrer).hostname.replace(/^www\./, "");
        referrers.set(host, (referrers.get(host) ?? 0) + 1);
      } catch {
        /* not a URL we can parse */
      }
    }
  }

  const engagement = [...depthByPath.entries()]
    .map(([path, e]) => ({
      path,
      avgDepth: Math.round(e.total / e.n),
      avgDwellSec: Math.round(e.dwell / e.n / 1000),
      samples: e.n,
    }))
    .sort((a, b) => b.samples - a.samples)
    .slice(0, 20);

  return NextResponse.json({
    views,
    engagement,
    referrers: [...referrers.entries()]
      .map(([host, count]) => ({ host, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12),
    totalViews: views.reduce((sum, v) => sum + v.count, 0),
    sampledEvents: totalEvents,
  });
}
