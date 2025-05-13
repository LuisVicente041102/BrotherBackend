import React from "react";

export default function Footer() {
  return (
    <footer className="bg-indigo-600 text-white py-6">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <p>© 2025 BrotherSublima</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:underline">Contacto</a>
          <a href="#" className="hover:underline">Instagram</a>
          <a href="#" className="hover:underline">Facebook</a>
        </div>
      </div>
    </footer>
  );
}
