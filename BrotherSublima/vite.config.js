import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: true, // <- permite acceder desde cualquier red
    origin: " https://752e-187-192-255-43.ngrok-free.app", // 👈 tu URL pública de Ngrok
    strictPort: true, // evita que cambie de puerto
    port: 5173, // o 5174 si ese es el que usas
  },
});
