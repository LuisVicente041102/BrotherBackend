import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";

const Success = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("pos_user");
    if (token && user) {
      setIsLoggedIn(true);
    }

    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );

    const guardarOrden = async () => {
      const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const direccion = JSON.parse(localStorage.getItem("direccion") || "{}");
      const correo = localStorage.getItem("email") || "";
      const posUser = JSON.parse(localStorage.getItem("pos_user") || "{}");
      const userId = posUser?.id;

      // 👇 DEPURACIÓN
      console.log("✅ sessionId:", sessionId);
      console.log("✅ cartItems:", cartItems);
      console.log("✅ direccion:", direccion);
      console.log("✅ correo:", correo);
      console.log("✅ userId:", userId);

      if (!sessionId || !userId || cartItems.length === 0) {
        console.warn("⚠️ Faltan datos para guardar la orden");
        return;
      }

      try {
        const res = await axios.post(
          "http://localhost:5000/api/stripe/save-order",
          {
            sessionId,
            userId,
            cartItems,
            direccion,
            correo,
          }
        );

        console.log(res.data.message);
        localStorage.removeItem("cartItems");
        localStorage.removeItem("direccion");
      } catch (error) {
        console.error("❌ Error al guardar la orden:", error);
      }
    };

    guardarOrden();
  }, []);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />

      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-xl w-full text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            ¡Felicidades! 🎉
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            Tu compra ha sido completada con éxito. Durante las próximas 24
            horas recibirás en tu correo electrónico la guía de seguimiento
            correspondiente. Si es día hábil, podría llegarte incluso antes.
          </p>

          <button
            onClick={() => navigate("/catalogo")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition"
          >
            🛍️ Seguir comprando
          </button>
        </div>
      </div>
    </>
  );
};

export default Success;
