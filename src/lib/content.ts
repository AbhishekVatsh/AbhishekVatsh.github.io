import siteJson from "../../content/site.json";

export interface Cta {
  label: string;
  href: string;
}

export interface WorkItem {
  tag: string;
  name: string;
  thumbnail: string;
  videoUrl: string;
  alt: string;
}

export interface WorkSection {
  kicker: string;
  title: string;
  note: string;
  items: WorkItem[];
}

export interface Stat {
  num: number;
  prefix: string;
  suffix: string;
  label: string;
}

export interface CategoryItem {
  name: string;
  image: string;
  alt: string;
  icon: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface SiteContent {
  meta: {
    title: string;
    description: string;
    siteUrl: string;
    ogImage: string;
    themeAccent: string;
  };
  brand: { logoText: string; logoSuffix: string };
  nav: { label: string; href: string }[];
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    tagline: string;
    taglineHighlight: string;
    description: string;
    descriptionHighlight: string;
    portrait: string;
    portraitAlt: string;
    availableText: string;
    primaryCta: Cta;
    marquee: string[];
  };
  stats: Stat[];
  shortForm: WorkSection;
  longForm: WorkSection;
  podcasts: WorkSection;
  categories: { title: string; note: string; items: CategoryItem[] };
  clients: { kicker: string; title: string; names: string[] };
  process: {
    kicker: string;
    title: string;
    steps: { title: string; desc: string }[];
  };
  contact: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    primaryCta: Cta;
    secondaryCta: Cta;
    socials: SocialLink[];
  };
  footer: { left: string; right: string };
}

export const site = siteJson as unknown as SiteContent;

/** Splits `text` around `highlight`, so the highlight can be wrapped in an accent span. */
export function splitHighlight(
  text: string,
  highlight: string
): { before: string; match: string; after: string } {
  const i = highlight ? text.indexOf(highlight) : -1;
  if (i === -1) return { before: text, match: "", after: "" };
  return {
    before: text.slice(0, i),
    match: highlight,
    after: text.slice(i + highlight.length),
  };
}
