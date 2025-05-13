import React from "react";

export default function FeaturedProducts() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-2xl font-bold mb-6">Destacados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white shadow rounded p-4">
              <div className="h-40 bg-gray-200 mb-3" />
              <h4 className="font-semibold text-lg">Producto {i}</h4>
              <p className="text-sm text-gray-600">Descripción breve del producto.</p>
              <button className="mt-3 bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700">
                Comprar
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
