// c:\Kuliah\S7\proposal\Program\server_rbp\models\bahan.js
const mongoose = require("mongoose");

const BahanSchema = new mongoose.Schema(
  {
    kategori: { type: String, required: true },
    namaBahan: { type: String, required: true },
    harga: { type: Number, required: true },
    satuan: { type: Number, required: true }, // Misalnya 1, 500, dll
    jenisSatuan: { type: String, required: true }, // Misalnya "buah", "gr", "kg", dll
  },
  { collection: "bahan" } // Nama koleksi: bahan
);

module.exports = mongoose.model("Bahan", BahanSchema);
