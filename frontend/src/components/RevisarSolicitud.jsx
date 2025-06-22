import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RevisarSolicitudes = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const id_dependencia = usuario?.id_dependencia;

    const [solicitudes, setSolicitudes] = useState([]);
    const [usuarios, setUsuarios] = useState({});
    const [documentos, setDocumentos] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:4001/api/solicitudes/dependencia/${id_dependencia}`)
            .then(response => response.json())
            .then(data => setSolicitudes(data))
            .catch(error => console.error('Error fetching solicitudes:', error));

        fetch(`http://localhost:4001/api/documentos/dependencia/${id_dependencia}`)
            .then(response => response.json())
            .then(data => setDocumentos(data))
            .catch(error => console.error('Error fetching documentos:', error));
    }, [id_dependencia]);

    const fetchUsuario = (id_solicitud) => {
        if (usuarios[id_solicitud]) return;

        fetch(`http://localhost:4001/api/solicitudes/${id_solicitud}/usuario`)
            .then(response => response.json())
            .then(data => {
                setUsuarios(prev => ({ ...prev, [id_solicitud]: data.nombre_usuario }));
            })
            .catch(error => console.error(`Error fetching usuario for solicitud ${id_solicitud}:`, error));
    };

    const handleEstadoChange = (id_solicitud, nuevoEstado) => {
        fetch(`http://localhost:4001/api/documentos/autorizar/${id_solicitud}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado }),
        })
            .then(response => response.json())
            .then(() => {
                setSolicitudes(prev =>
                    prev.map(solicitud =>
                        solicitud.id_solicitud === id_solicitud
                            ? { ...solicitud, estado: nuevoEstado }
                            : solicitud
                    )
                );
                toast.success(`Documento ${nuevoEstado.toLowerCase()} exitosamente`);
            })
            .catch(error => {
                console.error('Error actualizando estado:', error);
                toast.error('Error al actualizar la solicitud');
            });
    };

    const getColor = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return '#adb5bd';
            case 'Rechazado':
                return '#dc3545';
            case 'Aprobado':
                return '#198754';
            default:
                return '#6c757d';
        }
    };

    return (
        <div className="container">
            <h2 className="mb-4">Revisar Solicitudes</h2>
            <div className="row">
                {solicitudes.map(solicitud => {
                    fetchUsuario(solicitud.id_solicitud);
                    const documento = documentos.find(doc => doc.id_documento === solicitud.id_documento);

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
                                        className="badge mb-3"
                                        style={{
                                            backgroundColor: getColor(solicitud.estado),
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            padding: '0.4em 0.8em',
                                            borderRadius: '8px',
                                            width: 'fit-content'
                                        }}
                                    >
                                        {solicitud.estado}
                                    </span>

                                    <h5 className="card-title text-primary" style={{ fontWeight: 600 }}>
                                        {documento?.nombre_documento || 'Documento desconocido'}
                                    </h5>

                                    <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                                        <strong>Usuario:</strong> {usuarios[solicitud.id_solicitud] || 'Cargando...'}
                                    </p>

                                    <p style={{ fontSize: '0.9rem' }}>
                                        <strong>Comentario:</strong> {solicitud.comentario}
                                    </p>

                                    <p style={{ fontSize: '0.85rem' }} className="text-muted mb-3">
                                        <i className="bi bi-calendar-event me-1"></i>
                                        {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES')}
                                    </p>

                                    {documento && (
                                        <a
                                            className="btn btn-outline-primary btn-sm mb-3"
                                            href={`http://localhost:4001/api/documentos/ver/${documento.id_documento}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Ver Documento
                                        </a>
                                    )}

                                    {solicitud.estado === 'Pendiente' && (
                                        <div className="mt-auto d-flex justify-content-between">
                                            <button
                                                className="btn btn-success btn-sm px-3"
                                                onClick={() => handleEstadoChange(solicitud.id_solicitud, 'Aprobado')}
                                            >
                                                Aprobar
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm px-3"
                                                onClick={() => handleEstadoChange(solicitud.id_solicitud, 'Rechazado')}
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    );
                })}
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default RevisarSolicitudes;
