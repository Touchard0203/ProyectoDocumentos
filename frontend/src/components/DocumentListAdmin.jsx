import React, { useState, useEffect } from "react";
import { FaFile } from "react-icons/fa";
import styled from "styled-components";

// Estilos con styled-components
const DocumentListContainer = styled.div`
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: center;
`;

const DocumentListTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
`;

const LoadingText = styled.p`
  font-size: 1rem;
  color: #888;
`;

const NoDocumentsText = styled.p`
  font-size: 1rem;
  color: #888;
`;

const DocumentGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 0;
  list-style: none;
  margin: 0;
`;

const DocumentCard = styled.li`
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
    border-color: #007bff;
  }
`;

const DocumentIcon = styled.div`
  color: #007bff;
  margin-bottom: 1rem;
`;

const DocumentName = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  word-break: break-word;
`;

const DocumentAction = styled.p`
  font-size: 0.9rem;
  color: #007bff;
  text-decoration: underline;
`;

const DocumentLink = styled.a`
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ShareButton = styled.button`
  margin-top: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const CopyMessage = styled.p`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: green;
`;

const DocumentListAdmin = ({ idCarpeta, idDependencia }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        const idDependenciaQuery = idDependencia
          ? `&id_dependencia=${idDependencia}`
          : "";
        const response = await fetch(
          `http://localhost:4001/api/documentos/?id_carpeta=${idCarpeta}${idDependenciaQuery}`
        );
        const data = await response.json();
        if (data.documentos) {
          setDocumentos(data.documentos);
        } else {
          console.error("No se encontraron documentos en la respuesta");
        }
      } catch (error) {
        console.error("Error al cargar los documentos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (idCarpeta) {
      fetchDocumentos();
    }
  }, [idCarpeta, idDependencia]);

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => alert("¡Enlace copiado al portapapeles!"))
      .catch(() => alert("Error al copiar el enlace."));
  };

  return (
    <DocumentListContainer>
      <DocumentListTitle>Documentos</DocumentListTitle>
      {loading ? (
        <LoadingText>Cargando documentos...</LoadingText>
      ) : documentos.length === 0 ? (
        <NoDocumentsText>
          No hay documentos en esta carpeta para tu dependencia.
        </NoDocumentsText>
      ) : (
        <>
          <DocumentGrid>
            {documentos.map((documento, index) => (
              <DocumentCard key={index}>
                <DocumentLink
                  href={`http://localhost:4001/api/documentos/ver/${documento.id_documento}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DocumentIcon>
                    <FaFile size={48} />
                  </DocumentIcon>
                  <DocumentName>{documento.nombre_documento}</DocumentName>
                  <DocumentAction>Ver archivo</DocumentAction>
                </DocumentLink>
                <ShareButton
                  onClick={() =>
                    copyToClipboard(
                      `http://localhost:4001/api/documentos/ver/${documento.id_documento}`
                    )
                  }
                >
                  Compartir
                </ShareButton>
              </DocumentCard>
            ))}
          </DocumentGrid>
        </>
      )}
    </DocumentListContainer>
  );
};

export default DocumentListAdmin;
