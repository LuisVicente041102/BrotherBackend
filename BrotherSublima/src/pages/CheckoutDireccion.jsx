import React from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const CheckoutDireccion = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header isLoggedIn={true} />
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Elige la forma de entrega</h1>
        <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto space-y-4">
          <div className="border p-4 rounded bg-gray-50">
            <h2 className="font-semibold">📦 Enviar a domicilio</h2>
            <p className="text-gray-600">Calle 21 de Marzo 218 - Colima</p>
            <p className="text-green-600 mt-1">Gratis</p>
            <button className="text-blue-600 mt-2 text-sm underline">
              Modificar domicilio
            </button>
          </div>
          <div className="border p-4 rounded hover:bg-gray-50 cursor-pointer">
            <h2 className="font-semibold">🏬 Retiro en punto de entrega</h2>
            <p className="text-green-600">Gratis</p>
          </div>
          <button
            className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded"
            onClick={() => navigate("/checkout/pago")}
          >
            Continuar
          </button>
        </div>
      </div>
    </>
  );
};

export default CheckoutDireccion; // 👈 ESTA LÍNEA ES OBLIGATORIA
