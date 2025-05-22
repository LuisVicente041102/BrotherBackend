import React from "react";
import Header from "../components/Header";

const CheckoutResumen = () => {
  const total = 368.01; // puedes pasar este dato como prop o de localStorage

  return (
    <>
      <Header isLoggedIn={true} />
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Resumen de compra</h1>
        <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Producto</span>
              <span>$368.01</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span className="text-green-600">Gratis</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button className="mt-6 bg-blue-600 text-white w-full py-2 rounded">
            Confirmar pedido
          </button>
        </div>
      </div>
    </>
  );
};

export default CheckoutResumen;
