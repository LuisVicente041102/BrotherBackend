// src/components/ProductCarousel.jsx
import React from "react";
import Slider from "react-slick"; // Importa el componente Slider de react-slick
import { useNavigate } from "react-router-dom";

// ¡IMPORTANTE! Importa los estilos CSS de react-slick
// Estos son necesarios para que el carrusel se vea y funcione correctamente.
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Obtiene la URL base de tu backend desde las variables de entorno de Vite
// Asegúrate de que VITE_BACKEND_URL esté configurada en tu entorno de Vercel.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Componente de carrusel para mostrar una lista de productos.
 * Utiliza la librería 'react-slick' para la funcionalidad de deslizamiento.
 *
 * @param {Object} props - Las propiedades pasadas al componente.
 * @param {Array<Object>} props.products - Un array de objetos de producto a mostrar en el carrusel.
 * Cada objeto de producto debe tener al menos:
 * - id: Identificador único del producto.
 * - nombre: Nombre del producto.
 * - precio_venta: Precio de venta del producto.
 * - imagen_url: URL de la imagen del producto.
 */
const ProductCarousel = ({ products }) => {
  const navigate = useNavigate(); // Hook de React Router para la navegación programática

  // Configuración para el carrusel de react-slick.
  // Define cómo se comportará y se verá el carrusel.
  const settings = {
    dots: true, // Muestra indicadores de navegación (puntos) en la parte inferior del carrusel.
    infinite: true, // Permite que el carrusel se desplace infinitamente (al llegar al final, vuelve al principio).
    speed: 500, // La velocidad de la animación de transición entre slides en milisegundos (0.5 segundos).
    slidesToShow: 3, // Cuántos slides (productos) se muestran a la vez en la vista principal.
    slidesToScroll: 1, // Cuántos slides se desplazan a la vez cuando el usuario navega o el autoplay avanza.
    autoplay: true, // Habilita el desplazamiento automático de los slides.
    autoplaySpeed: 3000, // El tiempo de espera en milisegundos antes de que el carrusel avance automáticamente (3 segundos).
    cssEase: "linear", // El tipo de función de aceleración CSS para la animación (movimiento suave).
    responsive: [
      // Un array de objetos para definir configuraciones diferentes en distintos tamaños de pantalla.
      {
        breakpoint: 1024, // Cuando el ancho de la pantalla es de 1024px o menos.
        settings: {
          slidesToShow: 2, // Muestra 2 productos.
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600, // Cuando el ancho de la pantalla es de 600px o menos.
        settings: {
          slidesToShow: 1, // Muestra 1 producto.
          slidesToScroll: 1,
          initialSlide: 0, // Asegura que el carrusel comience desde el primer slide.
        },
      },
    ],
  };

  // Si no se proporcionan productos o la lista está vacía, muestra un mensaje informativo.
  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No hay productos disponibles para mostrar en el carrusel.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* El componente Slider de react-slick envuelve los elementos que se mostrarán en el carrusel. */}
      {/* Las 'settings' definidas arriba se aplican al Slider. */}
      <Slider {...settings}>
        {/* Mapea cada producto a un div que representará un slide individual en el carrusel. */}
        {products.map((product) => (
          // El 'px-2 pb-6' añade un pequeño espacio horizontal entre los slides y padding inferior.
          <div key={product.id} className="px-2 pb-6">
            <div
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
              onClick={() => navigate(`/producto/${product.id}`)} // Al hacer clic, navega a la página de detalle del producto.
            >
              <img
                // Lógica para construir la URL de la imagen:
                // Si la URL ya comienza con "http" (es una URL absoluta), úsala directamente.
                // De lo contrario (si es una ruta relativa como "/uploads/imagen.jpg"),
                // concatena la URL base del backend.
                src={
                  product.imagen_url?.startsWith("http")
                    ? product.imagen_url
                    : `${BACKEND_URL}${product.imagen_url}`
                }
                alt={product.nombre}
                className="w-full h-48 object-cover" // Asegura que la imagen cubra el área y sea responsiva.
              />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {product.nombre}
                  </h3>
                  <p className="text-indigo-600 font-bold mt-2">
                    ${Number(product.precio_venta).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ProductCarousel;
