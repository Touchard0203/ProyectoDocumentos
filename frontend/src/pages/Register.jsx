import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [idDependencia, setIdDependencia] = useState("");
  const [dependencias, setDependencias] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Cargar las dependencias al montar el componente
  useEffect(() => {
    const fetchDependencias = async () => {
      try {
        const response = await fetch("http://localhost:4001/api/dependencias/");
        const data = await response.json();
        setDependencias(data); // Guardamos las dependencias en el estado
      } catch (error) {
        console.error("Error al cargar las dependencias", error);
      }
    };

    fetchDependencias();
  }, []);

  // Función para manejar el envío del formulario
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nombreUsuario || !contraseña || !idDependencia) {
      setMensaje("Por favor, complete todos los campos.");
      return;
    }

    const data = {
      nombre_usuario: nombreUsuario,
      contraseña: contraseña,
      rol: "Usuario", // Establecer el rol como Usuario por defecto
      id_dependencia: idDependencia,
    };

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4001/api/usuarios/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMensaje("Registro exitoso. Redirigiendo al login...");
        setTimeout(() => {
          navigate("/"); // Redirigir al login después de 2 segundos
        }, 2000); //ms
      } else {
        setMensaje("Error al registrar el usuario: " + result.message);
      }
    } catch (error) {
      setMensaje("Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Registrarse</h2>
      {mensaje && <div className="alert alert-info">{mensaje}</div>}
      <form onSubmit={handleRegister} className="shadow p-4 rounded">
        <div className="mb-3">
          <label htmlFor="nombre_usuario" className="form-label">Nombre de usuario</label>
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
          <label htmlFor="contraseña" className="form-label">Contraseña</label>
          <input
            type="password"
            id="contraseña"
            className="form-control"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="dependencia" className="form-label">Dependencia</label>
          <select
            id="dependencia"
            className="form-control"
            value={idDependencia}
            onChange={(e) => setIdDependencia(e.target.value)}
            required
          >
            <option value="">Seleccionar dependencia</option>
            {dependencias.map((dependencia) => (
              <option key={dependencia.id_dependencia} value={dependencia.id_dependencia}>
                {dependencia.nombre_dependencia}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </form>
      <div>
        <p>¿Ya tienes cuenta? <a href="/">Iniciar sesión</a></p>
      </div>
    </div>
  );
};

export default Register;
