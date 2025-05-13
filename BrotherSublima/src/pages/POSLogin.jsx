import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const POSLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔄 Iniciando sesión punto de venta...");

    try {
      const response = await fetch("http://localhost:5000/api/pos/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("🔹 Respuesta del servidor:", data);

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("pos_user", JSON.stringify(data.user));

      navigate("/pos/dashboard");
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
              "url(https://images.unsplash.com/photo-1616763355603-9755a640a287?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80)",
          }}
        >
          <div className="flex items-center h-full px-20 bg-gray-900 bg-opacity-40">
            <div>
              <h2 className="text-4xl font-bold text-white">
                Brothers Sublima
              </h2>
              <p className="max-w-xl mt-3 text-gray-300">
                Bienvenido al sistema del punto de venta. Registra tus ventas de
                forma sencilla.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
          <div className="flex-1">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-700 dark:text-white">
                Punto de Venta
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
                    id="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
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
                    id="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                    required
                  />
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={() => navigate("/pos/register")}
                    className="text-blue-500 hover:underline"
                  >
                    Regístrate
                  </button>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  <button
                    onClick={() => navigate("/pos/forgot-password")}
                    className="text-blue-500 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSLogin;
