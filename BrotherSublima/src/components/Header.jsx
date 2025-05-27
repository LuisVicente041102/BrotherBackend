import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginAlertModal from "./LoginAlertModal";

const Header = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/home");
    window.location.reload();
  };

  const handleCartClick = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("pos_user");

    if (token && user) {
      navigate("/carrito");
    } else {
      setShowModal(true);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <h1
          className="text-xl font-bold text-indigo-600 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          BrotherSublima
        </h1>

        <input
          type="text"
          placeholder="Buscar productos..."
          className="border rounded px-3 py-1 w-1/2"
        />

        <div className="flex gap-4 items-center">
          {!isLoggedIn ? (
            <>
              <button
                className="text-indigo-600 hover:underline"
                onClick={() => navigate("/poslogin")}
              >
                Iniciar sesión
              </button>
              <button
                className="text-indigo-600 hover:underline"
                onClick={() => navigate("/pos/register")}
              >
                Registrarse
              </button>
            </>
          ) : (
            <>
              {/* ✅ Botón nuevo: Mis Compras */}
              <button
                className="text-indigo-600 hover:underline"
                onClick={() => navigate("/mis-compras")}
              >
                Mis compras
              </button>

              <button
                className="text-red-600 hover:underline"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          )}

          <button
            className="text-indigo-600 text-xl"
            onClick={handleCartClick}
            title="Ver carrito"
          >
            🛒
          </button>
        </div>
      </div>

      <LoginAlertModal show={showModal} onClose={() => setShowModal(false)} />
    </header>
  );
};

export default Header;
