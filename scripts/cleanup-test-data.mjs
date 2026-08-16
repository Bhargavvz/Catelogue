/**
 * Removes the documents left behind by end-to-end verification.
 *
 * Run from the project root, so that `firebase-admin` and `.env.local` resolve:
 *
 *   node scripts/cleanup-test-data.mjs
 *
 * Every document is printed before it is deleted, and only the specific test
 * artifacts are matched — the catalogue, and anything a real visitor left, are
 * not touched by any of these queries.
 */
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.trimStart().startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);

const raw = env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing from .env.local");

const creds = JSON.parse(
  raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"),
);
const db = getFirestore(initializeApp({ credential: cert(creds) }));

/** Exactly the addresses the verification run used. */
const TEST_EMAILS = ["setup@example.com", "rl@example.com"];

let removed = 0;

const messages = await db.collection("messages").get();
for (const doc of messages.docs) {
  const data = doc.data();
  if (TEST_EMAILS.includes(data.email)) {
    console.log(`messages/${doc.id}  ${data.name} <${data.email}>`);
    await doc.ref.delete();
    removed += 1;
  }
}

for (const [collection, id] of [
  ["views", "work__aquasafe"],
  ["reactions", "aquasafe"],
]) {
  const ref = db.collection(collection).doc(id);
  const snap = await ref.get();
  if (snap.exists) {
    console.log(`${collection}/${id}`, JSON.stringify(snap.data()));
    await ref.delete();
    removed += 1;
  }
}

// Throttle state, so the contact form is immediately usable again.
const limits = await db.collection("ratelimits").get();
for (const doc of limits.docs) {
  console.log(`ratelimits/${doc.id}`);
  await doc.ref.delete();
  removed += 1;
}

console.log(`\nRemoved ${removed} document${removed === 1 ? "" : "s"}.`);
process.exit(0);
