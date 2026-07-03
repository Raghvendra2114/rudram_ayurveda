# Ayurveda Clinic Website

A complete beginner-friendly Ayurvedic doctor website built with:

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- Nodemailer

## Features

- Futuristic glassmorphism UI
- Fully responsive mobile-first layout
- Hero, About, Services, Why Choose Us, Appointment, Contact, and Footer sections
- WhatsApp click-to-chat links using `wa.me`
- Appointment form with email notification
- Contact form with email notification
- Frontend and backend validation
- Loading states, toast notifications, and success popup
- Smooth scrolling and reveal animations
- SEO-friendly meta tags

## Project Structure

```text
/client
  index.html
  about.html
  services.html
  appointment.html
  contact.html
  style.css
  script.js
  /assets/images

/server
  server.js
  /routes
  /controllers
  /config
  /utils

.env
```

## 1. Install Node.js

1. Download Node.js LTS from the official Node.js website.
2. Install it using the default setup options.
3. Confirm the installation in your terminal:

```bash
node -v
npm -v
```

## 2. Install Project Dependencies

Open a terminal in this project folder and run:

```bash
npm install
```

## 3. Configure Gmail App Password

Gmail blocks normal passwords for Nodemailer, so use an App Password.

1. Sign in to your Gmail account.
2. Turn on 2-Step Verification in your Google account security settings.
3. Open the App Passwords page in your Google account.
4. Create a new app password for Mail.
5. Copy the generated 16-character password.
6. Update the `.env` file:

```env
PORT=5000
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_16_character_app_password
```

Important:

- `EMAIL_USER` should be the Gmail address that receives notifications.
- `EMAIL_PASS` must be the App Password, not your normal Gmail password.

## 4. Run the Website

For normal start:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

Then open:

```text
http://localhost:5000
```

Available pages:

- `/`
- `/about`
- `/services`
- `/appointment`
- `/contact`

## 5. What the Forms Do

- Appointment form:
  - Sends booking details to the Express backend
  - Backend emails the clinic admin using Nodemailer
  - Shows a success popup
  - Generates a dynamic WhatsApp confirmation link

- Contact form:
  - Sends the message to the backend
  - Backend emails the clinic admin using Nodemailer
  - Shows a success or error toast

## 6. Customize the Website

Replace these values when you are ready:

- Doctor name in `client/index.html`
- Clinic phone number and WhatsApp number in `client/script.js`
- Clinic address, email, and footer links in `client/index.html`
- Gmail credentials in `.env`

## 7. Troubleshooting

- If emails are not sent:
  - Check the `.env` values
  - Make sure 2-Step Verification is enabled
  - Make sure you used a Gmail App Password

- If the page does not load:
  - Confirm `npm install` completed successfully
  - Confirm the server is running on port `5000`

- If WhatsApp opens the wrong chat:
  - Update the `WHATSAPP_NUMBER` constant in `client/script.js`
