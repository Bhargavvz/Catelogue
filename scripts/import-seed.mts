/**
 * Headless import of the printed edition into Firestore.
 *
 * The same operation as the admin panel's "Import into Firestore" button, but
 * runnable from a terminal — useful after editing `seed.ts`, and immune to a
 * stale browser bundle.
 *
 *   npm run import
 *
 * Overwrites documents that share a slug and leaves anything else alone, so
 * running it repeatedly is safe.
 */
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { seed } from "../src/content/seed";

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

const db = getFirestore(
  initializeApp({
    credential: cert(
      JSON.parse(raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")),
    ),
  }),
);

const batch = db.batch();
for (const project of seed.projects) {
  batch.set(db.collection("projects").doc(project.slug), project);
}
for (const entry of seed.experience) {
  batch.set(db.collection("experience").doc(entry.slug), entry);
}
batch.set(db.collection("profile").doc("main"), seed.profile);

await batch.commit();

const check = await db.collection("projects").get();
console.log(
  `Imported ${seed.projects.length} projects, ${seed.experience.length} experience entries, 1 profile.`,
);
console.log(`Firestore now holds ${check.size} projects.`);
process.exit(0);
