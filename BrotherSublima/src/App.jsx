import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import InventoryLogin from "./pages/InventoryLogin";
import InventoryHome from "./pages/InventoryHome";
import AddEmployee from "./pages/AddEmployee";

console.log("✅ App.jsx se está ejecutando...");

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/inventariologin" element={<InventoryLogin />} />
      <Route path="/inventory" element={<InventoryHome />} />
      <Route path="/add-employee" element={<AddEmployee />} />
    </Routes>
  );
}

export default App;
