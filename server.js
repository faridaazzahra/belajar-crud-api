// const express = require("express");

// const app = express();

// app.use(express.json());

// app.get("/", (req, res) => {
//   res.json({
//     message: "Server berhasil berjalan"
//   });
// });




// // Tugas tambah endpoint get hello dan about
// app.get("/hello", (req, res) => {
//   res.json({
//     message: "Hello from api"
//   });
// });
// app.get("/about", (req, res) => {
//   res.json({
//     project: "Product Management Api"
//   });
// });






// // tugas 3 
// app.get("/api/products/:id", (req, res) => {
//   const id = req.params.id;

//   res.json({
//     productId: id
//   });
// });

// // app.post("/api/products", (req, res) => {
// //   const data = req.body;

// //   res.json(data);
// // });






// // tugas 4

// let products = [
//   {
//     id: 1,
//     name: "Laptop",
//     price: 7500000,
//     stock: 10
//   },
//   {
//     id: 2,
//     name: "Mouse",
//     price: 150000,
//     stock: 20
//   },
//   {
//     id: 3,
//     name: "Keyboard",
//     price: 150000,
//     stock: 22
//   },
//   {
//     id: 4,
//     name: "Charger",
//     price: 150000,
//     stock: 19
//   }
  
// ];

// app.get("/api/products", (req, res) => {
//   res.json(products);
// });


// app.post("/api/products", (req, res) => {
//   const product = {
//     id: products.length + 1,
//     name: req.body.name,
//     price: req.body.price,
//     stock: req.body.stock
//   };

//   products.push(product);

//   res.status(201).json(product);
// });


// app.put("/api/products/:id", (req, res) => {
//   const id = Number(req.params.id);

//   const product = products.find(x => x.id === id);

//   if (!product) {
//     return res.status(404).json({
//       message: "Product tidak ditemukan"
//     });
//   }

//   product.name = req.body.name;
//   product.price = req.body.price;
//   product.stock = req.body.stock;

//   res.json(product);
// });



// app.delete("/api/products/:id", (req, res) => {
//   const id = Number(req.params.id);

//   products = products.filter(x => x.id !== id);

//   res.json({
//     message: "Product berhasil dihapus"
//   });
// });








// app.listen(3000, () => {
//   console.log("Server berjalan di http://localhost:3000");
// });




const express = require("express");
const dotenv = require("dotenv");

const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

const serviceAccount = require("./firebase-service-account.json");

dotenv.config();

// =====================================
// KONEKSI FIREBASE
// =====================================

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});

const db = getDatabase();


// =====================================
// EXPRESS
// =====================================

const app = express();

app.use(express.json());


// =====================================
// HOME
// =====================================

app.get("/", (req, res) => {
  res.json({
    message: "Server Employee Management API berjalan"
  });
});


// =====================================
// TUGAS SEBELUMNYA
// HELLO
// =====================================

app.get("/hello", (req, res) => {
  res.json({
    message: "Hello from api"
  });
});


// =====================================
// TUGAS SEBELUMNYA
// ABOUT
// =====================================

app.get("/about", (req, res) => {
  res.json({
    project: "Product Management Api"
  });
});


// =====================================
// LEVEL 6
// TEST FIREBASE
// =====================================

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


// =====================================
// LEVEL 7
// CRUD PRODUCT DENGAN FIREBASE
// =====================================


// =====================================
// READ - SEMUA PRODUCT
// GET /api/products
// =====================================

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


// =====================================
// READ - PRODUCT BERDASARKAN ID
// GET /api/products/:id
// =====================================

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


// =====================================
// CREATE - TAMBAH PRODUCT
// POST /api/products
// =====================================

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


// =====================================
// UPDATE - UBAH PRODUCT
// PUT /api/products/:id
// =====================================

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


// =====================================
// DELETE - HAPUS PRODUCT
// DELETE /api/products/:id
// =====================================

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


// =====================================
// MENJALANKAN SERVER
// =====================================

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `Server berjalan di http://localhost:${process.env.PORT || 3000}`
  );
});