const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

const appointmentRoutes = require("./routes/appointmentRoutes");
const contactRoutes = require("./routes/contactRoutes");

dotenv.config({
  path: path.resolve(__dirname, "..", ".env")
});

const app = express();
const PORT = process.env.PORT || 5000;
const clientPath = path.resolve(__dirname, "..", "client");
const pageRoutes = {
  "/about": "about.html",
  "/services": "services.html",
  "/appointment": "appointment.html",
  "/contact": "contact.html"
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend files directly from the Express server.
app.use(express.static(clientPath));

app.get("/api/health", (request, response) => {
  response.status(200).json({
    success: true,
    message: "Server is running successfully."
  });
});

app.use("/api", appointmentRoutes);
app.use("/api", contactRoutes);

Object.entries(pageRoutes).forEach(([route, fileName]) => {
  app.get(route, (request, response) => {
    response.sendFile(path.join(clientPath, fileName));
  });
});

app.use("/api", (request, response) => {
  response.status(404).json({
    success: false,
    message: "API route not found."
  });
});

app.get(/^(?!\/api).*/, (request, response) => {
  response.sendFile(path.join(clientPath, "index.html"));
});

// Basic global error handler for unexpected runtime issues.
app.use((error, request, response, next) => {
  console.error("Unexpected server error:", error);

  response.status(500).json({
    success: false,
    message: "An unexpected server error occurred."
  });
});

app.listen(PORT, () => {
  console.log(`Ayurveda clinic website running at http://localhost:${PORT}`);
});
