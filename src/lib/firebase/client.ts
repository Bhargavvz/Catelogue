import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Browser-side Firebase, initialised lazily and never at module scope — an
 * unconfigured deploy should render the site, not throw during hydration.
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | null = null;

export function clientApp(): FirebaseApp | null {
  if (!firebaseConfigured) return null;
  if (app) return app;
  try {
    app = getApps()[0] ?? initializeApp(config);
    return app;
  } catch (error) {
    console.warn("[firebase] client init failed:", error);
    return null;
  }
}

export function clientAuth(): Auth | null {
  const instance = clientApp();
  return instance ? getAuth(instance) : null;
}

export function clientDb(): Firestore | null {
  const instance = clientApp();
  return instance ? getFirestore(instance) : null;
}
