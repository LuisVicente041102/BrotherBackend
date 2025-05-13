import React from "react";

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-indigo-600">BrotherSublima</h1>
        <input
          type="text"
          placeholder="Buscar productos..."
          className="border rounded px-3 py-1 w-1/2"
        />
        <div className="flex gap-4">
          <button className="text-indigo-600 hover:underline">Iniciar sesión</button>
          <button className="text-indigo-600 hover:underline">Registrarse</button>
          <button className="text-indigo-600">🛒</button>
        </div>
      </div>
    </header>
  );
}
