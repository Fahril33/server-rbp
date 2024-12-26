const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("../routes/auth");
const financeRoutes = require("../routes/finance");
const predictionRoutes = require("../routes/prediction");
const stocksRoutes = require("../routes/stocks");
const salesRoutes = require("../routes/sales");
const daftarBelanjaRoutes = require("../routes/daftarBelanja");
const bahanRoutes = require("../routes/bahan"); 
const statusRoutes = require("../routes/status"); 


const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Koneksi MongoDB
mongoose
  .connect("mongodb://localhost:27017/RotiBakarPalu")
  .then(() => console.log("Terhubung ke MongoDB..."))
  .catch((err) => console.error("Gagal terhubung ke MongoDB", err));

// Menggunakan rute autentikasi dan koleksi lainnya
app.use("/api/auth", authRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/stocks", stocksRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/daftarBelanja", daftarBelanjaRoutes);
app.use("/api/bahan", bahanRoutes);
app.use("/api/status", statusRoutes); 


// Jalankan server
// const port = process.env.PORT || 5000;
// app.listen(port, () => console.log(`Server berjalan di port ${port}`));

const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () =>
  console.log(`Server berjalan di port ${port}`)
);