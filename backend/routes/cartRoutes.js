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
      SELECT ci.*, p.nombre, p.imagen_url, p.precio_venta, p.cantidad AS stock_disponible
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
 * ✅ Agregar un producto al carrito (o incrementar cantidad si ya existe)
 * Con verificación de stock y decremento de stock del producto.
 */
router.post("/", async (req, res) => {
  const { user_id, product_id, cantidad } = req.body; // 'cantidad' es la cantidad que el usuario quiere añadir AHORA

  if (!user_id || !product_id || !cantidad || cantidad <= 0) {
    return res
      .status(400)
      .json({ message: "Faltan campos requeridos o cantidad inválida." });
  }

  const client = await pool.connect(); // Usar un cliente para transacciones
  try {
    await client.query("BEGIN"); // Iniciar transacción

    // 1. Obtener el stock actual del producto y bloquear la fila
    const productResult = await client.query(
      `SELECT cantidad FROM products WHERE id = $1 FOR UPDATE;`,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    const currentStock = productResult.rows[0].cantidad;

    // 2. Verificar si el producto ya está en el carrito para el usuario
    const existingCartItem = await client.query(
      `SELECT cantidad FROM cart_items WHERE user_id = $1 AND product_id = $2;`,
      [user_id, product_id]
    );

    let newQuantityInCart = cantidad; // Cantidad que el usuario quiere añadir AHORA
    if (existingCartItem.rows.length > 0) {
      // Si el producto ya está en el carrito, sumamos la cantidad existente
      newQuantityInCart += existingCartItem.rows[0].cantidad;
    }

    // 3. Verificar si hay suficiente stock para la NUEVA cantidad total en el carrito
    if (newQuantityInCart > currentStock) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({
          message: `Stock insuficiente. Solo hay ${currentStock} unidades disponibles.`,
        });
    }

    // 4. Actualizar el carrito o insertar el nuevo ítem
    let cartItem;
    if (existingCartItem.rows.length > 0) {
      // Actualizar cantidad en el carrito
      const updated = await client.query(
        `UPDATE cart_items SET cantidad = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *;`,
        [newQuantityInCart, user_id, product_id]
      );
      cartItem = updated.rows[0];
    } else {
      // Insertar nuevo ítem en el carrito
      const inserted = await client.query(
        `INSERT INTO cart_items (user_id, product_id, cantidad) VALUES ($1, $2, $3) RETURNING *;`,
        [user_id, product_id, newQuantityInCart]
      );
      cartItem = inserted.rows[0];
    }

    // 5. Decrementar el stock del producto en la tabla 'products'
    // Restamos solo la cantidad que se acaba de añadir en esta operación POST
    const updatedProductStock = currentStock - cantidad;
    await client.query(`UPDATE products SET cantidad = $1 WHERE id = $2;`, [
      updatedProductStock,
      product_id,
    ]);

    await client.query("COMMIT"); // Confirmar todos los cambios de la transacción
    return res.status(200).json(cartItem);
  } catch (error) {
    await client.query("ROLLBACK"); // Revertir si ocurre cualquier error
    console.error("❌ Error al agregar al carrito (transacción):", error);
    res
      .status(500)
      .json({
        message: "Error interno del servidor al agregar producto al carrito.",
      });
  } finally {
    client.release(); // Liberar el cliente de la pool
  }
});

/**
 * ✅ Actualizar la cantidad de un producto en el carrito (desde el carrito mismo)
 * Endpoint: PUT /api/cart/update-quantity
 * Esta ruta maneja el aumento/disminución de cantidad.
 */
router.put("/update-quantity", async (req, res) => {
  const { user_id, product_id, cantidad } = req.body; // 'cantidad' es la NUEVA cantidad TOTAL deseada en el carrito

  if (!user_id || !product_id || cantidad === undefined || cantidad < 0) {
    return res
      .status(400)
      .json({ message: "Faltan campos requeridos o cantidad inválida." });
  }

  const client = await pool.connect(); // Usar un cliente para transacciones
  try {
    await client.query("BEGIN"); // Iniciar transacción

    // 1. Obtener el stock actual del producto y bloquear la fila
    const productResult = await client.query(
      `SELECT cantidad FROM products WHERE id = $1 FOR UPDATE;`,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    const currentStock = productResult.rows[0].cantidad;

    // 2. Obtener la cantidad actual del producto en el carrito
    const existingCartItem = await client.query(
      `SELECT cantidad FROM cart_items WHERE user_id = $1 AND product_id = $2;`,
      [user_id, product_id]
    );

    if (existingCartItem.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ message: "Producto no encontrado en el carrito." });
    }
    const oldQuantityInCart = existingCartItem.rows[0].cantidad;

    // 3. Calcular la diferencia de stock necesaria
    const stockChange = cantidad - oldQuantityInCart; // Positivo si se añade, negativo si se quita

    // 4. Verificar stock si se intenta aumentar la cantidad
    if (stockChange > 0 && currentStock - stockChange < 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({
          message: `Stock insuficiente. Solo quedan ${currentStock} unidades.`,
        });
    }

    // 5. Si la nueva cantidad es 0, eliminar el ítem del carrito
    if (cantidad === 0) {
      await client.query(
        `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *;`,
        [user_id, product_id]
      );
    } else {
      // 6. Actualizar la cantidad en el carrito
      await client.query(
        `UPDATE cart_items SET cantidad = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *;`,
        [cantidad, user_id, product_id]
      );
    }

    // 7. Actualizar el stock del producto en la tabla 'products'
    // El stock se ajusta en base al cambio (stockChange)
    const updatedProductStock = currentStock - stockChange;
    await client.query(`UPDATE products SET cantidad = $1 WHERE id = $2;`, [
      updatedProductStock,
      product_id,
    ]);

    await client.query("COMMIT"); // Confirmar todos los cambios
    return res
      .status(200)
      .json({ message: "Cantidad de producto en carrito actualizada." });
  } catch (error) {
    await client.query("ROLLBACK"); // Revertir si ocurre cualquier error
    console.error(
      "❌ Error al actualizar cantidad en carrito (transacción):",
      error
    );
    res
      .status(500)
      .json({ message: "Error interno del servidor al actualizar cantidad." });
  } finally {
    client.release(); // Liberar el cliente de la pool
  }
});

/**
 * ✅ Eliminar un producto del carrito de un usuario
 * Repone el stock del producto.
 */
router.delete("/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  const client = await pool.connect(); // Usar un cliente para transacciones
  try {
    await client.query("BEGIN"); // Iniciar transacción

    // 1. Obtener la cantidad de este ítem en el carrito antes de eliminarlo
    const cartItemResult = await client.query(
      `SELECT cantidad FROM cart_items WHERE user_id = $1 AND product_id = $2;`,
      [userId, productId]
    );

    if (cartItemResult.rows.length > 0) {
      const quantityToRemove = cartItemResult.rows[0].cantidad;

      // 2. Eliminar el ítem del carrito
      await client.query(
        `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2;`,
        [userId, productId]
      );

      // 3. Reponer el stock del producto
      await client.query(
        `UPDATE products SET cantidad = cantidad + $1 WHERE id = $2;`,
        [quantityToRemove, productId]
      );
    } else {
      // Si no se encontró el ítem en el carrito, aún así lo eliminamos (no hay nada que hacer)
      await client.query(
        `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2;`,
        [userId, productId]
      );
    }

    await client.query("COMMIT"); // Confirmar todos los cambios
    res.status(204).send(); // No Content
  } catch (error) {
    await client.query("ROLLBACK"); // Revertir si ocurre cualquier error
    console.error(
      "❌ Error al eliminar producto del carrito (transacción):",
      error
    );
    res.status(500).json({ message: "Error al eliminar producto del carrito" });
  } finally {
    client.release(); // Liberar el cliente de la pool
  }
});

/**
 * ✅ Vaciar todo el carrito de un usuario
 * Endpoint: DELETE /api/cart/clear/:userId
 * NOTA: Esta ruta NO repone el stock. Se usará después de una compra exitosa.
 */
router.delete("/clear/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    // No usamos transacción aquí porque el stock ya se descontó al añadir al carrito
    // y se maneja en la lógica de pago/orden.
    await pool.query(`DELETE FROM cart_items WHERE user_id = $1;`, [userId]);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error("❌ Error al vaciar el carrito:", error);
    res.status(500).json({ message: "Error al vaciar el carrito" });
  }
});

module.exports = router;
