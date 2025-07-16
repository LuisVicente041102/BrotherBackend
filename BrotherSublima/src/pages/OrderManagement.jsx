import React, { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/orders/all`);
        setOrders(res.data);
      } catch (error) {
        console.error("❌ Error al obtener órdenes:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleUpdate = async (orderId, index) => {
    const updatedOrder = orders[index];
    try {
      await axios.put(`${BACKEND_URL}/api/orders/update/${orderId}`, {
        tracking_number: updatedOrder.tracking_number,
        shipping_company: updatedOrder.shipping_company,
        status: updatedOrder.status,
      });
      alert("✅ Pedido actualizado");
    } catch (error) {
      console.error("❌ Error al actualizar pedido:", error);
      alert("❌ Error al actualizar pedido");
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...orders];
    updated[index][field] = value;
    setOrders(updated);
  };

  const formatAddress = (direccion) => {
    if (!direccion) return "Sin dirección";

    const { calle, numero, colonia, ciudad, estado, codigo_postal, telefono } =
      direccion;

    return [
      `${calle} ${numero}`,
      colonia,
      ciudad,
      estado,
      `C.P. ${codigo_postal}`,
      `Tel: ${telefono}`,
    ]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
        Gestión de Pedidos
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Cliente</th>
              <th className="py-3 px-4 text-left">Dirección</th>
              <th className="py-3 px-4 text-left">Correo</th>
              <th className="py-3 px-4 text-left">Total</th>
              <th className="py-3 px-4 text-left">Estado</th>
              <th className="py-3 px-4 text-left">Paquetería</th>
              <th className="py-3 px-4 text-left">Guía</th>
              <th className="py-3 px-4 text-left">Productos</th>
              <th className="py-3 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={order.id} className="border-t">
                <td className="py-2 px-4">{order.id}</td>
                <td className="py-2 px-4">
                  {order.nombre_cliente || "Sin nombre"}
                </td>
                <td className="py-2 px-4">
                  {formatAddress(order.direccion_envio)}
                </td>
                <td className="py-2 px-4">{order.correo_cliente}</td>
                <td className="py-2 px-4">
                  ${parseFloat(order.total).toFixed(2)}
                </td>
                <td className="py-2 px-4">
                  <select
                    className="border rounded px-2 py-1"
                    value={order.status}
                    onChange={(e) =>
                      handleChange(idx, "status", e.target.value)
                    }
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="enviado">Enviado</option>
                    <option value="en tránsito">En tránsito</option>
                    <option value="recibido">Recibido</option>
                  </select>
                </td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    className="border px-2 py-1 w-32"
                    value={order.shipping_company || ""}
                    onChange={(e) =>
                      handleChange(idx, "shipping_company", e.target.value)
                    }
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    className="border px-2 py-1 w-32"
                    value={order.tracking_number || ""}
                    onChange={(e) =>
                      handleChange(idx, "tracking_number", e.target.value)
                    }
                  />
                </td>
                <td className="py-2 px-4">
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {(order.productos || []).map((p, i) => (
                      <li key={i}>
                        {p.nombre} × {p.cantidad}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleUpdate(order.id, idx)}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  >
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center py-6 text-gray-500">
                  No hay pedidos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
