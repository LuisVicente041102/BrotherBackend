import React from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const CheckoutPago = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header isLoggedIn={true} />
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Elige cómo pagar</h1>
        <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto space-y-4">
          <div className="border p-4 rounded bg-gray-50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="pago" defaultChecked />
              <span>💳 Tarjeta de crédito (terminación 1234)</span>
            </label>
          </div>
          <div className="border p-4 rounded hover:bg-gray-50 cursor-pointer">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="pago" />
              <span>🏦 Transferencia bancaria</span>
            </label>
          </div>
          <button
            className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded"
            onClick={() => navigate("/checkout/resumen")}
          >
            Continuar
          </button>
        </div>
      </div>
    </>
  );
};

export default CheckoutPago;
