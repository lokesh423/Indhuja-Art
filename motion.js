
/* =========================================
   INDUJA ARTISTRY — MOTION CONTROLLER
   Scroll reveal + Mouse motion + Page loader
========================================= */

(() => {
  "use strict";

  const root = document.documentElement;

  // Prevent duplicate initialization.
  if (window.__indhujaMotionInitialized) return;
  window.__indhujaMotionInitialized = true;

  const reduce = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

 

// ==========================================
// INDHUJA ARTISTRY — CANVAS LOADER CONTROLLER
// Append this to the end of your existing motion.js
// ==========================================

(() => {
  "use strict";

  const loader = document.getElementById("canvasLoader");
  const root = document.documentElement;

  if (!loader) return;

  root.classList.add("js", "canvas-loading");

  const MINIMUM_DISPLAY = 1800;
  const MAXIMUM_WAIT = 4500;
  const EXIT_DURATION = 1500;

  const startedAt = Date.now();

  let pageReady = document.readyState === "complete";
  let finished = false;
  let finishScheduled = false;
  let minTimer = null;
  let maxTimer = null;

  function removeLoader() {
    if (finished) return;
    finished = true;

    if (minTimer) clearTimeout(minTimer);
    if (maxTimer) clearTimeout(maxTimer);

    loader.classList.add("is-done");

    window.setTimeout(() => {
      root.classList.remove("canvas-loading");
      loader.remove();
    }, EXIT_DURATION);
  }

  function tryFinish() {
    if (finished || finishScheduled || !pageReady) return;

    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, MINIMUM_DISPLAY - elapsed);

    finishScheduled = true;

    minTimer = window.setTimeout(() => {
      removeLoader();
    }, remaining);
  }

  window.addEventListener("load", () => {
    pageReady = true;
    tryFinish();
  }, { once: true });

  // Do not leave the user stuck if an asset never loads.
  maxTimer = window.setTimeout(() => {
    pageReady = true;
    finishScheduled = false;
    removeLoader();
  }, MAXIMUM_WAIT);

  // Handle scripts that run after the page has already loaded.
  if (pageReady) {
    tryFinish();
  }
})();

  /* ---------- SCROLL REVEAL ---------- */

  const targets = [
    ...document.querySelectorAll(
      ".section-heading, .booking-copy, .enquiry-form, " +
      ".filter-bar, .service-card, .gallery-item"
    )
  ];

  targets.forEach(el => el.classList.add("reveal"));

  targets.forEach(el => {
    if (!el.parentElement) return;

    const siblings = [
      ...el.parentElement.children
    ].filter(child => child.classList.contains("reveal"));

    el.style.setProperty(
      "--i",
      siblings.indexOf(el)
    );
  });

  if (
    reduce ||
    !("IntersectionObserver" in window)
  ) {
    targets.forEach(el => el.classList.add("in"));
  } else {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -6% 0px"
      }
    );

    targets.forEach(el => observer.observe(el));
  }

  /* ---------- SCROLL PROGRESS ---------- */

  const bar = document.querySelector(".scroll-progress");

  if (bar) {
    let ticking = false;

    const updateProgress = () => {
      const max =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress = max > 0
        ? Math.min(1, window.scrollY / max)
        : 0;

      bar.style.setProperty("--p", progress);
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateProgress);
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "resize",
      updateProgress
    );

    updateProgress();
  }

  // Mouse-only motion below this point.
  if (reduce || !finePointer) return;

  /* ---------- HERO PARALLAX ---------- */

  const hero = document.querySelector(".hero");
  const heroArt = document.querySelector(".hero-art");

  if (hero && heroArt) {
    hero.addEventListener("pointermove", event => {
      const rect = hero.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      heroArt.style.setProperty(
        "--px",
        ((event.clientX - rect.left) / rect.width - 0.5) * 2
      );

      heroArt.style.setProperty(
        "--py",
        ((event.clientY - rect.top) / rect.height - 0.5) * 2
      );
    });

    hero.addEventListener("pointerleave", () => {
      heroArt.style.setProperty("--px", 0);
      heroArt.style.setProperty("--py", 0);
    });
  }

  /* ---------- 3D TILT ON SERVICE CARDS ---------- */

  document.querySelectorAll(".service-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const x =
        (event.clientX - rect.left) / rect.width - 0.5;

      const y =
        (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty(
        "--ry",
        (x * 9).toFixed(2) + "deg"
      );

      card.style.setProperty(
        "--rx",
        (-y * 9).toFixed(2) + "deg"
      );
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    });
  });

  /* ---------- MAGNETIC BUTTONS ---------- */

  document.querySelectorAll(".button").forEach(button => {
    button.addEventListener("pointermove", event => {
      const rect = button.getBoundingClientRect();

      button.style.setProperty(
        "--mx",
        (
          (event.clientX - rect.left - rect.width / 2) * 0.16
        ).toFixed(1) + "px"
      );

      button.style.setProperty(
        "--my",
        (
          (event.clientY - rect.top - rect.height / 2) * 0.26
        ).toFixed(1) + "px"
      );
    });

    button.addEventListener("pointerleave", () => {
      button.style.removeProperty("--mx");
      button.style.removeProperty("--my");
    });
  });

  /* ---------- SOFT CUSTOM CURSOR ---------- */

  const ring = document.createElement("div");
  const dot = document.createElement("div");

  ring.className = "cursor";
  dot.className = "cursor-dot";

  document.body.append(ring, dot);

  let targetX = 0;
  let targetY = 0;
  let ringX = 0;
  let ringY = 0;
  let running = false;

  function animateCursor() {
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;

    ring.style.transform =
      `translate3d(${ringX}px, ${ringY}px, 0)`;

    if (
      Math.abs(targetX - ringX) > 0.1 ||
      Math.abs(targetY - ringY) > 0.1
    ) {
      window.requestAnimationFrame(animateCursor);
    } else {
      running = false;
    }
  }

  window.addEventListener("pointermove", event => {
    if (event.pointerType !== "mouse") return;

    targetX = event.clientX;
    targetY = event.clientY;

    dot.style.transform =
      `translate3d(${targetX}px, ${targetY}px, 0)`;

    ring.classList.add("on");
    dot.classList.add("on");

    const hot = event.target.closest &&
      event.target.closest(
        "a, button, .filter, label, select, .gallery-item"
      );

    ring.classList.toggle("big", Boolean(hot));

    if (!running) {
      running = true;
      window.requestAnimationFrame(animateCursor);
    }
  });

  root.addEventListener("mouseleave", () => {
    ring.classList.remove("on");
    dot.classList.remove("on");
  });

})();
