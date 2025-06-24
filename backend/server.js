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
const addressRoutes = require("./routes/addressRoutes");
const stripeRoutes = require("./routes/stripeRoutes"); // 🛒 Stripe pagos
const orderRoutes = require("./routes/orderRoutes"); // 🧾 Mis compras

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS completamente abierto para desarrollo (Ngrok, Vercel, localhost)
app.use(
  cors({
    origin: "*", // ⚠️ SOLO para desarrollo. En producción especifica dominios permitidos.
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware para analizar JSON
app.use(express.json());

// Servir archivos estáticos (imágenes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ruta raíz para probar servidor
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
app.use("/api/address", addressRoutes);
app.use("/api/stripe", stripeRoutes); // Stripe
app.use("/api/orders", orderRoutes); // Órdenes

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

// Iniciar servidor (0.0.0.0 para compatibilidad con Ngrok y Render)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
