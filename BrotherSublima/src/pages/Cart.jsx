import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CheckoutButton from "../components/CheckoutButton";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("pos_user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      navigate("/poslogin");
      return;
    }

    setIsLoggedIn(true);
    fetchCart(user.id);
    fetchAddress(user.id);
  }, []);

  const fetchCart = async (userId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/cart/${userId}`);
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error("❌ Error al obtener el carrito:", err);
    }
  };

  const fetchAddress = async (userId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/address/${userId}`);
      const data = await res.json();
      setAddress(data);
    } catch (err) {
      console.error("❌ Error al obtener dirección:", err);
    }
  };

  const removeFromCart = async (productId) => {
    const user = JSON.parse(localStorage.getItem("pos_user"));
    try {
      await fetch(`${BACKEND_URL}/api/cart/${user.id}/${productId}`, {
        method: "DELETE",
      });
      setCart((prev) => prev.filter((item) => item.product_id !== productId));
    } catch (err) {
      console.error("❌ Error al eliminar producto:", err);
    }
  };

  const total = cart.reduce(
    (acc, item) => acc + item.precio_venta * item.cantidad,
    0
  );

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Carrito de Compras
        </h1>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center">
                Tu carrito está vacío.
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded shadow flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={`${BACKEND_URL}${item.imagen_url}`}
                      alt={item.nombre}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div>
                      <h2 className="text-lg font-semibold">{item.nombre}</h2>
                      <p className="text-gray-600">
                        ${Number(item.precio_venta).toFixed(2)} x{" "}
                        {item.cantidad}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">
                      ${Number(item.precio_venta * item.cantidad).toFixed(2)}
                    </p>
                    <button
                      className="text-red-500 hover:underline text-sm mt-2"
                      onClick={() => removeFromCart(item.product_id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-white p-6 rounded shadow space-y-6">
            {address && (
              <div className="bg-gray-50 p-4 rounded border text-sm">
                <h4 className="font-semibold mb-2 text-indigo-700">
                  Dirección de entrega
                </h4>
                <p>
                  {address.calle} #{address.numero}, {address.colonia},{" "}
                  {address.ciudad}, {address.estado}, CP {address.codigo_postal}
                </p>
                <p>📞 {address.telefono}</p>
                <p className="mt-2 text-gray-600 text-xs">
                  Asegúrate de que estos datos sean correctos.
                  <br />
                  Puedes editarlos en la sección{" "}
                  <span
                    onClick={() => navigate("/agregar-direccion")}
                    className="text-indigo-600 underline cursor-pointer"
                  >
                    Dirección
                  </span>
                  .
                </p>
              </div>
            )}

            <h3 className="text-xl font-semibold">Resumen de compra</h3>
            <div className="flex justify-between mb-2">
              <span>Productos</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Envío</span>
              <span className="text-green-600">Gratis</span>
            </div>
            <hr />
            <div className="flex justify-between mt-4 font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {cart.length > 0 && (
              <div className="mt-6">
                <CheckoutButton cartItems={cart} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
