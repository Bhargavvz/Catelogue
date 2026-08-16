import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const KINDS = ["notable", "engineering", "contact"] as const;
type Kind = (typeof KINDS)[number];

function cleanSlug(value: string | null): string | null {
  if (!value || value.length > 80) return null;
  return /^[a-z0-9-]+$/.test(value) ? value : null;
}

function emptyCounts() {
  return Object.fromEntries(KINDS.map((k) => [k, 0])) as Record<Kind, number>;
}

export async function GET(request: Request) {
  const slug = cleanSlug(new URL(request.url).searchParams.get("slug"));
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  const db = adminDb();
  if (!db) return NextResponse.json({ ok: true, counts: emptyCounts(), views: 0, live: false });

  try {
    const [reactions, views] = await Promise.all([
      db.collection("reactions").doc(slug).get(),
      db.collection("views").doc(`work__${slug}`).get(),
    ]);

    const data = (reactions.data() ?? {}) as Partial<Record<Kind, number>>;
    return NextResponse.json({
      ok: true,
      live: true,
      counts: Object.fromEntries(KINDS.map((k) => [k, data[k] ?? 0])),
      views: (views.data()?.count as number | undefined) ?? 0,
    });
  } catch {
    return NextResponse.json({ ok: true, counts: emptyCounts(), views: 0, live: false });
  }
}

export async function POST(request: Request) {
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Not configured." }, { status: 503 });

  let payload: { slug?: string; kind?: string; delta?: number };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const slug = cleanSlug(payload.slug ?? null);
  const kind = payload.kind as Kind;
  const delta = payload.delta === -1 ? -1 : 1;

  if (!slug || !KINDS.includes(kind)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ref = db.collection("reactions").doc(slug);
  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const current = ((snap.data()?.[kind] as number | undefined) ?? 0) + delta;
      // Clamp, so a replayed "-1" can never drive a counter negative.
      tx.set(ref, { [kind]: Math.max(0, current), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    });

    const fresh = await ref.get();
    const data = (fresh.data() ?? {}) as Partial<Record<Kind, number>>;
    return NextResponse.json({
      ok: true,
      counts: Object.fromEntries(KINDS.map((k) => [k, data[k] ?? 0])),
    });
  } catch (error) {
    console.warn("[reactions] write failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
