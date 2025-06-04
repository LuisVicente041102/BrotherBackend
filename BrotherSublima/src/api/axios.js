// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://a13b-187-192-255-43.ngrok-free.app/api", // 🔁 Ngrok backend URL
  withCredentials: true, // si usas cookies para login, si no puedes quitarlo
});

export default api;
