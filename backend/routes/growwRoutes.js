
const express = require("express");
const router = express.Router();

const {
  getProfile,
  getQuote,
} = require("../controllers/growwController");

router.get("/profile", getProfile);
router.get("/quote", getQuote);

module.exports = router;
