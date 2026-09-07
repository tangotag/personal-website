import { ImageResponse } from "next/og";
import { site } from "@/data/site";
import { getWork } from "@/lib/content";

export const alt = "Case study cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Fetches a TTF for the display face at build time; falls back to the default sans if offline. */
async function displayFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&display=swap",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0",
        },
      },
    ).then((r) => r.text());
    const url = css.match(/src:\s*url\(([^)]+\.(?:ttf|otf|woff))\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const entry = getWork(slug, locale);
  const font = await displayFont();
  const title = entry?.title ?? site.name;
  const client = entry?.client ?? site.role;
  const result = entry?.results.find((r) => r.status !== "confirm");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: "#071c17",
        color: "#f1f5ee",
        fontFamily: font ? "Bricolage" : "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          letterSpacing: 2,
          opacity: 0.7,
        }}
      >
        <span>
          {site.shortName} · {site.name}
        </span>
        <span style={{ color: "#ddf23a" }}>{client}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            fontSize: title.length > 60 ? 56 : 68,
            lineHeight: 1.02,
            letterSpacing: -2,
            fontWeight: 800,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>
        {result ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 26 }}>
            <span style={{ color: "#ddf23a", fontWeight: 800 }}>{result.value}</span>
            <span style={{ opacity: 0.75 }}>{result.label}</span>
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, opacity: 0.6 }}>
        <span>{site.url.replace(/^https?:\/\//, "")}</span>
        <span>{site.role}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: font ? [{ name: "Bricolage", data: font, weight: 800, style: "normal" }] : undefined,
    },
  );
}
