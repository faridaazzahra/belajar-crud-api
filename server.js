const express = require("express");
const dotenv = require("dotenv");

const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

const serviceAccount = require("./firebase-service-account.json");

dotenv.config();

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});

const db = getDatabase();
const app = express();

app.use(express.json());



// Ubah message menjadi kalimatmu sendiri.
app.get("/", (req, res) => {
  res.json({
    message: "Server Employee Management API berjalan"
  });
});



//Tambahkan endpoint GET /hello.
app.get("/hello", (req, res) => {
  res.json({
    message: "Hello from api"
  });
});



//Buat endpoint GET /about yang mengembalikan nama project.
app.get("/about", (req, res) => {
  res.json({
    project: "Product Management Api"
  });
});





// TEST FIREBASE
app.get("/api/test-firebase", async (req, res) => {
  try {
    const snapshot = await db.ref("test").once("value");

    res.status(200).json({
      success: true,
      data: snapshot.val()
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Gagal membaca Firebase"
    });
  }
});





// CRUD PRODUCT DENGAN FIREBASE
// READ - SEMUA PRODUCT
app.get("/api/products", async (req, res) => {
  try {
    const snapshot = await db.ref("products").once("value");

    const data = snapshot.val() || {};

    const products = Object.entries(data).map(([id, product]) => ({
      id,
      ...product
    }));

    res.status(200).json(products);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengambil data product"
    });
  }
});



// READ - PRODUCT BERDASARKAN ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const snapshot = await db
      .ref(`products/${id}`)
      .once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({
        message: "Product tidak ditemukan"
      });
    }

    res.status(200).json({
      id,
      ...snapshot.val()
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengambil data product"
    });
  }
});



// CREATE - TAMBAH PRODUCT
app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      price,
      stock,
      category
    } = req.body;

    if (!name || price === undefined || stock === undefined || !category) {
      return res.status(400).json({
        message: "name, price, stock, dan category wajib diisi"
      });
    }

    const ref = db.ref("products").push();

    const product = {
      name,
      price,
      stock,
      category
    };

    await ref.set(product);

    res.status(201).json({
      id: ref.key,
      ...product
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal menambah product"
    });
  }
});



// UPDATE - UBAH PRODUCT
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const ref = db.ref(`products/${id}`);

    const snapshot = await ref.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({
        message: "Product tidak ditemukan"
      });
    }

    const {
      name,
      price,
      stock,
      category
    } = req.body;

    if (!name || price === undefined || stock === undefined || !category) {
      return res.status(400).json({
        message: "name, price, stock, dan category wajib diisi"
      });
    }

    const product = {
      name,
      price,
      stock,
      category
    };

    await ref.update(product);

    res.status(200).json({
      id,
      ...product
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengubah product"
    });
  }
});



// DELETE - HAPUS PRODUCT
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const ref = db.ref(`products/${id}`);

    const snapshot = await ref.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({
        message: "Product tidak ditemukan"
      });
    }

    await ref.remove();

    res.status(200).json({
      message: "Product berhasil dihapus"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal menghapus product"
    });
  }
});



app.listen(process.env.PORT || 3000, () => {
  console.log(
    `Server berjalan di http://localhost:${process.env.PORT || 3000}`
  );
});