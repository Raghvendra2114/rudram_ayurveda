const express = require("express");
const { submitContactMessage } = require("../controllers/contactController");

const router = express.Router();

router.post("/contact", submitContactMessage);

module.exports = router;
