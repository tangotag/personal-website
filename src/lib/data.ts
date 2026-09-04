import "server-only";
import experienceJson from "@/content/experience.json";
import servicesJson from "@/content/services.json";
import faqJson from "@/content/faq.json";
import testimonialsJson from "@/content/testimonials.json";
import {
  experiencesSchema,
  faqsSchema,
  servicesSchema,
  testimonialsSchema,
  type Experience,
  type Faq,
  type Service,
  type Testimonial,
} from "@/types/content";

const IS_PROD = process.env.NODE_ENV === "production";

function parse<T>(
  name: string,
  schema: {
    safeParse: (d: unknown) => {
      success: boolean;
      data?: T;
      error?: { issues: { path: PropertyKey[]; message: string }[] };
    };
  },
  data: unknown,
): T {
  const r = schema.safeParse(data);
  if (!r.success || r.data === undefined) {
    const issues = r.error?.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid src/content/${name}.json — ${issues}`);
  }
  return r.data;
}

export function getServices(): Service[] {
  return parse("services", servicesSchema, servicesJson);
}

/** Newest first; current role first. */
export function getExperience(): Experience[] {
  return parse("experience", experiencesSchema, experienceJson).sort(
    (a, b) =>
      (b.end ?? "9999-99").localeCompare(a.end ?? "9999-99") || b.start.localeCompare(a.start),
  );
}

/** Only testimonials with explicit permission ship; in dev, unpublished ones show for layout work. */
export function getTestimonials(): Testimonial[] {
  const all = parse("testimonials", testimonialsSchema, testimonialsJson);
  return IS_PROD ? all.filter((t) => t.published) : all;
}

export function getFaq(page: Faq["page"]): Faq[] {
  return parse("faq", faqsSchema, faqJson).filter((f) => f.page === page);
}
