import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BACKEND_URL}/api/pos/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(data.message);
        setError("");
        setTimeout(() => navigate("/poslogin"), 3000);
      } else {
        setError(data.message);
        setMensaje("");
      }
    } catch (err) {
      console.error("❌ Error:", err.message);
      setError("Error al restablecer contraseña");
    }
  };

  if (!token || !email) {
    return (
      <div className="text-center mt-10 text-red-600">
        Token inválido. Verifica el enlace recibido en tu correo.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold text-center mb-4">
          Restablecer contraseña
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Guardar nueva contraseña
          </button>
        </form>
        {mensaje && (
          <p className="mt-4 text-green-600 text-center">{mensaje}</p>
        )}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
