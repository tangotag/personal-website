/** Filter chips on /work. Kept zod-free so client code can import it without pulling zod in. */
export const workFilters = ["fintech-pos", "saas", "mobile", "games"] as const;
export type WorkFilter = (typeof workFilters)[number];
