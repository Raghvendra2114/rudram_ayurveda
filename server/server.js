const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const appointmentRoutes = require("./routes/appointmentRoutes");
const contactRoutes = require("./routes/contactRoutes");

dotenv.config({
  path: path.resolve(__dirname, "..", ".env")
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const clientPath = path.resolve(__dirname, "..", "client");

const pageRoutes = {
  "/about": "about.html",
  "/services": "services.html",
  "/appointment": "appointment.html",
  "/contact": "contact.html"
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(clientPath));

// Health check API
app.get("/api/health", (request, response) => {
  response.status(200).json({
    success: true,
    message: "Server is running successfully."
  });
});

// API routes
app.use("/api", appointmentRoutes);
app.use("/api", contactRoutes);

// Multi-page routes
Object.entries(pageRoutes).forEach(([route, fileName]) => {
  app.get(route, (request, response) => {
    response.sendFile(path.join(clientPath, fileName));
  });
});

// API 404 handler
app.use("/api", (request, response) => {
  response.status(404).json({
    success: false,
    message: "API route not found."
  });
});

// Fallback route
app.get(/^(?!\/api).*/, (request, response) => {
  response.sendFile(path.join(clientPath, "index.html"));
});

// Global error handler
app.use((error, request, response, next) => {
  console.error("Unexpected server error:", error);

  response.status(500).json({
    success: false,
    message: "An unexpected server error occurred."
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Ayurveda clinic website running at http://localhost:${PORT}`);
});