/** Primary navigation. Labels are message keys under `nav`. */
export const navItems = [
  { key: "home", href: "/" },
  { key: "work", href: "/work" },
  { key: "services", href: "/services" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export type NavKey = (typeof navItems)[number]["key"];
