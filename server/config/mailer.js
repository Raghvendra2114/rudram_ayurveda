const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // FORCE IPv4 FIX
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
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