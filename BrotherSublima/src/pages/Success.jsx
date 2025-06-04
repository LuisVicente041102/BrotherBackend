// 📄 src/pages/Success.jsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  useEffect(() => {
    const guardarOrden = async () => {
      const user = JSON.parse(localStorage.getItem("pos_user"));
      const cartItems = JSON.parse(localStorage.getItem("cartItems"));
      const direccion = JSON.parse(localStorage.getItem("direccion") || "{}");

      if (!sessionId || !user || !cartItems) {
        console.error("❌ Faltan datos para guardar la orden");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/stripe/save-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            userId: user.id,
            cartItems,
            direccion,
          }),
        });

        if (res.ok) {
          localStorage.removeItem("cartItems");
          localStorage.removeItem("direccion");
          console.log("✅ Orden guardada exitosamente");
        } else {
          console.error("❌ Error al guardar orden");
        }
      } catch (err) {
        console.error("❌ Error en guardarOrden:", err);
      }
    };

    guardarOrden();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow text-center max-w-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          ¡Pago exitoso! 🎉
        </h1>
        <p className="text-gray-700 mb-6">
          Gracias por tu compra. Tu orden ha sido registrada correctamente.
        </p>
        <button
          onClick={() => navigate("/home")}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default Success;
