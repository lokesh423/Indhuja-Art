(() => {
  const root = document.documentElement;
  const KEY = "indhuja-theme-v2";

  // Every preset changes colour, mode, fonts, image frame, corners and buttons together.
  const PRESETS = {
    coral: {
      label: "Coral", color: "#f16d59", mode: "light", bg: "#fff5e7",
      head: '"Fraunces", Georgia, serif',
      body: '"Poppins", "Trebuchet MS", Arial, sans-serif',
      imgBorder: "8px solid var(--surface)", imgRadius: "46% 46% 24px 24px",
      flat: "15px", card: "1px solid var(--line)", radius: "22px", btn: "999px"
    },
    teal: {
      label: "Teal", color: "#2f9c8f", mode: "light", bg: "#eefaf7",
      head: '"Playfair Display", Georgia, serif',
      body: '"Lora", Georgia, serif',
      imgBorder: "7px double var(--accent)", imgRadius: "200px 200px 12px 12px",
      flat: "8px", card: "3px double var(--accent)", radius: "12px", btn: "10px"
    },
    violet: {
      label: "Violet", color: "#8467d7", mode: "light", bg: "#f6f2ff",
      head: '"Caveat", "Comic Sans MS", cursive',
      body: '"Nunito", "Trebuchet MS", Arial, sans-serif',
      imgBorder: "10px solid var(--surface)", imgRadius: "34px",
      flat: "26px", card: "1px solid var(--line)", radius: "32px", btn: "999px"
    },
    sunny: {
      label: "Sunny", color: "#f2b705", mode: "light", bg: "#fffbea",
      head: '"Nunito", "Trebuchet MS", Arial, sans-serif',
      body: '"Nunito", "Trebuchet MS", Arial, sans-serif',
      imgBorder: "5px dashed var(--text)", imgRadius: "40px",
      flat: "18px", card: "3px dashed var(--text)", radius: "24px", btn: "16px"
    },
    black: {
      label: "Black", color: "#f5c84c", mode: "dark", swatch: "#121114",
      head: '"Space Grotesk", Verdana, Arial, sans-serif',
      body: '"DM Sans", Verdana, Arial, sans-serif',
      imgBorder: "3px solid var(--accent)", imgRadius: "0",
      flat: "0", card: "2px solid var(--line)", radius: "0", btn: "0"
    }
  };

  /* ---------- colour helpers ---------- */
  const hexToHsl = hex => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [h, s * 100, l * 100];
  };

  const hsl = (h, s, l) =>
    `hsl(${Math.round(((h % 360) + 360) % 360)} ${Math.round(s)}% ${Math.round(l)}%)`;

  const luminance = hex => {
    const c = [1, 3, 5].map(i => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };

  const set = (k, v) => root.style.setProperty(k, v);

  /* ---------- apply colours + mode ---------- */
  let currentMode = "light";

  function applyColor(hex, mode, bgOverride) {
    currentMode = mode;
    const [h, s, l] = hexToHsl(hex);
    const sat = Math.max(s, 40);
    const dark = mode === "dark";

    root.dataset.mode = mode;
    root.style.colorScheme = dark ? "dark" : "light";

    set("--accent", hex);
    set("--on-accent", luminance(hex) > 0.4 ? "#1d1b20" : "#ffffff");
    set("--accent-text", dark ? hsl(h, Math.max(s, 55), 68) : hsl(h, sat, Math.min(l - 10, 38)));

    if (dark) {
      set("--bg", hsl(h, 8, 7));
      set("--bg-2", hsl(h, 8, 9));
      set("--surface", hsl(h, 8, 12));
      set("--surface-2", hsl(h, 8, 15));
      set("--text", "#f4f1ec");
      set("--muted", "#a9a3b0");
      set("--line", hsl(h, 8, 24));
      set("--field-line", hsl(h, 8, 30));
      set("--soft-1", hsl(h, 30, 22));
      set("--soft-2", hsl(h + 50, 28, 21));
      set("--soft-3", hsl(h + 160, 24, 20));
      set("--soft-4", hsl(h + 260, 28, 23));
    } else {
      set("--bg", bgOverride || hsl(h, 70, 96));
      set("--bg-2", hsl(h, 60, 98));
      set("--surface", "#ffffff");
      set("--surface-2", "#fffdfa");
      set("--text", "#29252e");
      set("--muted", "#6e6873");
      set("--line", hsl(h, 30, 88));
      set("--field-line", hsl(h, 15, 82));
      set("--soft-1", hsl(h, 80, 88));
      set("--soft-2", hsl(h + 50, 75, 86));
      set("--soft-3", hsl(h + 160, 45, 86));
      set("--soft-4", hsl(h + 260, 60, 90));
    }

    set("--shape-1", hsl(h + 50, 85, dark ? 58 : 65));
    set("--shape-2", hsl(h + 260, 55, dark ? 62 : 70));
    set("--shape-3", hsl(h + 160, 40, dark ? 55 : 60));

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim());
  }

  /* ---------- apply fonts, frames, shapes ---------- */
  function applyStyle(p) {
    set("--font-head", p.head);
    set("--font-body", p.body);
    set("--img-border", p.imgBorder);
    set("--img-radius", p.imgRadius);
    set("--img-radius-flat", p.flat);
    set("--card-border", p.card);
    set("--radius", p.radius);
    set("--btn-radius", p.btn);
  }

  /* ---------- storage ---------- */
  const save = data => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
  /* ---------- UI (built here if missing from the HTML) ---------- */
  let box = document.getElementById("theme-switcher");
  if (!box) {
    box = document.createElement("div");
    box.id = "theme-switcher";
    box.className = "theme-switcher";
    box.innerHTML = `
      <button class="theme-toggle" id="theme-toggle" type="button"
              aria-expanded="false" aria-controls="theme-panel"
              aria-label="Customise theme">🎨</button>
      <div class="theme-panel" id="theme-panel" hidden>
        <p class="theme-title">Pick your vibe</p>
        <div class="theme-presets" id="theme-presets"></div>
        <label class="theme-custom" for="theme-color">
          <span>Custom colour</span>
          <input type="color" id="theme-color" value="#f16d59">
        </label>
        <button class="theme-reset" id="theme-reset" type="button">Reset</button>
      </div>`;
    document.body.appendChild(box);
  }

  // Inline styles so the button stays visible even if the stylesheet is cached or overridden.
  Object.assign(box.style, {
    position: "fixed", right: "18px", bottom: "18px",
    zIndex: "2147483000", display: "flex", visibility: "visible", opacity: "1"
  });

  const toggle = document.getElementById("theme-toggle");
  const panel = document.getElementById("theme-panel");
  const presetBox = document.getElementById("theme-presets");
  const picker = document.getElementById("theme-color");
  const resetBtn = document.getElementById("theme-reset");
  if (!toggle || !panel || !presetBox || !picker) return;

  function markActive(name) {
    presetBox.querySelectorAll(".theme-swatch").forEach(b =>
      b.setAttribute("aria-pressed", String(b.dataset.theme === name)));
  }

  function applyPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    applyStyle(p);
    applyColor(p.color, p.mode, p.bg);
    picker.value = p.color;
    markActive(name);
    save({ preset: name });
  }

  function applyCustom(hex) {
    // Keeps the current preset's fonts, frame, corners and mode; changes the colour only.
    applyColor(hex, currentMode);
    markActive(null);
    const saved = load() || {};
    save({ preset: saved.preset || "coral", custom: hex });
  }

  Object.entries(PRESETS).forEach(([name, p]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "theme-swatch";
    b.dataset.theme = name;
    b.title = p.label;
    b.setAttribute("aria-label", p.label + " theme");
    b.setAttribute("aria-pressed", "false");
    b.style.background = p.swatch || p.color;
    b.addEventListener("click", () => applyPreset(name));
    presetBox.appendChild(b);
  });

  toggle.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", e => {
    if (!panel.hidden && !e.target.closest("#theme-switcher")) {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !panel.hidden) {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });

  picker.addEventListener("input", e => applyCustom(e.target.value));

  resetBtn.addEventListener("click", () => {
    try { localStorage.removeItem(KEY); } catch (err) {}
    applyPreset("coral");
  });

  /* ---------- restore saved theme ---------- */
  const saved = load();
  if (saved && PRESETS[saved.preset]) {
    applyPreset(saved.preset);
    if (saved.custom) {
      picker.value = saved.custom;
      applyCustom(saved.custom);
    }
  } else {
    applyPreset("coral");
  }
})();