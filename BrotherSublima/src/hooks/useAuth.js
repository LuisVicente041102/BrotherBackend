import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const usePosAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("pos_user");

    if (!token || !user) {
      setIsAuthenticated(false);
      navigate("/poslogin");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  return isAuthenticated;
};

export default usePosAuth;
