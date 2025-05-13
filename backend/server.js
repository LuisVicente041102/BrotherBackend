require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");

const authRoutes = require("./routes/authRoutes"); // ✅ Inventario
const posAuthRoutes = require("./routes/posAuthRoutes"); // ✅ Punto de venta

const employeeRoutes = require("./routes/employeeRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 🖼️ Servir archivos estáticos de la carpeta uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ruta base para verificar que el servidor funciona
app.get("/", (req, res) => {
  res.send("Servidor Express funcionando 🚀");
});

// ✅ Rutas API
app.use("/api/auth", authRoutes); // Login inventario
app.use("/api/pos", posAuthRoutes); // Login y registro punto de venta
app.use("/api/employees", employeeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Ruta de prueba para verificar conexión con PostgreSQL
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error conectando a la base de datos");
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
