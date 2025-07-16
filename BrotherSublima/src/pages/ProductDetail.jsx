import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CheckoutButton from "../components/CheckoutButton";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Nuevo estado para controlar la cantidad a agregar al carrito (por defecto 1)
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  // Mensaje de alerta personalizado
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("pos_user");
    if (token && user) {
      setIsLoggedIn(true);
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
        // Asegurarse de que la cantidad a añadir no exceda el stock si se recarga la página
        if (data.cantidad < quantityToAdd) {
          setQuantityToAdd(data.cantidad > 0 ? 1 : 0);
        }
      } catch (err) {
        console.error("❌ Error al obtener producto:", err);
      }
    };

    fetchProduct();
  }, [id]);

  // Función para mostrar alertas personalizadas
  const displayAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage("");
    }, 3000); // Ocultar después de 3 segundos
  };

  // Determina si el botón "Agregar al carrito" debe estar deshabilitado
  const isAddToCartDisabled =
    !product || product.cantidad <= 0 || quantityToAdd <= 0;
  // Determina el texto del botón
  const addToCartButtonText =
    product && product.cantidad <= 0 ? "Agotado" : "Agregar al carrito 🛒";

  // Manejador para agregar al carrito
  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem("pos_user"));
    if (!user || !user.id) {
      displayAlert("Necesitas iniciar sesión para agregar al carrito");
      return;
    }

    // Validación de stock en el frontend antes de enviar la petición
    if (product.cantidad <= 0) {
      displayAlert("Este producto está agotado.");
      return;
    }
    if (quantityToAdd > product.cantidad) {
      displayAlert(`Solo hay ${product.cantidad} unidades disponibles.`);
      return;
    }
    if (quantityToAdd <= 0) {
      displayAlert("La cantidad a agregar debe ser al menos 1.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          product_id: product.id,
          cantidad: quantityToAdd, // Usa la cantidad seleccionada
        }),
      });

      if (!response.ok) {
        // Si el backend devuelve un error (ej. 400 por stock insuficiente)
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al agregar al carrito");
      }

      displayAlert("✅ Producto agregado al carrito");
      // Opcional: Actualizar el stock mostrado en el frontend después de agregar al carrito
      // Esto requeriría volver a obtener el producto o calcular el nuevo stock localmente
      // Para simplificar, recargaremos el producto para obtener el stock actualizado
      const res = await fetch(`${BACKEND_URL}/api/products/${id}`);
      const updatedProductData = await res.json();
      setProduct(updatedProductData);
      setQuantityToAdd(1); // Resetear a 1 después de añadir
    } catch (error) {
      console.error("❌ Error:", error);
      displayAlert(error.message || "Hubo un problema al agregar al carrito");
    }
  };

  if (!product) {
    return (
      <div className="text-center mt-20 text-gray-500">
        Cargando producto...
      </div>
    );
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />

      <div className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <img
              src={
                product.imagen_url?.startsWith("http")
                  ? product.imagen_url
                  : `${BACKEND_URL}${product.imagen_url}`
              }
              alt={product.nombre}
              className="w-full h-96 object-cover"
            />
          </div>

          <div className="md:w-1/2 p-6 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.nombre}
              </h1>
              <p className="text-indigo-600 text-2xl font-semibold mb-4">
                ${Number(product.precio_venta).toFixed(2)}
              </p>

              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Stock disponible:</span>{" "}
                {/* Muestra el stock y un mensaje si está agotado */}
                {product.cantidad > 0 ? (
                  product.cantidad
                ) : (
                  <span className="text-red-500 font-bold">Agotado</span>
                )}
              </p>

              <p className="text-gray-600 mt-4">
                Este producto está listo para personalizar y entregar.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
              {/* Selector de cantidad */}
              {product.cantidad > 0 && (
                <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                  <label
                    htmlFor="quantity"
                    className="font-semibold text-gray-700"
                  >
                    Cantidad:
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={product.cantidad}
                    value={quantityToAdd}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (
                        !isNaN(value) &&
                        value >= 1 &&
                        value <= product.cantidad
                      ) {
                        setQuantityToAdd(value);
                      } else if (value < 1) {
                        setQuantityToAdd(1); // Mínimo 1
                      } else if (value > product.cantidad) {
                        setQuantityToAdd(product.cantidad); // Máximo el stock disponible
                      }
                    }}
                    className="w-20 p-2 border border-gray-300 rounded-md text-center"
                  />
                </div>
              )}

              <button
                className={`px-6 py-2 rounded w-full sm:w-auto transition-colors duration-200
                  ${
                    isAddToCartDisabled
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed" // Estilo deshabilitado
                      : "bg-green-600 text-white hover:bg-green-700" // Estilo habilitado
                  }`}
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled} // Deshabilita el botón si no hay stock
              >
                {addToCartButtonText}
              </button>

              {/* ✅ Checkout directo con Stripe */}
              <CheckoutButton
                cartItems={[
                  {
                    nombre: product.nombre,
                    imagen_url: product.imagen_url?.startsWith("http")
                      ? product.imagen_url
                      : `${BACKEND_URL}${product.imagen_url}`,
                    precio_venta: product.precio_venta,
                    cantidad: quantityToAdd, // Pasa la cantidad seleccionada al checkout
                  },
                ]}
                // Deshabilita el botón de checkout si el producto está agotado
                disabled={isAddToCartDisabled}
              />

              <button
                onClick={() => navigate("/catalogo")}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 w-full sm:w-auto"
              >
                Volver al catálogo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta personalizada */}
      {showAlert && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
          {alertMessage}
        </div>
      )}
    </>
  );
};

export default ProductDetail;
