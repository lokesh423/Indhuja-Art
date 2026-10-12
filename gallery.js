(() => {
  "use strict";

  // Builds the gallery from gallery-data.js (photos and videos) and adds the pop-up viewer.
  // If there is no data (or JavaScript is off) the static images already in index.html stay.
  const grid = document.querySelector(".gallery-grid");
  if (!grid) return;

  const LABELS = {
    caricature: "Caricature Art",
    pencil: "Pencil Portrait",
    wall: "Wall Painting",
    event: "Live Event Art"
  };

  // Only local files (assets/...) or https links are accepted.
  const SAFE = /^(assets\/|https?:\/\/)/i;
  const isString = (v) => typeof v === "string";

  const isValid = (item) =>
    item &&
    isString(item.src) && SAFE.test(item.src) &&
    (item.poster === undefined || (isString(item.poster) && SAFE.test(item.poster)));

  const PLAY_ICON =
    '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" focusable="false">' +
    '<circle cx="32" cy="32" r="30" fill="rgba(255,255,255,.93)"/>' +
    '<path d="M26 20l20 12-20 12z" style="fill:var(--accent)"/></svg>';

  function buildFigure(item) {
    const isVideo = item.type === "video";
    const category = String(item.category || "caricature");
    const title = String(item.title || LABELS[category] || "Artwork");

    const figure = document.createElement("figure");
    figure.className = "gallery-item";
    figure.dataset.category = category;
    figure.dataset.full = item.src;
    figure.dataset.title = title;
    if (isVideo) figure.dataset.type = "video";
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `${isVideo ? "Play video" : "View larger"}: ${title}`);

    const thumb = document.createElement("div");
    thumb.className = "thumb";

    const thumbSrc = isVideo ? item.poster : item.src;
    if (thumbSrc) {
      const img = document.createElement("img");
      img.src = thumbSrc;
      img.alt = isVideo ? "" : `${title} by Indhuja Artistry`;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => {
        if (isVideo) thumb.classList.add("no-poster"); // keep the video, show a colour tile
        else figure.remove();                          // missing photo: drop the card quietly
      });
      thumb.appendChild(img);
    } else {
      thumb.classList.add("no-poster");
    }

    if (isVideo) {
      const badge = document.createElement("span");
      badge.className = "play-badge";
      badge.innerHTML = PLAY_ICON; // fixed, trusted markup
      thumb.appendChild(badge);
    }

    const caption = document.createElement("figcaption");
    caption.textContent = title;

    figure.append(thumb, caption);
    return figure;
  }

  const data = Array.isArray(window.GALLERY) ? window.GALLERY.filter(isValid) : [];
  if (data.length) grid.replaceChildren(...data.map(buildFigure));

  /* ---------- pop-up viewer (photos and videos) ---------- */
  const dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.setAttribute("aria-label", "Artwork viewer");
  dlg.innerHTML =
    '<button class="lb-close" type="button" aria-label="Close">&times;</button>' +
    '<button class="lb-nav lb-prev" type="button" aria-label="Previous">&#8249;</button>' +
    '<div class="lb-stage"></div>' +
    '<button class="lb-nav lb-next" type="button" aria-label="Next">&#8250;</button>' +
    '<p class="lb-caption"></p>';
  document.body.appendChild(dlg);

  const stage = dlg.querySelector(".lb-stage");
  const captionEl = dlg.querySelector(".lb-caption");
  const prevBtn = dlg.querySelector(".lb-prev");
  const nextBtn = dlg.querySelector(".lb-next");
  let items = [];
  let index = 0;

  const visibleItems = () => [...grid.querySelectorAll(".gallery-item")].filter((f) => !f.hidden);

  function stopMedia() {
    const video = stage.querySelector("video");
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    stage.replaceChildren();
  }

  function show(i) {
    stopMedia();
    index = (i + items.length) % items.length;
    const fig = items[index];
    const thumbImg = fig.querySelector("img");
    const title = fig.dataset.title || (fig.querySelector("figcaption") || {}).textContent || "";

    if (fig.dataset.type === "video") {
      const video = document.createElement("video");
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = "auto";
      if (thumbImg && thumbImg.getAttribute("src")) video.poster = thumbImg.getAttribute("src");
      video.src = fig.dataset.full;
      stage.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = fig.dataset.full || (thumbImg && thumbImg.currentSrc) || "";
      img.alt = title;
      stage.appendChild(img);
    }

    captionEl.textContent = title;
    const many = items.length > 1;
    prevBtn.hidden = nextBtn.hidden = !many;
  }

  function open(fig) {
    items = visibleItems();
    const start = items.indexOf(fig);
    if (start < 0) return;
    show(start);
    if (!dlg.open) dlg.showModal();
  }

  grid.addEventListener("click", (e) => {
    const fig = e.target.closest(".gallery-item");
    if (fig && !fig.hidden) open(fig);
  });

  grid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const fig = e.target.closest(".gallery-item");
    if (!fig) return;
    e.preventDefault();
    open(fig);
  });

  dlg.querySelector(".lb-close").addEventListener("click", () => dlg.close());
  prevBtn.addEventListener("click", () => show(index - 1));
  nextBtn.addEventListener("click", () => show(index + 1));

  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); }); // click outside the media
  dlg.addEventListener("keydown", (e) => {
    if (items.length < 2) return;
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
  dlg.addEventListener("close", stopMedia); // also fires on Esc
})();
