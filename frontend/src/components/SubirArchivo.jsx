import React, { useState, useEffect } from 'react';

const SubirArchivo = ({ idUsuario, idCarpeta, fetchDocumentos }) => {
  const [dependencias, setDependencias] = useState([]);
  const [nombreDocumento, setNombreDocumento] = useState('');
  const [ruta_fisica, setRuta_fisica] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState(''); // Para mostrar errores del archivo

  useEffect(() => {
    const fetchDependencias = async () => {
      try {
        const response = await fetch('http://localhost:4001/api/dependencias/');
        const data = await response.json();
        console.log('Dependencias cargadas:', data); // Verifica el contenido de la respuesta
        setDependencias(data); // Ajusta aquí si el array está directamente en `data` o `data.dependencias`
      } catch (error) {
        console.error('Error al cargar las dependencias:', error);
      }
    };

    fetchDependencias();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setArchivo(file);
        setErrorArchivo('');
      } else {
        setArchivo(null);
        setErrorArchivo('Solo se permiten archivos PDF');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!archivo) {
      alert('Selecciona un archivo válido antes de subirlo');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('nombre_documento', nombreDocumento);
    formData.append('id_dependencia', e.target.id_dependencia.value);
    formData.append('id_carpeta', idCarpeta);
    formData.append('id_usuario', idUsuario);
    formData.append('ruta_fisica', ruta_fisica);

    try {
      const response = await fetch('http://localhost:4001/api/documentos/agregar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Documento subido exitosamente');
        fetchDocumentos(); // Recarga los documentos
      } else {
        alert('Error al subir el documento');
      }
    } catch (error) {
      console.error('Error al subir el documento:', error);
    }
  };

  return (
    <div className="mt-4">
      <h3>Subir un nuevo documento</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del Documento</label>
          <input
            type="text"
            className="form-control"
            value={nombreDocumento}
            onChange={(e) => setNombreDocumento(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Ruta física</label>
          <input
            type="text"
            className="form-control"
            value={ruta_fisica}
            onChange={(e) => setRuta_fisica(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Seleccionar archivo</label>
          <input
            type="file"
            className="form-control"
            onChange={handleFileChange}
            required
          />
          {errorArchivo && <p className="text-danger">{errorArchivo}</p>}
        </div>

        <div className="form-group">
          <label>Dependencia</label>
          <select
            className="form-control"
            name="id_dependencia"
            required
          >
            <option value="">Selecciona una dependencia</option>
            {dependencias.map((dependencia) => (
              <option key={dependencia.id_dependencia} value={dependencia.id_dependencia}>
                {dependencia.nombre_dependencia}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary mt-3">Subir Documento</button>
      </form>
    </div>
  );
};

export default SubirArchivo;
