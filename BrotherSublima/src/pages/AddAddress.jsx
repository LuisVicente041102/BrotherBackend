import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const AddAddress = () => {
  const [form, setForm] = useState({
    calle: "",
    numero: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigo_postal: "",
    telefono: "",
  });

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    newPassword: "",
  });

  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("pos_user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      navigate("/poslogin");
      return;
    }

    setIsLoggedIn(true);
    setUserData((prev) => ({
      ...prev,
      username: user.username,
      email: user.email,
    }));

    const fetchAddress = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/address/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setForm(data);
          }
        }
      } catch (error) {
        console.error("❌ Error al cargar dirección:", error);
      }
    };

    fetchAddress();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("pos_user"));

    try {
      const res = await fetch("http://localhost:5000/api/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, user_id: user.id }),
      });

      if (res.ok) {
        alert("Dirección guardada exitosamente");
        setShowAddressForm(false);
      } else {
        alert("Error al guardar dirección");
      }
    } catch (err) {
      console.error("❌ Error al guardar dirección:", err);
    }
  };

  const handleUserUpdate = async () => {
    const user = JSON.parse(localStorage.getItem("pos_user"));
    try {
      const res = await fetch(
        `http://localhost:5000/api/pos/update/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (res.ok) {
        const data = await res.json();
        alert("Datos actualizados correctamente");
        localStorage.setItem("pos_user", JSON.stringify(data.user));
        setShowEditForm(false);
      } else {
        const err = await res.json();
        alert(err.message || "Error al actualizar usuario");
      }
    } catch (err) {
      console.error("❌ Error al actualizar usuario:", err);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600">
          Perfil del usuario
        </h2>

        {/* 🟢 Recuadro con resumen de datos */}
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h3 className="text-lg font-semibold mb-2">Tus datos</h3>
          <p>
            <strong>Nombre:</strong> {userData.username}
          </p>
          <p>
            <strong>Correo:</strong> {userData.email}
          </p>
          <p>
            <strong>Dirección:</strong>{" "}
            {`${form.calle}, ${form.numero}, ${form.colonia}, ${form.ciudad}, ${form.estado}, CP ${form.codigo_postal}`}
          </p>
          <p>
            <strong>Teléfono:</strong> {form.telefono}
          </p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setShowEditForm(!showEditForm)}
              className="bg-indigo-600 text-white py-1 px-4 rounded hover:bg-indigo-700"
            >
              {showEditForm ? "Cerrar perfil" : "Editar perfil"}
            </button>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="bg-purple-600 text-white py-1 px-4 rounded hover:bg-purple-700"
            >
              {showAddressForm ? "Cerrar dirección" : "Editar dirección"}
            </button>
          </div>
        </div>

        {/* 🟣 Formulario para editar perfil */}
        {showEditForm && (
          <div className="bg-white p-4 border rounded mb-6">
            <h3 className="text-lg font-semibold mb-4 text-indigo-600">
              Editar perfil
            </h3>
            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={userData.username}
              onChange={handleUserChange}
              className="border p-2 rounded mb-2 w-full"
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={userData.email}
              onChange={handleUserChange}
              className="border p-2 rounded mb-2 w-full"
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña actual"
              value={userData.password}
              onChange={handleUserChange}
              className="border p-2 rounded mb-2 w-full"
            />
            <input
              type="password"
              name="newPassword"
              placeholder="Nueva contraseña"
              value={userData.newPassword}
              onChange={handleUserChange}
              className="border p-2 rounded mb-4 w-full"
            />
            <button
              type="button"
              onClick={handleUserUpdate}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 mr-2"
            >
              Guardar cambios
            </button>
          </div>
        )}

        {/* 🟡 Formulario para editar dirección */}
        {showAddressForm && (
          <>
            <h3 className="text-lg font-semibold mb-2">
              Editar dirección de envío
            </h3>
            <form onSubmit={handleSubmit} className="grid gap-4">
              {[
                ["calle", "Calle"],
                ["numero", "Número"],
                ["colonia", "Colonia"],
                ["ciudad", "Ciudad"],
                ["estado", "Estado"],
                ["codigo_postal", "Código Postal"],
                ["telefono", "Teléfono"],
              ].map(([name, label]) => (
                <input
                  key={name}
                  name={name}
                  placeholder={label}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
              ))}
              <button
                type="submit"
                className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                Guardar dirección
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default AddAddress;
