const mongoose = require("mongoose");

const FinanceSchema = new mongoose.Schema(
  {
    date: String,
    in_cash: Number,
    in_debit: Number,
    out_cash: Number,
    out_debit: Number,
    total_cash: Number,
    total_debit: Number,
    cash_to_debit: Number,
    debit_to_cash: Number,
  },
  { collection: "finance" }
); // Nama koleksi: finance

module.exports = mongoose.model("Finance", FinanceSchema);
