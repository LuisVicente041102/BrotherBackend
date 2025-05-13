import React, { useEffect, useState } from "react";

const POSDashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Obtener usuario del localStorage
    const storedUser = localStorage.getItem("pos_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
        {user ? `Hola, ${user.username}` : "Bienvenido"}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-center max-w-xl mb-10">
        Este es tu panel del punto de venta. Aquí podrás registrar ventas y
        consultar tu actividad.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <button className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg shadow-md transition">
          ➕ Registrar Venta
        </button>

        <button className="bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg shadow-md transition">
          📦 Ver Historial
        </button>
      </div>
    </div>
  );
};

export default POSDashboard;
