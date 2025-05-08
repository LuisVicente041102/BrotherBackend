import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ArchivedCategories = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArchivedCategories();
  }, []);

  const fetchArchivedCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/categories/archivadas",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Error al obtener categorías archivadas:", err.message);
    }
  };

  const handleUnarchive = async (id) => {
    const confirmUnarchive = confirm("¿Deseas desarchivar esta categoría?");
    if (!confirmUnarchive) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/categories/${id}/desarchivar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al desarchivar categoría");

      // Actualizar lista quitando la categoría desarchivada
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error("❌ Error al desarchivar categoría:", err.message);
      alert("Ocurrió un error al desarchivar la categoría.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Categorías Archivadas
          </h2>
          <button
            onClick={() => navigate("/categories")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Volver
          </button>
        </div>

        <ul className="divide-y">
          {categories.length > 0 ? (
            categories.map((category) => (
              <li
                key={category.id}
                className="py-3 flex justify-between items-center"
              >
                <span className="text-gray-800">{category.nombre}</span>
                <button
                  onClick={() => handleUnarchive(category.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Desarchivar
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay categorías archivadas.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ArchivedCategories;
