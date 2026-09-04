import { z } from "zod";

/** A string with a value per locale; ES may be omitted and falls back to EN. */
export const localizedSchema = z.object({ en: z.string().min(1), es: z.string().optional() });
export type Localized = z.infer<typeof localizedSchema>;

export function pick(value: Localized, locale: string): string {
  return (locale === "es" && value.es) || value.en;
}

export const serviceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: localizedSchema,
  scope: localizedSchema,
  deliverables: z.array(localizedSchema).min(1),
  tags: z.array(z.string()).min(1).max(4),
  /** Typical timeline label, e.g. "6–12 weeks". */
  timeline: localizedSchema,
  /** "confirm" hides the timeline from production until Raheel approves it. */
  timelineStatus: z.enum(["confirm"]).optional(),
  /** schema.org serviceType used in JSON-LD. */
  serviceType: z.string().min(1),
});
export const servicesSchema = z.array(serviceSchema).min(1);
export type Service = z.infer<typeof serviceSchema>;

export const experienceSchema = z.object({
  company: z.string().min(1),
  role: localizedSchema,
  /** ISO-ish "YYYY-MM"; `end` omitted = present. */
  start: z.string().regex(/^\d{4}-\d{2}$/),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  location: z.string().min(1),
  kind: z.enum(["full-time", "contract", "freelance"]),
  summary: localizedSchema,
  tags: z.array(z.string()).min(1).max(4),
  url: z.string().url().optional(),
});
export const experiencesSchema = z.array(experienceSchema).min(1);
export type Experience = z.infer<typeof experienceSchema>;

export const testimonialSchema = z.object({
  quote: localizedSchema,
  name: z.string().min(1),
  role: z.string().min(1),
  company: z.string().min(1),
  /** Path under /public. */
  avatar: z.string().startsWith("/").optional(),
  /** Case-study slug to link to. */
  project: z.string().optional(),
  source: z.enum(["upwork", "linkedin", "direct"]).default("direct"),
  /** Only published testimonials with explicit permission render. */
  published: z.boolean().default(false),
});
export const testimonialsSchema = z.array(testimonialSchema);
export type Testimonial = z.infer<typeof testimonialSchema>;

export const faqSchema = z.object({
  page: z.enum(["home", "services", "contact"]),
  q: localizedSchema,
  a: localizedSchema,
});
export const faqsSchema = z.array(faqSchema);
export type Faq = z.infer<typeof faqSchema>;
