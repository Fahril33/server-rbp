const express = require("express");
const router = express.Router();

// Rute untuk mengecek status server
router.get("/", (req, res) => {
  res.status(200).json({ message: "Server is up and running!" });
});

module.exports = router;
