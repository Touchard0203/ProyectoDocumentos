import React, { useState } from "react";
import { FaFolder } from "react-icons/fa";
import styled from "styled-components";

// Estilos
const FolderListContainer = styled.div`
  border: 1px solid #ddd;
  padding: 2rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FolderListTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  margin: 0 auto 1.5rem auto;
  display: block;
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

const BreadcrumbNav = styled.nav`
  margin-bottom: 1.5rem;
`;

const BreadcrumbList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BreadcrumbItem = styled.li`
  margin-right: 10px;
  font-size: 1rem;
  color: #007bff;

  &.active {
    color: #333;
  }

  button {
    background: none;
    border: none;
    color: inherit;
    font-size: 1rem;
    padding: 0;
    cursor: pointer;
    text-decoration: underline;
  }
`;

const GridContainer = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 0;
  list-style: none;
  margin: 0;
`;

const GridItem = styled.li`
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
    border-color: #007bff;
  }
`;

const FolderIcon = styled.div`
  color: #007bff;
  margin-bottom: 1rem;
`;

const FolderName = styled.p`
  font-size: 14px;
  color: #333;
  margin: 0;
`;

const FolderList = ({ carpetas, setParentId }) => {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // Carpetas del nivel actual
  const filteredFolders = carpetas.filter(
    (folder) =>
      folder.id_padre === currentFolderId &&
      folder.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleFolderClick = async (folder) => {
    try {
      await fetch(`http://localhost:4001/api/carpetas/uso/${folder.id_carpeta}`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Error al incrementar uso:', error);
    }

    setBreadcrumb((prev) => [...prev, folder]);
    setCurrentFolderId(folder.id_carpeta);
    setParentId(folder.id_carpeta);
  };

  const handleBackClick = () => {
    if (breadcrumb.length > 0) {
      const newBreadcrumb = [...breadcrumb];
      newBreadcrumb.pop();
      const previousFolderId = newBreadcrumb.length > 0 ? newBreadcrumb[newBreadcrumb.length - 1].id_carpeta : null;
      setBreadcrumb(newBreadcrumb);
      setCurrentFolderId(previousFolderId);
      setParentId(previousFolderId);
    }
  };

  return (
    <FolderListContainer>
      <FolderListTitle>Carpetas</FolderListTitle>

      <SearchInput
        type="text"
        placeholder="Buscar carpeta por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <BreadcrumbNav>
        <BreadcrumbList>
          {breadcrumb.length === 0 ? (
            <BreadcrumbItem className="active">Inicio</BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem>
                <button onClick={handleBackClick}>Atrás</button>
              </BreadcrumbItem>
              {breadcrumb.map((folder) => (
                <BreadcrumbItem key={folder.id_carpeta} className="active">
                  {folder.nombre}/
                </BreadcrumbItem>
              ))}
            </>
          )}
        </BreadcrumbList>
      </BreadcrumbNav>

      <GridContainer>
        {filteredFolders.map((folder) => (
          <GridItem key={folder.id_carpeta} onClick={() => handleFolderClick(folder)}>
            <FolderIcon>
              <FaFolder size={40} />
            </FolderIcon>
            <FolderName>{folder.nombre}</FolderName>
          </GridItem>
        ))}
      </GridContainer>
    </FolderListContainer>
  );
};

export default FolderList;
