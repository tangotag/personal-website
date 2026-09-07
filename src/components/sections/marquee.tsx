import { getTranslations } from "next-intl/server";

/** Availability strip. Pure CSS animation; the track is duplicated for a seamless loop. */
export async function Marquee() {
  const t = await getTranslations("marquee");
  const items = t.raw("items") as string[];
  const track = [...items, ...items];

  return (
    <div
      role="marquee"
      aria-label={items.join(" · ")}
      className="group/marquee overflow-hidden border-b border-border"
    >
      <ul
        aria-hidden
        className="flex w-max gap-10 py-2.5 font-mono text-[0.6875rem] tracking-[0.12em] text-fg-muted uppercase motion-safe:animate-[marquee_40s_linear_infinite] motion-safe:group-hover/marquee:[animation-play-state:paused] motion-reduce:flex-wrap motion-reduce:gap-x-6"
      >
        {track.map((item, i) => (
          <li key={i} className="flex items-center gap-10">
            {item}
            <span className="text-accent-strong">·</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
