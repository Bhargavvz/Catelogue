import "server-only";

import { cache } from "react";
import { adminDb } from "@/lib/firebase/admin";
import { seed } from "@/content/seed";
import type { Project, Experience, SiteContent } from "@/lib/types";

/**
 * Content access.
 *
 * Firestore is the editable source; `seed.ts` is the printed edition that ships
 * with the code. If Firestore has documents they win, collection by collection —
 * so you can move `projects` into the CMS without also having to move `awards`.
 */

const COLLECTIONS = {
  projects: "projects",
  experience: "experience",
  profile: "profile",
} as const;

async function readCollection<T>(name: string): Promise<T[] | null> {
  const db = adminDb();
  if (!db) return null;
  try {
    const snapshot = await db.collection(name).get();
    if (snapshot.empty) return null;
    return snapshot.docs.map((doc) => doc.data() as T);
  } catch (error) {
    console.warn(`[content] falling back to seed for "${name}":`, error);
    return null;
  }
}

export const getContent = cache(async (): Promise<SiteContent> => {
  const [projects, experience] = await Promise.all([
    readCollection<Project>(COLLECTIONS.projects),
    readCollection<Experience>(COLLECTIONS.experience),
  ]);

  let profile = seed.profile;
  const db = adminDb();
  if (db) {
    try {
      const doc = await db.collection(COLLECTIONS.profile).doc("main").get();
      if (doc.exists) profile = { ...seed.profile, ...doc.data() };
    } catch {
      /* keep the seed profile */
    }
  }

  return {
    profile,
    projects: (projects ?? seed.projects).slice().sort((a, b) => a.no - b.no),
    experience: experience ?? seed.experience,
    awards: seed.awards,
    credentials: seed.credentials,
    education: seed.education,
    skills: seed.skills,
  };
});

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  const { projects } = await getContent();
  return projects.find((p) => p.slug === slug) ?? null;
});

export const getFeatured = cache(async (): Promise<Project[]> => {
  const { projects } = await getContent();
  return projects.filter((p) => p.featured);
});

/** True when the CMS is live, used to decide whether /admin is worth showing. */
export function contentIsEditable(): boolean {
  return adminDb() !== null;
}
