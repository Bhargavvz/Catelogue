"use client";

import { useState, type FormEvent } from "react";

type State = "idle" | "sending" | "sent" | "error";

const FIELD =
  "w-full border-0 border-b bg-transparent pb-1.5 pt-1 outline-none transition-colors focus:border-[var(--accent)]";

/** Set like a form on a printed page: ruled lines, no boxes, no rounded corners. */
export function ContactForm({ email }: { email: string }) {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          subject: String(data.get("subject") ?? ""),
          body: String(data.get("body") ?? ""),
          // Honeypot: a real person never fills this in, it is off-screen.
          company: String(data.get("company") ?? ""),
        }),
      });

      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not send.");

      form.reset();
      setState("sent");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div
        className="border-l-2 py-2 pl-5"
        style={{ borderColor: "var(--accent)" }}
      >
        <p className="display" style={{ fontSize: "var(--t-lg)" }}>
          Filed.
        </p>
        <p className="mt-1" style={{ color: "var(--ink-muted)", fontSize: "var(--t-sm)" }}>
          It landed in the inbox. I&rsquo;ll reply from{" "}
          <span className="mono">{email}</span>.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="label mt-4 hover:text-[var(--accent)]"
          style={{ textDecoration: "underline", textUnderlineOffset: "0.3em" }}
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="label">Name</span>
        <input name="name" required maxLength={120} className={FIELD} autoComplete="name" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="label">Email</span>
        <input
          name="email"
          type="email"
          required
          maxLength={200}
          className={FIELD}
          autoComplete="email"
        />
      </label>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="label">Subject</span>
        <input name="subject" maxLength={160} className={FIELD} />
      </label>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="label">Message</span>
        <textarea
          name="body"
          required
          rows={4}
          maxLength={4000}
          className={`${FIELD} resize-y`}
        />
      </label>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex items-center gap-5 sm:col-span-2">
        <button
          type="submit"
          disabled={state === "sending"}
          className="mono border px-5 py-2 transition-colors disabled:opacity-50"
          style={{
            borderColor: "var(--ink)",
            fontSize: "var(--t-2xs)",
            letterSpacing: "0.16em",
            backgroundColor: "var(--ink)",
            color: "var(--paper)",
          }}
        >
          {state === "sending" ? "SENDING…" : "SEND"}
        </button>

        {state === "error" ? (
          <span style={{ color: "var(--accent)", fontSize: "var(--t-sm)" }}>{message}</span>
        ) : (
          <span style={{ color: "var(--ink-faint)", fontSize: "var(--t-xs)" }}>
            Or just email{" "}
            <a href={`mailto:${email}`} className="link-underline">
              {email}
            </a>
            .
          </span>
        )}
      </div>
    </form>
  );
}
