import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // Si no hay token, redirigir a la página de login
  if (!token) {
    return <Navigate to="/inventariologin" />;
  }

  return children;
};

export default ProtectedRoute;
