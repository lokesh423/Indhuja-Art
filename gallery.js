(() => {
  "use strict";

  const API_URL =
    "https://script.google.com/macros/s/AKfycbzreRJZ6Ht1Rg2UR851IQt-x-SiijQjlj5jN4t92bmC_4ifI1ylOTuVENGZhFiNa8H32A/exec";

  const grid = document.querySelector(".gallery-grid");
  const emptyMessage = document.querySelector("#gallery-empty");
  const filterButtons = document.querySelectorAll(".filter");

  if (!grid) return;

  let allItems = [];
  let activeFilter = "all";
  let requestScript = null;
  let requestTimer = null;

  function getCategory(item) {
    const folder = (item.folder || "").toLowerCase();
    const name = (item.name || "").toLowerCase();
    const mime = (item.mimeType || "").toLowerCase();

    if (
      item.type === "video" ||
      mime.startsWith("video/") ||
      /\.(mp4|webm|mov|m4v|avi)$/i.test(name)
    ) {
      return "video";
    }

    if (/caricature|cartoon/.test(folder + " " + name)) {
      return "caricature";
    }

    if (/pencil|sketch|portrait/.test(folder + " " + name)) {
      return "pencil";
    }

    if (/wall|mural/.test(folder + " " + name)) {
      return "wall";
    }

    if (/event|live|function/.test(folder + " " + name)) {
      return "event";
    }

    return "other";
  }

  function humanizeFilename(filename) {
    return String(filename || "Artwork")
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
  }

  function createCard(item) {
    const category = getCategory(item);
    const isVideo = category === "video";
    const title = humanizeFilename(item.name);
    const card = createElement("article", "gallery-card gallery-item");

    card.dataset.category = category;
    card.dataset.type = isVideo ? "video" : "image";

    const media = createElement("div", "gallery-media");

    if (isVideo) {
      const video = document.createElement("video");

      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      video.setAttribute("aria-label", title);

      if (item.thumbnail) video.poster = item.thumbnail;
      if (item.url) video.src = item.url;

      media.appendChild(video);
    } else {
      const link = document.createElement("a");
      const image = document.createElement("img");

      link.href = item.url || item.thumbnail || "#";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", "Open " + title);

      image.src = item.thumbnail || item.url || "";
      image.alt = title;
      image.loading = "lazy";
      image.decoding = "async";

      image.addEventListener("error", () => {
        image.classList.add("gallery-image-error");
        image.alt = title + " — image unavailable";
      });

      link.appendChild(image);
      media.appendChild(link);
    }

    const caption = createElement("p", "gallery-caption", title);
    card.append(media, caption);

    return card;
  }

  function updateHeroImage() {
    const heroImage = document.querySelector(".hero-art img");

    if (!heroImage) return;

    const firstImage = allItems.find((item) => {
      return item.type !== "video" &&
        (item.mimeType || "").startsWith("image/");
    });

    if (firstImage) {
      heroImage.src = firstImage.thumbnail || firstImage.url;
      heroImage.alt = humanizeFilename(firstImage.name) +
        " by Indhuja Artistry";
    }
  }

  function renderGallery() {
    grid.replaceChildren();

    const filtered = allItems.filter((item) => {
      return activeFilter === "all" ||
        getCategory(item) === activeFilter;
    });

    filtered.forEach((item) => {
      grid.appendChild(createCard(item));
    });

    if (emptyMessage) {
      emptyMessage.hidden = filtered.length > 0;
    }

    if (filtered.length === 0) {
      const note = createElement(
        "p",
        "gallery-status",
        allItems.length === 0
          ? "No artwork has been added yet."
          : "No artwork found in this category."
      );

      grid.appendChild(note);
    }
  }

  function setActiveFilter(selectedButton) {
    activeFilter = selectedButton.dataset.filter || "all";

    filterButtons.forEach((button) => {
      const selected = button === selectedButton;

      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    renderGallery();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveFilter(button);
    });
  });

  function loadGallery() {
    grid.replaceChildren(
      createElement("p", "gallery-status", "Loading artwork...")
    );

    // A unique callback avoids cross-origin fetch/CORS restrictions.
    const callbackName =
      "__indhujaGalleryCallback_" + Date.now();

    let finished = false;

    function cleanup() {
      if (requestTimer) {
        clearTimeout(requestTimer);
        requestTimer = null;
      }

      if (requestScript) {
        requestScript.remove();
        requestScript = null;
      }

      try {
        delete window[callbackName];
      } catch (_) {
        window[callbackName] = undefined;
      }
    }

    function fail(message) {
      if (finished) return;
      finished = true;
      cleanup();

      grid.replaceChildren(
        createElement("p", "gallery-error", message)
      );

      console.error("Indhuja Artistry gallery failed to load.");
    }

    window[callbackName] = (data) => {
      if (finished) return;
      finished = true;
      cleanup();

      if (!data || data.success !== true ||
          !Array.isArray(data.files)) {
        grid.replaceChildren(
          createElement(
            "p",
            "gallery-error",
            "Gallery data could not be loaded. Please try again later."
          )
        );
        return;
      }

      allItems = data.files;
      updateHeroImage();
      renderGallery();
    };

    requestScript = document.createElement("script");
    requestScript.src =
      API_URL +
      "?callback=" + encodeURIComponent(callbackName) +
      "&_=" + Date.now();
    requestScript.async = true;

    requestScript.onerror = () => {
      fail("Gallery could not connect. Please refresh and try again.");
    };

    requestTimer = setTimeout(() => {
      fail("Gallery is taking too long to load. Please try again.");
    }, 15000);

    document.head.appendChild(requestScript);
  }

  loadGallery();
})();
