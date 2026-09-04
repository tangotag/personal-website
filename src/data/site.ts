/** Site-wide constants. Locale-specific copy lives in messages/*.json. */
export const site = {
  name: "Raheel Ahmad Qureshi",
  shortName: "RAQ",
  role: "Senior Product Designer",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://raheelqureshi.com",
  email: "connect@raheelqureshi.com",
  // No location is shown anywhere on the site (user decision 2026-09-04); the zone is used only for formatting.
  timeZone: "Asia/Karachi",
  availability: {
    fullTime: true,
    freelance: true,
  },
  calendarUrl: process.env.NEXT_PUBLIC_CAL_LINK ?? "",
  resumePath: "/Raheel-Ahmad-Qureshi-Senior-Product-Designer.pdf",
  social: {
    linkedin: "https://www.linkedin.com/in/theraheel10/",
    behance: "https://www.behance.net/theraheel10",
    upwork: "", // [NEEDED] Upwork profile URL
  },
} as const;
