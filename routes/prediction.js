const express = require("express");
const Prediction = require("../models/prediction");

const router = express.Router();

// Rute untuk mendapatkan semua data prediksi
router.get("/", async (req, res) => {
  try {
    const predictions = await Prediction.find();
    res.json(predictions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/date/:date", async (req, res) => {
  const { date } = req.params; // Mengambil tanggal dari parameter

  // Validasi format tanggal (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res
      .status(400)
      .send({ message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." });
  }

  try {
    const predictionData = await Prediction.findOne({ date: date }); // Mencari data prediksi berdasarkan tanggal

    if (!predictionData) {
      return res
        .status(404)
        .send({ message: "Data prediksi tidak ditemukan untuk tanggal ini." });
    }

    res.send(predictionData); // Mengirimkan data prediksi yang ditemukan
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error fetching prediction data", error: err.message });
  }
});

// Rute untuk menambahkan data prediksi
router.post("/", async (req, res) => {
  const {
    date,
    weekend,
    libur,
    cuaca,
    cuaca_besok,
    event_raya,
    terjual,
    manual_update,
    operasional,
    hasil_prediksi,
    akurat, 
  } = req.body;

  try {
    const prediction = new Prediction({
      date,
      weekend,
      libur,
      cuaca,
      cuaca_besok,
      event_raya,
      terjual,
      manual_update,
      operasional,
      hasil_prediksi,
      akurat, 
    });
    await prediction.save();
    res.json(prediction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk mengupdate data prediksi berdasarkan tanggal
router.put("/date/:date", async (req, res) => {
  const { date } = req.params;
  const updateData = req.body;

  // Validasi format tanggal (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res
      .status(400)
      .send({ message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." });
  }

  try {
    const data = await Prediction.findOneAndUpdate({ date: date }, updateData, {
      new: true,
    });

    if (!data) {
      return res
        .status(404)
        .send({ message: "Data prediksi tidak ditemukan untuk tanggal ini." });
    }

    res.send(data); // Mengirimkan data yang telah diperbarui
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error updating prediction data", error: err.message });
  }
});

// Rute untuk menghapus data prediksi berdasarkan tanggal
router.delete("/date/:date", async (req, res) => {
  const { date } = req.params;

  // Validasi format tanggal (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res
      .status(400)
      .send({ message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." });
  }

  try {
    const data = await Prediction.findOneAndDelete({ date: date }); // Mencari berdasarkan tanggal

    if (!data) {
      return res
        .status(404)
        .send({ message: "Data prediksi tidak ditemukan untuk dihapus" });
    }

    res.send({ message: "Data prediksi berhasil dihapus", data });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error deleting prediction data", error: err.message });
  }
});

module.exports = router;
