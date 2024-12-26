const mongoose = require('mongoose');

const SalesSchema = new mongoose.Schema({
  id: Number,
  date: String,
  day: String,
  sold: [
    {
      time: String,
      price: Number,
      quantity: Number,
      income: Number,
      place: String,
    },
  ],
  totalQuantity: Number,
  totalIncome: Number,
  totalOutletIncome: Number,
  totalMerchantIncome: Number,
}, { collection: 'sales' }); // Nama koleksi: sales

module.exports = mongoose.model('Sales', SalesSchema);