import { useEffect, useState } from "react";

const useInventoryAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("inventory_user"));

    if (token && user && user.tipo === "inventario") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return isAuthenticated;
};

export default useInventoryAuth;
