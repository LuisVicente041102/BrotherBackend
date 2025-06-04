import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function HeroSection() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      }
    };

    fetchProducts();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <section className="bg-indigo-100 py-10 text-center">
      <h2 className="text-3xl font-bold mb-4">
        ¡Crea tu mundo con sublimación personalizada!
      </h2>
      <p className="mb-6 text-lg">
        Productos únicos y personalizados para cada ocasión
      </p>
      <div className="max-w-3xl mx-auto mb-8">
        <Slider {...settings}>
          {products.map((product) => (
            <div key={product.id} className="px-4">
              <img
                src={`http://localhost:5000${product.imagen_url}`}
                alt={product.nombre}
                className="h-64 object-contain mx-auto rounded shadow"
              />
              <h3 className="text-xl font-semibold mt-2">{product.nombre}</h3>
              <p className="text-indigo-700 font-bold">
                ${parseFloat(product.precio_venta).toFixed(2)}
              </p>
            </div>
          ))}
        </Slider>
      </div>
      <button
        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        onClick={() => navigate("/catalogo")}
      >
        Ver Catálogo
      </button>
    </section>
  );
}
