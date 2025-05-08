import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [imagenPreview, setImagenPreview] = useState("");
  const [imagenFile, setImagenFile] = useState(null);
  const [categoriaId, setCategoriaId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProducto = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        setNombre(data.nombre);
        setCantidad(data.cantidad);
        setPrecioCompra(data.precio_compra);
        setPrecioVenta(data.precio_venta);
        setImagenPreview(data.imagen_url || "");
        setCategoriaId(data.categoria_id);
      } catch (err) {
        console.error("Error al cargar el producto:", err.message);
      }
    };

    const fetchCategorias = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCategorias(data);
      } catch (err) {
        console.error("Error al cargar categorías:", err.message);
      }
    };

    fetchProducto();
    fetchCategorias();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) return setError("No hay token. Inicia sesión.");

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("cantidad", cantidad);
      formData.append("precio_compra", precioCompra);
      formData.append("precio_venta", precioVenta);
      formData.append("categoria_id", categoriaId);

      if (imagenFile) {
        formData.append("imagen", imagenFile);
      } else {
        formData.append("imagen_url", imagenPreview); // Enviar URL previa si no se cambia la imagen
      }

      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al actualizar");

      alert("Producto actualizado correctamente");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Error al actualizar producto:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Editar Producto
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Precio de compra"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            className="w-full p-3 border rounded"
            step="0.01"
            required
          />
          <input
            type="number"
            placeholder="Precio de venta"
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
            className="w-full p-3 border rounded"
            step="0.01"
            required
          />

          {/* Vista previa de imagen */}
          {imagenPreview && (
            <div className="flex justify-center">
              <img
                src={imagenPreview}
                alt="Imagen previa"
                className="w-24 h-24 object-cover rounded mb-2"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setImagenFile(file);
              if (file) {
                setImagenPreview(URL.createObjectURL(file));
              }
            }}
            className="w-full p-3 border rounded"
          />

          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full p-3 border rounded"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
