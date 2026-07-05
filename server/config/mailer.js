const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendAdminEmail(mailOptions) {
  return transporter.sendMail({
    from: `"Rudram Ayurveda" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    ...mailOptions
  });
}

module.exports = {
  sendAdminEmail
};