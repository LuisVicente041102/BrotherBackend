// 📄 src/components/CheckoutButton.jsx
import React from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51RRRK8QPS7CfkaTCQeKZG7VWezS3UhiNJ4pDWhd5Zw5JrzSeFgl4hrJ1zepJrVNjuhBjmuKB4ylLe8u0Tktnq1Re00oYGSZIy4"
);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // ✅ Usar variable de entorno

const CheckoutButton = ({ cartItems }) => {
  const handleCheckout = async () => {
    const user = JSON.parse(localStorage.getItem("pos_user"));

    if (!user || !user.id || !cartItems || cartItems.length === 0) {
      alert("Faltan datos para procesar el pago.");
      return;
    }

    const email = user.email || "demo@email.com";

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    localStorage.setItem("pos_user", JSON.stringify(user));
    localStorage.setItem("email", email);

    const itemsConUserId = cartItems.map((item) => ({
      ...item,
      user_id: user.id,
    }));

    try {
      const res = await fetch(`${BACKEND_URL}/api/stripe/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems: itemsConUserId, email }),
      });

      const data = await res.json();
      const stripe = await stripePromise;

      if (!data.sessionId) {
        throw new Error("No se recibió sessionId de Stripe");
      }

      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err) {
      console.error("❌ Error al redirigir al checkout:", err.message);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full"
    >
      Ir a pagar con Stripe 💳
    </button>
  );
};

export default CheckoutButton;
