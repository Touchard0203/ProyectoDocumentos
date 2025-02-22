import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const RevisarSolicitudes = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const id_dependencia = usuario?.id_dependencia;

    const [solicitudes, setSolicitudes] = useState([]);
    const [usuarios, setUsuarios] = useState({}); // Estado para almacenar nombres de usuarios

    useEffect(() => {
        fetch(`http://localhost:4001/api/solicitudes/dependencia/${id_dependencia}`)
            .then(response => response.json())
            .then(data => setSolicitudes(data))
            .catch(error => console.error('Error fetching solicitudes:', error));
    }, [id_dependencia]);

    const fetchUsuario = (id_solicitud) => {
        // Verifica si el usuario ya está en el estado
        if (usuarios[id_solicitud]) return;

        fetch(`http://localhost:4001/api/solicitudes/${id_solicitud}/usuario`)
            .then(response => response.json())
            .then(data => {
                setUsuarios(prev => ({ ...prev, [id_solicitud]: data.nombre_usuario }));
            })
            .catch(error => console.error(`Error fetching usuario for solicitud ${id_solicitud}:`, error));
    };

    const handleEstadoChange = (id_solicitud, nuevoEstado) => {
        fetch(`http://localhost:4001/api/solicitudes/${id_solicitud}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ estado: nuevoEstado }),
        })
            .then(response => response.json())
            .then(data => {
                setSolicitudes(solicitudes.map(solicitud =>
                    solicitud.id_solicitud === id_solicitud ? { ...solicitud, estado: nuevoEstado } : solicitud
                ));
            })
            .catch(error => console.error('Error updating solicitud:', error));
    };

    const getColor = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return 'bg-secondary';
            case 'Rechazado':
                return 'bg-danger';
            case 'Aprobado':
                return 'bg-success';
            default:
                return 'bg-light';
        }
    };

    return (
        <div className="container">
            <h2>Revisar solicitud</h2>
            <div className="row">
                {solicitudes.map(solicitud => {
                    fetchUsuario(solicitud.id_solicitud);
                    return (
                        <div key={solicitud.id_solicitud} className="col-md-4 mb-3">
                            <div className={`card ${getColor(solicitud.estado)}`}>
                                <div className="card-body">
                                    <h5 className="card-title">Estado: {solicitud.estado}</h5>
                                    <p className="card-text">
                                        Usuario: {usuarios[solicitud.id_solicitud] || 'Cargando...'}
                                    </p>
                                    <p className="card-text">Comentario: {solicitud.comentario}</p>
                                    <p className="card-text">
                                        Fecha de solicitud: {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES')}
                                    </p>
                                    <button
                                        className="btn btn-success me-2"
                                        onClick={() => handleEstadoChange(solicitud.id_solicitud, 'Aprobado')}
                                    >
                                        Revisar
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleEstadoChange(solicitud.id_solicitud, 'Rechazado')}
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RevisarSolicitudes;
