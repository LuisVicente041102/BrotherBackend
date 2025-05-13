import React from "react";

const categories = ["Tazas", "Termos", "Llaveros", "Planchas"];

export default function CategoriesSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-2xl font-bold mb-6">Categorías destacadas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat}
              className="bg-indigo-50 p-4 rounded-lg shadow hover:bg-indigo-100 cursor-pointer text-center"
            >
              <img
                src={`/${cat.toLowerCase()}.png`}
                alt={cat}
                className="h-24 mx-auto mb-2"
              />
              <p className="font-semibold">{cat}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
