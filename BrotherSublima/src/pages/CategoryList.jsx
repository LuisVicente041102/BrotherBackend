import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Error al obtener las categorías:", err.message);
    }
  };

  const handleArchive = async (id) => {
    const confirmArchive = confirm("¿Deseas archivar esta categoría?");
    if (!confirmArchive) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/categories/${id}/archivar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al archivar categoría");

      // Actualizar lista quitando la categoría archivada
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error("❌ Error al archivar categoría:", err.message);
      alert("Ocurrió un error al archivar la categoría.");
    }
  };

  const handleToggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Categorías</h2>
          <button
            onClick={() => navigate("/add-categorie")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Agregar Categoría
          </button>
        </div>

        <ul className="divide-y">
          {categories.map((category) => (
            <li
              key={category.id}
              className="py-3 flex justify-between items-center"
            >
              <span className="text-gray-800">{category.nombre}</span>

              <div className="relative">
                <button
                  onClick={() => handleToggleMenu(category.id)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ⋮
                </button>

                {openMenuId === category.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow-lg z-10">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => navigate(`/edit-categorie/${category.id}`)}
                    >
                      Modificar
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-yellow-600"
                      onClick={() => handleArchive(category.id)}
                    >
                      Archivar
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryList;
