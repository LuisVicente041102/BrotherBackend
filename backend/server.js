require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");

const authRoutes = require("./routes/authRoutes"); // Inventario
const posAuthRoutes = require("./routes/posAuthRoutes"); // Punto de venta
const employeeRoutes = require("./routes/employeeRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const stripeRoutes = require("./routes/stripeRoutes"); // 🛒 Stripe pagos
const orderRoutes = require("./routes/orderRoutes"); // 🧾 Mis compras

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (imágenes subidas)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ruta base de prueba
app.get("/", (req, res) => {
  res.send("Servidor Express funcionando 🚀");
});

// ✅ Rutas de la API
app.use("/api/auth", authRoutes); // Inventario
app.use("/api/pos", posAuthRoutes); // Punto de venta
app.use("/api/employees", employeeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/stripe", stripeRoutes); // ✅ Stripe: pagos y save-order
app.use("/api/orders", orderRoutes); // 🧾 Vista de órdenes (mis compras)

// Verificación de conexión a la base de datos
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
