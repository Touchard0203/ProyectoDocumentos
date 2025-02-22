const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Ruta para obtener todas las dependencias
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dependencias');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las dependencias' });
  }
});
// Obtener usuarios con rol 'usuario' de una dependencia específica
router.get('/:id_dependencia/usuarios', async (req, res) => {
  const { id_dependencia } = req.params;

  try {
    const query = `
      SELECT * FROM usuarios
      WHERE id_dependencia = $1 AND rol = 'Usuario';
    `;
    const values = [id_dependencia];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios con el rol "usuario" en esta dependencia' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
});

// Ruta para agregar una nueva dependencia
router.post('/agregar', async (req, res) => {
  const { nombre_dependencia } = req.body;
  if (!nombre_dependencia) {
    return res.status(400).json({ message: 'El nombre de la dependencia es obligatorio' });
  }

  try {
    const result = await db.query(
      'INSERT INTO dependencias (nombre_dependencia) VALUES ($1) RETURNING *',
      [nombre_dependencia]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la dependencia' });
  }
});

// Ruta para modificar una dependencia
router.put('/modificar/:id_dependencia', async (req, res) => {
  const { id_dependencia } = req.params; // ID de la dependencia a modificar
  const { nombre_dependencia } = req.body;

  if (!nombre_dependencia) {
    return res.status(400).json({ message: 'El nombre de la dependencia es obligatorio' });
  }

  try {
    const result = await db.query(
      'UPDATE dependencias SET nombre_dependencia = $1 WHERE id_dependencia = $2 RETURNING *',
      [nombre_dependencia, id_dependencia]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Dependencia no encontrada' });
    }

    res.json(result.rows[0]); // Dependencia actualizada
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al modificar la dependencia' });
  }
});

module.exports = router;
