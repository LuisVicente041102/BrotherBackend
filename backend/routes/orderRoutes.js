const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🔍 Obtener órdenes de un usuario
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    // Convertir JSONB a objeto para frontend
    const ordenes = result.rows.map((orden) => ({
      ...orden,
      productos: orden.productos || [],
      direccion_envio: orden.direccion_envio || {},
    }));

    res.json(ordenes);
  } catch (error) {
    console.error("❌ Error al obtener órdenes:", error);
    res.status(500).json({ message: "Error al obtener órdenes" });
  }
});

module.exports = router;
