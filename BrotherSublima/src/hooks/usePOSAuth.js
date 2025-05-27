const usePOSAuth = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("pos_user"));

  // ✅ Verificamos que exista token y sea tipo POS
  if (token && user && user.tipo === "pos") {
    return true;
  }

  return false;
};

export default usePOSAuth;
