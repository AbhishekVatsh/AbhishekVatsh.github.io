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

/* ---------- Autoplay muted previews (reels) ---------- */
/* Cards with data-autoplay get a muted, looping, chromeless player injected
   once they scroll near the viewport. URL-param autoplay is unreliable for
   injected iframes, so playback is started through the official YouTube
   IFrame API (loaded lazily, only when the first card approaches). The
   preview ignores pointer events, so a click still swaps in the full
   sound-on player below. */
const autoCards = document.querySelectorAll<HTMLElement>("[data-autoplay]");
if (autoCards.length && "IntersectionObserver" in window) {
  let ytApi: Promise<any> | null = null;
  const loadYtApi = () => {
    if (!ytApi) {
      ytApi = new Promise((resolve) => {
        const w = window as any;
        if (w.YT?.Player) return resolve(w.YT);
        const prev = w.onYouTubeIframeAPIReady;
        w.onYouTubeIframeAPIReady = () => {
          prev?.();
          resolve(w.YT);
        };
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      });
    }
    return ytApi;
  };

  const players: any[] = [];
  const play = (p: any) => {
    try {
      p.mute();
      p.playVideo();
    } catch {
      /* player not ready yet */
    }
  };
  // Previews can't be paused by the user (pointer-events: none), so any
  // pause is the browser/YouTube stopping a background tab — resume when
  // the page is visible again.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    for (const p of players) if (p.getPlayerState?.() !== 1) play(p);
  });

  const startPreview = (card: HTMLElement) => {
    const id = card.dataset.autoplay!.match(/embed\/([\w-]+)/)?.[1];
    if (!id) return;
    loadYtApi().then((YT) => {
      const wrap = document.createElement("div");
      wrap.className = "media-fill media-preview";
      const holder = document.createElement("div");
      wrap.appendChild(holder);
      card.prepend(wrap);
      card.classList.add("is-previewing");
      const player = new YT.Player(holder, {
        videoId: id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: id,
          controls: 0,
          playsinline: 1,
          rel: 0,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1,
        },
        events: {
          onReady: (ev: any) => play(ev.target),
          onStateChange: (ev: any) => {
            // 2 = paused. Retry a few times unless the tab is hidden
            // (visibilitychange handles that case).
            if (ev.data === 2 && !document.hidden) {
              ev.target.__retries = (ev.target.__retries || 0) + 1;
              if (ev.target.__retries <= 3) play(ev.target);
            }
          },
        },
      });
      players.push(player);
    });
  };

  const pio = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        pio.unobserve(e.target);
        startPreview(e.target as HTMLElement);
      }
    },
    { rootMargin: "160px" }
  );
  autoCards.forEach((el) => pio.observe(el));
}

/* ---------- Scroll-linked horizontal workflow ---------- */
/* Desktop only: the process section is tall, its inner pin sticks to the
   viewport, and page scroll translates the steps track right-to-left. */
const proc = document.querySelector<HTMLElement>(".process");
const procPin = document.querySelector<HTMLElement>(".process__pin");
const procTrack = document.querySelector<HTMLElement>(".process__track");
if (proc && procPin && procTrack && !reduceMotion) {
  let raf = 0;
  const update = () => {
    raf = 0;
    const dist = procTrack.scrollWidth - procPin.clientWidth;
    if (dist <= 0) {
      // Reduced-motion / fallback grid layout — no horizontal travel.
      procTrack.style.transform = "";
      procTrack.style.removeProperty("--p");
      proc.style.height = "";
      return;
    }
    // 1px of page scroll = 1px of horizontal travel.
    proc.style.height = `${procPin.offsetHeight + dist}px`;
    const total = proc.offsetHeight - procPin.offsetHeight;
    if (total <= 0) return;
    const p = Math.min(1, Math.max(0, -proc.getBoundingClientRect().top / total));
    procTrack.style.transform = `translate3d(${-p * dist}px, 0, 0)`;
    // Drives the timeline progress fill and the moving pointer (see CSS).
    procTrack.style.setProperty("--p", String(p));
  };
  const queue = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  update();
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
