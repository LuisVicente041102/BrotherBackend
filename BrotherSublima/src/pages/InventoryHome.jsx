import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
      const response = await fetch("http://localhost:5000/api/employees", {
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
      const response = await fetch(
        `http://localhost:5000/api/employees/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Error al eliminar empleado");

      setEmployees(employees.filter((emp) => emp.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Bienvenido al Inventario
        </h2>
        {user && (
          <>
            <p className="text-gray-600 mt-2">Hola, {user.email}</p>

            {user.role === "admin" && (
              <>
                <button
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                  onClick={() => navigate("/add-employee")}
                >
                  Agregar Empleado
                </button>

                <h3 className="text-xl font-semibold mt-4">
                  Lista de Empleados
                </h3>
                {error && <p className="text-red-500">{error}</p>}

                <ul className="mt-3 text-left">
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <li
                        key={emp.id}
                        className="p-2 border-b border-gray-300 flex justify-between items-center"
                      >
                        {emp.email}
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                          onClick={() => handleDeleteEmployee(emp.id)}
                        >
                          Eliminar
                        </button>
                      </li>
                    ))
                  ) : (
                    <p>No hay empleados registrados</p>
                  )}
                </ul>
              </>
            )}

            <button
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryHome;
