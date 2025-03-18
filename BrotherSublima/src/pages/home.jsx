import React from "react";

console.log("✅ Home.jsx se está ejecutando...");

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">Bienvenido a Brothers Sublima</h1>
      <p className="text-lg text-gray-700 mt-4">Esta es la página de inicio.</p>
    </div>
  );
}

export default Home;