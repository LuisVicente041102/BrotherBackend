import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const VerificarCuenta = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verificando");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");

    const verificar = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/pos/verify?token=${token}&id=${id}`
        );
        const texto = await res.text();

        if (res.status === 200) {
          if (texto.includes("Ya habías verificado")) {
            setStatus("ya-verificada");
            setMensaje(texto);
          } else {
            setStatus("verificado");
            setMensaje(texto);
          }
        } else if (res.status === 400) {
          setStatus("invalido");
          setMensaje(texto);
        } else {
          setStatus("error");
          setMensaje("Error al verificar cuenta.");
        }
      } catch (err) {
        console.error("❌ Error en verificación:", err);
        setStatus("error");
        setMensaje("Error inesperado. Intenta más tarde.");
      }
    };

    if (token && id) {
      verificar();
    } else {
      setStatus("invalido");
      setMensaje("Enlace inválido.");
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {status === "verificando" && (
        <p className="text-lg text-gray-700">Verificando cuenta...</p>
      )}

      {(status === "verificado" || status === "ya-verificada") && (
        <div className="bg-white shadow-md rounded p-6 text-center">
          <h2 className="text-xl font-bold text-green-600 mb-4">{mensaje}</h2>
          <button
            onClick={() => navigate("/poslogin")}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Iniciar sesión
          </button>
        </div>
      )}

      {status === "invalido" && (
        <p className="text-red-600 text-center">{mensaje}</p>
      )}

      {status === "error" && (
        <p className="text-red-500 text-center">{mensaje}</p>
      )}
    </div>
  );
};

export default VerificarCuenta;
