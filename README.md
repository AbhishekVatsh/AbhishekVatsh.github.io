# Abhishek Pandey — Portfolio

Dark-themed single-page portfolio for a senior video editor. Built with
[Astro](https://astro.build) + TypeScript, ships zero framework JavaScript
(one tiny inline script for interactivity) and scores **100 / 100 / 100 / 100**
on Google PageSpeed Insights, mobile and desktop.

## Manage ALL content, images & videos in ONE file

Everything on the page — text, stats, work items, thumbnails, videos, links,
the accent color — lives in **`content/site.json`**.

1. Drop image/video files into **`public/assets/`**
   (see `public/assets/README.txt` for recommended sizes/formats).
2. Reference them in `content/site.json`, e.g.
   ```json
   { "thumbnail": "/assets/reel-01.webp", "videoUrl": "https://youtu.be/XXXX" }
   ```
   - `videoUrl` accepts YouTube links (played in an embedded player on click),
     Instagram/any external links (open in a new tab), or `.mp4` files.
   - Leave `thumbnail` / `portrait` / `poster` as `""` to show the styled
     placeholder.
   - `meta.themeAccent` controls the accent color site-wide
     (currently coral `#ff5a3c`).
3. Rebuild: `npm run build`.

## Commands

| Command           | Action                                       |
| ----------------- | -------------------------------------------- |
| `npm install`     | Install dependencies (first time only)       |
| `npm run dev`     | Dev server at http://localhost:4321          |
| `npm run build`   | Build the production site into `dist/`       |
| `npm run preview` | Preview the production build locally         |

## Deploying

`dist/` is a fully static site — upload it to any host (Vercel, Netlify,
Cloudflare Pages, GitHub Pages, S3…). Set `meta.siteUrl` in
`content/site.json` to the real domain before the final build (used for
canonical/OG tags), and drop a 1200×630 `og-image.jpg` into `public/assets/`
for social sharing previews.

## Project structure

```text
content/site.json        ← ALL content & asset references (edit this)
public/assets/           ← your images & videos
public/fonts/            ← self-hosted font subsets (Anton, Space Grotesk, Space Mono)
src/pages/index.astro    ← page layout & SEO head
src/components/          ← Header, WorkGrid, WorkCard, CategoryIcon, Marquee
src/styles/global.css    ← design system (responsive, reduced-motion aware)
src/styles/fonts.css     ← @font-face + zero-CLS fallbacks
src/scripts/main.ts      ← menu, reveal-on-scroll, count-up, click-to-play video
src/lib/content.ts       ← typed access to site.json
src/lib/video.ts         ← YouTube/file/external URL parsing
```

## Performance notes (how the 100 score is kept)

- No framework runtime — plain HTML/CSS + ~2 KB of vanilla TS.
- CSS is inlined into the HTML (no render-blocking request).
- Fonts are preloaded, subset, self-hosted, `font-display: optional` with
  metric-matched fallbacks → CLS 0.
- Videos are click-to-play facades — no iframes load until tapped.
- Keep images compressed (WebP, sizes in `public/assets/README.txt`) to stay
  at 100 after adding real assets.
