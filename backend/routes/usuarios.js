const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo usuario
router.post('/registrar', async (req, res) => {
  const { nombre_usuario, contraseña, rol, id_dependencia } = req.body;
  try {
    const query = `
      INSERT INTO usuarios (nombre_usuario, contraseña, rol, id_dependencia)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [nombre_usuario, contraseña, rol, id_dependencia];
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Modificar un usuario
router.put('/modificar/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_usuario, contraseña, rol, id_dependencia } = req.body;

  try {
    const query = `
      UPDATE usuarios
      SET 
        nombre_usuario = $1,
        contraseña = $2,
        rol = $3,
        id_dependencia = $4
      WHERE id_usuario = $5
      RETURNING *;
    `;
    const values = [nombre_usuario, contraseña, rol, id_dependencia, id];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario modificado exitosamente', usuario: result.rows[0] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ruta para login
router.post('/login', async (req, res) => {
  const { nombre_usuario, contraseña } = req.body;

  try {
    const query = 'SELECT * FROM usuarios WHERE nombre_usuario = $1';
    const values = [nombre_usuario];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    if (usuario.contraseña === contraseña) {
      return res.status(200).json({ message: 'Login exitoso', usuario });
    } else {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

module.exports = router;
