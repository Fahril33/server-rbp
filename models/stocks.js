const mongoose = require("mongoose");

const StocksSchema = new mongoose.Schema(
  {
    date: String,
    initial_stock: Number,
    additional_stock: Number,
    bonus_stock: Number,
    spoiled_stock: Number,
    sold_stock: Number,
    total_stock: Number,
    remaining_stock: Number,
  },
  { collection: "stocks" }
); // Nama koleksi: stocks

module.exports = mongoose.model("Stocks", StocksSchema);
