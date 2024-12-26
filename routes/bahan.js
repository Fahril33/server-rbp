const express = require("express");
const jwt = require("jsonwebtoken");
const Bahan = require("../models/bahan");

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.user = { id: decoded.user.id, role: decoded.user.role }; // Menyimpan id dan role
    console.log("Authenticated User:", req.user); // Log untuk debugging
    next();
  } catch (err) {
    console.log(token)
    res.status(401).json({ msg: "Token is not valid", token });
  }
};

// Middleware untuk memeriksa role
const checkRole = (role) => {
  return (req, res, next) => {
    // Log untuk melihat isi req.user
    console.log("User :", req.user);

    // Pastikan req.user ada
    if (!req.user) {
      return res.status(401).json({ msg: "User  not authenticated" });
    }

    // Log untuk melihat peran yang sedang dibandingkan
    console.log("Expected Role:", role);
    console.log("User Role:", req.user.role);

    // Periksa apakah peran pengguna sesuai
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ msg: "Access denied", role: req.user.role });
    }

    // Jika peran sesuai, lanjutkan ke middleware berikutnya
    next();
  };
};

// Rute untuk mendapatkan semua data bahan (hanya bisa diakses oleh manager)
router.get("/", auth, checkRole("manager"), async (req, res) => {
  try {
    const bahan = await Bahan.find();
    res.json(bahan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk mendapatkan data bahan berdasarkan ID (hanya bisa diakses oleh manager)
router.get("/:id", auth, checkRole("manager"), async (req, res) => {
  const { id } = req.params;

  try {
    const bahan = await Bahan.findById(id);
    if (!bahan) {
      return res.status(404).send({ message: "Bahan tidak ditemukan" });
    }
    res.json(bahan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk menambahkan data bahan (hanya bisa diakses oleh manager)
router.post("/", auth, checkRole("manager"), async (req, res) => {
  const { kategori, namaBahan, harga, satuan, jenisSatuan } = req.body;

  try {
    const bahan = new Bahan({
      kategori,
      namaBahan,
      harga,
      satuan,
      jenisSatuan,
    });
    await bahan.save();
    res.json(bahan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk mengupdate data bahan berdasarkan ID (hanya bisa diakses oleh manager)
router.put("/:id", auth, checkRole("manager"), async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const bahan = await Bahan.findByIdAndUpdate(id, updateData, { new: true });
    if (!bahan) {
      return res.status(404).send({ message: "Bahan tidak ditemukan" });
    }
    res.json(bahan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk menghapus data bahan berdasarkan ID (hanya bisa diakses oleh manager)
router.delete("/:id", auth, checkRole("manager"), async (req, res) => {
  const { id } = req.params;

  try {
    const bahan = await Bahan.findByIdAndDelete(id);
    if (!bahan) {
      return res.status(404).send({ message: "Bahan tidak ditemukan" });
    }
    res.send({ message: "Bahan berhasil dihapus" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
