const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema(
  {
    date: String,
    weekend: Boolean,
    libur: Boolean,
    cuaca: String,
    cuaca_besok: String,
    event_raya: String,
    terjual: String,
    manual_update: Boolean,
    operasional: Boolean,
    hasil_prediksi: String,
    akurat: {
      type: Boolean,
      default: null, 
    },
  },
  { collection: "prediction" }
); // Nama koleksi: prediction

module.exports = mongoose.model("Prediction", PredictionSchema);
