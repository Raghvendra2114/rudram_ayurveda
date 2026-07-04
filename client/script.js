const API_BASE = "https://rudram-ayurveda-api.onrender.com";
const DEFAULT_WHATSAPP_NUMBER = "919555744498";
let clinicWhatsAppNumber = DEFAULT_WHATSAPP_NUMBER;

const appointmentSlots = [
  "09:00 AM - 10:00 AM",
  "10:30 AM - 11:30 AM",
  "12:00 PM - 01:00 PM",
  "03:00 PM - 04:00 PM",
  "05:00 PM - 06:00 PM"
];

document.addEventListener("DOMContentLoaded", () => {
  initializeYear();
  initializeNavigation();
  initializeCurrentPage();
  initializeScrollState();
  initializeRevealAnimation();
  initializeFloatingFields();
  initializeDateInput();
  initializeWhatsAppLinks();
  initializeAppointmentForm();
  initializeContactForm();
  initializeModal();
});

function initializeYear() {
  const yearNode = document.getElementById("current-year");

  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
}

function initializeNavigation() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link, .nav-cta");

  if (!navToggle || !navMenu) {
    return;
  }

  const closeNavigationMenu = () => {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");

    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeNavigationMenu();
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNav = event.target.closest(".nav-shell");

    if (!clickedInsideNav && navMenu.classList.contains("is-open")) {
      closeNavigationMenu();
    }
  });

  window.addEventListener("resize", debounce(() => {
    if (window.innerWidth >= 900) {
      closeNavigationMenu();
    }
  }, 120));
}

function initializeCurrentPage() {
  const currentPage = document.body.dataset.page;
  const navLinks = document.querySelectorAll(".nav-link[data-nav]");

  navLinks.forEach((link) => {
    const isCurrentPage = link.dataset.nav === currentPage;

    link.classList.toggle("current-page", isCurrentPage);

    if (isCurrentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function initializeScrollState() {
  let isTicking = false;

  const updateScrolledState = () => {
    document.body.classList.toggle("is-scrolled", window.scrollY > 12);
    isTicking = false;
  };

  const requestScrolledStateUpdate = () => {
    if (isTicking) {
      return;
    }

    isTicking = true;
    window.requestAnimationFrame(updateScrolledState);
  };

  updateScrolledState();
  window.addEventListener("scroll", requestScrolledStateUpdate, { passive: true });
}

function initializeRevealAnimation() {
  const revealElements = document.querySelectorAll("[data-reveal]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal immediately when animations are disabled or unsupported.
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function initializeFloatingFields() {
  const fieldShells = document.querySelectorAll(".field-shell");

  fieldShells.forEach((shell) => {
    const field = shell.querySelector("input, select, textarea");

    if (!field) {
      return;
    }

    const updateState = () => {
      shell.classList.toggle("is-filled", hasFieldValue(field));
    };

    field.addEventListener("focus", () => {
      shell.classList.add("is-focused");
    });

    field.addEventListener("blur", () => {
      shell.classList.remove("is-focused");
      updateState();
    });

    field.addEventListener("input", updateState);
    field.addEventListener("change", updateState);

    updateState();
  });
}

function refreshFloatingFieldStates() {
  const fieldShells = document.querySelectorAll(".field-shell");

  fieldShells.forEach((shell) => {
    const field = shell.querySelector("input, select, textarea");

    if (!field) {
      return;
    }

    shell.classList.toggle("is-filled", hasFieldValue(field));
  });
}

function hasFieldValue(field) {
  if (field.tagName === "SELECT") {
    return field.value !== "";
  }

  return field.value.trim() !== "";
}

function initializeDateInput() {
  const dateInput = document.getElementById("appointment-date");

  if (!dateInput) {
    return;
  }

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().split("T")[0];
}

function initializeWhatsAppLinks() {
  const links = document.querySelectorAll("[data-whatsapp-link]");

  links.forEach((link) => {
    const customMessage =
      link.dataset.message || "Hello Doctor, I would like to connect with your clinic.";

    link.href = buildGeneralWhatsAppLink(customMessage);
  });
}

function initializeAppointmentForm() {
  const form = document.getElementById("appointment-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Keep the data contract unchanged so the backend continues to work.
    const formData = getTrimmedFormData(form);
    const errors = validateAppointment(formData);

    if (errors.length > 0) {
      showToast(errors[0], "error");
      return;
    }

    const submitButton = form.querySelector(".submit-btn");
    setButtonLoading(submitButton, true);

    try {
      const response = await fetch(`${API_BASE}/appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to send your appointment request.");
      }

      const appointmentData = result.appointment || formData;
      clinicWhatsAppNumber = normalizePhone(result.whatsappNumber) || clinicWhatsAppNumber;
      const whatsappLink = buildBookingWhatsAppLink(appointmentData, clinicWhatsAppNumber);

      showToast(result.message || "Appointment request sent successfully.", "success");
      openBookingModal(appointmentData, whatsappLink);
      openWhatsAppConfirmation(whatsappLink);
      form.reset();
      initializeDateInput();
      window.requestAnimationFrame(refreshFloatingFieldStates);
    } catch (error) {
      showToast(error.message || "Something went wrong while sending your booking.", "error");
    } finally {
      setButtonLoading(submitButton, false);
    }
  });
}

function initializeContactForm() {
  const form = document.getElementById("contact-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = getTrimmedFormData(form);
    const errors = validateContact(formData);

    if (errors.length > 0) {
      showToast(errors[0], "error");
      return;
    }

    const submitButton = form.querySelector(".submit-btn");
    setButtonLoading(submitButton, true);

    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to send your message.");
      }

      showToast(result.message || "Message sent successfully.", "success");
      form.reset();
      window.requestAnimationFrame(refreshFloatingFieldStates);
    } catch (error) {
      showToast(error.message || "Something went wrong while sending your message.", "error");
    } finally {
      setButtonLoading(submitButton, false);
    }
  });
}

function initializeModal() {
  const modal = document.getElementById("booking-modal");
  const closeButtons = document.querySelectorAll("[data-close-modal]");

  if (!modal) {
    return;
  }

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeBookingModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeBookingModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeBookingModal();
    }
  });
}

function getTrimmedFormData(form) {
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    data[key] = typeof value === "string" ? value.trim() : value;
  }

  return data;
}

function validateAppointment(data) {
  const errors = [];
  const phoneDigits = normalizePhone(data.phone);

  if (!data.name || data.name.length < 2) {
    errors.push("Please enter a valid name.");
  }

  if (!phoneDigits || phoneDigits.length < 10 || phoneDigits.length > 15) {
    errors.push("Please enter a valid phone number.");
  }

  if (!isValidEmail(data.email)) {
    errors.push("Please enter a valid email address.");
  }

  if (!data.date || isPastDate(data.date)) {
    errors.push("Please choose today or a future date.");
  }

  if (!appointmentSlots.includes(data.timeSlot)) {
    errors.push("Please choose a valid appointment time slot.");
  }

  if (!data.problemDescription || data.problemDescription.length < 10) {
    errors.push("Please describe your health concern in at least 10 characters.");
  }

  return errors;
}

function validateContact(data) {
  const errors = [];

  if (!data.name || data.name.length < 2) {
    errors.push("Please enter a valid name.");
  }

  if (!isValidEmail(data.email)) {
    errors.push("Please enter a valid email address.");
  }

  if (!data.message || data.message.length < 10) {
    errors.push("Please write a message with at least 10 characters.");
  }

  return errors;
}

function setButtonLoading(button, isLoading) {
  if (!button) {
    return;
  }

  button.classList.toggle("is-loading", isLoading);
  button.disabled = isLoading;
}

function showToast(message, type = "success") {
  const toastStack = document.getElementById("toast-stack");

  if (!toastStack) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastStack.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3600);
}

function openBookingModal(bookingData, whatsappLink = buildBookingWhatsAppLink(bookingData)) {
  const modal = document.getElementById("booking-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const confirmButton = document.getElementById("confirm-whatsapp-btn");

  if (!modal || !modalTitle || !modalMessage || !confirmButton) {
    return;
  }

  const formattedDate = formatDate(bookingData.date);

  modalTitle.textContent = `Thank you, ${bookingData.name}!`;
  modalMessage.textContent = `Your appointment request for ${formattedDate} at ${bookingData.timeSlot} has been emailed to the clinic. You can now confirm it on WhatsApp.`;
  confirmButton.href = whatsappLink;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeBookingModal() {
  const modal = document.getElementById("booking-modal");

  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

function openWhatsAppConfirmation(whatsappLink) {
  const popup = window.open(whatsappLink, "_blank", "noopener,noreferrer");

  if (!popup) {
    showToast(
      "Appointment submitted. If WhatsApp did not open automatically, use the confirmation button.",
      "success"
    );
  }
}

function buildGeneralWhatsAppLink(message, whatsappNumber = clinicWhatsAppNumber) {
  const targetNumber = normalizePhone(whatsappNumber) || DEFAULT_WHATSAPP_NUMBER;

  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
}

function buildBookingWhatsAppLink(bookingData, whatsappNumber = clinicWhatsAppNumber) {
  const message = [
    "Hello Doctor, I have booked an appointment.",
    `Name: ${bookingData.name}`,
    `Phone: ${bookingData.phone}`,
    `Date: ${formatDate(bookingData.date)}`,
    `Time: ${bookingData.timeSlot}`,
    `Problem: ${bookingData.problemDescription}`
  ].join("\n");

  return buildGeneralWhatsAppLink(message, whatsappNumber);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function normalizePhone(value) {
  return (value || "").replace(/\D/g, "");
}

function debounce(callback, delay = 120) {
  let timeoutId;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

function isPastDate(dateString) {
  const selectedDate = new Date(`${dateString}T00:00:00`);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return selectedDate < today;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
}
