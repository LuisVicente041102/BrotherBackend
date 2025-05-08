import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [stockRange, setStockRange] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      const resProducts = await fetch("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataProducts = await resProducts.json();
      setProducts(dataProducts);
      setFilteredProducts(dataProducts);

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

  useEffect(() => {
    let filtered = products;

    if (search) {
      filtered = filtered.filter((p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (stockRange) {
      filtered = filtered.filter((p) => {
        const cantidad = p.cantidad;
        if (stockRange === "0-10") return cantidad >= 0 && cantidad <= 10;
        if (stockRange === "10-20") return cantidad > 10 && cantidad <= 20;
        if (stockRange === "20-30") return cantidad > 20 && cantidad <= 30;
        if (stockRange === "30+") return cantidad > 30;
        return true;
      });
    }

    if (category) {
      filtered = filtered.filter((p) => p.categoria_id === parseInt(category));
    }

    setFilteredProducts(filtered);
  }, [search, stockRange, category, products]);

  const handleToggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleArchive = async (id) => {
    const confirmArchive = window.confirm("¿Deseas archivar este producto?");
    if (!confirmArchive) return;

    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/products/${id}/archivar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error al archivar el producto:", error.message);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Lista de Productos
      </h1>

      <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4 justify-between">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="p-2 border rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-2 border rounded"
          value={stockRange}
          onChange={(e) => setStockRange(e.target.value)}
        >
          <option value="">Todos los Stocks</option>
          <option value="0-10">0 - 10</option>
          <option value="10-20">10 - 20</option>
          <option value="20-30">20 - 30</option>
          <option value="30+">30 o más</option>
        </select>

        <select
          className="p-2 border rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas las Categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

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
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
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
                  <td className="p-2 relative">
                    <button
                      onClick={() => handleToggleMenu(p.id)}
                      className="text-gray-600 hover:text-black"
                    >
                      ⋮
                    </button>
                    {openMenuId === p.id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow-lg z-10">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => navigate(`/edit-product/${p.id}`)}
                        >
                          Modificar
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                          onClick={() => handleArchive(p.id)}
                        >
                          Archivar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-10">
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewProducts;
