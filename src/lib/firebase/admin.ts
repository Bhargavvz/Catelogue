import "server-only";

import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

/**
 * Server-side Firebase.
 *
 * Every accessor can return null. That is deliberate: the site has to build and
 * serve on a machine with no credentials at all — a fresh clone, a preview
 * deploy, a CI run — and fall back to the printed edition in `content/seed.ts`.
 */

let app: App | null | undefined;

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    try {
      // Accept both raw JSON and base64, since dashboards mangle newlines.
      const json = raw.trim().startsWith("{")
        ? raw
        : Buffer.from(raw, "base64").toString("utf8");
      return JSON.parse(json);
    } catch {
      console.warn("[firebase] FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON — ignoring.");
      return null;
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }
  return null;
}

function getAdminApp(): App | null {
  if (app !== undefined) return app;

  const creds = serviceAccount();
  if (!creds) {
    app = null;
    return null;
  }

  try {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert(creds),
        projectId: creds.projectId ?? creds.project_id,
      });
  } catch (error) {
    console.warn("[firebase] admin init failed:", error);
    app = null;
  }
  return app;
}

export function adminDb(): Firestore | null {
  const instance = getAdminApp();
  if (!instance) return null;
  try {
    return getFirestore(instance);
  } catch {
    return null;
  }
}

export function adminAuth(): Auth | null {
  const instance = getAdminApp();
  if (!instance) return null;
  try {
    return getAuth(instance);
  } catch {
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return getAdminApp() !== null;
}

/**
 * Verifies a caller is the site owner.
 *
 * Being on the allowlist is checked against ADMIN_UID / ADMIN_EMAIL rather than
 * "any authenticated user" — otherwise anybody who can sign up to the Firebase
 * project could edit the site.
 */
export async function verifyOwner(
  request: Request,
): Promise<{ ok: true; uid: string } | { ok: false; status: number; error: string }> {
  const auth = adminAuth();
  if (!auth) return { ok: false, status: 503, error: "Firebase is not configured." };

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return { ok: false, status: 401, error: "Missing bearer token." };

  try {
    const decoded = await auth.verifyIdToken(token, true);
    const allowedUid = process.env.ADMIN_UID?.trim();
    const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (!allowedUid && !allowedEmail) {
      return {
        ok: false,
        status: 503,
        error: "No ADMIN_UID or ADMIN_EMAIL configured — refusing to authorise anyone.",
      };
    }

    const uidMatches = allowedUid ? decoded.uid === allowedUid : false;
    const emailMatches = allowedEmail
      ? decoded.email?.toLowerCase() === allowedEmail
      : false;

    if (!uidMatches && !emailMatches) {
      return { ok: false, status: 403, error: "Not an owner account." };
    }
    return { ok: true, uid: decoded.uid };
  } catch {
    return { ok: false, status: 401, error: "Invalid or expired token." };
  }
}
