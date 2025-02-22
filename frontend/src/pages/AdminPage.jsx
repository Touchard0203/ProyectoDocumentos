import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import FolderList from '../components/FolderList';
import CreateFolder from '../components/CreateFolder';
import SubirArchivo from '../components/SubirArchivo';
import DocumentListAdmin from '../components/DocumentListAdmin';
import GestionDocumentList from '../components/GestionDocumentList';
import RevisarSolicitudes from '../components/RevisarSolicitud';

const AdminPage = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const [carpetas, setCarpetas] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCarpetas = async () => {
    try {
      const response = await fetch('http://localhost:4001/api/carpetas');
      const data = await response.json();
      setCarpetas(data.carpetas);
    } catch (error) {
      console.error('Error al cargar las carpetas:', error);
    }
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

  const handleReset = () => {
    setCurrentFolder(null);
    window.location.reload();
  };
  const handleLoad = () => {
    setLoading(false);
  };

  useEffect(() => {
    fetchCarpetas();
  }, []);

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar se integra aquí */}
      <Sidebar role="Admin" />

      {/* Contenido principal con scroll */}
      <div className="content flex-grow-1 p-4" style={{ overflowY: 'auto', height: '100vh' }}>
        <h2>
          Bienvenido, Admin <span className="text-primary">{usuario?.nombre_usuario}</span>
        </h2>

        {/* Aquí manejamos las rutas */}
        <Routes>
          {/* Ruta para SEMAPA */}
          <Route path="/" element={
            <div style={{ height: '100vh', width: '100%' }}>
              {/* Si está cargando, muestra un spinner */}
              {loading && (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                  <div className="spinner-border" role="status">
                    <span className="sr-only"></span>
                  </div>
                </div>
              )}
              <iframe
                src="https://www.semapa.gob.bo"
                style={{ height: '100%', width: '100%' }}
                title="SEMAPA"
                frameBorder="0"
                onLoad={handleLoad} // Llamamos a handleLoad cuando se carga el iframe
              />
            </div>
          } />
          {/* Ruta para Carpetas */}
          <Route path="/documentos" element={<GestionDocumentList idDependencia={usuario?.id_dependencia} />} />
          <Route path="/solicitudes" element={<RevisarSolicitudes />} />
          <Route
            path="/carpetas"
            element={
              <>
                <div className="mt-4">
                  <h4>Gestión de Carpetas</h4>
                  {currentFolder && usuario?.rol !== 'Usuario' && (
                    <SubirArchivo
                      idUsuario={usuario?.id_usuario}
                      idCarpeta={currentFolder}
                      fetchDocumentos={fetchDocumentos}
                    />
                  )}
                  <CreateFolder
                    userId={usuario?.id_usuario}
                    parentId={currentFolder}
                    fetchFolders={fetchCarpetas}
                  />
                </div>

                <hr />

                {/* Lista de carpetas */}
                <FolderList
                  carpetas={carpetas}
                  setParentId={setCurrentFolder} // Este prop manejará el cambio de carpeta padre
                />
                {currentFolder && (
                  <DocumentListAdmin
                    idCarpeta={currentFolder}
                    idDependencia={usuario?.id_dependencia || null} // Pasamos id_dependencia como prop
                  />
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
              </>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPage;
