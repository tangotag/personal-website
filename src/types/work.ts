import { z } from "zod";

import { workFilters } from "@/data/work-filters";

export { workFilters, type WorkFilter } from "@/data/work-filters";

export const workTemplates = ["full", "standard", "compact", "collection"] as const;
export const workTiers = ["hero", "featured", "secondary", "collection"] as const;

export const resultSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  /** "confirm" hides the result from production builds until the number is verified. */
  status: z.enum(["confirm"]).optional(),
});

export const workFrontmatterSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case")
    .min(2),
  title: z.string().min(3),
  hook: z.string().min(3),
  template: z.enum(workTemplates),
  tier: z.enum(workTiers),
  client: z.string().min(1),
  role: z.string().min(1),
  team: z.string().optional(),
  timeline: z.string().min(1),
  platforms: z.array(z.string().min(1)).min(1),
  industry: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)).min(1).max(6),
  filters: z.array(z.enum(workFilters)).min(1),
  results: z.array(resultSchema).max(4).default([]),
  /** Path under /public, e.g. /work/compass-pos/cover.jpg. Optional until assets arrive. */
  cover: z.string().startsWith("/").optional(),
  coverAlt: z.string().optional(),
  loop: z.string().startsWith("/").optional(),
  featuredOrder: z.number().int().positive().optional(),
  credits: z.array(z.string()).default([]),
  externalUrl: z.string().url().optional(),
  /** Draft entries are excluded from production builds and listings. */
  draft: z.boolean().default(false),
});

export type WorkFrontmatter = z.infer<typeof workFrontmatterSchema>;
export type WorkResult = z.infer<typeof resultSchema>;

export type WorkEntry = WorkFrontmatter & {
  /** Locale the body was loaded from — "en" when the requested locale has no file yet. */
  locale: string;
  /** True when the requested locale fell back to English. */
  fallback: boolean;
  /** Raw MDX body (without frontmatter). */
  body: string;
  readingMinutes: number;
};
