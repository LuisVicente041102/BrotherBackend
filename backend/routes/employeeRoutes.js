const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Acceso denegado" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    req.user = user;
    next();
  });
};

// ✅ Ruta para obtener empleados (solo admin)
router.get("/", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "No tienes permisos para ver empleados" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, role FROM inventory_users WHERE role = 'employee'"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener empleados:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ✅ Ruta para agregar empleados (solo admin)
router.post("/add", authenticateToken, async (req, res) => {
  const { email, password } = req.body;

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "No tienes permisos para agregar empleados" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO inventory_users (email, password, role) VALUES ($1, $2, 'employee')",
      [email, hashedPassword]
    );

    res.status(201).json({ message: "Empleado agregado exitosamente" });
  } catch (error) {
    console.error("❌ Error al agregar empleado:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ✅ Ruta para eliminar empleados (solo admin)
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "No tienes permisos para eliminar empleados" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM inventory_users WHERE id = $1 AND role = 'employee'",
      [id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Empleado no encontrado o no permitido" });
    }

    res.json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar empleado:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
