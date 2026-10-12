"use strict";

// Replace this with the artist's WhatsApp number.
// Use country code + number, digits only; no +, spaces or dashes.
const ARTIST_WHATSAPP = "91XXXXXXXXXX";

const form = document.querySelector("#enquiry-form");
const message = document.querySelector("#form-message");
const serviceSelect = document.querySelector("#enquiry-type");
const dateInput = document.querySelector("#preferred-date");
const phoneInput = document.querySelector("#customer-phone");

// Footer year
document.querySelector("#year").textContent = new Date().getFullYear();

/* ---------- Gallery filter ---------- */
const filterButtons = document.querySelectorAll(".filter");
const galleryEmpty = document.querySelector("#gallery-empty");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    // Read the cards at click time, because gallery.js builds them from gallery-data.js
    let visibleCount = 0;

    document.querySelectorAll(".gallery-item").forEach((item) => {
      const matches =
        selectedCategory === "all" ||
        item.dataset.category === selectedCategory ||
        (selectedCategory === "video" && item.dataset.type === "video");

      item.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    if (galleryEmpty) galleryEmpty.hidden = visibleCount > 0;
  });

  button.setAttribute(
    "aria-pressed",
    String(button.classList.contains("active"))
  );
});

/* ---------- Prefill service from a service card ---------- */
document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    serviceSelect.value = link.dataset.service;
  });
});

/* ---------- Helpers ---------- */
function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Turns whatever the visitor typed into a clean 10-digit Indian mobile number,
// or returns "" if it is not valid. Accepts 98765 43210, +91 98765 43210, 098765 43210.
function normaliseIndianMobile(raw) {
  let digits = String(raw).replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);

  return /^[6-9]\d{9}$/.test(digits) ? digits : "";
}

function formatDate(isoDate) {
  if (!isoDate) return "Flexible / not decided yet";

  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `form-message ${type || ""}`.trim();
}

/* ---------- Live validation ---------- */

// Past dates are blocked in the picker AND checked again here,
// because typing a date by hand can bypass the picker's minimum.
dateInput.min = getLocalDateString();

function validateDate() {
  dateInput.min = getLocalDateString(); // stays correct if the page stays open past midnight
  const isPast = dateInput.value && dateInput.value < getLocalDateString();

  dateInput.setCustomValidity(
    isPast ? "Please choose today or a future date." : ""
  );
}

function validatePhone() {
  const valid = normaliseIndianMobile(phoneInput.value);

  phoneInput.setCustomValidity(
    valid ? "" : "Please enter a valid 10-digit Indian mobile number."
  );
}

dateInput.addEventListener("input", validateDate);
dateInput.addEventListener("change", validateDate);
phoneInput.addEventListener("input", validatePhone);

// Red borders only after a field has been visited
form.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("blur", () => field.classList.add("touched"));
});

/* ---------- Submit ---------- */
form.addEventListener("submit", (event) => {
  event.preventDefault();
  showMessage("");

  validateDate();
  validatePhone();

  if (!form.reportValidity()) {
    form.querySelectorAll("input, select, textarea").forEach((field) =>
      field.classList.add("touched")
    );
    return;
  }

  // Configure the artist's real number before publishing.
  if (!/^91\d{10}$/.test(ARTIST_WHATSAPP)) {
    showMessage("The artist's WhatsApp number has not been configured yet.", "error");
    return;
  }

  const data = new FormData(form);
  const mobile = normaliseIndianMobile(data.get("phone"));
  const cityAndState = `${data.get("location").trim()}, ${data.get("state")}`;

  const enquiryText = [
    "Hello Indhuja Artistry! 👋",
    "I would like to enquire about your services.",
    "",
    `*Name:* ${data.get("name").trim()}`,
    `*Mobile Number:* +91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`,
    `*Looking for:* ${data.get("type")}`,
    `*Date:* ${formatDate(data.get("date"))}`,
    `*Location and City:* ${cityAndState}`,
    `*Tell us more:* ${data.get("details").trim()}`,
    "",
    "_Note: I understand that transport and accommodation will be arranged by me (the client)._",
    "",
    "Thank you!"
  ].join("\n");

  const whatsappURL =
    `https://wa.me/${ARTIST_WHATSAPP}?text=${encodeURIComponent(enquiryText)}`;

  showMessage(
    "WhatsApp is opening. Please review your message and press Send to submit your enquiry.",
    "ok"
  );

  // The customer must press Send in WhatsApp.
  window.location.href = whatsappURL;
});
