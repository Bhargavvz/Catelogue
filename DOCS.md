# The project, in detail

This document explains what the site is, how it is put together, and why each
significant decision went the way it did — including the ones that turned out to
be wrong. It is written to be read by someone who did not build it.

---

## 1. The thesis

Most developer portfolios are a landing page: a hero, a grid of cards, a contact
form. They are optimised for looking modern, which means they all look the same,
and because they all look the same the reader stops reading.

This one is built as a **printed catalogue**. The organising metaphor is a
journal or a broadsheet — numbered sections, a masthead, plates with captions,
marginalia, footnotes, a colophon. That choice does two things at once:

1. **It is hard to fake.** Editorial typography has rules (measure, leading,
   indentation, optical alignment, tabular figures) and getting them right takes
   deliberate work. A page that observes them reads as *designed*, not generated.
2. **It suits the content.** The material is twenty engineering projects with
   real measurements. A catalogue of numbered entries with results tables is
   genuinely the right form for that, not a costume worn over a card grid.

The second half of the thesis is **instrumentation**. Every number on the site is
real and traceable: model metrics come from the project write-ups, the GitHub
figures are read live from the API at build time, and the reader statistics are
measured. Nothing is a placeholder and nothing is rounded up. Where a measurement
is weak — a 0.787 R² for the sanitation model — it is printed at the same size as
the strong ones.

The two halves are the argument: *craft* says a person made this, *data* says an
engineer did.

---

## 2. Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16, App Router, Turbopack | Server Components mean the catalogue renders as static HTML with no client JS cost; ISR lets CMS edits go live without a redeploy |
| UI | React 19.2 | Required by App Router; `useSyncExternalStore` used for browser-only state |
| Styling | Tailwind v4 + CSS custom properties | Tokens live in `:root` so theming is one variable swap; Tailwind handles layout only |
| Data | Firebase Firestore | Free tier, no server to run, and the Admin SDK keeps all access server-side |
| Auth | Firebase Auth (email/password) | One user. Anything heavier would be theatre |
| Hosting | Vercel | First-class Next.js support: ISR, streaming, image optimisation |
| Type safety | TypeScript strict + Zod | TS at compile time, Zod at the network boundary |

There are deliberately **no Cloud Functions**. Every server-side operation runs in
a Next.js Route Handler, which means the whole thing stays on Firebase's free
Spark plan. Cloud Functions would require the Blaze plan and a payment method for
work that Vercel already runs.

---

## 3. Architecture

### 3.1 Rendering strategy

```
Request
   │
   ├─ Static shell (prerendered at build, revalidated hourly)
   │     front page · catalogue index · 20 case studies · about
   │
   ├─ Streamed island (Suspense)
   │     telemetry section — GitHub API, 6h cache
   │
   └─ Client islands (hydrated)
         command palette · theme toggle · catalogue filters
         contact form · reactions · page instrumentation
```

Everything that can be static is static. The page arrives as HTML; JavaScript
only attaches to the five things that genuinely need interactivity. The telemetry
section is wrapped in `Suspense` so a slow GitHub response delays that block
alone rather than the whole page.

`export const revalidate = 3600` puts every content route on hourly ISR. A CMS
edit calls `revalidatePath()` directly, so saves appear immediately instead of
waiting out the hour.

### 3.2 The content pipeline

```
src/content/seed.ts          ← the printed edition, committed to the repo
        │
        ▼
src/lib/content.ts           ← getContent(): Firestore first, seed as fallback
        │                       per collection, wrapped in React cache()
        ▼
Server Components            ← pages read content, never Firebase directly
```

`getContent()` is the single door to content. It tries Firestore for `projects`,
`experience` and `profile`; if a collection is empty or the call throws, that
collection falls back to `seed.ts`. It is wrapped in React's `cache()` so the
layout and the page share one read per request.

**The consequence to understand:** the fallback is *per collection, all or
nothing*. A non-empty `projects` collection wins outright — it does not merge
with the seed. That is correct (otherwise you could never delete a project) but
it is sharp: writing one project to Firestore makes the site show exactly one
project. The admin panel now detects this and says so.

### 3.3 Request flow for writes

```
Browser ──► Next.js Route Handler ──► Firebase Admin SDK ──► Firestore
                    │
                    └── Zod validation, rate limiting, auth check
```

The browser **never touches Firestore**. Not for reads, not for writes. Every
path goes through a route handler using the Admin SDK, which bypasses security
rules entirely. That is why `firestore.rules` can deny everything — there is no
legitimate direct client access to permit.

---

## 4. The content model

Defined in `src/lib/types.ts`, validated in `src/lib/schema.ts`.

A `Project` carries structured metadata (`slug`, `no`, `title`, `kicker`,
`domain`, `status`, `stack`, `links`), a `metrics` array of headline numbers, an
optional `body` of typed blocks, and optional `figures`.

**Body blocks** are a deliberately small vocabulary — `p`, `h`, `list`, `quote`,
`figure`, `note`. A printed page needs few primitives, and a small set keeps the
CMS payload JSON-serialisable and the renderer total.

**Figures** are data, not images. Four kinds:

- `roc` — a receiver operating characteristic with a stated AUC
- `bars` — horizontal bars on a shared baseline
- `share` — a hundred-cell waffle, for proportions too small for a bar
- `series` — columns, used for commit activity

Figures are referenced from the prose by id, so plate numbering follows reading
order the way a paper numbers its figures.

### The nested-array trap

`roc.points` was originally `[number, number][]` — an array of `[x, y]` tuples.
It rendered perfectly from the seed file and passed every test, then failed the
moment anything tried to persist it:

```
3 INVALID_ARGUMENT: Property array contains an invalid nested entity.
```

**Firestore does not allow an array directly inside another array.** Points are
now `{ x, y }` objects. The lesson generalises: a type that is valid in
TypeScript and valid as JSON is not automatically valid in your datastore, and
the only way to know is to actually write it. There is a check for this in
`scripts/` that writes every document to a throwaway collection and deletes it.

---

## 5. Design system

### Typography

Three families, each with one job:

- **Instrument Serif** — display. High contrast, single weight, Times-like but
  sharper. Masthead, headlines, and every large number.
- **Newsreader** — running text. A variable serif with a genuinely good italic.
- **IBM Plex Mono** — labels, figures, anything that must align in a column.

All three are self-hosted through `next/font`, so there are no external font
requests and no layout shift.

Details that do the actual work:

- `font-variant-numeric: tabular-nums` on every number, so columns align
- `hanging-punctuation: first last` on the body
- `text-wrap: balance` on headings, `pretty` on paragraphs
- First paragraph after a break set flush, subsequent ones indented — the
  printed convention for distinguishing a new thought from a continued one
- Drop caps via `::first-letter`, coloured in the accent (rubrication)

### Colour

Newsprint, not "dark mode with a purple gradient":

| Token | Light | Dark |
| --- | --- | --- |
| `--paper` | `#f6f2e9` | `#100f0c` |
| `--ink` | `#16140f` | `#ede7d9` |
| `--accent` | `#b23a1e` | `#e0603c` |

The accent is **minium** — red lead, the pigment printers have used for initials
and rubrication for centuries. It is used sparingly: drop caps, the full stop
after the name, figure numbers, active states.

Three theme states, not two: light, dark, and follow-system. Hiding the third is
a small lie about what the site is doing. An inline script applies the stored
choice before first paint so there is no flash.

### Marginalia

Notes sit in the true right margin above 1100px, achieved with a float and a
negative outer margin so the running text does *not* wrap around them — which is
how a printed gloss behaves. Below that breakpoint they fall inline with a rule.

This caused a subtle bug worth recording: an `<aside>` between two paragraphs
breaks the `p + p` adjacency selector, so the paragraph after a note lost both
its leading and its indent and ran into the previous one. Fixed with an explicit
`aside + p` rule, and mirrored in the renderer's logic so a note does not count
as a passage break.

### The mark

`src/app/icon.svg` is a paper-coloured **B** on a minium ground. The letterform
is the real Instrument Serif outline, extracted from the font binary the site is
set in, so the favicon and the masthead are literally the same letter. It carries
a hairline stroke in its own colour because a high-contrast serif loses its thin
strokes at 16px.

---

## 6. Firebase integration

### Collections

| Collection | Written by | Contents |
| --- | --- | --- |
| `projects` | Admin CMS | Catalogue entries |
| `experience` | Admin CMS | Roles |
| `profile` | Admin CMS | Name, lede, links |
| `messages` | Contact form | Correspondence with read state |
| `views` | `/api/track` | Per-path counters |
| `events` | `/api/track` | View and scroll-depth events |
| `reactions` | `/api/reactions` | Per-entry marks |
| `ratelimits` | Contact form | Per-IP throttle windows |

### Security model

Three independent layers:

1. **Firestore rules deny everything.** No client credential can read or write
   anything directly.
2. **Route handlers hold the only key.** The Admin SDK service account lives in
   a server-only environment variable, imported through modules marked
   `server-only` so it can never be bundled for the browser.
3. **Admin routes check ownership explicitly.** `verifyOwner()` validates the
   Firebase ID token *and* checks the UID against `ADMIN_UID`. Being
   authenticated is not authorisation — without an allowlist entry, every admin
   call is refused, including when no allowlist is configured at all.

### Abuse resistance on the contact form

- Zod validation on every field
- An off-screen honeypot field; a filled one returns `200 OK` and silently
  discards, so a bot learns nothing from the response
- Per-IP rate limiting at five per hour, held in a Firestore transaction rather
  than process memory — serverless instances are recycled constantly, so an
  in-process counter protects nothing

### Reader statistics

Deliberately **not** Google Analytics. Firebase Analytics is GA4: it sets
cookies, which means a consent banner, and it cannot easily answer the question
that actually matters here.

Instead `/api/track` records two cookieless events — a view, and on page exit a
scroll depth plus dwell time, sent via `navigator.sendBeacon` so it survives the
page going away. No identifiers are stored. The admin dashboard aggregates this
into *which entries get opened* and *does anyone reach the bottom*, which is the
real question about a portfolio.

---

## 7. GitHub telemetry

`src/lib/github.ts` reads live figures with a documented degraded mode:

- **With `GITHUB_TOKEN`** — the GraphQL API returns the true contribution
  calendar: 52 weeks of exact daily counts.
- **Without** — it falls back to the public events feed, which reaches back about
  ninety days, sets `degraded: true`, and **the page says so in the caption.**

That last point is the design decision. The easy move is to show a shorter chart
and let the reader assume it is a full year. Labelling the limitation costs one
sentence and is the whole difference between instrumentation and decoration.

Responses are cached for six hours, comfortably inside the unauthenticated rate
limit. Language distribution is counted by each repository's primary language,
not by bytes — cheaper, and the caption says which.

---

## 8. Interaction

- **Command palette (⌘K)** — the back-of-the-book index. Subsequence matching, so
  `aqs` finds AquaSafe. Full keyboard control.
- **Catalogue** — filter by field, sort by number, recency or title, free-text
  search across titles and stacks.
- **Reactions** — three typographic marks per entry. `localStorage` remembers
  what this browser marked; the server clamps at zero so a replayed decrement
  cannot drive a counter negative.

---

## 9. Accessibility and resilience

- Semantic landmarks, real heading hierarchy, `aria-label`s on every chart
- Visible focus rings in the accent colour
- `prefers-reduced-motion` collapses all animation
- No horizontal overflow at 375px
- Print stylesheet: hides chrome, expands link URLs, resets to black on white
- **The site renders with zero environment variables.** Firebase adds capability;
  it is never required. A fresh clone with no credentials still serves every
  page from `seed.ts`.

---

## 10. File map

```
src/
  app/
    page.tsx              Front page
    work/page.tsx         Catalogue index
    work/[slug]/page.tsx  Case studies (generateStaticParams)
    about/page.tsx        Long read
    admin/page.tsx        Back office — inbox, readers, catalogue editor
    api/
      contact/            Validation, honeypot, rate limit, optional email
      track/              Cookieless view and depth events
      reactions/          Counters with clamping
      admin/*             Owner-gated: projects, messages, stats, import
    icon.svg              The mark
    opengraph-image.tsx   Share card, generated from the bundled font
    globals.css           Design tokens and editorial rules
  components/
    press/                Rules, folios, figures, marginalia, entries
    charts/               ROC, bars, waffle, series, languages
  content/seed.ts         The printed edition
  lib/
    content.ts            Firestore-first with per-collection seed fallback
    github.ts             Telemetry with degraded mode
    firebase/             Client and Admin wrappers, both null-safe
    schema.ts             Zod validation for CMS writes
    types.ts              The content model
scripts/                  Maintenance utilities
firestore.rules           Deny-all
```

---

## 11. Decisions I would defend

**Twenty entries as a table, not a card grid.** Twenty projects with screenshots
is a gallery you scroll past. Twenty as a sortable index with a headline result
per row is something a hiring engineer can actually read in ninety seconds.

**Printing the weak numbers.** The sanitation model's 0.787 R² is set in the same
type as the 0.9997 AUC, and the case study says it is the one to rebuild first. A
portfolio that only shows wins is not evidence, it is advertising.

**A ROC curve that looks empty.** At AUC 0.9997 the curve hugs the corner and the
plot reads as a near-empty box. That is what a 0.9997 looks like. Distorting the
axes to make it look more impressive would be lying with a chart.

**No stock photography, no illustrations, no logo wall.** The typography carries
the page. Every visual element on the site is either type, a rule, or a plot of
real data.
