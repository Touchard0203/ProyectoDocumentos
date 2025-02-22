const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM solicitudes');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});
router.get('/:id_usuario', async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const result = await db.query('SELECT * FROM solicitudes WHERE id_usuario = $1', [id_usuario]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint para obtener solicitudes de usuarios de una dependencia específica
router.get('/dependencia/:id_dependencia', async (req, res) => {
    try {
        const { id_dependencia } = req.params;
        const result = await db.query(`
            SELECT solicitudes.*
            FROM solicitudes
            JOIN usuarios ON solicitudes.id_usuario = usuarios.id_usuario
            WHERE usuarios.id_dependencia = $1
        `, [id_dependencia]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint para actualizar el estado de una solicitud
router.put('/:id_solicitud', async (req, res) => {
    try {
        const { id_solicitud } = req.params;
        const { estado } = req.body;
        const result = await db.query(`
            UPDATE solicitudes
            SET estado = $1
            WHERE id_solicitud = $2
            RETURNING *
        `, [estado, id_solicitud]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/:id_solicitud/usuario', async (req, res) => {
    try {
        const { id_solicitud } = req.params;
        const result = await db.query(`
            SELECT usuarios.*
            FROM usuarios
            JOIN solicitudes ON usuarios.id_usuario = solicitudes.id_usuario
            WHERE solicitudes.id_solicitud = $1
        `, [id_solicitud]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/agregar', async (req, res) => {
    try {
        const { comentario, id_usuario, estado } = req.body;

        const newSolicitud = await db.query('INSERT INTO solicitudes (comentario, id_usuario, estado) VALUES ($1, $2, $3) RETURNING *', [comentario, id_usuario, estado]);

        res.status(201).json(newSolicitud.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la solicitud' });
    }
});

module.exports = router;