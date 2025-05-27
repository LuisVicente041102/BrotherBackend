import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const InventorySales = () => {
  const [sales, setSales] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/payments/sales"
        );
        console.log("Ventas recibidas:", response.data);
        setSales(response.data);
      } catch (error) {
        console.error("Error al obtener ventas:", error);
      }
    };

    fetchSales();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          📈 Ventas Realizadas (Stripe)
        </h1>

        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
          <table className="min-w-full table-auto border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Monto</th>
                <th className="px-4 py-2 border">Moneda</th>
                <th className="px-4 py-2 border">Estado</th>
                <th className="px-4 py-2 border">Fecha</th>
                <th className="px-4 py-2 border">Nombre</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Dirección</th>
                <th className="px-4 py-2 border">Productos</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(sales) &&
                sales.map((sale) => (
                  <tr key={sale.id} className="text-center">
                    <td className="px-4 py-2 border">{sale.id}</td>
                    <td className="px-4 py-2 border">${sale.amount}</td>
                    <td className="px-4 py-2 border">
                      {sale.currency.toUpperCase()}
                    </td>
                    <td className="px-4 py-2 border">{sale.status}</td>
                    <td className="px-4 py-2 border">{sale.created}</td>
                    <td className="px-4 py-2 border">{sale.name}</td>
                    <td className="px-4 py-2 border">{sale.email}</td>
                    <td className="px-4 py-2 border">{sale.address}</td>
                    <td className="px-4 py-2 border">
                      {sale.items.map((item, idx) => (
                        <div key={idx}>
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              {Array.isArray(sales) && sales.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-gray-500">
                    No hay ventas registradas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg shadow-md transition"
          >
            🔙 Volver al Panel de Inventario
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventorySales;
