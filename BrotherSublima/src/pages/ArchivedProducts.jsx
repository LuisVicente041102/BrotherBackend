import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ArchivedProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      const resProducts = await fetch(
        "http://localhost:5000/api/products/archived",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const archived = await resProducts.json();
      setProducts(archived);

      const resCategories = await fetch(
        "http://localhost:5000/api/categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const dataCategories = await resCategories.json();
      setCategories(dataCategories);
    };

    fetchData();
  }, []);

  const handleUnarchive = async (id) => {
    const confirmUnarchive = window.confirm(
      "¿Deseas desarchivar este producto?"
    );
    if (!confirmUnarchive) return;

    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/products/${id}/desarchivar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error al desarchivar producto:", error.message);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Productos Archivados
      </h1>

      <div className="bg-white p-4 rounded shadow overflow-x-auto min-h-[60vh]">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Imagen</th>
              <th className="p-2 text-left">Producto</th>
              <th className="p-2 text-left">Cantidad</th>
              <th className="p-2 text-left">Precio Compra</th>
              <th className="p-2 text-left">Precio Venta</th>
              <th className="p-2 text-left">Categoría</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="min-h-[400px]">
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">
                    {p.imagen_url ? (
                      <img
                        src={`http://localhost:5000${p.imagen_url}`}
                        alt={p.nombre}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400 italic">Sin imagen</span>
                    )}
                  </td>
                  <td className="p-2">{p.nombre}</td>
                  <td className="p-2">{p.cantidad}</td>
                  <td className="p-2">${p.precio_compra}</td>
                  <td className="p-2">${p.precio_venta}</td>
                  <td className="p-2">
                    {categories.find((c) => c.id === p.categoria_id)?.nombre ||
                      "N/A"}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleUnarchive(p.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Desarchivar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-10">
                  No hay productos archivados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArchivedProducts;
