const axios = require("axios");

async function sendAdminEmail(mailOptions) {
  const payload = {
    sender: {
      name: "Rudram Ayurveda",
      email: process.env.EMAIL_USER
    },

    to: [
      {
        email: process.env.EMAIL_USER
      }
    ],

    subject: mailOptions.subject,

    htmlContent: mailOptions.html,

    textContent: mailOptions.text
  };

  return axios.post(
    "https://api.brevo.com/v3/smtp/email",
    payload,
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );
}

module.exports = {
  sendAdminEmail
};