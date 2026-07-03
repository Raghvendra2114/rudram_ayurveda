const nodemailer = require("nodemailer");

function createTransporter() {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASS in .env");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
}

async function sendAdminEmail({ subject, text, html, replyTo }) {
  const transporter = createTransporter();

  return transporter.sendMail({
    from: `"Ayurveda Website" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo,
    subject,
    text,
    html
  });
}

module.exports = {
  sendAdminEmail
};
