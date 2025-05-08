import React from "react";
import { useNavigate } from "react-router-dom";
import pieImage from "../assets/images/pie.png"; // Importamos la imagen

const InventoryMain = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Contenido Principal */}
      <header className="flex-grow p-8 bg-white text-center">
        <div className="container mx-auto">
          {/* Eslogan */}
          <h2 className="text-4xl font-bold text-blue-gray-900">
            "La mejor calidad en sublimados para tu negocio"
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Administra tu inventario de manera eficiente con nuestra plataforma.
          </p>

          {/* Botón para ir al Inventario */}
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Ir al Inventario
          </button>
        </div>
      </header>

      {/* Pie de Página con Imagen Ajustada */}
      <footer className="w-full mt-auto">
        <img
          src={pieImage}
          alt="Pie de página"
          className="w-full h-[500px] object-cover"
        />
      </footer>
    </div>
  );
};

export default InventoryMain;
