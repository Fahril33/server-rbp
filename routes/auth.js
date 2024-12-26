const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.user = {
      id: decoded.user.id,      
      role: decoded.user.role,
    }; // Menyimpan id dan role
    console.log("Authenticated User:", req.user); // Log untuk debugging
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
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

// Contoh penggunaan middleware
router.get("/manager-only", auth, checkRole("manager"), (req, res) => {
  res.json({ msg: "This route is only accessible by managers" });
});

//
// Access
//

router.get("/user", auth, async (req, res) => {
  try {
    // Mengambil data pengguna berdasarkan ID dari token
    const user = await User.findById(req.user.id).select("-password"); // Menghindari mengirimkan password
    if (!user) {
      return res.status(404).json({ msg: "User  not found" });
    }
    // Mengembalikan data pengguna yang relevan
    res.json({
      id: user._id,
      fullname: user.fullname,
      address: user.address,
      phone: user.phone,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      position: user.position,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk mendapatkan data pengguna berdasarkan ID (hanya bisa diakses oleh manager)
router.get("/user/:id", auth, checkRole("manager"), async (req, res) => {
  try {
    // Mengambil ID dari parameter
    const userId = req.params.id;

    // Mencari pengguna berdasarkan ID
    const user = await User.findById(userId).select("-password"); // Menghindari mengirimkan password

    if (!user) {
      return res.status(404).json({ msg: "User  not found" });
    }

    // Mengembalikan data pengguna yang relevan
    res.json({
      id: user._id,
      fullname: user.fullname,
      address: user.address,
      phone: user.phone,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      position: user.position, // Menyertakan posisi cabang
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk mendapatkan semua pengguna (hanya bisa diakses oleh manager)
router.get("/users", auth, checkRole("manager"), async (req, res) => {
  try {
    // Mengambil semua pengguna, kecuali password
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/// Rute untuk registrasi pengguna
router.post("/register", auth, checkRole("manager"), async (req, res) => {
  const {
    fullname,
    address,
    phone,
    username,
    email,
    password,
    role,
    status,
    position,
  } = req.body;

  try {
    // Cek apakah pengguna sudah ada
    let existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }],
    });
    if (existingUser) {
      const existingFields = [];
      if (existingUser.email === email) existingFields.push("email");
      if (existingUser.username === username) existingFields.push("username");
      if (existingUser.phone === phone) existingFields.push("phone");

      return res.status(400).json({
        msg: `User  already exists for: ${existingFields.join(", ")}`,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat pengguna baru
    const user = new User({
      fullname,
      address,
      phone,
      username,
      email,
      password: hashedPassword,
      role: role || "employee",
      status: status || "active",
      position, // Menyimpan posisi cabang
    });

    await user.save(); // Simpan pengguna ke dalam koleksi

    res.status(201).json({ msg: "User  registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Rute untuk login
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  // Validasi input
  if (!identifier || !password) {
    return res
      .status(400)
      .json({ msg: "Identifier and password are required" });
  }

  try {
    // Mencari pengguna berdasarkan email atau username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    console.log("User found:", user); // Log untuk melihat pengguna yang ditemukan

    if (!user) {
      return res.status(400).json({ msg: "Invalid email/username" });
    }

    // Log password yang di-hash dan password yang dimasukkan
    console.log("Password from DB:", user.password);
    console.log("Password entered:", password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch); // Log untuk melihat apakah password cocok

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    // Menyertakan role dalam payload
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "10h" });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  try {
    res.status(200).json({
      message: "Logout berhasil",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal logout",
      success: false,
    });
  }
});

// Rute untuk memperbarui data pengguna berdasarkan ID (hanya bisa diakses oleh manager)
router.put("/user/:id", auth, checkRole("manager"), async (req, res) => {
  const { id } = req.params; // Mengambil ID dari parameter
  const { fullname, address, phone, username, email, role, status, position } = req.body; // Ambil data yang akan diperbarui

  try {
    // Mencari pengguna berdasarkan ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "User  not found" });
    }

    // Cek apakah ada pengguna lain yang memiliki email, username, atau phone yang sama
    const existingUser  = await User.findOne({
      $or: [
        { email, _id: { $ne: id } }, // Cek email, kecuali untuk pengguna yang sama
        { username, _id: { $ne: id } }, // Cek username, kecuali untuk pengguna yang sama
        { phone, _id: { $ne: id } } // Cek phone, kecuali untuk pengguna yang sama
      ]
    });

    if (existingUser ) {
      const existingFields = [];
      if (existingUser .email === email) existingFields.push("email");
      if (existingUser .username === username) existingFields.push("username");
      if (existingUser .phone === phone) existingFields.push("phone");

      return res.status(400).json({
        msg: `User  already exists for: ${existingFields.join(", ")}`
      });
    }

    // Memperbarui data pengguna
    user.fullname = fullname || user.fullname;
    user.address = address || user.address;
    user.phone = phone || user.phone;
    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;
    user.status = status || user.status;
    user.position = position || user.position;

    await user.save(); // Simpan perubahan

    res.json(user); // Kembalikan data pengguna yang diperbarui
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk menghapus pengguna berdasarkan ID (hanya bisa diakses oleh manager)
router.delete("/user/:id", auth, checkRole("manager"), async (req, res) => {
  const { id } = req.params; // Mengambil ID dari parameter

  try {
    // Mencari dan menghapus pengguna berdasarkan ID
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ msg: "User  not found" });
    }

    res.json({ msg: "User  deleted successfully" }); // Kembalikan pesan sukses
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
module.exports = router;
