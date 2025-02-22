import React, { useState, useEffect } from "react";
import styled from "styled-components";

const GestionDocumentList = ({ idDependencia }) => {
  const [documentos, setDocumentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocumento, setSelectedDocumento] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchUsuario, setSearchUsuario] = useState("");
  const [formData, setFormData] = useState({
    nombre_documento: "",
    estado: "publico",
    usuarios_prohibidos: [],
    ruta_fisica: "",
    archivo: null,
  });

  // Obtener documentos y usuarios
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const documentosRes = await fetch(
          `http://localhost:4001/api/documentos/?id_dependencia=${idDependencia}`
        );
        const documentosData = await documentosRes.json();
        setDocumentos(documentosData.documentos || []);

        const usuariosRes = await fetch(
          `http://localhost:4001/api/dependencias/${idDependencia}/usuarios`
        );
        const usuariosData = await usuariosRes.json();
        setUsuarios(usuariosData || []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (idDependencia) fetchData();
  }, [idDependencia]);

  const handleDocumentoClick = (documento) => {
    setSelectedDocumento(documento);
    setFormData({
      nombre_documento: documento.nombre_documento,
      estado: documento.estado,
      usuarios_prohibidos: documento.usuarios_prohibidos || [],
      ruta_fisica: documento.ruta_fisica,
      archivo: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, archivo: e.target.files[0] });
  };

  const handleAddUsuario = (usuarioId) => {
    if (!formData.usuarios_prohibidos.includes(usuarioId)) {
      setFormData((prev) => ({
        ...prev,
        usuarios_prohibidos: [...prev.usuarios_prohibidos, usuarioId],
      }));
    }
  };

  const handleRemoveUsuario = (usuarioId) => {
    setFormData((prev) => ({
      ...prev,
      usuarios_prohibidos: prev.usuarios_prohibidos.filter((id) => id !== usuarioId),
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("nombre_documento", formData.nombre_documento);
    formDataToSend.append("estado", formData.estado);
    formDataToSend.append("usuarios_prohibidos", formData.usuarios_prohibidos.join(","));
    formDataToSend.append("ruta_fisica", formData.ruta_fisica);
    if (formData.archivo) formDataToSend.append("archivo", formData.archivo);

    try {
      const res = await fetch(
        `http://localhost:4001/api/documentos/modificar/${selectedDocumento.id_documento}`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );
      if (res.ok) {
        alert("Documento modificado exitosamente");
        setDocumentos((prev) =>
          prev.map((doc) =>
            doc.id_documento === selectedDocumento.id_documento
              ? { ...doc, ...formData }
              : doc
          )
        );
        setSelectedDocumento(null);
      } else {
        const errorData = await res.json();
        console.error("Error:", errorData.message);
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    }
  };

  const filteredDocumentos = documentos.filter((doc) =>
    doc.nombre_documento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      !formData.usuarios_prohibidos.includes(usuario.id_usuario) &&
      (usuario.nombre_usuario || usuario.email)
        .toLowerCase()
        .includes(searchUsuario.toLowerCase())
  );

  return (
    <Container>
      <h3>Gestión de Documentos</h3>
      <SearchInput
        type="text"
        placeholder="Buscar documentos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading ? (
        <p>Cargando documentos...</p>
      ) : filteredDocumentos.length === 0 ? (
        <p>No se encontraron documentos</p>
      ) : (
        <ButtonGrid>
          {filteredDocumentos.map((documento) => (
            <Button
              key={documento.id_documento}
              onClick={() => handleDocumentoClick(documento)}
            >
              {documento.nombre_documento}
            </Button>
          ))}
        </ButtonGrid>
      )}
      {selectedDocumento && (
        <FormContainer onSubmit={handleFormSubmit}>
          <h4>Modificar Documento</h4>
          <Input
            type="text"
            name="nombre_documento"
            value={formData.nombre_documento}
            onChange={handleInputChange}
            placeholder="Nombre del Documento"
            required
          />
          <Select
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
          >
            <option value="publico">Público</option>
            <option value="privado">Privado</option>
          </Select>
          <h5><strong>Usuarios prohibidos</strong></h5>

          <SearchInput
            type="text"
            placeholder="Buscar usuarios..."
            value={searchUsuario}
            onChange={(e) => setSearchUsuario(e.target.value)}
          />
          {filteredUsuarios.length > 0 ? (
            filteredUsuarios.map((usuario) => (
              <UserItem key={usuario.id_usuario}>
                <span>{usuario.nombre_usuario || usuario.email}</span>
                <Button type="button" onClick={() => handleAddUsuario(usuario.id_usuario)}>
                  Añadir
                </Button>
              </UserItem>
            ))
          ) : (
            <p>No hay usuarios disponibles</p>
          )}
          <h5><strong>Usuarios seleccionados: </strong></h5>

          {formData.usuarios_prohibidos.map((id) => (
            <UserItem key={id}>
              <span>
                {usuarios.find((u) => u.id_usuario === id)?.nombre_usuario || id}
              </span>
              <Button type="button" onClick={() => handleRemoveUsuario(id)}>
                Quitar
              </Button>
            </UserItem>
          ))}
          <Input
            type="text"
            name="ruta_fisica"
            value={formData.ruta_fisica}
            onChange={handleInputChange}
            placeholder="Ruta Física"
            required
          />
          <Input type="file" name="archivo" onChange={handleFileChange} />
          <FormActions>
            <Button type="submit" primary>
              Guardar Cambios
            </Button>
            <Button type="button" onClick={() => setSelectedDocumento(null)}>
              Cancelar
            </Button>
          </FormActions>
        </FormContainer>
      )}
    </Container>
  );
};

export default GestionDocumentList;


// Styled Components
const Container = styled.div`
  margin-top: 1rem;
  font-family: Arial, sans-serif;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
`;

const Button = styled.button`
  padding: 0.5rem;
  background-color: ${(props) => (props.primary ? "#007BFF" : "#f0f0f0")};
  border: none;
  border-radius: 4px;
  color: ${(props) => (props.primary ? "white" : "black")};
  cursor: pointer;
  &:hover {
    background-color: ${(props) => (props.primary ? "#0056b3" : "#e0e0e0")};
  }
`;

const FormContainer = styled.form`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;
