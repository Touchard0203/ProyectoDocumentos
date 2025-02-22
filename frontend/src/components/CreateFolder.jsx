import React, { useState } from "react";

const CreateFolder = ({ userId, parentId, fetchFolders }) => {
  const [folderName, setFolderName] = useState("");
  const [estadoMensaje, setEstadoMensaje] = useState("");

  const handleCreateFolder = async () => {
    if (!folderName) {
      setEstadoMensaje("El nombre de la carpeta no puede estar vacío.");
      return;
    }

    const folderData = {
      nombre: folderName,
      id_usuario: userId,
      id_padre: parentId,
    };

    console.log("Datos enviados:", folderData); // Log para verificar los datos

    try {
      const response = await fetch("http://localhost:4001/api/carpetas/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(folderData),
      });

      if (response.ok) {
        setEstadoMensaje(`Carpeta "${folderName}" creada exitosamente!`);
        setFolderName("");
        fetchFolders(); // Recargar lista de carpetas
      } else {
        const errorData = await response.json(); // Obtener detalles de la respuesta de error
        console.log("Respuesta de error:", errorData); // Log para ver la respuesta de error
        setEstadoMensaje(errorData.message || "No se pudo crear la carpeta.");
      }
    } catch (error) {
      console.error("Error al crear la carpeta:", error);
      setEstadoMensaje("Error al crear la carpeta. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="border p-4 rounded bg-light shadow-sm mb-4">
      <h4 className="text-center mb-3">Crear Carpeta</h4>
      <div className="input-group mb-3">
        <input
          type="text"
          placeholder="Nombre de la carpeta"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="form-control"
        />
        <button onClick={handleCreateFolder} className="btn btn-primary">
          Crear carpeta
        </button>
      </div>
      {estadoMensaje && (
        <div
          className={`alert ${
            estadoMensaje.includes("Error") ? "alert-danger" : "alert-success"
          }`}
          role="alert"
        >
          {estadoMensaje}
        </div>
      )}
    </div>
  );
};

export default CreateFolder;
