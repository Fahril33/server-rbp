const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true, unique: false, trim: true },
  address: { type: String, required: true, unique: false, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  role: { type: String, enum: ["employee", "manager"], default: "employee" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  position: { type: String, required: true },
});
// Nama koleksi: users
module.exports = mongoose.model("User ", UserSchema);
