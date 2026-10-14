const { sendAdminEmail } = require("../config/mailer");
const { validateAppointmentPayload } = require("../utils/validation");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const htmlEntities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return htmlEntities[character];
  });
}

function formatDisplayDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function getWhatsAppNumber() {
  return String(process.env.WHATSAPP_NUMBER || "").replace(/\D/g, "") || "919555744498";
}

async function submitAppointment(request, response) {
  const { errors, sanitizedData } = validateAppointmentPayload(request.body);

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }

  const formattedDate = formatDisplayDate(sanitizedData.date);
  const subject = `New Appointment Request from ${sanitizedData.name}`;
  const text = [
    "A new appointment request was submitted from the website.",
    `Name: ${sanitizedData.name}`,
    `Phone: ${sanitizedData.phone}`,
    `Email: ${sanitizedData.email}`,
    `Appointment Date: ${formattedDate}`,
    `Time Slot: ${sanitizedData.timeSlot}`,
    `Problem Description: ${sanitizedData.problemDescription}`
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #123126; line-height: 1.6;">
      <h2 style="margin-bottom: 12px; color: #0c6a4a;">New Appointment Request</h2>
      <p>A patient submitted a new appointment request from the website.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #d9ebe2;"><strong>Name</strong></td>
          <td style="padding: 10px; border: 1px solid #d9ebe2;">${escapeHtml(sanitizedData.name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #d9ebe2;"><strong>Phone</strong></td>
          <td style="padding: 10px; border: 1px solid #d9ebe2;">${escapeHtml(sanitizedData.phone)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #d9ebe2;"><strong>Email</strong></td>
          <td style="padding: 10px; border: 1px solid #d9ebe2;">${escapeHtml(sanitizedData.email)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #d9ebe2;"><strong>Appointment Date</strong></td>
          <td style="padding: 10px; border: 1px solid #d9ebe2;">${escapeHtml(formattedDate)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #d9ebe2;"><strong>Time Slot</strong></td>
          <td style="padding: 10px; border: 1px solid #d9ebe2;">${escapeHtml(sanitizedData.timeSlot)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #d9ebe2;"><strong>Problem Description</strong></td>
          <td style="padding: 10px; border: 1px solid #d9ebe2; white-space: pre-line;">${escapeHtml(sanitizedData.problemDescription)}</td>
        </tr>
      </table>
    </div>
  `;

  try {
    // Send the booking details to the clinic email configured in .env.
    await sendAdminEmail({
      subject,
      text,
      html,
      replyTo: sanitizedData.email
    });

    return response.status(200).json({
      success: true,
      message: "Appointment request sent successfully.",
      appointment: sanitizedData,
      whatsappNumber: getWhatsAppNumber()
    });
  } catch (error) {
    console.error("Appointment email error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to send the appointment email. Please check your Gmail App Password settings."
    });
  }
}

module.exports = {
  submitAppointment
};
