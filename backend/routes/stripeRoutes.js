const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = require("../db");
const nodemailer = require("nodemailer");

const BASE_URL = process.env.BASE_URL; // URL del frontend (Vercel)

// ✅ Crear sesión de pago
router.post("/create-session", async (req, res) => {
  try {
    const { cartItems, email } = req.body;

    if (!cartItems?.length || !email) {
      return res.status(400).json({ error: "Datos inválidos" });
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
            images: [`${BASE_URL}/images${item.imagen_url}`], // ✅ Imagen pública
          },
          unit_amount: Math.round(item.precio_venta * 100),
        },
        quantity: item.cantidad,
      })),
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/cart`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("❌ Error al crear sesión:", err.message);
    res.status(500).json({ error: "Error al crear sesión" });
  }
});

// ✅ Guardar orden + enviar correos
router.post("/save-order", async (req, res) => {
  const { sessionId, userId, cartItems } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM orders WHERE stripe_session_id = $1",
      [sessionId]
    );
    if (existing.rows.length > 0) {
      return res
        .status(200)
        .json({ message: "Orden ya guardada anteriormente" });
    }

    const userRes = await pool.query("SELECT * FROM pos_users WHERE id = $1", [
      userId,
    ]);
    const addressRes = await pool.query(
      "SELECT * FROM pos_user_addresses WHERE user_id = $1",
      [userId]
    );
    const inventoryRes = await pool.query("SELECT email FROM inventory_users");

    if (!userRes.rows.length) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = userRes.rows[0];
    const address = addressRes.rows[0] || {};
    const total = cartItems.reduce(
      (acc, i) => acc + i.precio_venta * i.cantidad,
      0
    );

    await pool.query(
      `INSERT INTO orders (user_id, stripe_session_id, productos, total, direccion_envio, correo_cliente)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        sessionId,
        JSON.stringify(cartItems),
        total,
        JSON.stringify(address),
        user.email,
      ]
    );

    for (const item of cartItems) {
      await pool.query(
        "UPDATE products SET cantidad = cantidad - $1 WHERE id = $2",
        [item.cantidad, item.product_id]
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const productosHTML = cartItems
      .map((i) => `<li>${i.nombre} (x${i.cantidad}) - $${i.precio_venta}</li>`)
      .join("");

    const html = `
      <h2>🛒 Nueva compra realizada</h2>
      <p><strong>Cliente:</strong> ${user.username} (${user.email})</p>
      <ul>${productosHTML}</ul>
      <p><strong>Total:</strong> $${total.toFixed(2)}</p>
      <p><strong>Dirección:</strong><br>
      Calle: ${address.calle || "-"}<br>
      Número: ${address.numero || "-"}<br>
      Colonia: ${address.colonia || "-"}<br>
      Ciudad: ${address.ciudad || "-"}<br>
      Estado: ${address.estado || "-"}<br>
      Código Postal: ${address.codigo_postal || "-"}<br>
      Teléfono: ${address.telefono || "-"}</p>
    `;

    const inventarioEmails = inventoryRes.rows.map((row) => row.email);

    await transporter.sendMail({
      from: `"BrotherSublima" <${process.env.EMAIL_USER}>`,
      to: inventarioEmails,
      subject: "📦 Nueva compra realizada",
      html,
    });

    await transporter.sendMail({
      from: `"BrotherSublima" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🧾 Confirmación de compra",
      html: `
        <p>¡Gracias por tu compra, ${user.username}!</p>
        ${html}
        <p>Te notificaremos cuando tu pedido sea enviado.</p>
      `,
    });

    res.status(200).json({ message: "Orden guardada y correos enviados" });
  } catch (error) {
    console.error("❌ Error en /save-order:", error.message);
    res.status(500).json({ message: "Error al guardar orden o enviar correo" });
  }
});

module.exports = router;
