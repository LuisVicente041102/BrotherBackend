import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AddEmployee = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem("token"); // ✅ Obtener el token del admin
      const response = await fetch(`${BACKEND_URL}/api/employees/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al agregar empleado");
      }

      alert("✅ Empleado agregado exitosamente!");
      navigate("/main"); // 🔄 Redirigir al panel principal del inventario
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1569099815434-9141916c68be?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80)",
      }}
    >
      <div className="bg-white bg-opacity-90 p-10 rounded-lg shadow-xl w-full max-w-md text-center backdrop-blur-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Agregar Empleado
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Ingresa los datos del nuevo empleado autorizado
        </p>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            Agregar Empleado
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
