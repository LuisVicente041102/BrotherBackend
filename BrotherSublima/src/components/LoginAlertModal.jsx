import React from "react";

const LoginAlertModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm text-center">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Debes iniciar sesión
        </h2>
        <p className="text-gray-600 mb-6">
          Inicia sesión para poder ver tu carrito de compras.
        </p>
        <button
          onClick={onClose}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default LoginAlertModal;
