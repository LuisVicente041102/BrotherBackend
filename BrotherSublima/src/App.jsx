import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import InventoryLogin from "./pages/InventoryLogin";
import InventoryHome from "./pages/InventoryHome";
import AddEmployee from "./pages/AddEmployee";
import InventoryMain from "./pages/InventoryMain";
import Navbar from "./components/Navbar"; // ✅ Importamos el Navbar
import useAuth from "./hooks/useAuth"; // ✅ Importamos el hook de autenticación

console.log("✅ App.jsx se está ejecutando...");

// 🔒 Componente de Rutas Protegidas
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = useAuth(); // Verifica si hay sesión

  if (isAuthenticated === null) {
    return <div className="text-center mt-20">Cargando...</div>; // 🔄 Evita parpadeos
  }

  return isAuthenticated ? element : <Navigate to="/inventariologin" replace />;
};

function App() {
  const location = useLocation();

  return (
    <>
      {/* Navbar visible en todas las páginas excepto InventoryLogin */}
      {location.pathname !== "/inventariologin" && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inventariologin" element={<InventoryLogin />} />
        {/* 🔒 Protegemos las rutas */}
        <Route
          path="/inventory"
          element={<ProtectedRoute element={<InventoryHome />} />}
        />
        <Route
          path="/add-employee"
          element={<ProtectedRoute element={<AddEmployee />} />}
        />
        <Route
          path="/main"
          element={<ProtectedRoute element={<InventoryMain />} />}
        />
      </Routes>
    </>
  );
}

export default App;
