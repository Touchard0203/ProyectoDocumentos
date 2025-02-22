import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dependencias from '../components/Dependencias';
import AgregarUsuario from '../components/AgregarUsuario';
import FolderList from '../components/FolderList';
import CreateFolder from '../components/CreateFolder';
import SubirArchivo from '../components/SubirArchivo'; 
import DocumentList from '../components/DocumentList';

const Home = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const [carpetas, setCarpetas] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const fetchCarpetas = async () => {
    try {
      const response = await fetch('http://localhost:4001/api/carpetas');
      const data = await response.json();
      setCarpetas(data.carpetas);
    } catch (error) {
      console.error('Error al cargar las carpetas:', error);
    }
  };

  useEffect(() => {
    fetchCarpetas();
  }, []);

  const filteredCarpetas = carpetas.filter(
    (folder) => folder.id_padre === currentFolder || currentFolder === null
  );

  const handleReset = () => {
    setCurrentFolder(null);
    window.location.reload();
  };

  const fetchDocumentos = async () => {
    try {
      const response = await fetch(`http://localhost:4001/api/documentos/?id_carpeta=${currentFolder}`);
      const data = await response.json();
      console.log(data.documentos);
    } catch (error) {
      console.error('Error al cargar los documentos:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>
        Bienvenido, <span className="text-primary">{usuario?.nombre_usuario || 'invitado'}</span>
      </h2>
      <p>Rol: {usuario?.rol}</p>

      {/* Mostrar el formulario de dependencias y agregar usuarios solo si el rol es 'Super Admin' */}
      {usuario?.rol === 'Super Admin' && (
        <div className="mt-4">
          <Dependencias />
          <AgregarUsuario />
        </div>
      )}

      {/* Mostrar el formulario de subir archivos solo si el rol no es 'Usuario' */}
      {currentFolder && usuario?.rol !== 'Usuario' && (
        <SubirArchivo
          idUsuario={usuario?.id_usuario}
          idCarpeta={currentFolder}
          fetchDocumentos={fetchDocumentos}
        />
      )}

      <hr />

      {/* Mostrar el formulario de crear carpetas solo si el rol no es 'Usuario' */}
      {usuario?.rol !== 'Usuario' && (
        <CreateFolder
          userId={usuario?.id_usuario}
          parentId={currentFolder}
          fetchFolders={fetchCarpetas}
        />
      )}

      {/* Lista de carpetas */}
      <FolderList
        carpetas={filteredCarpetas}
        setParentId={setCurrentFolder}
      />

      {/* Mostrar documentos solo si hay una carpeta seleccionada */}
      {currentFolder && (
        <DocumentList idCarpeta={currentFolder} />
      )}

      {/* Botón para regresar al directorio raíz */}
      {currentFolder && (
        <button
          onClick={handleReset}
          className="btn btn-secondary mt-3"
        >
          Regresar al directorio raíz
        </button>
      )}

      <button onClick={handleLogout} className="btn btn-danger mt-3">
        Cerrar sesión
      </button>
    </div>
  );
};

export default Home;
