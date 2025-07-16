// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer"; // Asegúrate de tener este componente para el footer
import ProductCarousel from "../components/ProductCarousel"; // Importa el nuevo componente de carrusel

// Obtiene la URL base de tu backend desde las variables de entorno de Vite.
// Esta URL es crucial para todas las llamadas a tu API.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
console.log("🌐 Usando BACKEND_URL:", BACKEND_URL);

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Estado para almacenar los últimos productos agregados (para el carrusel).
  const [latestProducts, setLatestProducts] = useState([]);
  // Estado para almacenar el producto más vendido.
  const [topSellingProduct, setTopSellingProduct] = useState(null);
  const navigate = useNavigate(); // Hook para la navegación programática.

  // useEffect se ejecuta una vez cuando el componente se monta.
  useEffect(() => {
    // Verifica si el usuario está logueado revisando el localStorage.
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("pos_user");
    if (token && user) {
      setIsLoggedIn(true);
    }

    // Llama a las funciones para obtener los datos de los productos desde el backend.
    fetchLatestProducts();
    fetchTopSellingProduct();
  }, []); // El array vacío [] asegura que este efecto se ejecute solo una vez.

  /**
   * Función asíncrona para obtener los últimos productos agregados desde el backend.
   * Hace una petición GET a la ruta '/api/products/latest'.
   */
  const fetchLatestProducts = async () => {
    const endpoint = `${BACKEND_URL}/api/products/latest`;
    console.log("📦 Llamando a últimos productos:", endpoint);

    try {
      const res = await fetch(endpoint); // Realiza la petición HTTP.
      if (!res.ok) {
        // Si la respuesta no es exitosa (ej. 404, 500), lanza un error.
        throw new Error(
          `❌ Error HTTP al obtener últimos productos: ${res.status}`
        );
      }
      const data = await res.json(); // Parsea la respuesta JSON.
      console.log("🟢 Últimos productos recibidos:", data);
      setLatestProducts(data); // Actualiza el estado con los productos recibidos.
    } catch (error) {
      console.error("❌ Error al obtener los últimos productos:", error);
    }
  };

  /**
   * Función asíncrona para obtener el producto más vendido desde el backend.
   * Hace una petición GET a la ruta '/api/products/top-selling'.
   */
  const fetchTopSellingProduct = async () => {
    const endpoint = `${BACKEND_URL}/api/products/top-selling`;
    console.log("📦 Llamando a producto más vendido:", endpoint);

    try {
      const res = await fetch(endpoint); // Realiza la petición HTTP.
      if (!res.ok) {
        // Si la respuesta no es exitosa, lanza un error.
        throw new Error(
          `❌ Error HTTP al obtener producto más vendido: ${res.status}`
        );
      }
      const data = await res.json(); // Parsea la respuesta JSON.
      console.log("🟢 Producto más vendido recibido:", data);
      setTopSellingProduct(data); // Actualiza el estado con el producto recibido.
    } catch (error) {
      console.error("❌ Error al obtener el producto más vendido:", error);
    }
  };

  return (
    <div className="font-sans text-gray-800">
      <Header isLoggedIn={isLoggedIn} />

      {/* Nueva Sección: Carrusel de Últimos Productos Agregados */}
      {/* Esta sección muestra un título y luego el carrusel con los productos más recientes. */}
      <section className="py-16 bg-white px-6">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-10">
          Nuestras Últimas Novedades
        </h2>
        {/* Renderiza el componente ProductCarousel, pasándole el array de latestProducts. */}
        <ProductCarousel products={latestProducts} />
      </section>

      {/* Sección del Producto Más Vendido */}
      {/* Esta sección destaca un único producto, el más vendido. */}
      <section className="py-16 bg-gray-50 px-6">
        {" "}
        {/* Usa un color de fondo diferente para distinción visual. */}
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-10">
          El Favorito de Nuestros Clientes
        </h2>
        {/* Muestra el producto más vendido si existe; de lo contrario, un mensaje de carga/no disponible. */}
        {topSellingProduct ? (
          <div className="max-w-3xl mx-auto bg-white border rounded-lg shadow-xl flex flex-col md:flex-row overflow-hidden">
            <div className="md:w-1/2">
              <img
                // Lógica para construir la URL de la imagen (la misma que en Catalog.jsx y ProductDetail.jsx)
                src={
                  topSellingProduct.imagen_url?.startsWith("http")
                    ? topSellingProduct.imagen_url
                    : `${BACKEND_URL}${topSellingProduct.imagen_url}`
                }
                alt={topSellingProduct.nombre}
                className="w-full h-72 object-cover md:h-full" // Estilos para la imagen, responsiva.
              />
            </div>
            <div className="md:w-1/2 p-6 flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-indigo-800 mb-3">
                {topSellingProduct.nombre}
              </h3>
              <p className="text-gray-600 text-lg mb-4">
                Descubre por qué este producto es el más popular. ¡Calidad y
                personalización garantizadas!
              </p>
              <p className="text-green-600 font-extrabold text-3xl mb-4">
                ${parseFloat(topSellingProduct.precio_venta).toFixed(2)}
              </p>
              <button
                onClick={() => navigate(`/producto/${topSellingProduct.id}`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md transition w-full md:w-auto"
              >
                Ver Detalle
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Cargando producto estrella o no hay productos destacados
            disponibles.
          </p>
        )}
      </section>

      {/* Sección Hero (el mensaje principal, movido más abajo para dar protagonismo a los productos) */}
      <section className="bg-indigo-100 py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-indigo-800 mb-4">
          ¡Crea tu mundo con sublimación personalizada!
        </h1>
        <p className="text-lg text-indigo-700 mb-6">
          Productos únicos y personalizados para cada ocasión
        </p>
        <button
          onClick={() => navigate("/catalogo")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md transition"
        >
          Ver Catálogo
        </button>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;
