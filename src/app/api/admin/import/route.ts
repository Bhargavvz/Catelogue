import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminDb, verifyOwner } from "@/lib/firebase/admin";
import { serverError } from "@/lib/api";
import { seed } from "@/content/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Bootstraps Firestore from the printed edition.
 *
 * Overwrites documents that share a slug, and leaves anything else alone — so
 * running it twice is safe, and running it after edits only resets what shipped
 * in the code.
 */
export async function POST(request: Request) {
  const auth = await verifyOwner(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const db = adminDb()!;
  const batch = db.batch();

  for (const project of seed.projects) {
    batch.set(db.collection("projects").doc(project.slug), project);
  }
  for (const entry of seed.experience) {
    batch.set(db.collection("experience").doc(entry.slug), entry);
  }
  batch.set(db.collection("profile").doc("main"), seed.profile);

  try {
    await batch.commit();
  } catch (error) {
    return serverError("Importing the catalogue", error);
  }

  revalidatePath("/");
  revalidatePath("/work");
  for (const project of seed.projects) revalidatePath(`/work/${project.slug}`);

  return NextResponse.json({
    ok: true,
    projects: seed.projects.length,
    experience: seed.experience.length,
  });
}
