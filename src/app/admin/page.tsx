"use client";

import { useCallback, useEffect, useState } from "react";
import { useOwner } from "@/lib/useOwner";
import { Shell, Label } from "@/components/press/primitives";
import type { Project } from "@/lib/types";

type Tab = "inbox" | "readers" | "catalogue";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  read: boolean;
  at: string | null;
};

type Stats = {
  views: { path: string; count: number }[];
  engagement: { path: string; avgDepth: number; avgDwellSec: number; samples: number }[];
  referrers: { host: string; count: number }[];
  totalViews: number;
  sampledEvents: number;
};

const BUTTON =
  "mono border px-4 py-2 transition-colors disabled:opacity-50 hover:bg-[var(--ink)] hover:text-[var(--paper)]";
const BUTTON_STYLE = {
  borderColor: "var(--ink)",
  fontSize: "var(--t-2xs)",
  letterSpacing: "0.14em",
} as const;

export default function BackOffice() {
  const { user, loading, error, signIn, signOut, call, configured } = useOwner();
  const [tab, setTab] = useState<Tab>("inbox");

  if (loading) {
    return (
      <Shell as="div">
        <p className="label pt-20">Checking credentials…</p>
      </Shell>
    );
  }

  if (!configured) {
    return (
      <Shell as="div">
        <div className="pt-20" style={{ maxWidth: "34rem" }}>
          <h1 className="display" style={{ fontSize: "var(--t-xl)" }}>
            Not wired up yet
          </h1>
          <p className="mt-3" style={{ color: "var(--ink-muted)" }}>
            The back office needs the <code className="mono">NEXT_PUBLIC_FIREBASE_*</code>{" "}
            variables in the environment. Until then the site runs from{" "}
            <code className="mono">src/content/seed.ts</code>, which is a perfectly
            good place for it to run from.
          </p>
        </div>
      </Shell>
    );
  }

  if (!user) return <SignIn onSubmit={signIn} error={error} />;

  return (
    <Shell as="div">
      <header className="pt-8 sm:pt-14">
        <div
          className="mono flex flex-wrap items-center justify-between gap-3 pb-2"
          style={{ fontSize: "var(--t-2xs)", letterSpacing: "0.18em", color: "var(--ink-faint)" }}
        >
          <span>BACK OFFICE</span>
          <span className="flex items-center gap-4">
            <span>{user.email}</span>
            <button onClick={signOut} className="hover:text-[var(--accent)]">
              SIGN OUT
            </button>
          </span>
        </div>
        <hr className="rule-double" />

        <nav className="flex gap-6 pt-5">
          {(["inbox", "readers", "catalogue"] as Tab[]).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="mono transition-colors"
              style={{
                fontSize: "var(--t-2xs)",
                letterSpacing: "0.14em",
                color: tab === id ? "var(--accent)" : "var(--ink-faint)",
                textDecoration: tab === id ? "underline" : "none",
                textUnderlineOffset: "0.4em",
              }}
            >
              {id.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <div className="pt-10 pb-20">
        {tab === "inbox" ? <Inbox call={call} /> : null}
        {tab === "readers" ? <Readers call={call} /> : null}
        {tab === "catalogue" ? <CatalogueEditor call={call} /> : null}
      </div>
    </Shell>
  );
}

/* ── Sign in ───────────────────────────────────────────────────────────── */

function SignIn({
  onSubmit,
  error,
}: {
  onSubmit: (email: string, password: string) => Promise<boolean>;
  error: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Shell as="div">
      <div className="pt-24" style={{ maxWidth: "22rem" }}>
        <h1 className="display" style={{ fontSize: "var(--t-xl)" }}>
          Back office
        </h1>
        <hr className="rule-thick mt-4" />
        <form
          className="mt-6 grid gap-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            await onSubmit(email, password);
            setBusy(false);
          }}
        >
          <label className="grid gap-1">
            <span className="label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="mono border-0 border-b bg-transparent pb-1 outline-none focus:border-[var(--accent)]"
              style={{ fontSize: "var(--t-sm)" }}
            />
          </label>
          <label className="grid gap-1">
            <span className="label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mono border-0 border-b bg-transparent pb-1 outline-none focus:border-[var(--accent)]"
              style={{ fontSize: "var(--t-sm)" }}
            />
          </label>
          <button type="submit" disabled={busy} className={BUTTON} style={BUTTON_STYLE}>
            {busy ? "…" : "SIGN IN"}
          </button>
          {error ? (
            <p style={{ color: "var(--accent)", fontSize: "var(--t-sm)" }}>{error}</p>
          ) : null}
        </form>
      </div>
    </Shell>
  );
}

/* ── Inbox ─────────────────────────────────────────────────────────────── */

type Call = ReturnType<typeof useOwner>["call"];

function Inbox({ call }: { call: Call }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState("Loading…");

  const load = useCallback(
    async (alive: () => boolean = () => true) => {
      try {
        const data = await call<{ messages: Message[] }>("/api/admin/messages");
        if (!alive()) return;
        setMessages(data.messages);
        setStatus(data.messages.length ? "" : "No messages yet.");
      } catch (err) {
        if (!alive()) return;
        setStatus(err instanceof Error ? err.message : "Failed to load.");
      }
    },
    [call],
  );

  useEffect(() => {
    let cancelled = false;
    // The lint rule traces setState calls inside `load` but does not model the
    // `await` in front of them — every one of them runs in a later microtask,
    // guarded by `alive()`, so there is no cascading render to avoid here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(() => !cancelled);
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function toggleRead(message: Message) {
    setMessages((list) =>
      list.map((m) => (m.id === message.id ? { ...m, read: !m.read } : m)),
    );
    await call("/api/admin/messages", {
      method: "PATCH",
      body: JSON.stringify({ id: message.id, read: !message.read }),
    }).catch(() => void load());
  }

  if (status) return <p className="label">{status}</p>;

  return (
    <div>
      <Label>
        {messages.filter((m) => !m.read).length} unread of {messages.length}
      </Label>
      <ul className="mt-4">
        {messages.map((message) => (
          <li key={message.id}>
            <hr className="rule-thin" />
            <div className="grid gap-x-8 gap-y-2 py-5 md:grid-cols-12">
              <div className="md:col-span-3">
                <p style={{ fontSize: "var(--t-sm)", fontWeight: message.read ? 400 : 500 }}>
                  {!message.read ? (
                    <span style={{ color: "var(--accent)" }}>● </span>
                  ) : null}
                  {message.name}
                </p>
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(
                    `Re: ${message.subject || "your message"}`,
                  )}`}
                  className="mono link-underline"
                  style={{ fontSize: "var(--t-2xs)" }}
                >
                  {message.email}
                </a>
                <p
                  className="mono mt-1"
                  style={{ fontSize: "var(--t-2xs)", color: "var(--ink-faint)" }}
                >
                  {message.at ? new Date(message.at).toLocaleString() : "—"}
                </p>
              </div>
              <div className="md:col-span-7">
                {message.subject ? (
                  <p className="serif-head" style={{ fontSize: "var(--t-md)" }}>
                    {message.subject}
                  </p>
                ) : null}
                <p className="mt-1 whitespace-pre-wrap" style={{ color: "var(--ink-muted)" }}>
                  {message.body}
                </p>
              </div>
              <div className="md:col-span-2 md:text-right">
                <button
                  onClick={() => toggleRead(message)}
                  className="label hover:text-[var(--accent)]"
                >
                  Mark {message.read ? "unread" : "read"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <hr className="rule-thin" />
    </div>
  );
}

/* ── Readers ───────────────────────────────────────────────────────────── */

function Readers({ call }: { call: Call }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState("Loading…");

  useEffect(() => {
    call<Stats>("/api/admin/stats")
      .then((data) => {
        setStats(data);
        setStatus("");
      })
      .catch((err) => setStatus(err instanceof Error ? err.message : "Failed."));
  }, [call]);

  if (status) return <p className="label">{status}</p>;
  if (!stats) return null;

  const peak = Math.max(...stats.views.map((v) => v.count), 1);

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <section className="lg:col-span-7">
        <Label>Most-read paths · {stats.totalViews.toLocaleString()} views total</Label>
        <ul className="mt-4 space-y-2.5">
          {stats.views.map((view) => (
            <li key={view.path} className="grid grid-cols-12 items-center gap-3">
              <span
                className="mono col-span-5 truncate"
                style={{ fontSize: "var(--t-xs)" }}
              >
                {view.path}
              </span>
              <span className="col-span-5">
                <span
                  className="block"
                  style={{
                    height: 8,
                    width: `${(view.count / peak) * 100}%`,
                    backgroundColor: "var(--accent)",
                  }}
                />
              </span>
              <span
                className="mono figures col-span-2 text-right"
                style={{ fontSize: "var(--t-xs)" }}
              >
                {view.count}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lg:col-span-5">
        <Label>Did they actually read it</Label>
        <table className="mt-4 w-full" style={{ fontSize: "var(--t-xs)" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--ink)" }}>
              <th className="label pb-1 text-left">Path</th>
              <th className="label pb-1 text-right">Depth</th>
              <th className="label pb-1 text-right">Dwell</th>
            </tr>
          </thead>
          <tbody>
            {stats.engagement.map((row) => (
              <tr key={row.path} style={{ borderBottom: "1px solid var(--rule)" }}>
                <td className="mono truncate py-1.5" style={{ maxWidth: 160 }}>
                  {row.path}
                </td>
                <td className="mono figures py-1.5 text-right">{row.avgDepth}%</td>
                <td className="mono figures py-1.5 text-right">{row.avgDwellSec}s</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Label className="mt-9 block">Where they came from</Label>
        <ul className="mt-3 space-y-1">
          {stats.referrers.length === 0 ? (
            <li className="mono" style={{ fontSize: "var(--t-xs)", color: "var(--ink-faint)" }}>
              All direct so far.
            </li>
          ) : (
            stats.referrers.map((ref) => (
              <li
                key={ref.host}
                className="mono flex justify-between"
                style={{ fontSize: "var(--t-xs)" }}
              >
                <span>{ref.host}</span>
                <span className="figures">{ref.count}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

/* ── Catalogue editor ──────────────────────────────────────────────────── */

function CatalogueEditor({ call }: { call: Call }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [source, setSource] = useState("");
  const [seedCount, setSeedCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("Loading…");
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (alive: () => boolean = () => true) => {
      try {
        const data = await call<{
          projects: Project[];
          source: string;
          seedCount: number;
        }>("/api/admin/projects");
        if (!alive()) return;
        setProjects(data.projects);
        setSource(data.source);
        setSeedCount(data.seedCount ?? 0);
        setStatus("");
      } catch (err) {
        if (!alive()) return;
        setStatus(err instanceof Error ? err.message : "Failed to load.");
      }
    },
    [call],
  );

  useEffect(() => {
    let cancelled = false;
    // The lint rule traces setState calls inside `load` but does not model the
    // `await` in front of them — every one of them runs in a later microtask,
    // guarded by `alive()`, so there is no cascading render to avoid here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(() => !cancelled);
    return () => {
      cancelled = true;
    };
  }, [load]);

  function open(project: Project) {
    setSelected(project.slug);
    setDraft(JSON.stringify(project, null, 2));
    setStatus("");
  }

  async function save() {
    setBusy(true);
    setStatus("");
    try {
      const parsed = JSON.parse(draft);
      await call("/api/admin/projects", { method: "PUT", body: JSON.stringify(parsed) });
      setStatus("Saved. The published pages have been refreshed.");
      await load();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function importSeed() {
    setBusy(true);
    try {
      const res = await call<{ projects: number }>("/api/admin/import", { method: "POST" });
      setStatus(`Imported ${res.projects} entries into Firestore.`);
      await load();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="flex items-baseline justify-between">
          <Label>{projects.length} entries</Label>
          <Label accent>{source === "seed" ? "from seed" : "from firestore"}</Label>
        </div>

        {source === "seed" ? (
          <div className="mt-4 border-l-2 pl-4" style={{ borderColor: "var(--accent)" }}>
            <p style={{ fontSize: "var(--t-xs)", color: "var(--ink-muted)" }}>
              Firestore is empty, so this is reading the printed edition. Import it
              once and everything becomes editable here.
            </p>
            <button
              onClick={importSeed}
              disabled={busy}
              className={`${BUTTON} mt-3`}
              style={BUTTON_STYLE}
            >
              IMPORT INTO FIRESTORE
            </button>
          </div>
        ) : projects.length < seedCount ? (
          // The trap: once this collection has one document it wins outright, so
          // a half-finished import quietly shortens the public catalogue.
          <div className="mt-4 border-l-2 pl-4" style={{ borderColor: "var(--accent)" }}>
            <p style={{ fontSize: "var(--t-xs)", color: "var(--ink-muted)" }}>
              Firestore holds <strong>{projects.length}</strong> of{" "}
              <strong>{seedCount}</strong> entries, and Firestore wins once it has
              anything in it — so the public catalogue is currently showing only
              these {projects.length}. Import to restore the rest.
            </p>
            <button
              onClick={importSeed}
              disabled={busy}
              className={`${BUTTON} mt-3`}
              style={BUTTON_STYLE}
            >
              IMPORT THE MISSING {seedCount - projects.length}
            </button>
          </div>
        ) : null}

        <ul className="mt-5">
          {projects.map((project) => (
            <li key={project.slug}>
              <button
                onClick={() => open(project)}
                className="flex w-full items-baseline gap-3 border-b py-2 text-left transition-colors hover:text-[var(--accent)]"
                style={{
                  borderColor: "var(--rule)",
                  color: selected === project.slug ? "var(--accent)" : undefined,
                }}
              >
                <span
                  className="mono figures"
                  style={{ fontSize: "var(--t-2xs)", color: "var(--ink-faint)" }}
                >
                  {String(project.no).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "var(--t-sm)" }}>{project.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-8">
        {selected ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label>Editing · {selected}</Label>
              <button onClick={save} disabled={busy} className={BUTTON} style={BUTTON_STYLE}>
                {busy ? "SAVING…" : "SAVE"}
              </button>
            </div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              spellCheck={false}
              className="mono mt-4 w-full border p-4 outline-none focus:border-[var(--accent)]"
              style={{
                borderColor: "var(--rule)",
                backgroundColor: "var(--paper-raised)",
                fontSize: "var(--t-xs)",
                lineHeight: 1.6,
                minHeight: "60vh",
                resize: "vertical",
              }}
            />
            <p
              className="mt-2"
              style={{ fontSize: "var(--t-xs)", color: "var(--ink-faint)" }}
            >
              Validated against the schema on save — a malformed entry is rejected
              rather than published.
            </p>
          </>
        ) : (
          <p className="label">Pick an entry to edit.</p>
        )}

        {status ? (
          <p className="mt-4" style={{ color: "var(--accent)", fontSize: "var(--t-sm)" }}>
            {status}
          </p>
        ) : null}
      </div>
    </div>
  );
}
