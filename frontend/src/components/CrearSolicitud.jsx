import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const CrearSolicitud = () => {
    const [comentario, setComentario] = useState('');
    const [solicitudes, setSolicitudes] = useState([]);
    const [usuarios, setUsuarios] = useState({});
    const [documentos, setDocumentos] = useState([]);
    const [documentoSeleccionado, setDocumentoSeleccionado] = useState('');

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const id_usuario = usuario?.id_usuario;
    const id_dependencia = usuario?.id_dependencia;

    useEffect(() => {
        fetch(`http://localhost:4001/api/solicitudes/${id_usuario}`)
            .then(response => response.json())
            .then(data => setSolicitudes(data))
            .catch(error => console.error('Error fetching solicitudes:', error));

        if (id_dependencia) {
            fetch(`http://localhost:4001/api/documentos/dependencia/${id_dependencia}`)
                .then(response => response.json())
                .then(data => setDocumentos(data))
                .catch(error => console.error('Error fetching documentos:', error));
        }
    }, [id_usuario, id_dependencia]);

    const fetchUsuario = (id_solicitud) => {
        if (usuarios[id_solicitud]) return;
        fetch(`http://localhost:4001/api/solicitudes/${id_solicitud}/usuario`)
            .then(response => response.json())
            .then(data => {
                setUsuarios(prev => ({ ...prev, [id_solicitud]: data.nombre_usuario }));
            })
            .catch(error => console.error(`Error fetching usuario for solicitud ${id_solicitud}:`, error));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const nuevaSolicitud = {
            comentario,
            id_usuario,
            estado: 'Pendiente',
            id_documento: parseInt(documentoSeleccionado) // aseguramos que sea un número
        };

        fetch('http://localhost:4001/api/solicitudes/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevaSolicitud),
        })
            .then(response => response.json())
            .then(data => {
                setSolicitudes([...solicitudes, data]);
                setComentario('');
                setDocumentoSeleccionado('');
            })
            .catch(error => console.error('Error adding solicitud:', error));
    };


    const handleDocumentoChange = (e) => {
        const selectedId = e.target.value;
        setDocumentoSeleccionado(selectedId);
        console.log('Documento seleccionado ID:', selectedId);
    };

    const getColor = (estado) => {
        switch (estado) {
            case 'Pendiente': return 'bg-secondary';
            case 'Rechazado': return 'bg-danger';
            case 'Aprobado': return 'bg-success';
            default: return 'bg-light';
        }
    };

    return (
        <div className="container">
            <h2>Crear Nueva Solicitud</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="comentario" className="form-label">Comentario</label>
                    <textarea
                        id="comentario"
                        className="form-control"
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="documento" className="form-label">Seleccionar Documento</label>
                    <select
                        id="documento"
                        className="form-select"
                        value={documentoSeleccionado}
                        onChange={handleDocumentoChange}
                        required
                    >
                        <option value="">-- Selecciona un documento --</option>
                        {documentos.map(doc => (
                            <option key={doc.id_documento} value={doc.id_documento}>
                                {doc.nombre_documento}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary">Agregar Solicitud</button>
            </form>

            <h3 className="mt-5">Mis Solicitudes</h3>
            <div className="row">
                {solicitudes.map(solicitud => {
                    fetchUsuario(solicitud.id_solicitud);

                    return (
                        <div key={solicitud.id_solicitud} className="col-md-4 mb-4">
                            <div
                                className="card h-100"
                                style={{
                                    border: '1px solid #dee2e6',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <span
                                        className={`badge ${getColor(solicitud.estado).replace('bg-', 'bg-gradient bg-')} mb-2`}
                                        style={{ fontSize: '0.85rem' }}
                                    >
                                        {solicitud.estado}
                                    </span>
                                    <h5 className="card-title text-primary mb-2">
                                        {documentos.find(doc => doc.id_documento === solicitud.id_documento)?.nombre_documento || 'Documento desconocido'}
                                    </h5>
                                    <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                                        <i className="bi bi-calendar-event me-1"></i>
                                        {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES')}
                                    </p>
                                    <p className="mb-0" style={{ fontSize: '0.95rem' }}>
                                        <strong>Comentario:</strong> {solicitud.comentario}
                                    </p>
                                </div>
                            </div>
                        </div>

                    );
                })}
            </div>
        </div>
    );
};

export default CrearSolicitud;
