const express = require("express");
const Sales = require("../models/sales");

const router = express.Router();

// Rute untuk mendapatkan semua data sales
router.get("/", async (req, res) => {
  try {
    const sales = await Sales.find();
    res.json(sales);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk mendapatkan data penjualan berdasarkan tanggal
router.get("/date/:date", async (req, res) => {
  const { date } = req.params;

  try {
    const salesData = await Sales.findOne({ date: date });
    if (!salesData) {
      return res
        .status(404)
        .json({ msg: "Data tidak ditemukan untuk tanggal ini." });
    }
    res.json(salesData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk menambahkan data sales
router.post("/", async (req, res) => {
  const {
    id,
    date,
    day,
    sold,
    totalQuantity,
    totalIncome,
    totalOutletIncome,
    totalMerchantIncome,
  } = req.body;

  try {
    const sales = new Sales({
      id,
      date,
      day,
      sold,
      totalQuantity,
      totalIncome,
      totalOutletIncome,
      totalMerchantIncome,
    });
    await sales.save();
    res.status(201).json(sales);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk mengupdate data sales berdasarkan ID
router.put("/id/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const data = await Sales.findOneAndUpdate({ id: id }, updateData, {
      new: true,
    });
    if (!data) {
      return res.status(404).json({ msg: "Data tidak ditemukan" });
    }
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk mengupdate data penjualan berdasarkan tanggal
router.put("/date/:date", async (req, res) => {
  const { date } = req.params;
  const newSoldItem = req.body; // Data baru untuk ditambahkan ke array sold

  try {
    const salesData = await Sales.findOne({ date: date });
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

// put outer data sales
router.put("/put/date/:date", async (req, res) => {
  const { date } = req.params;
  const updateData = req.body;

  try {
    const salesData = await Sales.findOne({ date: date });
    if (!salesData) {
      return res
        .status(404)
        .send({ message: "Data tidak ditemukan untuk tanggal ini." });
    }

    salesData.day = updateData.day;
    await salesData.save();

    res.send(salesData);
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error updating data", error: err.message });
  }
});

// Rute untuk mengupdate item penjualan berdasarkan tanggal dan soldId
router.put("/date/:date/:soldId", async (req, res) => {
  const { date, soldId } = req.params; // Extract date and soldId from the URL
  const updatedSoldData = req.body; // New data for the sold item

  try {
    const salesData = await Sales.findOne({ date: date });
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

// Rute untuk menghapus data sales berdasarkan ID
router.delete("/id/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSales = await Sales.findOneAndDelete({ id: id });
    if (!deletedSales) {
      return res.status(404).json({ msg: "Data tidak ditemukan" });
    }
    res.json({ msg: "Data berhasil dihapus" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rute untuk menghapus item dari penjualan berdasarkan tanggal dan soldId
router.delete("/date/:date/item/:itemId", async (req, res) => {
  const { date, itemId } = req.params; // Mengambil tanggal dan ID item dari parameter

  try {
    const salesData = await Sales.findOne({ date: date });

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

module.exports = router;
