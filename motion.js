(() => {
  "use strict";

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- scroll reveal ---------- */
  const targets = [...document.querySelectorAll(
    ".section-heading, .booking-copy, .enquiry-form, .filter-bar, .service-card, .gallery-item"
  )];

  targets.forEach(el => el.classList.add("reveal"));

  // stagger delay by position among revealed siblings
  targets.forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains("reveal"));
    el.style.setProperty("--i", siblings.indexOf(el));
  });

  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(el => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(el => io.observe(el));
  }

  /* ---------- scroll progress ---------- */
  const bar = document.querySelector(".scroll-progress");
  if (bar) {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max) : 0);
      ticking = false;
    };
    addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  if (reduce || !finePointer) return; // everything below is mouse-only motion

  /* ---------- hero parallax ---------- */
  const hero = document.querySelector(".hero");
  const heroArt = document.querySelector(".hero-art");
  if (hero && heroArt) {
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      heroArt.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5) * 2);
      heroArt.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5) * 2);
    });
    hero.addEventListener("pointerleave", () => {
      heroArt.style.setProperty("--px", 0);
      heroArt.style.setProperty("--py", 0);
    });
  }

  /* ---------- 3D tilt on service cards ---------- */
  document.querySelectorAll(".service-card").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--ry", (x * 9).toFixed(2) + "deg");
      card.style.setProperty("--rx", (-y * 9).toFixed(2) + "deg");
    });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    });
  });

  /* ---------- magnetic buttons ---------- */
  document.querySelectorAll(".button").forEach(btn => {
    btn.addEventListener("pointermove", e => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px");
      btn.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.26).toFixed(1) + "px");
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.removeProperty("--mx");
      btn.style.removeProperty("--my");
    });
  });

  /* ---------- soft custom cursor ---------- */
  const ring = document.createElement("div");
  const dot = document.createElement("div");
  ring.className = "cursor";
  dot.className = "cursor-dot";
  document.body.append(ring, dot);

  let tx = 0, ty = 0, rx = 0, ry = 0, running = false;

  const loop = () => {
    rx += (tx - rx) * 0.18;
    ry += (ty - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    if (Math.abs(tx - rx) > 0.1 || Math.abs(ty - ry) > 0.1) {
      requestAnimationFrame(loop);
    } else {
      running = false;
    }
  };

  addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    tx = e.clientX;
    ty = e.clientY;
    dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    ring.classList.add("on");
    dot.classList.add("on");

    const hot = e.target.closest && e.target.closest("a, button, .filter, label, select, .gallery-item");
    ring.classList.toggle("big", Boolean(hot));

    if (!running) { running = true; requestAnimationFrame(loop); }
  });

  document.documentElement.addEventListener("mouseleave", () => {
    ring.classList.remove("on");
    dot.classList.remove("on");
  });
})();