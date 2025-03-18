import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

console.log("✅ App.jsx se está ejecutando...");

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;