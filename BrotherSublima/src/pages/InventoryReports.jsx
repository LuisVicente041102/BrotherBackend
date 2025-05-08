import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const InventoryReports = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const resProducts = await fetch("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resCategories = await fetch(
          "http://localhost:5000/api/categories",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const dataProducts = await resProducts.json();
        const dataCategories = await resCategories.json();
        setProducts(dataProducts);
        setCategories(dataCategories);
      } catch (err) {
        console.error("Error al cargar datos:", err.message);
      }
    };
    fetchData();
  }, []);

  // KPIs
  const totalProductos = products.length;
  const stockTotal = products.reduce((acc, p) => acc + p.cantidad, 0);
  const bajoStock = products.filter((p) => p.cantidad <= 10).length;

  // Gráfico de barras por producto
  const barData = {
    labels: products.map((p) => p.nombre),
    datasets: [
      {
        label: "Cantidad en Stock",
        data: products.map((p) => p.cantidad),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  // Gráfico de pastel por categoría
  const categoryData = categories.map((cat) => {
    const productosEnCategoria = products.filter(
      (p) => p.categoria_id === cat.id
    );
    return {
      label: cat.nombre,
      cantidad: productosEnCategoria.reduce((acc, p) => acc + p.cantidad, 0),
    };
  });

  const pieData = {
    labels: categoryData.map((c) => c.label),
    datasets: [
      {
        data: categoryData.map((c) => c.cantidad),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#EC4899",
        ],
      },
    ],
  };

  // Tablas por stock
  const productosBajoStock = products.filter((p) => p.cantidad <= 10);
  const productosStockMedio = products.filter(
    (p) => p.cantidad > 10 && p.cantidad <= 30
  );
  const productosStockAlto = products.filter((p) => p.cantidad > 30);

  const renderTabla = (titulo, productos) => (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">{titulo}</h2>
      {productos.length === 0 ? (
        <p className="text-gray-500 italic">
          No hay productos en esta categoría.
        </p>
      ) : (
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Producto</th>
              <th className="border p-2 text-left">Cantidad</th>
              <th className="border p-2 text-left">Categoría</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td className="border p-2">{p.nombre}</td>
                <td className="border p-2">{p.cantidad}</td>
                <td className="border p-2">
                  {categories.find((c) => c.id === p.categoria_id)?.nombre ||
                    "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Reportes de Inventario
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-lg font-semibold">Total de Productos</h3>
          <p className="text-3xl text-blue-600 mt-2">{totalProductos}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-lg font-semibold">Stock Total</h3>
          <p className="text-3xl text-green-600 mt-2">{stockTotal}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-lg font-semibold">Productos con Bajo Stock</h3>
          <p className="text-3xl text-red-600 mt-2">{bajoStock}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Stock por Producto
          </h2>
          <Bar data={barData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Distribución por Categoría
          </h2>
          <Pie data={pieData} />
        </div>
      </div>

      {/* Tablas de productos por stock */}
      {renderTabla("Productos con Bajo Stock (0 - 10)", productosBajoStock)}
      {renderTabla("Productos con Stock Medio (11 - 30)", productosStockMedio)}
      {renderTabla("Productos con Stock Alto (más de 30)", productosStockAlto)}
    </div>
  );
};

export default InventoryReports;
