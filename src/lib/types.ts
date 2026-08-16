/**
 * Content model.
 *
 * Everything the site renders is described here. The same shapes are stored in
 * Firestore, so the admin panel writes plain JSON and the pages don't care
 * whether a document came from the network or from `src/content/seed.ts`.
 */

export type Domain = "systems" | "ml" | "product" | "infra" | "security";

export type Status = "shipped" | "active" | "research" | "archived";

/** A single headline number. Values stay strings so units travel with them. */
export type Metric = {
  label: string;
  value: string;
  note?: string;
};

/** Plotted data. Each variant maps to one component in components/charts. */
export type FigureSpec =
  | {
      id: string;
      kind: "roc";
      caption: string;
      /**
       * Points along the curve: x is the false positive rate, y the true
       * positive rate. Objects rather than [x, y] tuples because Firestore
       * refuses an array nested directly inside another array.
       */
      points: { x: number; y: number }[];
      auc: number;
    }
  | {
      id: string;
      kind: "bars";
      caption: string;
      unit?: string;
      max?: number;
      bars: { label: string; value: number; note?: string }[];
    }
  | {
      id: string;
      kind: "series";
      caption: string;
      unit?: string;
      series: { label: string; values: number[] }[];
      ticks?: string[];
    }
  | {
      id: string;
      kind: "share";
      caption: string;
      slices: { label: string; value: number }[];
    };

/** Long-form body. Deliberately small — a printed page needs few primitives. */
export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "list"; items: string[] }
  | { t: "quote"; text: string; attribution?: string }
  | { t: "figure"; ref: string }
  | { t: "note"; text: string };

export type Link = {
  label: string;
  href: string;
  kind?: "repo" | "live" | "paper" | "model";
};

export type Project = {
  slug: string;
  /** Catalogue number. Stable, printed next to the title. */
  no: number;
  title: string;
  /** Sits under the title, sets the frame in a few words. */
  kicker: string;
  year: number;
  period: string;
  status: Status;
  domain: Domain;
  /** One or two sentences. Used in the index and the front page. */
  summary: string;
  /** The lede of the case study. Longer, sets up the problem. */
  standfirst?: string;
  metrics: Metric[];
  stack: string[];
  links: Link[];
  featured: boolean;
  body?: Block[];
  figures?: FigureSpec[];
  footnotes?: { id: string; text: string }[];
};

export type Experience = {
  slug: string;
  org: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  detail: string[];
  stack: string[];
  links?: Link[];
};

export type Award = {
  title: string;
  detail: string;
  org: string;
  date: string;
};

export type Credential = {
  title: string;
  issuer: string;
  id?: string;
};

export type Education = {
  school: string;
  qualification: string;
  period: string;
  result: string;
};

export type Profile = {
  name: string;
  shortName: string;
  role: string;
  location: string;
  email: string;
  phone?: string;
  lede: string[];
  github: string;
  linkedin: string;
  resumeUrl: string;
  githubUser: string;
};

export type SkillGroup = {
  group: string;
  note: string;
  items: string[];
};

export type SiteContent = {
  profile: Profile;
  projects: Project[];
  experience: Experience[];
  awards: Award[];
  credentials: Credential[];
  education: Education[];
  skills: SkillGroup[];
};

/** Live numbers pulled from the GitHub API. */
export type Telemetry = {
  repos: number;
  stars: number;
  followers: number;
  languages: { label: string; value: number }[];
  /** Commit counts per week, oldest first. */
  activity: number[];
  topRepos: { name: string; stars: number; language: string | null }[];
  fetchedAt: string;
  degraded: boolean;
};
