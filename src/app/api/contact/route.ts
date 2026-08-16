import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Message = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(200),
  subject: z.string().trim().max(160).optional().default(""),
  body: z.string().trim().min(10).max(4000),
  company: z.string().max(200).optional().default(""),
});

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Rate limit in Firestore rather than memory — serverless instances are
 * recycled constantly, so an in-process counter protects nothing.
 */
async function overLimit(ip: string): Promise<boolean> {
  const db = adminDb();
  if (!db) return false;

  const ref = db.collection("ratelimits").doc(ip.replace(/[^\w.:-]/g, "_"));
  try {
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const now = Date.now();
      const data = snap.data() as { count?: number; windowStart?: number } | undefined;

      if (!data || now - (data.windowStart ?? 0) > WINDOW_MS) {
        tx.set(ref, { count: 1, windowStart: now });
        return false;
      }
      if ((data.count ?? 0) >= MAX_PER_WINDOW) return true;

      tx.set(ref, { count: (data.count ?? 0) + 1, windowStart: data.windowStart }, { merge: true });
      return false;
    });
  } catch {
    return false;
  }
}

/** Optional. Absent key means the message still lands in the inbox, just quietly. */
async function notify(message: z.infer<typeof Message>) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !to || !from) return;

  try {
    const { Resend } = await import("resend");
    await new Resend(key).emails.send({
      from,
      to,
      replyTo: message.email,
      subject: message.subject
        ? `Portfolio — ${message.subject}`
        : `Portfolio — message from ${message.name}`,
      text: `${message.name} <${message.email}>\n\n${message.body}`,
    });
  } catch (error) {
    console.warn("[contact] notification failed:", error);
  }
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = Message.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the fields and try again." },
      { status: 400 },
    );
  }
  const message = parsed.data;

  // Honeypot. Report success so a bot has nothing to learn from the response.
  if (message.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const db = adminDb();
  if (!db) {
    return NextResponse.json(
      {
        ok: false,
        error: "The inbox isn't connected yet — please email me directly.",
      },
      { status: 503 },
    );
  }

  const ip = clientIp(request);
  if (await overLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "That's several messages in an hour. Try again later." },
      { status: 429 },
    );
  }

  try {
    await db.collection("messages").add({
      name: message.name,
      email: message.email,
      subject: message.subject,
      body: message.body,
      read: false,
      ip,
      userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
      at: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.warn("[contact] write failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not file the message. Please email me directly." },
      { status: 500 },
    );
  }

  await notify(message);
  return NextResponse.json({ ok: true });
}
