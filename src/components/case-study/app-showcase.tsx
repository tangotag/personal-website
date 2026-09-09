import Image from "next/image";
import { Tag } from "@/components/ui/tag";
import { getMobileApps } from "@/lib/data";
import { pick } from "@/types/content";

/**
 * A screen in a device shell. The shell is drawn rather than baked into the image so the bezel
 * takes the theme's surface and border instead of shipping a grey frame that suits one background.
 */
function Phone({ src, alt, label }: { src: string; alt: string; label: string }) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="rounded-[1.75rem] border border-border-strong bg-surface-2 p-1.5">
        {/* 430x932 is the source size of every screen, so the shell never crops one. */}
        <div className="relative aspect-[430/932] overflow-hidden rounded-[1.4rem] bg-surface">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 44vw"
            className="object-cover"
          />
        </div>
      </div>
      <figcaption className="text-center font-mono text-xs text-fg-muted">{label}</figcaption>
    </figure>
  );
}

/**
 * The four concept apps, used from the Mobile App Designs entry as `<AppShowcase />`.
 *
 * The apps live in src/content/mobile-apps.json rather than in the MDX so the alt text and labels
 * stay translatable through the same `pick` path as every other catalogue, and so adding an app is
 * a data change rather than a copy-paste of markup.
 */
export function AppShowcase({ locale }: { locale: string }) {
  const apps = getMobileApps();

  return (
    <div className="mt-10 flex flex-col gap-14">
      {apps.map((app) => (
        <section
          key={app.slug}
          className="border-t border-border pt-10 first:border-t-0 first:pt-0"
        >
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-3">
            <h3 className="scroll-mt-24 text-h3">{app.name}</h3>
            <ul className="flex flex-wrap gap-2">
              {app.tags.map((tag) => (
                <li key={tag}>
                  <Tag>{tag}</Tag>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 max-w-[62ch] text-fg-muted">{pick(app.summary, locale)}</p>

          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {app.screens.map((screen) => (
              <li key={screen.src}>
                <Phone
                  src={screen.src}
                  alt={pick(screen.alt, locale)}
                  label={pick(screen.label, locale)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
