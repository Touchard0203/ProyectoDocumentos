import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const CrearSolicitud = () => {
    const [comentario, setComentario] = useState('');
    const [solicitudes, setSolicitudes] = useState([]);
    const [usuarios, setUsuarios] = useState({}); // Estado para almacenar nombres de usuarios
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const id_usuario = usuario?.id_usuario;

    useEffect(() => {
        fetch(`http://localhost:4001/api/solicitudes/${usuario?.id_usuario}`)
            .then(response => response.json())
            .then(data => setSolicitudes(data))
            .catch(error => console.error('Error fetching solicitudes:', error));
    }, [usuario?.id_usuario]);

    const fetchUsuario = (id_solicitud) => {
        // Verifica si el nombre del usuario ya está en el estado
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
            })
            .catch(error => console.error('Error adding solicitud:', error));
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
                <button type="submit" className="btn btn-primary">Agregar Solicitud</button>
            </form>
            <h3 className="mt-5">Mis Solicitudes</h3>
            <div className="row">
                {solicitudes.map(solicitud => {
                    fetchUsuario(solicitud.id_solicitud); // Llama al endpoint para obtener el usuario

                    return (
                        <div key={solicitud.id_solicitud} className="col-md-4 mb-3">
                            <div className={`card ${getColor(solicitud.estado)}`}>
                                <div className="card-body">
                                    <h5 className="card-title">Estado: {solicitud.estado}</h5>
                                    <p className="card-text">Comentario: {solicitud.comentario}</p>
                                    <p className="card-text">
                                        Fecha de solicitud:{' '}
                                        {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES')}
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
