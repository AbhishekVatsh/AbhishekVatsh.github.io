// @ts-check
import { defineConfig } from "astro/config";
import { readFileSync } from "node:fs";

const site = JSON.parse(readFileSync("./content/site.json", "utf8"));

export default defineConfig({
  site: site.meta.siteUrl,
  build: {
    // Inline all CSS into the HTML — no render-blocking stylesheet request.
    inlineStylesheets: "always",
  },
});
