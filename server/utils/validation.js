const APPOINTMENT_SLOTS = new Set([
  "09:00 AM - 10:00 AM",
  "10:30 AM - 11:30 AM",
  "12:00 PM - 01:00 PM",
  "03:00 PM - 04:00 PM",
  "05:00 PM - 06:00 PM"
]);

function sanitizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ");
}

function sanitizeMultilineText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\r\n/g, "\n");
}

function normalizePhone(value) {
  return sanitizeText(value).replace(/\D/g, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidFutureOrTodayDate(dateString) {
  if (!dateString) {
    return false;
  }

  const selectedDate = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(selectedDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  return selectedDate >= today;
}

function validateAppointmentPayload(payload) {
  // Sanitize values first so validation works on clean, predictable input.
  const sanitizedData = {
    name: sanitizeText(payload.name),
    phone: normalizePhone(payload.phone),
    email: sanitizeText(payload.email).toLowerCase(),
    date: sanitizeText(payload.date),
    timeSlot: sanitizeText(payload.timeSlot),
    problemDescription: sanitizeMultilineText(payload.problemDescription)
  };

  const errors = [];

  if (!sanitizedData.name || sanitizedData.name.length < 2) {
    errors.push("Please enter a valid name.");
  }

  if (!sanitizedData.phone || sanitizedData.phone.length < 10 || sanitizedData.phone.length > 15) {
    errors.push("Please enter a valid phone number.");
  }

  if (!isValidEmail(sanitizedData.email)) {
    errors.push("Please enter a valid email address.");
  }

  if (!isValidFutureOrTodayDate(sanitizedData.date)) {
    errors.push("Please choose today or a future date.");
  }

  if (!APPOINTMENT_SLOTS.has(sanitizedData.timeSlot)) {
    errors.push("Please choose a valid appointment time slot.");
  }

  if (!sanitizedData.problemDescription || sanitizedData.problemDescription.length < 10) {
    errors.push("Please describe the health concern in at least 10 characters.");
  }

  return {
    errors,
    sanitizedData
  };
}

function validateContactPayload(payload) {
  const sanitizedData = {
    name: sanitizeText(payload.name),
    email: sanitizeText(payload.email).toLowerCase(),
    message: sanitizeMultilineText(payload.message)
  };

  const errors = [];

  if (!sanitizedData.name || sanitizedData.name.length < 2) {
    errors.push("Please enter a valid name.");
  }

  if (!isValidEmail(sanitizedData.email)) {
    errors.push("Please enter a valid email address.");
  }

  if (!sanitizedData.message || sanitizedData.message.length < 10) {
    errors.push("Please enter a message with at least 10 characters.");
  }

  return {
    errors,
    sanitizedData
  };
}

module.exports = {
  validateAppointmentPayload,
  validateContactPayload
};
