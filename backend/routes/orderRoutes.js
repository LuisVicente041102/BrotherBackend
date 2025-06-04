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

    const ordenes = result.rows.map((orden) => {
      const fecha = new Date(orden.created_at);
      const year = fecha.getFullYear();
      const numeroOrden = `ORD-${year}-${String(orden.id).padStart(4, "0")}`;

      return {
        ...orden,
        numero_orden: numeroOrden,
        productos: orden.productos || [],
        direccion_envio: orden.direccion_envio || {},
      };
    });

    res.json(ordenes);
  } catch (error) {
    console.error("❌ Error al obtener órdenes:", error);
    res.status(500).json({ message: "Error al obtener órdenes" });
  }
});

// ✅ Obtener todas las órdenes con nombre del cliente
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.username AS nombre_cliente
      FROM orders o
      LEFT JOIN pos_users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    const ordenes = result.rows.map((orden) => {
      const fecha = new Date(orden.created_at);
      const year = fecha.getFullYear();
      const numeroOrden = `ORD-${year}-${String(orden.id).padStart(4, "0")}`;

      return {
        ...orden,
        numero_orden: numeroOrden,
        productos: orden.productos || [],
        direccion_envio: orden.direccion_envio || {},
        nombre_cliente: orden.nombre_cliente || "Sin nombre",
      };
    });

    res.json(ordenes);
  } catch (error) {
    console.error("❌ Error al obtener todas las órdenes:", error);
    res.status(500).json({ message: "Error al obtener todas las órdenes" });
  }
});

// ✅ Actualizar guía de seguimiento, paquetería y estado
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { tracking_number, shipping_company, status } = req.body;

  try {
    await pool.query(
      `
      UPDATE orders
      SET tracking_number = $1,
          shipping_company = $2,
          status = $3
      WHERE id = $4
    `,
      [tracking_number, shipping_company, status, id]
    );

    res.json({ message: "✅ Pedido actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar pedido:", error);
    res.status(500).json({ message: "Error al actualizar pedido" });
  }
});

module.exports = router;
