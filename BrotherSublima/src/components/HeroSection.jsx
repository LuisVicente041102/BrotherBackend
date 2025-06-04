import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Importamos useNavigate

export default function HeroSection() {
  const navigate = useNavigate(); // ✅ Definimos navigate

  return (
    <section className="bg-indigo-100 py-16 text-center">
      <h2 className="text-3xl font-bold mb-4">
        ¡Crea tu mundo con sublimación personalizada!
      </h2>
      <p className="mb-6 text-lg">
        Productos únicos y personalizados para cada ocasión
      </p>
      <button
        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        onClick={() => navigate("/catalogo")} // ✅ Navega al catálogo
      >
        Ver Catálogo
      </button>
    </section>
  );
}
