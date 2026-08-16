# bhargav.adepu.co.in

A portfolio built as a printed catalogue: editorial typography carrying live,
verifiable data. Next.js 16 (App Router, Turbopack), React 19, Tailwind v4,
Firebase for content, correspondence and reader statistics.

## The idea

Twenty projects, each with the numbers it actually produced, set the way a
journal sets a paper — numbered plates, captions, marginalia, footnotes, a
colophon. The charts plot real measurements (a 0.9997 AUC-ROC looks like a
near-empty box, and it is left looking like one). The telemetry section reads
the GitHub API at build time. Nothing on the page is decorative data.

## Running it

```bash
npm install && npm run dev
```

That is the whole setup. With **no environment variables at all** the site
builds and serves completely from `src/content/seed.ts` — every page, the full
catalogue, the GitHub telemetry in its fallback mode. Firebase adds the CMS, the
inbox, the counters and the reader stats on top; it is never required to render.

## Layout

```
src/
  app/
    page.tsx              Front page — masthead, experience, selected work, telemetry
    work/                 Catalogue index and the twenty case studies
    about/                The long read
    admin/                Back office (Firebase Auth gated, noindex)
    api/                  Route handlers: contact, track, reactions, admin/*
    opengraph-image.tsx   Share card, generated from the repo's own font
  components/
    press/                Editorial furniture — rules, folios, figures, marginalia
    charts/               ROC, bars, waffle, series, language distribution
  content/seed.ts         The printed edition. Source of truth until Firestore has data.
  lib/
    content.ts            Firestore-first with a seed fallback, per collection
    github.ts             Telemetry, with a documented degraded mode
    firebase/             Client and Admin SDK wrappers, both null-safe
    schema.ts             Zod validation for everything the CMS writes back
```

## Firebase setup

Everything below is optional and independent — turn on as much as you want.

1. **Create a project** at [console.firebase.google.com](https://console.firebase.google.com).
   Add a Web app; copy the config into the `NEXT_PUBLIC_FIREBASE_*` variables in
   `.env.local` (see `.env.example`).
2. **Create the Firestore database** in production mode.
3. **Service account**: Project settings → Service accounts → Generate new
   private key. Paste the whole JSON into `FIREBASE_SERVICE_ACCOUNT_KEY` on one
   line. This must never be prefixed `NEXT_PUBLIC_`.
4. **Owner account**: Authentication → Sign-in method → enable Email/Password,
   then Users → Add user. Put that user's UID into `ADMIN_UID`.
5. **Deploy the rules**:

```bash
firebase deploy --only firestore:rules
```

6. **Bootstrap the content**: sign in at `/admin`, open the Catalogue tab, and
   press *Import into Firestore*. From then on edits made there are live without
   a redeploy — `revalidatePath` refreshes the affected pages on save.

### What is stored where

| Collection   | Written by     | Contents                                    |
| ------------ | -------------- | ------------------------------------------- |
| `projects`   | Admin CMS      | The catalogue entries                       |
| `experience` | Admin CMS      | Roles                                       |
| `profile`    | Admin CMS      | Name, lede, links                           |
| `messages`   | Contact form   | Correspondence, with read state             |
| `views`      | `/api/track`   | Per-path view counters                      |
| `events`     | `/api/track`   | Cookieless view and scroll-depth events     |
| `reactions`  | `/api/reactions` | Per-entry marks                           |
| `ratelimits` | Contact form   | Per-IP window for contact throttling        |

No cookies are set and no identifiers are stored. `firestore.rules` denies all
direct client access — every read and write goes through a route handler using
the Admin SDK, which is why the rules can be as strict as they are.

## GitHub telemetry

Without a token the activity chart is built from the public events feed, which
reaches back roughly ninety days, and the page says so in the caption. Set
`GITHUB_TOKEN` to a classic token with **no scopes** and it switches to the real
contribution calendar via the GraphQL API. Responses are cached for six hours.

## Contact notifications

Messages always land in Firestore and appear in the `/admin` inbox. Setting
`RESEND_API_KEY`, `RESEND_FROM_EMAIL` and `CONTACT_NOTIFY_EMAIL` adds an email
ping on top; without them nothing breaks, the notification is just skipped.

There are no Cloud Functions here on purpose — all server work happens in
Next.js route handlers, so the whole thing runs on Firebase's free Spark plan.

## Deploying to Vercel

```bash
git init && git add -A && git commit -m "Initial commit"
gh repo create portfolio --private --source=. --push
```

Then import the repository at [vercel.com/new](https://vercel.com/new), paste
the environment variables from `.env.example` into Project Settings →
Environment Variables, and deploy. To move the domain across, add
`bhargav.adepu.co.in` under Project Settings → Domains and update the DNS record
at your registrar.

## Design notes

- **Type**: Instrument Serif (display), Newsreader (running text), IBM Plex Mono
  (labels and figures). Self-hosted through `next/font`, no external requests.
- **Colour**: newsprint paper and warm-black ink, with minium — the red-lead
  pigment printers have used for initials since well before any of this — as the
  single accent. Three theme states: light, dark, and follow-system.
- **Numbers** are set with `tabular-nums` everywhere so they align in a column.
- The page prints properly. Try it.
