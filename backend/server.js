require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes"); // ✅ Rutas de autenticación
const employeeRoutes = require("./routes/employeeRoutes"); // ✅ Rutas de empleados

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.send("Servidor Express funcionando 🚀");
});

// ✅ Agregar rutas de autenticación y empleados
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

// Ruta de prueba para verificar conexión a PostgreSQL
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
