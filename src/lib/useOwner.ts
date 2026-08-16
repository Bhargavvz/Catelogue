"use client";

import { useCallback, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { clientAuth, firebaseConfigured } from "@/lib/firebase/client";

/**
 * Owner session for the back office.
 *
 * The ID token is fetched per request rather than held — it expires hourly, and
 * `getIdToken()` refreshes transparently, so there is nothing to keep in state.
 */
export function useOwner() {
  const [user, setUser] = useState<User | null>(null);
  // Nothing to wait for when Firebase was never configured.
  const [loading, setLoading] = useState(firebaseConfigured);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = clientAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = clientAuth();
    if (!auth) {
      setError("Firebase isn't configured in this environment.");
      return false;
    }
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(
        code.includes("invalid-credential") || code.includes("wrong-password")
          ? "Those credentials don't match."
          : code.includes("too-many-requests")
            ? "Too many attempts. Wait a minute."
            : "Sign-in failed.",
      );
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = clientAuth();
    if (auth) await fbSignOut(auth);
  }, []);

  /** Authenticated fetch. Every admin call goes through here. */
  const call = useCallback(
    async <T,>(input: string, init: RequestInit = {}): Promise<T> => {
      const auth = clientAuth();
      const current = auth?.currentUser;
      if (!current) throw new Error("Not signed in.");

      const token = await current.getIdToken();
      const res = await fetch(input, {
        ...init,
        headers: {
          ...(init.headers ?? {}),
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
      return json as T;
    },
    [],
  );

  return { user, loading, error, signIn, signOut, call, configured: firebaseConfigured };
}
