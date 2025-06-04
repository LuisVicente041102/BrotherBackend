// 📄 backend/routes/stripeRoutes.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = require("../db");

// ✅ Crear sesión de pago (ya no pide dirección)
router.post("/create-session", async (req, res) => {
  try {
    const { cartItems, email } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res
        .status(400)
        .json({ error: "No se enviaron productos válidos" });
    }

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Correo electrónico inválido" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "mxn",
          product_data: {
            name: item.nombre,
            images: [`http://localhost:5000${item.imagen_url}`],
          },
          unit_amount: Math.round(item.precio_venta * 100),
        },
        quantity: item.cantidad,
      })),
      success_url:
        "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cart",
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("❌ Error al crear sesión de pago:", err.message);
    res.status(500).json({ error: "Error al crear sesión de pago" });
  }
});

// ✅ Guardar orden con dirección desde base de datos
router.post("/save-order", async (req, res) => {
  try {
    const { sessionId, userId, cartItems } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Sesión no válida o no pagada" });
    }

    // 🧾 Obtener dirección del usuario desde la tabla correcta
    const direccionResult = await pool.query(
      "SELECT * FROM pos_user_addresses WHERE user_id = $1",
      [userId]
    );
    const direccion = direccionResult.rows[0] || {};

    const correo = session.customer_details?.email || "";
    const productos = cartItems.map((item) => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
    }));
    const total = session.amount_total / 100;

    const insertResult = await pool.query(
      `INSERT INTO orders (user_id, stripe_session_id, productos, total, direccion_envio, correo_cliente, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
       ON CONFLICT DO NOTHING`,
      [
        userId,
        sessionId,
        JSON.stringify(productos),
        total,
        JSON.stringify(direccion),
        correo,
      ]
    );

    if (insertResult.rowCount === 0) {
      return res.status(200).json({ message: "Orden ya registrada" });
    }

    // 📉 Actualizar stock
    for (const item of cartItems) {
      await pool.query(
        `UPDATE products SET cantidad = GREATEST(cantidad - $1, 0) WHERE nombre = $2`,
        [item.cantidad, item.nombre]
      );
    }

    res
      .status(200)
      .json({ message: "Orden guardada con dirección del sistema" });
  } catch (err) {
    console.error("❌ Error al guardar orden:", err);
    res.status(500).json({ error: "Error al guardar orden" });
  }
});

module.exports = router;
