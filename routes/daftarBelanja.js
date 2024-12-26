const express = require("express");
const DaftarBelanja = require("../models/daftarBelanja");
const daftarBelanja = require("../models/daftarBelanja");

const router = express.Router();

// Rute untuk mendapatkan semua data daftar belanja
router.get("/", async (req, res) => {
  try {
    const daftarBelanja = await DaftarBelanja.find();
    res.json(daftarBelanja);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk menambahkan data daftar belanja
router.post("/", async (req, res) => {
  const { tanggal, barang, totalCash, totalDebit, totalBelanja } = req.body;

  try {
    const daftarBelanja = new DaftarBelanja({
      tanggal,
      barang,
      totalCash,
      totalDebit,
      totalBelanja,
    });
    await daftarBelanja.save();
    res.json(daftarBelanja);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      query = { _id: id };
      const data = await DaftarBelanja.findOneAndUpdate(query, req.body, {
        new: true,
      });

      if (!data) {
        return res
          .status(404)
          .send({ message: "Data tidak ditemukan untuk diupdate" });
      }
      res.send(data);
    } catch (err) {
      res
        .status(500)
        .send({ message: "Error updating data", error: err.message });
    }
});

// Rute untuk mengupdate data daftar belanja berdasarkan tanggal
router.put("/:tanggal", async (req, res) => {
  const { tanggal } = req.params; // Mengambil tanggal dari parameter
  const updatedData = req.body; // Mengambil data baru untuk diperbarui

  try {
    const Model = getModel("daftarBelanja");

    // Temukan dokumen berdasarkan tanggal
    const belanjaData = await Model.findOne({ tanggal: tanggal });

    if (!belanjaData) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk tanggal ini." });
    }

    // Memperbarui barang dan menghitung total
    belanjaData.barang = updatedData.barang || belanjaData.barang;

    // Menghitung totalCash, totalDebit, dan totalBelanja
    belanjaData.totalCash = belanjaData.barang
      .filter((item) => item.payment === "cash")
      .reduce((acc, item) => acc + item.totalHarga, 0);

    belanjaData.totalDebit = belanjaData.barang
      .filter((item) => item.payment === "debit")
      .reduce((acc, item) => acc + item.totalHarga, 0);

    belanjaData.totalBelanja = belanjaData.totalCash + belanjaData.totalDebit;

    // Menyimpan perubahan
    await belanjaData.save();

    res.send(belanjaData); // Mengirimkan data yang telah diperbarui
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error updating data", error: err.message });
  }
});

router.delete("/:tanggal/:itemId", async (req, res) => {
  const { tanggal, itemId } = req.params;

  try {
    // Hapus item dengan _id tertentu dalam array 'barang' berdasarkan tanggal
    const result = await daftarBelanja.updateOne(
      { tanggal: tanggal }, // Cari dokumen berdasarkan tanggal
      { $pull: { barang: { _id: itemId } } } // Hapus item dalam array 'barang' berdasarkan _id
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .send({ message: "Item tidak ditemukan atau tanggal tidak cocok" });
    }

    res.send({
      message: `Item dengan ID ${itemId} berhasil dihapus dari tanggal ${tanggal}`,
    });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error deleting data", error: err.message });
  }
});
module.exports = router;
