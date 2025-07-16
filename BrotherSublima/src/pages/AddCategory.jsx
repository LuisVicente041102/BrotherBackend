import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AddCategory = () => {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No hay token. Inicia sesión nuevamente.");
      return;
    }

    console.log("📝 Enviando nombre:", nombre);

    try {
      const response = await fetch(`${BACKEND_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
      });

      const data = await response.json();
      console.log("📩 Respuesta del backend:", data);

      if (!response.ok) {
        throw new Error(data.message || "Error al agregar categoría");
      }

      alert("Categoría creada exitosamente");
      navigate("/categories");
    } catch (err) {
      console.error("❌ Error al enviar categoría:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Agregar Nueva Categoría
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">
              Nombre de la Categoría
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Guardar Categoría
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
