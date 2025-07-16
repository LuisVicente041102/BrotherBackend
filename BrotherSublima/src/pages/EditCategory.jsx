import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const EditCategory = () => {
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const category = data.find((cat) => cat.id === parseInt(id));
        if (category) setNombre(category.nombre);
        else setError("Categoría no encontrada");
      } catch (err) {
        setError("Error al obtener la categoría");
      }
    };

    fetchCategory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No hay token. Inicia sesión nuevamente.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar la categoría");
      }

      alert("Categoría actualizada exitosamente");
      navigate("/categories");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Editar Categoría
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
            Actualizar Categoría
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
