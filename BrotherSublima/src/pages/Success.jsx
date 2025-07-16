// 📄 src/pages/Success.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const [estado, setEstado] = useState("cargando"); // cargando | exito | error

  const hasSavedOrder = useRef(false); // ✅ evita reenvío

  useEffect(() => {
    const guardarOrden = async () => {
      if (hasSavedOrder.current) return;
      hasSavedOrder.current = true;

      const user = JSON.parse(localStorage.getItem("pos_user"));
      const cartItems = JSON.parse(localStorage.getItem("cartItems"));

      if (!sessionId || !user || !cartItems) {
        setEstado("error");
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/stripe/save-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            userId: user.id,
            cartItems,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.removeItem("cartItems");
          localStorage.removeItem("direccion");
          setEstado("exito");
        } else {
          console.error("❌ Error en guardar orden:", data.message);
          setEstado("error");
        }
      } catch (err) {
        console.error("❌ Error al guardar orden:", err);
        setEstado("error");
      }
    };

    guardarOrden();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow text-center max-w-md">
        {estado === "cargando" && (
          <p className="text-gray-700">Procesando tu orden...</p>
        )}
        {estado === "exito" && (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              ¡Pago exitoso! 🎉
            </h1>
            <p className="text-gray-700 mb-6">
              Gracias por tu compra. Tu orden ha sido registrada correctamente.
            </p>
          </>
        )}
        {estado === "error" && (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Algo salió mal 😥
            </h1>
            <p className="text-gray-700 mb-6">
              No pudimos registrar tu orden. Si ya realizaste el pago, por favor
              contáctanos o intenta nuevamente.
            </p>
          </>
        )}
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
