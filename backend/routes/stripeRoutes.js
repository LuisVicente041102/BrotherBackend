const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const pool = require("../db");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🛒 Crear sesión de pago con datos forzados
router.post("/create-session", async (req, res) => {
  const { cartItems } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
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
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["MX"],
      },
      customer_creation: "always",
      success_url:
        "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cancel",
      metadata: {
        userId: cartItems[0].user_id.toString(),
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("❌ Error al crear sesión de pago:", error);
    res.status(500).json({ error: "Error al crear sesión de pago" });
  }
});

// 📊 Obtener ventas desde Stripe
router.get("/sales", async (req, res) => {
  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 20 });

    const sales = await Promise.all(
      sessions.data
        .filter((session) => session.payment_status === "paid")
        .map(async (session) => {
          const lineItems = await stripe.checkout.sessions.listLineItems(
            session.id,
            { limit: 10 }
          );

          let customer = null;
          if (session.customer) {
            customer = await stripe.customers.retrieve(session.customer);
          }

          const rawAddress =
            session.shipping?.address || session.customer_details?.address;

          const address = rawAddress
            ? `${rawAddress.line1}, ${rawAddress.postal_code}, ${rawAddress.city}, ${rawAddress.state}, ${rawAddress.country}`
            : "Sin dirección";

          return {
            id: session.id,
            amount: session.amount_total / 100,
            currency: session.currency,
            status: session.payment_status,
            created: new Date(session.created * 1000).toLocaleString(),
            email: customer?.email || "Sin email",
            name: customer?.name || "Sin nombre",
            address,
            items: lineItems.data.map((item) => ({
              name: item.description,
              quantity: item.quantity,
            })),
          };
        })
    );

    res.json(sales);
  } catch (error) {
    console.error("❌ Error al obtener ventas:", error);
    res.status(500).json({ message: "Error al obtener ventas de Stripe" });
  }
});

// 📝 Guardar orden manual (Success.jsx)
router.post("/save-order", async (req, res) => {
  const { sessionId, userId, cartItems, direccion, correo } = req.body;

  try {
    const productos = cartItems.map((item) => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
    }));

    const total = cartItems.reduce(
      (acc, item) => acc + item.precio_venta * item.cantidad,
      0
    );

    const direccionFormateada = direccion || {};

    await pool.query(
      `
      INSERT INTO orders (
        user_id, stripe_session_id, productos, total, direccion_envio,
        correo_cliente, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
      ON CONFLICT (stripe_session_id) DO NOTHING
    `,
      [
        userId,
        sessionId,
        JSON.stringify(productos),
        total,
        JSON.stringify(direccionFormateada),
        correo,
      ]
    );

    res.json({ message: "✅ Orden guardada con éxito (o ya existía)" });
  } catch (error) {
    console.error("❌ Error al guardar orden manual:", error);
    res.status(500).json({ error: "Error al guardar la orden" });
  }
});

module.exports = router;
