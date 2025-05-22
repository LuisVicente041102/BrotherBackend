import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("pos_user");
    if (token && user) {
      setIsLoggedIn(true);
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products/public");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("❌ Error al cargar productos:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />

      <div className="bg-gray-100 min-h-screen px-6 py-10">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Catálogo de Productos
        </h1>

        {products.length === 0 ? (
          <p className="text-center text-gray-600">
            No hay productos disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col"
              >
                <img
                  src={`http://localhost:5000${product.imagen_url}`}
                  alt={product.nombre}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {product.nombre}
                    </h2>
                    <p className="text-indigo-600 font-bold mt-2">
                      ${Number(product.precio_venta).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/producto/${product.id}`)}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Ver más
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Catalog;
