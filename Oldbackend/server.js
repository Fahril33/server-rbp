const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Koneksi MongoDB
mongoose
  .connect("mongodb://localhost:27017/RotiBakarPalu")
  .then(() => console.log("Terhubung ke MongoDB..."))
  .catch((err) => console.error("Gagal terhubung ke MongoDB", err));

// Fungsi untuk membuat model dinamis

const getModel = (collectionName) => {
  let schema;
  if (collectionName === "finance") {
    schema = new mongoose.Schema(
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
      { collection: collectionName }
    );
  } else if (collectionName === "prediction") {
    // Koleksi baru untuk cuaca
    schema = new mongoose.Schema(
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
      },
      { collection: collectionName }
    );
  } else if (collectionName === "stocks") {
    // Koleksi baru untuk stock
    schema = new mongoose.Schema(
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
      { collection: collectionName }
    );
  } else if (collectionName === "sales") {
    schema = new mongoose.Schema(
      {
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
        totalOutletIncome: Number, // Tambahkan field baru
        totalMerchantIncome: Number, // Tambahkan field baru
      },
      { collection: collectionName }
    );
  } else if (collectionName === "daftarBelanja") {
    schema = new mongoose.Schema(
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
      { collection: collectionName }
    );
  }

  // Memastikan model tidak dibuat ulang jika sudah ada
  return (
    mongoose.models[collectionName] || mongoose.model(collectionName, schema)
  );
};

// Rute API dinamis berdasarkan nama collection
app.get("/api/:collection", async (req, res) => {
  const { collection } = req.params;
  try {
    const Model = getModel(collection);
    const data = await Model.find();
    res.send(data);
    console.log('bisa uy', );
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error fetching data", error: err.message });
  }
});

// Rute untuk mendapatkan barang tertentu pada tanggal tertentu di daftarBelanja
app.get("/api/daftarBelanja/:tanggal", async (req, res) => {
  // Mengubah URL untuk hanya menggunakan tanggal
  const { tanggal } = req.params; // Mengambil tanggal dari parameter
  try {
    const Model = getModel("daftarBelanja");
    // Cari data berdasarkan tanggal
    const data = await Model.find({ tanggal: tanggal }); // Mengubah query untuk mencari berdasarkan tanggal

    if (!data || data.length === 0) {
      // Memeriksa jika data tidak ditemukan
      return res.status(404).send({ message: "Data hari ini belum ada" });
    }
    res.send(data);
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error fetching data", error: err.message });
  }
});

app.get("/api/stocks/date/:date", async (req, res) => {
  const { date } = req.params; // Get the date from the URL
  try {
    const Model = getModel("stocks");

    // Find the stock entry for the given date
    const stockData = await Model.findOne({ date: date });

    if (!stockData) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk tanggal ini." });
    }

    res.send(stockData); // Respond with the found stock data
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error fetching data", error: err.message });
  }
});

app.get("/api/sales/date/:date", async (req, res) => {
  const { date } = req.params; // Mengambil tanggal dari parameter

  // Validasi format tanggal (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res
      .status(400)
      .send({ message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." });
  }

  try {
    const Model = getModel("sales");
    const salesData = await Model.findOne({ date: date }); // Mencari data penjualan berdasarkan tanggal

    if (!salesData) {
      return res
        .status(404)
        .send({ message: "Data penjualan tidak ditemukan untuk tanggal ini." });
    }

    res.send(salesData); // Mengirimkan data penjualan yang ditemukan
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error fetching sales data", error: err.message });
  }
});

app.get("/api/finance/date/:date", async (req, res) => {
  const { date } = req.params;
  try {
    const Model = getModel("finance");
    const data = await Model.find({ date: date }); // Mencari berdasarkan tanggal

    if (!data || data.length === 0) {
      return res
        .status(404)
        .send({ message: "Data finance tidak ditemukan untuk tanggal ini." });
    }
    res.send(data);
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error fetching finance data", error: err.message });
  }
});

app.get("/api/prediction/date/:date", async (req, res) => {
  const { date } = req.params; // Mengambil tanggal dari parameter

  // Validasi format tanggal (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res
      .status(400)
      .send({ message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." });
  }

  try {
    const Model = getModel("prediction");
    const predictionData = await Model.findOne({ date: date }); // Mencari data prediksi berdasarkan tanggal

    if (!predictionData) {
      return res
        .status(404)
        .send({ message: "Data prediksi tidak ditemukan untuk tanggal ini." });
    }

    res.send(predictionData); // Mengirimkan data prediksi yang ditemukan
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error fetching prediction data", error: err.message });
  }
});

app.post("/api/:collection", async (req, res) => {
  const { collection } = req.params;
  try {
    const Model = getModel(collection);
    const data = new Model(req.body);
    await data.save();
    res.send(data);
  } catch (err) {
    res.status(500).send({ message: "Error saving data", error: err.message });
  }
});

app.put("/api/:collection/:id", async (req, res) => {
  const { collection, id } = req.params;
  try {
    const Model = getModel(collection);
    let query;
    if (collection === "daftarBelanja") {
      query = { _id: id }; // Cari berdasarkan _id untuk daftarBelanja
    } else {
      query = { id: id }; // Cari berdasarkan custom 'id' untuk collection lain
    }
    const data = await Model.findOneAndUpdate(query, req.body, {
      new: true,
    });

    if (!data) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk diupdate" });
    }
    res.send(data);
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error updating data", error: err.message });
  }
});

app.put("/api/stocks/date/:date", async (req, res) => {
  const { date } = req.params; // Ambil tanggal dari URL
  try {
    const Model = getModel("stocks");

    // Update data berdasarkan input dari klien
    const updatedData = req.body;

    // Temukan dokumen berdasarkan tanggal dan perbarui
    const result = await Model.findOneAndUpdate(
      { date: date }, // Mencari dokumen berdasarkan tanggal
      updatedData, // Data yang akan diperbarui
      { new: true } // Kembalikan dokumen yang diperbarui
    );

    if (!result) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk diupdate" });
    }

    res.send(result); // Kirimkan data yang telah diperbarui
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error updating data", error: err.message });
  }
});

// Rute untuk mengupdate data penjualan berdasarkan tanggal
app.put("/api/sales/date/:date", async (req, res) => {
  const { date } = req.params; // Mengambil tanggal dari parameter
  const newSoldItem = req.body; // Mengambil data baru untuk ditambahkan ke array sold

  try {
    const Model = getModel("sales");

    // Mencari data penjualan berdasarkan tanggal
    const salesData = await Model.findOne({ date: date });

    if (!salesData) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk tanggal ini." });
    }

    // Menambahkan item baru ke array sold
    salesData.sold.push(newSoldItem);

    // Mengupdate totalQuantity dan totalIncome
    salesData.totalQuantity += Number(newSoldItem.quantity);
    salesData.totalIncome += Number(newSoldItem.income);

    // Menghitung totalOutletIncome dan totalMerchantIncome
    salesData.totalOutletIncome = salesData.sold
      .filter((item) => item.place === "outlet")
      .reduce((acc, item) => acc + item.income, 0);

    salesData.totalMerchantIncome = salesData.sold
      .filter((item) => item.place === "merchant")
      .reduce((acc, item) => acc + item.income, 0);

    // Menyimpan perubahan
    await salesData.save();

    res.send(salesData); // Mengirimkan data yang telah diperbarui
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error updating data", error: err.message });
  }
});

app.put("/api/sales/date/:date/:soldId", async (req, res) => {
  const { date, soldId } = req.params; // Extract date and soldId from the URL
  const updatedSoldData = req.body; // New data for the sold item

  try {
    const Model = getModel("sales");

    // Find the sales document by date
    const salesData = await Model.findOne({ date: date });

    if (!salesData) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk tanggal ini." });
    }

    // Find the index of the item in the sold array by soldId
    const soldIndex = salesData.sold.findIndex(
      (item) => item._id.toString() === soldId
    );

    if (soldIndex === -1) {
      return res
        .status(404)
        .send({ message: "Item di dalam sold tidak ditemukan." });
    }

    // Update the sold item with the new data
    const oldIncome = salesData.sold[soldIndex].income; // Simpan income lama
    salesData.sold[soldIndex] = {
      ...salesData.sold[soldIndex],
      ...updatedSoldData,
    };

    // Update totalQuantity dan totalIncome
    salesData.totalQuantity = salesData.sold.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    salesData.totalIncome = salesData.sold.reduce(
      (acc, item) => acc + item.income,
      0
    );

    // Menghitung totalOutletIncome dan totalMerchantIncome
    salesData.totalOutletIncome = salesData.sold
      .filter((item) => item.place === "outlet")
      .reduce((acc, item) => acc + item.income, 0);

    salesData.totalMerchantIncome = salesData.sold
      .filter((item) => item.place === "merchant")
      .reduce((acc, item) => acc + item.income, 0);

    // Menyimpan perubahan
    await salesData.save();

    res.send(salesData); // Mengirimkan data yang telah diperbarui
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error updating data", error: err.message });
  }
});

app.put("/api/daftarBelanja/:tanggal", async (req, res) => {
  const { tanggal } = req.params; // Mengambil tanggal dari parameter
  const updatedData = req.body; // Mengambil data baru untuk diperbarui

  try {
    const Model = getModel("daftarBelanja");

    // Temukan dokumen berdasarkan tanggal
    const belanjaData = await Model.findOne({ tanggal: tanggal });

    if (!belanjaData) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk tanggal ini." });
    }

    // Memperbarui barang dan menghitung total
    belanjaData.barang = updatedData.barang || belanjaData.barang;

    // Menghitung totalCash, totalDebit, dan totalBelanja
    belanjaData.totalCash = belanjaData.barang
      .filter((item) => item.payment === "cash")
      .reduce((acc, item) => acc + item.totalHarga, 0);

    belanjaData.totalDebit = belanjaData.barang
      .filter((item) => item.payment === "debit")
      .reduce((acc, item) => acc + item.totalHarga, 0);

    belanjaData.totalBelanja = belanjaData.totalCash + belanjaData.totalDebit;

    // Menyimpan perubahan
    await belanjaData.save();

    res.send(belanjaData); // Mengirimkan data yang telah diperbarui
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error updating data", error: err.message });
  }
});

app.put("/api/finance/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const Model = getModel("finance");
    const data = await Model.findByIdAndUpdate(id, req.body, { new: true }); // Menggunakan findByIdAndUpdate

    if (!data) {
      return res
        .status(404)
        .send({ message: "Data finance tidak ditemukan untuk diupdate" });
    }
    res.send(data);
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error updating finance data", error: err.message });
  }
});

app.put("/api/finance/date/:date", async (req, res) => {
  const { date } = req.params; // Mengambil tanggal dari parameter
  const updateData = req.body; // Data yang akan diperbarui

  // Validasi format tanggal (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res
      .status(400)
      .send({ message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." });
  }

  // Validasi nilai yang harus berupa number
  for (const key in updateData) {
    if (typeof updateData[key] === "number" && !isFinite(updateData[key])) {
      return res
        .status(400)
        .send({ message: `${key} harus berupa angka yang valid.` });
    }
  }

  try {
    const Model = getModel("finance");
    const data = await Model.findOneAndUpdate({ date: date }, updateData, {
      new: true,
    });

    if (!data) {
      return res
        .status(404)
        .send({ message: "Data finance tidak ditemukan untuk tanggal ini." });
    }

    res.send(data); // Mengirimkan data yang telah diperbarui
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error updating finance data", error: err.message });
  }
});

app.put("/api/prediction/date/:date", async (req, res) => {
  const { date } = req.params; // Mengambil tanggal dari parameter
  const updateData = req.body; // Data yang akan diperbarui

  // Validasi format tanggal (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res
      .status(400)
      .send({ message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." });
  }

  try {
    const Model = getModel("prediction");
    const data = await Model.findOneAndUpdate({ date: date }, updateData, {
      new: true,
    });

    if (!data) {
      return res
        .status(404)
        .send({ message: "Data prediksi tidak ditemukan untuk tanggal ini." });
    }

    res.send(data); // Mengirimkan data yang telah diperbarui
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error updating prediction data", error: err.message });
  }
});

app.delete("/api/daftarBelanja/:tanggal", async (req, res) => {
  const { tanggal } = req.params; // Mengambil tanggal dari parameter

  try {
    const Model = getModel("daftarBelanja");
    const data = await Model.findOneAndDelete({ tanggal: tanggal });

    if (!data) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk dihapus" });
    }

    res.send({ message: "Data berhasil dihapus", data });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error deleting data", error: err.message });
  }
});

app.delete("/api/daftarBelanja/:tanggal/item/:itemId", async (req, res) => {
  const { tanggal, itemId } = req.params; // Mengambil tanggal dan ID item dari parameter

  try {
    const Model = getModel("daftarBelanja");

    // Mencari data daftar belanja berdasarkan tanggal
    const belanjaData = await Model.findOne({ tanggal: tanggal });

    if (!belanjaData) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk tanggal ini." });
    }

    // Mencari index item yang akan dihapus
    const itemIndex = belanjaData.barang.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).send({ message: "Item tidak ditemukan." });
    }

    // Menghapus item dari array barang
    belanjaData.barang.splice(itemIndex, 1);

    // Menghitung totalCash, totalDebit, dan totalBelanja setelah penghapusan
    belanjaData.totalCash = belanjaData.barang
      .filter((item) => item.payment === "cash")
      .reduce((acc, item) => acc + item.totalHarga, 0);

    belanjaData.totalDebit = belanjaData.barang
      .filter((item) => item.payment === "debit")
      .reduce((acc, item) => acc + item.totalHarga, 0);

    belanjaData.totalBelanja = belanjaData.totalCash + belanjaData.totalDebit;

    // Menyimpan perubahan
    await belanjaData.save();

    res.send({ message: "Item berhasil dihapus", belanjaData });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error deleting item", error: err.message });
  }
});

app.delete("/api/sales/date/:date/item/:itemId", async (req, res) => {
  const { date, itemId } = req.params; // Mengambil tanggal dan ID item dari parameter

  try {
    const Model = getModel("sales");

    // Mencari data penjualan berdasarkan tanggal
    const salesData = await Model.findOne({ date: date });

    if (!salesData) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk tanggal ini." });
    }

    // Mencari index item yang akan dihapus
    const itemIndex = salesData.sold.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).send({ message: "Item tidak ditemukan." });
    }

    // Mengurangi totalQuantity dan totalIncome
    salesData.totalQuantity -= salesData.sold[itemIndex].quantity;
    salesData.totalIncome -= salesData.sold[itemIndex].income;

    // Menghapus item dari array sold
    salesData.sold.splice(itemIndex, 1);

    // Menghitung totalOutletIncome dan totalMerchantIncome setelah penghapusan
    salesData.totalOutletIncome = salesData.sold
      .filter((item) => item.place === "outlet")
      .reduce((acc, item) => acc + item.income, 0);

    salesData.totalMerchantIncome = salesData.sold
      .filter((item) => item.place === "merchant")
      .reduce((acc, item) => acc + item.income, 0);

    // Menyimpan perubahan
    await salesData.save();

    res.send({ message: "Item berhasil dihapus", salesData });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error deleting data", error: err.message });
  }
});

app.delete("/api/:collection/:id", async (req, res) => {
  const { collection, id } = req.params;
  try {
    const Model = getModel(collection);
    let query;

    // Penyesuaian berdasarkan collection yang diproses
    if (collection === "daftarBelanja") {
      query = { _id: id }; // Cari berdasarkan _id untuk daftarBelanja
    } else {
      query = { id: id }; // Cari berdasarkan custom 'id' untuk collection lain
    }

    const data = await Model.findOneAndDelete(query); // Cari berdasarkan query
    if (!data) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk dihapus" });
    }
    res.send({ message: "Data berhasil dihapus", data });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error deleting data", error: err.message });
  }
});

app.delete("/api/:collection/:tanggal/:itemId", async (req, res) => {
  const { collection, tanggal, itemId } = req.params;
  try {
    const Model = getModel(collection);

    // Hapus item dengan _id tertentu dalam array 'barang' berdasarkan tanggal
    const result = await Model.updateOne(
      { tanggal: tanggal }, // Cari dokumen berdasarkan tanggal
      { $pull: { barang: { _id: itemId } } } // Hapus item dalam array 'barang' berdasarkan _id
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .send({ message: "Item tidak ditemukan atau tanggal tidak cocok" });
    }

    res.send({
      message: `Item dengan ID ${itemId} berhasil dihapus dari tanggal ${tanggal}`,
    });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error deleting data", error: err.message });
  }
});

app.delete("/api/sales/date/:date/item/:itemId", async (req, res) => {
  const { date, itemId } = req.params; // Mengambil tanggal dan ID item dari parameter

  try {
    const Model = getModel("sales");

    // Mencari data penjualan berdasarkan tanggal
    const salesData = await Model.findOne({ date: date });

    if (!salesData) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk tanggal ini." });
    }

    // Mencari index item yang akan dihapus
    const itemIndex = salesData.sold.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).send({ message: "Item tidak ditemukan." });
    }

    // Mengurangi totalQuantity dan totalIncome
    salesData.totalQuantity -= salesData.sold[itemIndex].quantity;
    salesData.totalIncome -= salesData.sold[itemIndex].income;

    // Menghapus item dari array sold
    salesData.sold.splice(itemIndex, 1);

    // Menyimpan perubahan
    await salesData.save();

    res.send({ message: "Item berhasil dihapus", salesData });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error deleting data", error: err.message });
  }
});

app.delete("/api/finance/date/:date", async (req, res) => {
  const { date } = req.params;
  try {
    const Model = getModel("finance");
    const data = await Model.findOneAndDelete({ date: date }); // Mencari berdasarkan tanggal

    if (!data) {
      return res
        .status(404)
        .send({ message: "Data finance tidak ditemukan untuk dihapus" });
    }
    res.send({ message: "Data finance berhasil dihapus", data });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error deleting finance data", error: err.message });
  }
});

app.delete("/api/prediction/date/:date", async (req, res) => {
  const { date } = req.params; // Mengambil tanggal dari parameter

  // Validasi format tanggal (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res
      .status(400)
      .send({ message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." });
  }

  try {
    const Model = getModel("prediction");
    const data = await Model.findOneAndDelete({ date: date }); // Mencari berdasarkan tanggal

    if (!data) {
      return res
        .status(404)
        .send({ message: "Data prediksi tidak ditemukan untuk dihapus" });
    }

    res.send({ message: "Data prediksi berhasil dihapus", data });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error deleting prediction data", error: err.message });
  }
});

// Jalankan server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server berjalan di port ${port}`));

