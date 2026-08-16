"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight, cookieless page instrumentation.
 *
 * Records a view per path and the deepest scroll reached before leaving. No
 * identifiers, no cookies, no third party — it exists so the admin dashboard can
 * answer "which projects do people actually open, and do they read them".
 */
export function PageViews() {
  const pathname = usePathname();
  const depth = useRef(0);
  // Set in the effect, not at render — the clock is not a pure value.
  const enteredAt = useRef(0);

  useEffect(() => {
    depth.current = 0;
    enteredAt.current = Date.now();

    // Views are fire-and-forget; a failure here must never surface to a reader.
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "view",
        path: pathname,
        referrer: document.referrer || null,
        width: window.innerWidth,
      }),
      keepalive: true,
    }).catch(() => {});

    function onScroll() {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = Math.round((window.scrollY / scrollable) * 100);
      if (pct > depth.current) depth.current = Math.min(100, pct);
    }

    function flush() {
      if (document.visibilityState !== "hidden") return;
      const payload = JSON.stringify({
        type: "depth",
        path: pathname,
        depth: depth.current,
        dwellMs: Date.now() - enteredAt.current,
      });
      // sendBeacon survives the page going away; fetch often does not.
      navigator.sendBeacon?.("/api/track", new Blob([payload], { type: "application/json" }));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", flush);
      flush();
    };
  }, [pathname]);

  return null;
}
