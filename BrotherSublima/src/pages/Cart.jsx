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
  // Estado para el mensaje de alerta personalizada
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

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

  // Función para mostrar alertas personalizadas
  const displayAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage("");
    }, 3000); // Ocultar después de 3 segundos
  };

  const fetchCart = async (userId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/cart/${userId}`);
      const data = await res.json();
      // Asegúrate de que imagen_url se construya correctamente aquí también
      const formattedCart = data.map((item) => ({
        ...item,
        imagen_url: item.imagen_url?.startsWith("http")
          ? item.imagen_url
          : `${BACKEND_URL}${item.imagen_url}`,
      }));
      setCart(formattedCart);
    } catch (err) {
      console.error("❌ Error al obtener el carrito:", err);
      displayAlert("Error al cargar el carrito.");
    }
  };

  const fetchAddress = async (userId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/address/${userId}`);
      const data = await res.json();
      setAddress(data);
    } catch (err) {
      console.error("❌ Error al obtener dirección:", err);
      displayAlert("Error al cargar la dirección.");
    }
  };

  const removeFromCart = async (productId) => {
    const user = JSON.parse(localStorage.getItem("pos_user"));
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/cart/${user.id}/${productId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Error al eliminar producto del carrito.");
      }
      // Actualiza el estado del carrito después de eliminar
      setCart((prev) => prev.filter((item) => item.product_id !== productId));
      displayAlert("✅ Producto eliminado del carrito.");
    } catch (err) {
      console.error("❌ Error al eliminar producto:", err);
      displayAlert(err.message || "Hubo un problema al eliminar el producto.");
    }
  };

  // Nueva función para actualizar la cantidad de un ítem en el carrito
  const updateCartItemQuantity = async (productId, newQuantity) => {
    const user = JSON.parse(localStorage.getItem("pos_user"));
    if (!user || !user.id) {
      displayAlert("Necesitas iniciar sesión para modificar el carrito.");
      return;
    }

    // Validación básica de cantidad
    if (newQuantity < 0) return; // No permitir cantidades negativas

    try {
      const response = await fetch(`${BACKEND_URL}/api/cart/update-quantity`, {
        method: "PUT", // Usaremos un método PUT para actualizar
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          product_id: productId,
          cantidad: newQuantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar la cantidad."
        );
      }

      // Si la actualización fue exitosa, volvemos a cargar el carrito para reflejar los cambios
      // Esto también actualizará el stock disponible en el backend
      fetchCart(user.id);
      displayAlert("✅ Cantidad actualizada.");
    } catch (error) {
      console.error("❌ Error al actualizar cantidad:", error);
      displayAlert(
        error.message || "Hubo un problema al actualizar la cantidad."
      );
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
                      src={item.imagen_url} // Ya viene formateada desde fetchCart
                      alt={item.nombre}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div>
                      <h2 className="text-lg font-semibold">{item.nombre}</h2>
                      <p className="text-gray-600">
                        ${Number(item.precio_venta).toFixed(2)}
                      </p>
                      {/* Controles de cantidad */}
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() =>
                            updateCartItemQuantity(
                              item.product_id,
                              item.cantidad - 1
                            )
                          }
                          className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.cantidad <= 1} // Deshabilita si la cantidad es 1 o menos
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-t border-b border-gray-200">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() =>
                            updateCartItemQuantity(
                              item.product_id,
                              item.cantidad + 1
                            )
                          }
                          className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          // Deshabilita si la cantidad en carrito es igual al stock disponible
                          disabled={item.cantidad >= item.stock_disponible}
                        >
                          +
                        </button>
                      </div>
                      {/* Mensaje de stock si se alcanza el límite */}
                      {item.cantidad >= item.stock_disponible &&
                        item.stock_disponible > 0 && (
                          <p className="text-red-500 text-xs mt-1">
                            Máximo stock disponible alcanzado.
                          </p>
                        )}
                      {item.stock_disponible <= 0 && (
                        <p className="text-red-500 text-xs mt-1">
                          Producto agotado.
                        </p>
                      )}
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

      {/* Alerta personalizada */}
      {showAlert && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
          {alertMessage}
        </div>
      )}
    </>
  );
};

export default Cart;
