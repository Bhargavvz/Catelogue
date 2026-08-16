import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deployment diagnostics.
 *
 * Answers "why is this environment behaving differently from my laptop"
 * without exposing anything sensitive: booleans and lengths for secrets, never
 * values. Safe to leave in production and safe to paste into a chat.
 *
 *   curl https://your-domain/api/health
 */
export async function GET() {
  const started = Date.now();

  const report: Record<string, unknown> = {
    ok: true,
    node: process.version,
    vercel: {
      env: process.env.VERCEL_ENV ?? null,
      region: process.env.VERCEL_REGION ?? null,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    },
    env: {
      // Presence and shape only — never the value.
      FIREBASE_SERVICE_ACCOUNT_KEY: describe(process.env.FIREBASE_SERVICE_ACCOUNT_KEY),
      FIREBASE_PROJECT_ID: describe(process.env.FIREBASE_PROJECT_ID),
      FIREBASE_CLIENT_EMAIL: describe(process.env.FIREBASE_CLIENT_EMAIL),
      FIREBASE_PRIVATE_KEY: describe(process.env.FIREBASE_PRIVATE_KEY),
      ADMIN_UID: describe(process.env.ADMIN_UID),
      ADMIN_EMAIL: describe(process.env.ADMIN_EMAIL),
      GITHUB_TOKEN: describe(process.env.GITHUB_TOKEN),
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null,
      NEXT_PUBLIC_FIREBASE_API_KEY: describe(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    },
  };

  // Step 1 — can the package even load in this runtime? This is the check that
  // distinguishes "misconfigured" from "the module throws on import here".
  try {
    await import("firebase-admin/app");
    report.adminSdkLoads = true;
  } catch (error) {
    report.ok = false;
    report.adminSdkLoads = false;
    report.adminSdkError = message(error);
    report.elapsedMs = Date.now() - started;
    return NextResponse.json(report, { status: 500 });
  }

  // Step 2 — do the credentials produce a usable Firestore handle?
  let db: unknown = null;
  try {
    const { adminDb, isFirebaseConfigured } = await import("@/lib/firebase/admin");
    report.firebaseConfigured = isFirebaseConfigured();
    db = adminDb();
    report.firestoreHandle = db !== null;
  } catch (error) {
    report.ok = false;
    report.firebaseConfigured = false;
    report.initError = message(error);
  }

  // Step 3 — can we actually reach Firestore? This is where a wrong project,
  // a disabled API or a network egress problem shows up.
  if (db) {
    const t0 = Date.now();
    try {
      const { adminDb } = await import("@/lib/firebase/admin");
      const snap = await adminDb()!.collection("projects").limit(1).get();
      report.firestore = {
        reachable: true,
        latencyMs: Date.now() - t0,
        projectsCollectionEmpty: snap.empty,
      };
    } catch (error) {
      report.ok = false;
      report.firestore = {
        reachable: false,
        latencyMs: Date.now() - t0,
        error: message(error),
      };
    }
  }

  report.elapsedMs = Date.now() - started;
  return NextResponse.json(report, { status: report.ok ? 200 : 500 });
}

/** Shape of a secret, never its content. */
function describe(value: string | undefined) {
  if (value === undefined) return "unset";
  if (value === "") return "empty string";
  return {
    length: value.length,
    startsWith: value.trim().slice(0, 1),
    looksLikeJson: value.trim().startsWith("{"),
    hasNewlines: /[\r\n]/.test(value),
    hasSurroundingQuotes: /^["'].*["']$/.test(value.trim()),
  };
}

function message(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack?.split("\n")[1]?.trim() };
  }
  return String(error);
}
