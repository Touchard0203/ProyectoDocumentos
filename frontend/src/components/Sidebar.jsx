import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUser, FaFolder, FaSignOutAlt, FaBars, FaAddressBook, FaDochub, FaFile, FaAddressCard, FaHome } from "react-icons/fa";

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false); // Estado para controlar si está colapsado

  // Función para manejar el logout
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  // Función para alternar el colapso del sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = {
    SuperAdmin: [
      { name: "Inicio", icon: <FaHome />, path: "/superadmin/" },
      { name: "Usuarios", icon: <FaUser />, path: "/superadmin/usuarios" },
      { name: "Dependencias", icon: <FaAddressBook />, path: "/superadmin/dependencias" },
      { name: "Carpetas y documentos", icon: <FaFolder />, path: "/superadmin/carpetas" },
    ],
    Admin: [
      { name: "Inicio", icon: <FaHome />, path: "/admin/" },
      { name: "Carpetas y documentos", icon: <FaFolder />, path: "/admin/carpetas" },
      { name: "Documentos", icon: <FaFile />, path: "/admin/documentos" },
      { name: "Solicitudes", icon: <FaAddressCard />, path: "/admin/solicitudes" },
    ],
    Usuario: [
      { name: "Inicio", icon: <FaHome />, path: "/usuario/" },
      { name: "Carpetas y documentos", icon: <FaFolder />, path: "/usuario/carpetas" },
      { name: "Solicitudes", icon: <FaAddressCard />, path: "/usuario/solicitudes" },
    ],
  };

  return (
    <div
      className="sidebar d-flex flex-column"
      style={{
        width: isCollapsed ? "80px" : "250px",
        backgroundColor: "#0044cc",
        color: "white",
        height: "100vh",
        transition: "width 0.3s ease",
        boxShadow: "2px 0 5px rgba(0, 0, 0, 0.2)",
        overflow: "hidden",
      }}
    >
      <div
        className="d-flex justify-content-between align-items-center p-3"
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <h2
          className="text-center m-0"
          style={{
            fontSize: "1.5rem",
            display: isCollapsed ? "none" : "block",
          }}
        >
          Panel {role}
        </h2>
        <button
          onClick={toggleSidebar}
          className="btn"
          style={{
            fontSize: "1.2rem",
            borderRadius: "50%",
            padding: "5px",
          }}
        >
          <FaBars />
        </button>
      </div>
      <ul className="list-unstyled mt-4 px-2">
        {menuItems[role]?.map((item, index) => (
          <li key={index} className="mb-3">
            <NavLink
              to={item.path}
              className="text-white d-flex align-items-center p-2"
              style={({ isActive }) =>
                isActive
                  ? {
                      backgroundColor: "#003399",
                      borderRadius: "5px",
                      transition: "all 0.3s ease",
                    }
                  : {}
              }
            >
              {item.icon}{" "}
              {!isCollapsed && (
                <span className="ms-2" style={{ fontSize: "1rem" }}>
                  {item.name}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-auto px-3 pb-3">
        <button
          onClick={handleLogout}
          className="btn btn-danger w-100 d-flex align-items-center"
          style={{
            padding: "10px",
            borderRadius: "5px",
            fontSize: "1rem",
            transition: "background-color 0.3s ease",
          }}
        >
          <FaSignOutAlt />
          {!isCollapsed && <span className="ms-2">Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
