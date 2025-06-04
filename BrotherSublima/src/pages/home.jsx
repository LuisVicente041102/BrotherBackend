import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("pos_user");
    if (token && user) {
      setIsLoggedIn(true);
    }

    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products/top");
      const data = await res.json();
      setTopProducts(data);
    } catch (error) {
      console.error("Error al obtener productos destacados:", error);
    }
  };

  return (
    <div className="font-sans text-gray-800">
      <Header isLoggedIn={isLoggedIn} />

      <section className="bg-indigo-100 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          ¡Crea tu mundo con sublimación personalizada!
        </h2>
        <p className="mb-6 text-lg">
          Productos únicos y personalizados para cada ocasión
        </p>
        <button
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          onClick={() => navigate("/catalogo")}
        >
          Ver Catálogo
        </button>
      </section>

      <section className="py-12 px-6 bg-white">
        <h3 className="text-2xl font-bold text-center text-indigo-700 mb-8">
          Productos más vendidos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {topProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow rounded overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={`http://localhost:5000${product.imagen_url}`}
                alt={product.nombre}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h4 className="text-lg font-semibold text-indigo-700">
                  {product.nombre}
                </h4>
                <p className="text-gray-600">
                  ${parseFloat(product.precio_venta).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-6 text-sm text-gray-500">
        &copy; 2025 Brother Sublima. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Home;
