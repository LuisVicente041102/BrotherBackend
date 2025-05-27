import React from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51RRRK8QPS7CfkaTCQeKZG7VWezS3UhiNJ4pDWhd5Zw5JrzSeFgl4hrJ1zepJrVNjuhBjmuKB4ylLe8u0Tktnq1Re00oYGSZIy4"
);

const CheckoutButton = ({ cartItems, onBeforeCheckout }) => {
  const handleCheckout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("pos_user"));
      if (!user || !user.id) {
        alert("Debes iniciar sesión para continuar");
        return;
      }

      // ✅ Ejecutar función que guarda datos en localStorage
      if (onBeforeCheckout) {
        onBeforeCheckout();
      }

      const itemsConUserId = cartItems.map((item) => ({
        ...item,
        user_id: user.id,
      }));

      const res = await fetch(
        "http://localhost:5000/api/stripe/create-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cartItems: itemsConUserId }),
        }
      );

      const { sessionId } = await res.json();
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("❌ Error al redirigir al checkout:", error);
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
