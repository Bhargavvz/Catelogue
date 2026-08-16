import { NextResponse } from "next/server";
import { adminDb, verifyOwner } from "@/lib/firebase/admin";
import { serverError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await verifyOwner(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const snapshot = await adminDb()!
      .collection("messages")
      .orderBy("at", "desc")
      .limit(100)
      .get();

    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name ?? "",
        email: data.email ?? "",
        subject: data.subject ?? "",
        body: data.body ?? "",
        read: Boolean(data.read),
        at: data.at?.toDate?.()?.toISOString() ?? null,
      };
    });

    return NextResponse.json({
      messages,
      unread: messages.filter((m) => !m.read).length,
    });
  } catch (error) {
    return serverError("Reading messages", error);
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyOwner(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id, read } = (await request.json()) as { id?: string; read?: boolean };
    if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    await adminDb()!.collection("messages").doc(id).set({ read: Boolean(read) }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError("Updating a message", error);
  }
}

export async function DELETE(request: Request) {
  const auth = await verifyOwner(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    await adminDb()!.collection("messages").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError("Deleting a message", error);
  }
}
