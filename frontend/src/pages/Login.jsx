import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mensaje, setMensaje] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const loginData = {
      nombre_usuario: nombreUsuario,
      contraseña: contraseña,
    };

    try {
      const response = await fetch("http://localhost:4001/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        // Mostrar mensaje de éxito
        setMensaje({ text: "Inicio de sesión exitoso.", type: "success" });

        // Guardar el usuario en localStorage (sin datos sensibles)
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        // Redirigir al usuario según su rol
        switch (data.usuario.rol) {
          case "Admin":
            navigate("/admin");
            break;
          case "Super Admin":
            navigate("/superadmin");
            break;
          case "Usuario":
            navigate("/usuario");
            break;
          default:
            navigate("/home");
            break;
        }
      } else {
        // Mostrar mensaje de error devuelto por el servidor
        setMensaje({ text: data.message || "Error en las credenciales.", type: "error" });
      }
    } catch (error) {
      // Mostrar mensaje en caso de fallo de conexión
      setMensaje({ text: "Error al conectar con el servidor.", type: "error" });
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Iniciar sesión</h2>

      {/* Mensaje dinámico */}
      {mensaje.text && (
        <div
          className={`alert ${
            mensaje.type === "success" ? "alert-success" : "alert-danger"
          }`}
        >
          {mensaje.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="shadow p-4 rounded">
        <div className="mb-3">
          <label htmlFor="nombre_usuario" className="form-label">
            Nombre de usuario
          </label>
          <input
            type="text"
            id="nombre_usuario"
            className="form-control"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="contraseña" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            id="contraseña"
            className="form-control"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Iniciar sesión
        </button>
      </form>

      <div className="mt-3">
        <p>
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
