import { notFound } from "next/navigation";

/** Catch-all so unknown paths render the localized not-found page instead of the root one. */
export default function CatchAll() {
  notFound();
}
