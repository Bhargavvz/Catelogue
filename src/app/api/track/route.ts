import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Only paths this site actually serves, so the collection can't be stuffed. */
function safePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.length > 120) return null;
  if (!/^\/[\w\-/#]*$/.test(value)) return null;
  return value;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Validate before checking storage, so the endpoint answers the same way
  // whether or not Firebase happens to be configured.
  const path = safePath(payload.path);
  if (!path) return NextResponse.json({ ok: false }, { status: 400 });

  const db = adminDb();
  // Without Firebase this is a no-op, not an error — the page shouldn't care.
  if (!db) return NextResponse.json({ ok: true, stored: false });

  const key = path === "/" ? "_root" : path.slice(1).replace(/\//g, "__");

  try {
    if (payload.type === "view") {
      await db
        .collection("views")
        .doc(key)
        .set(
          {
            path,
            count: FieldValue.increment(1),
            lastSeen: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

      await db.collection("events").add({
        type: "view",
        path,
        referrer: typeof payload.referrer === "string" ? payload.referrer.slice(0, 300) : null,
        width: typeof payload.width === "number" ? Math.round(payload.width) : null,
        at: FieldValue.serverTimestamp(),
      });
    } else if (payload.type === "depth") {
      const depth = typeof payload.depth === "number" ? Math.round(payload.depth) : 0;
      const dwellMs = typeof payload.dwellMs === "number" ? Math.round(payload.dwellMs) : 0;
      // Ignore instant bounces — they say nothing about whether a page was read.
      if (dwellMs < 1500) return NextResponse.json({ ok: true, stored: false });

      await db.collection("events").add({
        type: "depth",
        path,
        depth: Math.max(0, Math.min(100, depth)),
        dwellMs: Math.min(dwellMs, 1000 * 60 * 30),
        at: FieldValue.serverTimestamp(),
      });
    }
    return NextResponse.json({ ok: true, stored: true });
  } catch (error) {
    console.warn("[track] write failed:", error);
    return NextResponse.json({ ok: true, stored: false });
  }
}
