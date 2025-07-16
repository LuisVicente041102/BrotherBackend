import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Catalog = () => {
  const [products, setProducts] = useState([]);
  // Estado para almacenar las categorías obtenidas del backend
  const [categories, setCategories] = useState([]);
  // Estado para la categoría actualmente seleccionada por el usuario (null = todas)
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Primer useEffect: Para cargar categorías y verificar el estado de login solo una vez al inicio
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("pos_user");
    if (token && user) {
      setIsLoggedIn(true);
    }

    // Cargar todas las categorías disponibles
    fetchCategories();
  }, []); // Se ejecuta solo una vez al montar

  // Segundo useEffect: Para cargar productos cada vez que la categoría seleccionada cambia
  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]); // Se ejecuta cuando 'selectedCategory' cambia

  /**
   * Función asíncrona para obtener la lista de categorías desde el backend.
   * Hace una petición GET a /api/categories.
   */
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/categories`);
      if (!res.ok) {
        throw new Error(`Error HTTP al cargar categorías: ${res.status}`);
      }
      const data = await res.json();
      setCategories(data); // Almacena las categorías en el estado
    } catch (err) {
      console.error("❌ Error al cargar categorías:", err);
    }
  };

  /**
   * Función asíncrona para cargar productos desde el backend.
   * Acepta un 'categoryId' opcional para filtrar los productos.
   * @param {number|null} categoryId - El ID de la categoría a filtrar, o null para obtener todos los productos.
   */
  const fetchProducts = async (categoryId = null) => {
    let endpoint = `${BACKEND_URL}/api/products/public`; // URL base para productos públicos
    if (categoryId) {
      // Si se selecciona una categoría, añade el parámetro de consulta
      endpoint += `?categoria_id=${categoryId}`;
    }

    try {
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Error HTTP al cargar productos: ${res.status}`);
      }
      const data = await res.json();
      setProducts(data); // Almacena los productos en el estado
    } catch (err) {
      console.error("❌ Error al cargar productos:", err);
    }
  };

  /**
   * Manejador de eventos para cuando el usuario selecciona una categoría en la barra lateral.
   * Actualiza el estado 'selectedCategory', lo que a su vez activa 'fetchProducts'.
   * @param {number|null} categoryId - El ID de la categoría seleccionada, o null para "Todas las Categorías".
   */
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />

      {/* Contenedor principal del catálogo: usa flexbox para la barra lateral y el contenido */}
      {/* CAMBIO AQUÍ: md:flex-row-reverse para poner la barra lateral a la derecha en pantallas medianas y grandes */}
      <div className="bg-gray-100 min-h-screen px-6 py-10 flex flex-col md:flex-row-reverse">
        {/* Barra Lateral de Categorías (aside) */}
        {/* CAMBIO AQUÍ: md:ml-6 md:mr-0 para mover el margen a la izquierda en pantallas medianas y grandes */}
        <aside className="md:w-64 bg-white p-6 rounded-lg shadow-md mb-6 md:mb-0 md:ml-6 md:mr-0">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 border-b pb-4">
            Categorías
          </h2>
          <ul className="space-y-3">
            {/* Botón para mostrar todas las categorías */}
            <li>
              <button
                onClick={() => handleCategorySelect(null)}
                className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200
                  ${
                    selectedCategory === null
                      ? "bg-indigo-600 text-white shadow-md" // Estilo para categoría seleccionada
                      : "text-gray-700 hover:bg-indigo-100" // Estilo para categoría no seleccionada
                  }`}
              >
                Todas las Categorías
              </button>
            </li>
            {/* Mapea y renderiza cada categoría obtenida del backend */}
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200
                    ${
                      selectedCategory === category.id
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-indigo-100"
                    }`}
                >
                  {category.nombre}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Contenido Principal del Catálogo (main) */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
            Catálogo de Productos
          </h1>

          {/* Muestra un mensaje si no hay productos disponibles para la categoría seleccionada */}
          {products.length === 0 ? (
            <p className="text-center text-gray-600">
              No hay productos disponibles para esta categoría.
            </p>
          ) : (
            // Grid de productos
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-full mx-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col"
                >
                  <img
                    src={
                      product.imagen_url?.startsWith("http")
                        ? product.imagen_url
                        : `${BACKEND_URL}${product.imagen_url}`
                    }
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
        </main>
      </div>

      <Footer />
    </>
  );
};

export default Catalog;
