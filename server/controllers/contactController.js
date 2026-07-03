const { sendAdminEmail } = require("../config/mailer");
const { validateContactPayload } = require("../utils/validation");

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

async function submitContactMessage(request, response) {
  const { errors, sanitizedData } = validateContactPayload(request.body);

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }

  const subject = `New Contact Message from ${sanitizedData.name}`;
  const text = [
    "A new contact message was submitted from the website.",
    `Name: ${sanitizedData.name}`,
    `Email: ${sanitizedData.email}`,
    `Message: ${sanitizedData.message}`
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #123126; line-height: 1.6;">
      <h2 style="margin-bottom: 12px; color: #0c6a4a;">New Contact Message</h2>
      <p>A visitor submitted a new contact form message.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #d9ebe2;"><strong>Name</strong></td>
          <td style="padding: 10px; border: 1px solid #d9ebe2;">${escapeHtml(sanitizedData.name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #d9ebe2;"><strong>Email</strong></td>
          <td style="padding: 10px; border: 1px solid #d9ebe2;">${escapeHtml(sanitizedData.email)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #d9ebe2;"><strong>Message</strong></td>
          <td style="padding: 10px; border: 1px solid #d9ebe2; white-space: pre-line;">${escapeHtml(sanitizedData.message)}</td>
        </tr>
      </table>
    </div>
  `;

  try {
    // Route contact form messages to the same admin inbox for simplicity.
    await sendAdminEmail({
      subject,
      text,
      html,
      replyTo: sanitizedData.email
    });

    return response.status(200).json({
      success: true,
      message: "Contact message sent successfully."
    });
  } catch (error) {
    console.error("Contact email error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to send the contact email. Please check your Gmail App Password settings."
    });
  }
}

module.exports = {
  submitContactMessage
};
