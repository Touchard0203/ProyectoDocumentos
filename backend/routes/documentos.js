const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../db/db');
const path = require('path');

// Configuración de almacenamiento con Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

// Inicializar Multer
const upload = multer({ storage });

// Ruta para agregar un documento
router.post('/agregar', upload.single('archivo'), async (req, res) => {
    const { nombre_documento, id_dependencia, id_carpeta, usuarios_prohibidos, id_usuario, ruta_fisica } = req.body;
    const ruta_archivo = req.file?.path;

    try {
        // Validar que se cargó un archivo
        if (!ruta_archivo) {
            return res.status(400).json({ message: 'No se subió ningún archivo' });
        }

        // Verificar el rol del usuario
        const queryUsuario = 'SELECT rol FROM usuarios WHERE id_usuario = $1';
        const resultUsuario = await db.query(queryUsuario, [id_usuario]);

        if (resultUsuario.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const rol = resultUsuario.rows[0].rol;

        // Validar que sea Admin o Super Admin
        if (rol !== 'Admin' && rol !== 'Super Admin') {
            return res.status(403).json({ message: 'No tienes permisos para agregar documentos' });
        }

        // Insertar documento en la base de datos
        const queryInsert = `
      INSERT INTO documentos (
        nombre_documento, ruta_archivo, estado, id_dependencia, id_carpeta, usuarios_prohibidos, id_usuario, ruta_fisica
      ) VALUES ($1, $2, 'publico', $3, $4, $5, $6, $7)
      RETURNING *;
    `;

        const valuesInsert = [
            nombre_documento,
            ruta_archivo,
            id_dependencia || null,
            id_carpeta || null,
            usuarios_prohibidos ? `{${usuarios_prohibidos}}` : '{}',
            id_usuario,
            ruta_fisica || null,
        ];

        const resultInsert = await db.query(queryInsert, valuesInsert);

        res.status(201).json({
            message: 'Documento agregado exitosamente',
            documento: resultInsert.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar el documento', error: error.message });
    }
});
// Obtener documentos de una carpeta y dependencia 
router.get('/', async (req, res) => {
    const { id_carpeta, id_dependencia } = req.query;

    try {
        let query = 'SELECT * FROM documentos WHERE 1=1';
        let values = [];  // Aquí vamos a almacenar los parámetros para la consulta

        // Filtrar por carpeta con id_carpeta si se pasa
        if (id_carpeta) {
            query += ' AND id_carpeta = $1';
            values.push(id_carpeta); // Agregar el valor de id_carpeta
        }

        // Filtrar por dependencia con id_dependencia si se pasa
        if (id_dependencia) {
            query += id_carpeta ? ' AND id_dependencia = $2' : ' AND id_dependencia = $1'; // Si ya hay un parámetro, usar $2, si no, usar $1
            values.push(id_dependencia); // Agregar el valor de id_dependencia
        }

        // Ejecutar la consulta con los parámetros correspondientes
        const result = await db.query(query, values);

        res.status(200).json({
            message: 'Documentos obtenidos correctamente',
            documentos: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los documentos', error: error.message });
    }
});
router.get('/docs/', async (req, res) => {
    const { id_carpeta, id_dependencia, id_usuario } = req.query;

    try {
        let query = 'SELECT * FROM documentos WHERE 1=1';
        let values = [];

        // Filtrar por carpeta con id_carpeta si se pasa
        if (id_carpeta) {
            query += ' AND id_carpeta = $' + (values.length + 1);
            values.push(id_carpeta);
        }

        // Filtrar por dependencia con id_dependencia si se pasa
        if (id_dependencia) {
            query += ' AND id_dependencia = $' + (values.length + 1);
            values.push(id_dependencia);
        }

        // Filtrar por estado 'publico'
        query += ' AND estado = $' + (values.length + 1);
        values.push('publico');

        // Excluir documentos donde id_usuario está en usuarios_prohibidos
        if (id_usuario) {
            query += ' AND NOT ($' + (values.length + 1) + ' = ANY (usuarios_prohibidos))';
            values.push(id_usuario);
        }

        // Ejecutar la consulta con los parámetros correspondientes
        const result = await db.query(query, values);

        res.status(200).json({
            message: 'Documentos obtenidos correctamente',
            documentos: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los documentos', error: error.message });
    }
});

router.put('/modificar/:id_documento', upload.single('archivo'), async (req, res) => {
    const { id_documento } = req.params; // ID del documento a modificar
    const { nombre_documento, estado, usuarios_prohibidos, ruta_fisica } = req.body; // Campos del body
    const ruta_archivo = req.file?.path; // Ruta del archivo si se subió uno

    try {
        // Verificar si el documento existe
        const queryCheck = 'SELECT * FROM documentos WHERE id_documento = $1';
        const resultCheck = await db.query(queryCheck, [id_documento]);

        if (resultCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }

        // Construir consulta dinámica para actualización
        let queryUpdate = 'UPDATE documentos SET ';
        const updates = [];
        const values = [];
        let index = 1;

        if (nombre_documento) {
            updates.push(`nombre_documento = $${index++}`);
            values.push(nombre_documento);
        }
        if (ruta_archivo) {
            updates.push(`ruta_archivo = $${index++}`);
            values.push(ruta_archivo);
        }
        if (estado) {
            updates.push(`estado = $${index++}`);
            values.push(estado);
        }
        if (usuarios_prohibidos) {
            updates.push(`usuarios_prohibidos = $${index++}`);
            values.push(`{${usuarios_prohibidos}}`); // Convertir el array a formato SQL
        }
        if (ruta_fisica) {
            updates.push(`ruta_fisica = $${index++}`);
            values.push(ruta_fisica);
        }

        // Validar que al menos un campo se está actualizando
        if (updates.length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron campos para actualizar' });
        }

        // Completar la consulta
        queryUpdate += updates.join(', ') + ` WHERE id_documento = $${index}`;
        values.push(id_documento); // Agregar ID del documento al final de los valores

        // Ejecutar la consulta
        await db.query(queryUpdate, values);

        res.status(200).json({
            message: 'Documento modificado exitosamente',
            documento: { id_documento, nombre_documento, ruta_archivo, estado, usuarios_prohibidos, ruta_fisica }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al modificar el documento', error: error.message });
    }
});
// Ruta para servir un documento por ID
router.get('/ver/:id_documento', async (req, res) => {
    const { id_documento } = req.params;

    try {
        // Verificar si el documento existe
        const query = 'SELECT ruta_archivo FROM documentos WHERE id_documento = $1';
        const result = await db.query(query, [id_documento]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }

        const rutaArchivo = result.rows[0].ruta_archivo;

        // Enviar el archivo al navegador
        const filePath = path.resolve(rutaArchivo); // Resolución de la ruta absoluta
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error al enviar el archivo:', err.message);
                res.status(500).json({ message: 'Error al cargar el archivo' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el documento', error: error.message });
    }
});
module.exports = router;
