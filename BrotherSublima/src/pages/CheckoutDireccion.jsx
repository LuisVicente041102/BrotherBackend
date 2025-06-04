import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import CheckoutButton from "../components/CheckoutButton";

const CheckoutDireccion = () => {
  const navigate = useNavigate();
  const [tipoEntrega, setTipoEntrega] = useState("punto");
  const [telefono, setTelefono] = useState("");
  const [referencias, setReferencias] = useState("");
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const guardarInfoExtra = () => {
    const extra = {
      tipo: tipoEntrega,
      telefono: tipoEntrega === "domicilio" ? telefono : "",
      referencias: tipoEntrega === "domicilio" ? referencias : "",
    };
    localStorage.setItem("extraCheckout", JSON.stringify(extra));
  };

  return (
    <>
      <Header isLoggedIn={true} />
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Elige la forma de entrega</h1>
        <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto space-y-4">
          <div className="border p-4 rounded bg-gray-50">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="entrega"
                value="domicilio"
                checked={tipoEntrega === "domicilio"}
                onChange={() => setTipoEntrega("domicilio")}
              />
              Enviar a domicilio
            </label>

            {tipoEntrega === "domicilio" && (
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  placeholder="Referencias del domicilio"
                  value={referencias}
                  onChange={(e) => setReferencias(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </div>

          <div className="border p-4 rounded bg-gray-50">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="entrega"
                value="punto"
                checked={tipoEntrega === "punto"}
                onChange={() => setTipoEntrega("punto")}
              />
              Retiro en Ciudad Guzmán, plaza principal
            </label>
          </div>

          <div className="mt-6">
            <CheckoutButton
              cartItems={cartItems}
              onBeforeCheckout={guardarInfoExtra}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutDireccion;
