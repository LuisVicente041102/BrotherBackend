import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const MisCompras = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("pos_user");

    if (!token || !user) {
      navigate("/pos-login");
      return;
    }

    const parsedUser = JSON.parse(user);
    setIsLoggedIn(true);

    const fetchOrdenes = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/orders/user/${parsedUser.id}`
        );
        const data = await res.json();
        setOrdenes(data);
      } catch (error) {
        console.error("❌ Error al obtener órdenes:", error);
      }
    };

    fetchOrdenes();
  }, [navigate]);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />

      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Mis compras 🧾
          </h2>

          {ordenes.length === 0 ? (
            <p className="text-center text-gray-500">
              Aún no has realizado compras.
            </p>
          ) : (
            <div className="space-y-6">
              {ordenes.map((orden) => (
                <div
                  key={orden.id}
                  className="border rounded-lg p-4 shadow-sm bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg text-indigo-600">
                      #{orden.id}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(orden.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="mb-2">
                    <strong>Total:</strong> ${orden.total}
                  </p>

                  <p className="mb-2">
                    <strong>Estado:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded text-white text-sm ${
                        orden.status === "pendiente"
                          ? "bg-yellow-500"
                          : orden.status === "enviado"
                          ? "bg-blue-500"
                          : orden.status === "entregado"
                          ? "bg-green-600"
                          : "bg-gray-400"
                      }`}
                    >
                      {orden.status}
                    </span>
                  </p>

                  <p className="mb-2">
                    <strong>Productos:</strong>
                  </p>
                  <ul className="list-disc list-inside text-gray-700">
                    {orden.productos.map((p, index) => (
                      <li key={index}>
                        {p.nombre} × {p.cantidad}
                      </li>
                    ))}
                  </ul>

                  {orden.tracking_number && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Guía:</strong> {orden.tracking_number} (
                      {orden.shipping_company})
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MisCompras;
