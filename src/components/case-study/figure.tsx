import Image from "next/image";
import { MediaFrame, type FrameKind } from "@/components/ui/media-frame";

type Props = {
  src: string;
  /** Required — the build validator rejects figures without alt text. */
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  kind?: FrameKind;
  /** Aspect ratio, e.g. "16/10". Defaults per frame kind. */
  aspect?: string;
  wide?: boolean;
  priority?: boolean;
};

const defaultAspect: Record<FrameKind, string> = {
  plain: "16/10",
  phone: "9/19",
  desktop: "16/10",
  pos: "4/3",
  kiosk: "9/16",
};

/** Image inside a media/device frame. Used from MDX as <Figure src alt caption kind wide />. */
export function Figure({ src, alt, caption, kind = "plain", aspect, wide, priority }: Props) {
  return (
    <MediaFrame kind={kind} aspect={aspect ?? defaultAspect[kind]} caption={caption} wide={wide}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={wide ? "(min-width: 1024px) 1100px, 100vw" : "(min-width: 1024px) 720px, 100vw"}
        className="object-cover"
      />
    </MediaFrame>
  );
}
