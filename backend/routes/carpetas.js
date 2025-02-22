const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Ruta para crear una carpeta
router.post('/crear', async (req, res) => {
  const { nombre, id_usuario, id_padre } = req.body;

  try {
    // Buscar el rol del usuario
    const query = 'SELECT rol FROM usuarios WHERE id_usuario = $1';
    const values = [id_usuario];
    const result = await db.query(query, values);

    // Verificar si el usuario existe
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const rol = result.rows[0].rol;

    // Verificar que el usuario tenga rol Admin o Super Admin
    if (rol !== 'Admin' && rol !== 'Super Admin') {
      return res.status(403).json({ message: 'No tienes permisos para crear carpetas' });
    }

    // Verificar si id_padre es válido (si se proporciona, debe existir una carpeta con ese id)
    if (id_padre) {
      const checkPadreQuery = 'SELECT * FROM carpetas WHERE id_carpeta = $1';
      const checkPadreValues = [id_padre];
      const checkPadreResult = await db.query(checkPadreQuery, checkPadreValues);

      if (checkPadreResult.rows.length === 0) {
        return res.status(400).json({ message: 'El id_padre proporcionado no existe' });
      }
    }

    // Crear la carpeta
    const insertQuery = `
      INSERT INTO carpetas (nombre, id_usuario, id_padre)
      VALUES ($1, $2, $3) RETURNING *;
    `;
    // Si no hay id_padre, se usa null
    const insertValues = [nombre, id_usuario, id_padre || null];
    const insertResult = await db.query(insertQuery, insertValues);

    res.status(201).json({
      message: 'Carpeta creada exitosamente',
      carpeta: insertResult.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});
// Ruta para obtener todas las carpetas
router.get('/', async (req, res) => {
  try {
    const query = `
        SELECT c.id_carpeta, c.nombre, c.id_usuario, c.id_padre, u.nombre_usuario AS usuario_nombre
        FROM carpetas c
        LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      `;
    const result = await db.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron carpetas' });
    }

    res.status(200).json({ carpetas: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

module.exports = router;
