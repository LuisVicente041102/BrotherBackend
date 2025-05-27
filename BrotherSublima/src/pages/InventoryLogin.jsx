import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InventoryLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔄 Botón de iniciar sesión presionado");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("🔹 Respuesta del servidor:", data);

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // ✅ Guardar token y usuario con tipo: "inventario"
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "inventory_user",
        JSON.stringify({ ...data.user, tipo: "inventario" })
      );

      console.log("✅ Usuario autenticado, redirigiendo a /main...");
      navigate("/main");
    } catch (err) {
      console.error("❌ Error en login:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="flex justify-center h-screen w-full">
        <div
          className="hidden bg-cover lg:block lg:w-2/3"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1616763355603-9755a640a287?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80)",
          }}
        >
          <div className="flex items-center h-full px-20 bg-gray-900 bg-opacity-40">
            <div>
              <h2 className="text-4xl font-bold text-white">
                Brothers Sublima
              </h2>
              <p className="max-w-xl mt-3 text-gray-300">
                Accede al sistema de inventario y gestiona los productos de
                manera eficiente.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
          <div className="flex-1">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-700 dark:text-white">
                Inventario
              </h2>
              <p className="mt-3 text-gray-500 dark:text-gray-300">
                Inicia sesión para continuar
              </p>
            </div>

            <div className="mt-8">
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <form onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm text-gray-600 dark:text-gray-200"
                  >
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="example@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                    required
                  />
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="password"
                    className="text-sm text-gray-600 dark:text-gray-200"
                  >
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                    required
                  />
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              </form>

              <p className="mt-6 text-sm text-center text-gray-400">
                Solo administradores pueden acceder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryLogin;
