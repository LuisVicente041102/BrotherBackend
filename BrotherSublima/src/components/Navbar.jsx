import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Ocultar navbar en la página de login
  if (location.pathname === "/inventariologin") {
    return null;
  }

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("inventory_user"));
    if (userData) {
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("inventory_user");
    navigate("/inventariologin");
  };

  // Si el usuario aún no se ha cargado, no mostrar nada para evitar errores
  if (user === null) return null;

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        {/* Logo */}
        <Link to="/main" className="flex items-center space-x-3">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Logo"
          />
          <span className="self-center text-2xl font-semibold text-gray-900 dark:text-white">
            BrotherSublima
          </span>
        </Link>

        {/* Menú centrado */}
        <div className="flex items-center space-x-6">
          {user.role === "admin" && (
            <button
              onClick={() => navigate("/add-employee")}
              className="text-gray-900 hover:text-blue-700 dark:text-white"
            >
              Agregar Empleado
            </button>
          )}
        </div>

        {/* Botón de Cerrar Sesión */}
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
