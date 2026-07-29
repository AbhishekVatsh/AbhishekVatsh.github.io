export type VideoKind = "youtube" | "file" | "external" | "none";

export interface VideoInfo {
  kind: VideoKind;
  /** Embeddable URL (YouTube embed URL or direct file URL). */
  embedUrl: string;
  /** Original URL for external links. */
  href: string;
}

const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{6,})/,
  /(?:youtu\.be\/)([\w-]{6,})/,
  /(?:youtube\.com\/shorts\/)([\w-]{6,})/,
  /(?:youtube\.com\/embed\/)([\w-]{6,})/,
];

export function parseVideoUrl(url: string): VideoInfo {
  if (!url) return { kind: "none", embedUrl: "", href: "" };

  for (const p of YT_PATTERNS) {
    const m = url.match(p);
    if (m) {
      return {
        kind: "youtube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0`,
        href: url,
      };
    }
  }

  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)) {
    return { kind: "file", embedUrl: url, href: url };
  }

  return { kind: "external", embedUrl: "", href: url };
}
