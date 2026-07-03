const express = require("express");
const { submitAppointment } = require("../controllers/appointmentController");

const router = express.Router();

router.post("/appointment", submitAppointment);

module.exports = router;
