import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const POSRegister = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/pos/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar");
      }

      // Guardamos los datos y redirigimos
      localStorage.setItem("token", data.token);
      localStorage.setItem("pos_user", JSON.stringify(data.user));

      navigate("/pos/dashboard");
    } catch (err) {
      console.error("❌ Error al registrar:", err.message);
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
              "url(https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1470&q=80)",
          }}
        >
          <div className="flex items-center h-full px-20 bg-gray-900 bg-opacity-40">
            <div>
              <h2 className="text-4xl font-bold text-white">
                Brothers Sublima
              </h2>
              <p className="max-w-xl mt-3 text-gray-300">
                Regístrate para comenzar a usar el sistema del punto de venta.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
          <div className="flex-1">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-700 dark:text-white">
                Registrarse
              </h2>
              <p className="mt-3 text-gray-500 dark:text-gray-300">
                Ingresa tus datos para crear una cuenta
              </p>
            </div>

            <div className="mt-8">
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <form onSubmit={handleRegister}>
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm text-gray-600 dark:text-gray-200"
                  >
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Tu nombre"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 bg-white border border-gray-200 rounded-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-600 focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                    required
                  />
                </div>

                <div className="mt-4">
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
                    className="block w-full px-4 py-2 mt-2 bg-white border border-gray-200 rounded-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-600 focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm text-gray-600 dark:text-gray-200"
                  >
                    Contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 bg-white border border-gray-200 rounded-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-600 focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                    required
                  />
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 tracking-wide text-white bg-blue-500 rounded-md hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                  >
                    Registrarse
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    onClick={() => navigate("/poslogin")}
                    className="text-blue-500 hover:underline"
                  >
                    Inicia sesión
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

export default POSRegister;
