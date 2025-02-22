import React from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Eliminar el usuario del localStorage
    localStorage.removeItem("usuario");

    // Redirigir al login
    navigate("/login");
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">
      Cerrar sesión
    </button>
  );
};

export default Logout;
