import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // Asegúrate de importar los estilos

const Register = () => {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [idDependencia, setIdDependencia] = useState("");
  const [dependencias, setDependencias] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDependencias = async () => {
      try {
        const response = await fetch("http://localhost:4001/api/dependencias/");
        const data = await response.json();
        setDependencias(data);
      } catch (error) {
        console.error("Error al cargar las dependencias", error);
      }
    };
    fetchDependencias();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nombreUsuario || !contraseña || !idDependencia) {
      setMensaje("Por favor, complete todos los campos.");
      return;
    }

    const data = {
      nombre_usuario: nombreUsuario,
      contraseña: contraseña,
      rol: "Usuario",
      id_dependencia: idDependencia,
    };

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4001/api/usuarios/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMensaje("Registro exitoso. Redirigiendo al login...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMensaje("Error al registrar: " + result.message);
      }
    } catch {
      setMensaje("Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-background">
      <div className="decorative-circle"></div>

      <div className="register-card">
        <h2 className="mb-4 text-center">Registrarse</h2>
        {mensaje && <div className="alert alert-info">{mensaje}</div>}

        <form onSubmit={handleRegister}>
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
              {dependencias.map((d) => (
                <option key={d.id_dependencia} value={d.id_dependencia}>
                  {d.nombre_dependencia}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar"}
          </button>
        </form>

        <div className="mt-3 text-center">
          <p>¿Ya tienes cuenta? <a href="/">Iniciar sesión</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
