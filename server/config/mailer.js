const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
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