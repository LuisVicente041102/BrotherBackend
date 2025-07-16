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
      } catch (err) {
        console.error("❌ Error al obtener producto:", err);
      }
    };

    fetchProduct();
  }, [id]);

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
              // ** INICIO DEL CAMBIO **
              src={
                product.imagen_url?.startsWith("http")
                  ? product.imagen_url
                  : `${BACKEND_URL}${product.imagen_url}`
              }
              // ** FIN DEL CAMBIO **
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
                {product.cantidad}
              </p>

              <p className="text-gray-600 mt-4">
                Este producto está listo para personalizar y entregar.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
                onClick={async () => {
                  const user = JSON.parse(localStorage.getItem("pos_user"));
                  if (!user || !user.id) {
                    alert("Necesitas iniciar sesión para agregar al carrito");
                    return;
                  }

                  try {
                    const response = await fetch(`${BACKEND_URL}/api/cart`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        user_id: user.id,
                        product_id: product.id,
                        cantidad: 1,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error("Error al agregar al carrito");
                    }

                    alert("✅ Producto agregado al carrito");
                  } catch (error) {
                    console.error("❌ Error:", error);
                    alert("Hubo un problema al agregar al carrito");
                  }
                }}
              >
                Agregar al carrito 🛒
              </button>

              {/* ✅ Checkout directo con Stripe */}
              <CheckoutButton
                cartItems={[
                  {
                    nombre: product.nombre,
                    // Asegúrate de que imagen_url sea la URL correcta aquí también
                    imagen_url: product.imagen_url?.startsWith("http")
                      ? product.imagen_url
                      : `${BACKEND_URL}${product.imagen_url}`,
                    precio_venta: product.precio_venta,
                    cantidad: 1,
                  },
                ]}
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
    </>
  );
};

export default ProductDetail;
