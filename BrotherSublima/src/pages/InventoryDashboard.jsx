import React from "react";
import { useNavigate } from "react-router-dom";

const InventoryDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Panel de Control del Inventario
      </h1>
      <p className="text-gray-600 mb-10 text-center max-w-xl">
        Administra todos los aspectos de tu inventario de forma sencilla y
        organizada.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        <button
          onClick={() => navigate("/add-product")}
          className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg shadow-md transition"
        >
          ➕ Agregar Producto
        </button>

        <button
          onClick={() => navigate("/view-product")}
          className="bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg shadow-md transition"
        >
          📦 Ver Productos
        </button>

        <button
          onClick={() => navigate("/archive-products")}
          className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg shadow-md transition"
        >
          📦 Productos Archivados
        </button>

        <button
          onClick={() => navigate("/categories")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-6 rounded-lg shadow-md transition"
        >
          🗂️ Categorías
        </button>

        <button
          onClick={() => navigate("/reports")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-lg shadow-md transition"
        >
          📊 Reportes de Inventario
        </button>

        <button
          onClick={() => navigate("/archive-category")}
          className="bg-gray-700 hover:bg-gray-800 text-white py-4 px-6 rounded-lg shadow-md transition"
        >
          📦 Categorías Archivados
        </button>
      </div>
    </div>
  );
};

export default InventoryDashboard;
