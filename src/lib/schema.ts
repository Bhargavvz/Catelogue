import { z } from "zod";

/** Runtime validation for anything the CMS writes back into Firestore. */

const Metric = z.object({
  label: z.string().min(1).max(80),
  value: z.string().min(1).max(40),
  note: z.string().max(120).optional(),
});

const Link = z.object({
  label: z.string().min(1).max(60),
  href: z.string().url().max(400),
  kind: z.enum(["repo", "live", "paper", "model"]).optional(),
});

const Block = z.discriminatedUnion("t", [
  z.object({ t: z.literal("p"), text: z.string().max(4000) }),
  z.object({ t: z.literal("h"), text: z.string().max(200) }),
  z.object({ t: z.literal("list"), items: z.array(z.string().max(600)).max(20) }),
  z.object({
    t: z.literal("quote"),
    text: z.string().max(600),
    attribution: z.string().max(120).optional(),
  }),
  z.object({ t: z.literal("figure"), ref: z.string().max(60) }),
  z.object({ t: z.literal("note"), text: z.string().max(600) }),
]);

const Figure = z.union([
  z.object({
    id: z.string().max(60),
    kind: z.literal("roc"),
    caption: z.string().max(600),
    points: z.array(z.object({ x: z.number(), y: z.number() })).max(60),
    auc: z.number(),
  }),
  z.object({
    id: z.string().max(60),
    kind: z.literal("bars"),
    caption: z.string().max(600),
    unit: z.string().max(10).optional(),
    max: z.number().optional(),
    bars: z
      .array(
        z.object({
          label: z.string().max(80),
          value: z.number(),
          note: z.string().max(80).optional(),
        }),
      )
      .max(12),
  }),
  z.object({
    id: z.string().max(60),
    kind: z.literal("series"),
    caption: z.string().max(600),
    unit: z.string().max(10).optional(),
    series: z.array(z.object({ label: z.string().max(80), values: z.array(z.number()) })).max(4),
    ticks: z.array(z.string().max(40)).max(12).optional(),
  }),
  z.object({
    id: z.string().max(60),
    kind: z.literal("share"),
    caption: z.string().max(600),
    slices: z.array(z.object({ label: z.string().max(80), value: z.number() })).max(8),
  }),
]);

export const ProjectSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens."),
  no: z.number().int().min(1).max(999),
  title: z.string().min(1).max(120),
  kicker: z.string().min(1).max(200),
  year: z.number().int().min(2000).max(2100),
  period: z.string().max(80),
  status: z.enum(["shipped", "active", "research", "archived"]),
  domain: z.enum(["systems", "ml", "product", "infra", "security"]),
  summary: z.string().min(1).max(1200),
  standfirst: z.string().max(1200).optional(),
  metrics: z.array(Metric).max(8),
  stack: z.array(z.string().max(40)).max(24),
  links: z.array(Link).max(8),
  featured: z.boolean(),
  body: z.array(Block).max(80).optional(),
  figures: z.array(Figure).max(12).optional(),
  footnotes: z
    .array(z.object({ id: z.string().max(20), text: z.string().max(600) }))
    .max(12)
    .optional(),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;
