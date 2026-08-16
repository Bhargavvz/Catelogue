import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminDb, verifyOwner } from "@/lib/firebase/admin";
import { ProjectSchema } from "@/lib/schema";
import { seed } from "@/content/seed";
import type { Project } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Published pages are cached; an edit has to knock the relevant ones over. */
function refresh(slug?: string) {
  revalidatePath("/");
  revalidatePath("/work");
  if (slug) revalidatePath(`/work/${slug}`);
}

export async function GET(request: Request) {
  const auth = await verifyOwner(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const db = adminDb()!;
  const snapshot = await db.collection("projects").get();

  if (snapshot.empty) {
    // Nothing imported yet — show the printed edition so the panel isn't blank.
    return NextResponse.json({
      projects: seed.projects,
      source: "seed",
      seedCount: seed.projects.length,
    });
  }

  const projects = snapshot.docs
    .map((doc) => doc.data() as Project)
    .sort((a, b) => a.no - b.no);

  // `seedCount` lets the panel warn when Firestore holds fewer entries than the
  // code ships with. Once this collection is non-empty it wins outright, so a
  // partial import silently truncates the public catalogue — worth flagging.
  return NextResponse.json({
    projects,
    source: "firestore",
    seedCount: seed.projects.length,
  });
}

export async function PUT(request: Request) {
  const auth = await verifyOwner(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON." }, { status: 400 });
  }

  const parsed = ProjectSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: `${first.path.join(".") || "payload"}: ${first.message}` },
      { status: 400 },
    );
  }

  const project = parsed.data;
  await adminDb()!.collection("projects").doc(project.slug).set(project);
  refresh(project.slug);

  return NextResponse.json({ ok: true, slug: project.slug });
}

export async function DELETE(request: Request) {
  const auth = await verifyOwner(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Bad slug." }, { status: 400 });
  }

  await adminDb()!.collection("projects").doc(slug).delete();
  refresh(slug);
  return NextResponse.json({ ok: true });
}
