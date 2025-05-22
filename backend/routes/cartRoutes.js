const express = require("express");
const pool = require("../db");
const router = express.Router();

/**
 * ✅ Obtener carrito por ID de usuario
 */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT ci.*, p.nombre, p.imagen_url, p.precio_venta
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
    `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener carrito:", error);
    res.status(500).json({ message: "Error al obtener carrito" });
  }
});

/**
 * ✅ Agregar o actualizar un producto en el carrito
 */
router.post("/", async (req, res) => {
  const { user_id, product_id, cantidad } = req.body;

  if (!user_id || !product_id || !cantidad) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    // Verificar si ya existe ese producto para el usuario
    const existing = await pool.query(
      `SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2`,
      [user_id, product_id]
    );

    if (existing.rows.length > 0) {
      // Si ya existe, actualizamos la cantidad
      const updated = await pool.query(
        `UPDATE cart_items SET cantidad = cantidad + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *`,
        [cantidad, user_id, product_id]
      );
      return res.status(200).json(updated.rows[0]);
    } else {
      // Si no existe, lo insertamos
      const inserted = await pool.query(
        `INSERT INTO cart_items (user_id, product_id, cantidad) VALUES ($1, $2, $3) RETURNING *`,
        [user_id, product_id, cantidad]
      );
      return res.status(201).json(inserted.rows[0]);
    }
  } catch (error) {
    console.error("❌ Error al agregar al carrito:", error);
    res.status(500).json({ message: "Error al agregar producto al carrito" });
  }
});

/**
 * ❌ Eliminar un producto del carrito de un usuario
 */
router.delete("/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  try {
    await pool.query(
      `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );
    res.status(204).send(); // No Content
  } catch (error) {
    console.error("❌ Error al eliminar producto del carrito:", error);
    res.status(500).json({ message: "Error al eliminar producto del carrito" });
  }
});

module.exports = router;
