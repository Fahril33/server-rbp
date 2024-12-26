const express = require("express");
const Finance = require("../models/finance");

const router = express.Router();

// Rute untuk mendapatkan semua data finance
router.get("/", async (req, res) => {
  try {
    const finances = await Finance.find();
    res.json(finances);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk menambahkan data finance
router.post("/", async (req, res) => {
  const {
    date,
    in_cash,
    in_debit,
    out_cash,
    out_debit,
    total_cash,
    total_debit,
    cash_to_debit,
    debit_to_cash,
  } = req.body;

  try {
    const finance = new Finance({
      date,
      in_cash,
      in_debit,
      out_cash,
      out_debit,
      total_cash,
      total_debit,
      cash_to_debit,
      debit_to_cash,
    });
    await finance.save();
    res.json(finance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk mengupdate data finance berdasarkan tanggal
router.put("/date/:date", async (req, res) => {
  const { date } = req.params;
  const updateData = req.body;

  try {
    const data = await Finance.findOneAndUpdate({ date: date }, updateData, {
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

// Rute untuk menghapus data finance berdasarkan tanggal
router.delete("/date/:date", async (req, res) => {
  const { date } = req.params;

  try {
    const data = await Finance.findOneAndDelete({ date: date });
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
