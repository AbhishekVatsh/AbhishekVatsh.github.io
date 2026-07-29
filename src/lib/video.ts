export type VideoKind = "youtube" | "file" | "external" | "none";

export interface VideoInfo {
  kind: VideoKind;
  /** YouTube video id (empty for non-YouTube). */
  id: string;
  /** Embeddable URL (YouTube embed URL or direct file URL). */
  embedUrl: string;
  /** Muted, looping, chromeless embed for in-card autoplay previews. */
  previewUrl: string;
  /** Auto-generated thumbnail (YouTube's first-frame poster) — used when no thumbnail is set. */
  thumbUrl: string;
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
  if (!url) return { kind: "none", id: "", embedUrl: "", previewUrl: "", thumbUrl: "", href: "" };

  for (const p of YT_PATTERNS) {
    const m = url.match(p);
    if (m) {
      const id = m[1];
      return {
        kind: "youtube",
        id,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
        previewUrl: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1&enablejsapi=1`,
        thumbUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        href: url,
      };
    }
  }

  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)) {
    return { kind: "file", id: "", embedUrl: url, previewUrl: url, thumbUrl: "", href: url };
  }

  return { kind: "external", id: "", embedUrl: "", previewUrl: "", thumbUrl: "", href: url };
}
