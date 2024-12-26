const express = require("express");
const Stocks = require("../models/stocks");

const router = express.Router();

// Rute untuk mendapatkan semua data stocks
router.get("/", async (req, res) => {
  try {
    const stocks = await Stocks.find();
    res.json(stocks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk menambahkan data stocks
router.post("/", async (req, res) => {
  const {
    date,
    initial_stock,
    additional_stock,
    bonus_stock,
    spoiled_stock,
    sold_stock,
    total_stock,
    remaining_stock,
  } = req.body;

  try {
    const stocks = new Stocks({
      date,
      initial_stock,
      additional_stock,
      bonus_stock,
      spoiled_stock,
      sold_stock,
      total_stock,
      remaining_stock,
    });
    await stocks.save();
    res.json(stocks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk mengupdate data stocks berdasarkan tanggal
router.put("/date/:date", async (req, res) => {
  const { date } = req.params;
  const updateData = req.body;

  try {
    const data = await Stocks.findOneAndUpdate({ date: date }, updateData, {
      new: true,
    });
    if (!data) {
      return res.status(404).json({ msg: "Data not found" });
    }
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk menghapus data stocks berdasarkan tanggal
router.delete("/date/:date", async (req, res) => {
  const { date } = req.params;

  try {
    const data = await Stocks.findOneAndDelete({ date: date });
    if (!data) {
      return res.status(404).json({ msg: "Data not found" });
    }
    res.json({ msg: "Data deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
