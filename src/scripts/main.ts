/**
 * All page interactivity (~2 KB): header scroll state, mobile menu,
 * reveal-on-scroll, stat count-up, and click-to-play video facades.
 * The page is fully readable without this script — everything here is
 * progressive enhancement.
 */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Header scroll state ---------- */
const header = document.querySelector<HTMLElement>(".header");
const onScroll = () => {
  header?.classList.toggle("scrolled", window.scrollY > 20);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
const burger = document.querySelector<HTMLButtonElement>(".header__burger");
const menu = document.getElementById("mobile-menu");
const setMenu = (open: boolean) => {
  burger?.setAttribute("aria-expanded", String(open));
  burger?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menu?.classList.toggle("open", open);
  header?.classList.toggle("menu-open", open);
};
burger?.addEventListener("click", () =>
  setMenu(burger.getAttribute("aria-expanded") !== "true")
);
menu?.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("a")) setMenu(false);
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

/* ---------- Reveal on scroll ---------- */
if (!reduceMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.remove("reveal-pending");
          e.target.classList.add("revealed");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    // Only hide below-the-fold elements — hiding visible content would
    // re-trigger and delay LCP.
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add("reveal-pending");
      io.observe(el);
    }
  });
}

/* ---------- Stat count-up ---------- */
const animateCount = (el: HTMLElement) => {
  if (el.dataset.counted) return;
  el.dataset.counted = "1";
  const target = parseFloat(el.dataset.count || "0") || 0;
  const suffix = el.dataset.suffix || "";
  const dur = 1500;
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = target * eased;
    el.textContent =
      (Number.isInteger(target) ? Math.round(val).toString() : val.toFixed(1)) +
      suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

if (!reduceMotion && "IntersectionObserver" in window) {
  const cio = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          animateCount(e.target as HTMLElement);
          cio.unobserve(e.target);
        }
      }
    },
    { threshold: 0.3 }
  );
  document
    .querySelectorAll<HTMLElement>("[data-count]")
    .forEach((el) => cio.observe(el));
}

/* ---------- Click-to-play video facades ---------- */
/* Buttons carry data-embed (YouTube embed URL) or data-file (video URL).
   The heavy iframe/video is only created on click. */
document.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>(
    "[data-embed], [data-file]"
  );
  if (!btn) return;
  const embed = btn.dataset.embed;
  const file = btn.dataset.file;
  const title = btn.getAttribute("aria-label") || "Video";
  const frame = document.createElement("div");
  frame.className = btn.className;
  frame.classList.remove("reveal-pending");
  if (embed) {
    const iframe = document.createElement("iframe");
    iframe.className = "media-fill";
    iframe.src = embed;
    iframe.title = title;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    frame.appendChild(iframe);
  } else if (file) {
    const video = document.createElement("video");
    video.className = "media-fill";
    video.src = file;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    frame.appendChild(video);
  }
  btn.replaceWith(frame);
});
