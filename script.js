"use strict";

// Replace with the artist's WhatsApp number.
// Country code + number; digits only. No +, spaces or dashes.
const ARTIST_WHATSAPP = "91XXXXXXXXXX";

const form = document.querySelector("#enquiry-form");
const message = document.querySelector("#form-message");
const serviceSelect = document.querySelector("#enquiry-type");
const dateInput = document.querySelector("#preferred-date");
const phoneInput = document.querySelector("#customer-phone");

// Footer year
const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* ---------- Prefill service from a service card ---------- */

document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    if (serviceSelect) {
      serviceSelect.value = link.dataset.service;
    }
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

// Accepts 98765 43210, +91 98765 43210, or 098765 43210.
function normaliseIndianMobile(raw) {
  let digits = String(raw || "").replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

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

function showMessage(text, type = "") {
  if (!message) return;

  message.textContent = text;
  message.className = `form-message ${type}`.trim();
}

/* ---------- Form availability ---------- */

// Safely stop if this page does not contain the enquiry form.
if (form && dateInput && phoneInput) {
  /* ---------- Live validation ---------- */

  dateInput.min = getLocalDateString();

  function validateDate() {
    dateInput.min = getLocalDateString();

    const isPast =
      dateInput.value &&
      dateInput.value < getLocalDateString();

    dateInput.setCustomValidity(
      isPast ? "Please choose today or a future date." : ""
    );
  }

  function validatePhone() {
    const valid = normaliseIndianMobile(phoneInput.value);

    phoneInput.setCustomValidity(
      valid
        ? ""
        : "Please enter a valid 10-digit Indian mobile number."
    );
  }

  dateInput.addEventListener("input", validateDate);
  dateInput.addEventListener("change", validateDate);
  phoneInput.addEventListener("input", validatePhone);

  // Show field error styling only after the visitor has interacted.
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => {
      field.classList.add("touched");
    });
  });

  /* ---------- Submit enquiry ---------- */

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    showMessage("");

    validateDate();
    validatePhone();

    if (!form.reportValidity()) {
      form.querySelectorAll("input, select, textarea").forEach((field) => {
        field.classList.add("touched");
      });

      return;
    }

    // Check that the artist's WhatsApp number is configured.
    if (!/^91\d{10}$/.test(ARTIST_WHATSAPP)) {
      showMessage(
        "The artist's WhatsApp number has not been configured yet.",
        "error"
      );
      return;
    }

    const data = new FormData(form);
    const mobile = normaliseIndianMobile(data.get("phone"));
    const location = String(data.get("location") || "").trim();
    const state = String(data.get("state") || "").trim();
    const details = String(data.get("details") || "").trim();

    const cityAndState = [location, state]
      .filter(Boolean)
      .join(", ");

    const enquiryText = [
      "Hello Indhuja Artistry! 👋",
      "I would like to enquire about your services.",
      "",
      `*Name:* ${String(data.get("name") || "").trim()}`,
      `*Mobile Number:* +91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`,
      `*Looking for:* ${data.get("type") || "Not specified"}`,
      `*Date:* ${formatDate(String(data.get("date") || ""))}`,
      `*Location and City:* ${cityAndState || "Not specified"}`,
      `*Tell us more:* ${details || "No additional details"}`,
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
}