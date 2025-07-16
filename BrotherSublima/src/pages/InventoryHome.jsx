import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const InventoryHome = () => {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!token || !userData) {
      navigate("/login");
    } else {
      setUser(userData);
      fetchEmployees(token);
    }
  }, [navigate]);

  const fetchEmployees = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al obtener empleados");

      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDeleteEmployee = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BACKEND_URL}/api/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al eliminar empleado");

      setEmployees(employees.filter((emp) => emp.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1549923746-c502d488b3ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDZ8fGJsdWUlMjBtaW5pbWFsaXNtfGVufDB8fHx8MTY4MDAzNTQ3Mw&ixlib=rb-1.2.1&q=80&w=1920)",
      }}
    >
      <div className="bg-white bg-opacity-90 p-10 rounded-lg shadow-xl w-full max-w-lg text-center backdrop-blur-md">
        <h2 className="text-3xl font-bold text-gray-800">Inventario</h2>
        {user && (
          <>
            <p className="text-gray-600 mt-2">Hola, {user.email}</p>

            {user.role === "admin" && (
              <>
                <button
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
                  onClick={() => navigate("/add-employee")}
                >
                  + Agregar Empleado
                </button>

                <h3 className="text-xl font-semibold mt-6 text-gray-700">
                  Lista de Empleados
                </h3>
                {error && <p className="text-red-500">{error}</p>}

                <ul className="mt-3 text-left space-y-3">
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <li
                        key={emp.id}
                        className="flex justify-between items-center p-3 bg-gray-100 rounded-lg shadow-sm"
                      >
                        <span className="text-gray-800">{emp.email}</span>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition duration-200"
                          onClick={() => handleDeleteEmployee(emp.id)}
                        >
                          Eliminar
                        </button>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No hay empleados registrados
                    </p>
                  )}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryHome;
