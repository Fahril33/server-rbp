const mongoose = require("mongoose");

const DaftarBelanjaSchema = new mongoose.Schema(
  {
    tanggal: String,
    barang: [
      {
        namaBahan: String,
        jumlah: Number,
        harga: Number,
        totalHarga: Number,
        payment: String,
      },
    ],
    totalCash: Number,
    totalDebit: Number,
    totalBelanja: Number,
  },
  { collection: "daftarBelanja" }
); // Nama koleksi: daftarBelanja

module.exports = mongoose.model("DaftarBelanja", DaftarBelanjaSchema);
