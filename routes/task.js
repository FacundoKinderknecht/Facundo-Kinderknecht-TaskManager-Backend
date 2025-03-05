const express = require("express");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

//**Crear una nueva tarea** (PROTEGIDO: Solo usuarios autenticados)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { titulo, descripcion } = req.body;

        // Validar datos
        if (!titulo || !descripcion) {
            return res.status(400).json({ message: "Título y descripción son obligatorios" });
        }

        // Crear nueva tarea asociada al usuario autenticado
        const nuevaTarea = new Task({
            titulo,
            descripcion,
            usuario: req.user.userId
        });

        await nuevaTarea.save();
        res.status(201).json(nuevaTarea);
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// **Obtener todas las tareas del usuario autenticado**
router.get("/", authMiddleware, async (req, res) => {
    try {
        const tareas = await Task.find({ usuario: req.user.userId });
        res.json(tareas);
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// **Actualizar una tarea**
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { titulo, descripcion, completado } = req.body;

        // Buscar tarea por ID y verificar si pertenece al usuario autenticado
        let tarea = await Task.findOne({ _id: req.params.id, usuario: req.user.userId });

        if (!tarea) {
            return res.status(404).json({ message: "Tarea no encontrada o no pertenece al usuario" });
        }

        // Actualizar tarea con nuevos datos
        tarea.titulo = titulo ?? tarea.titulo;
        tarea.descripcion = descripcion ?? tarea.descripcion;
        tarea.completado = completado ?? tarea.completado;

        await tarea.save();
        res.json(tarea);
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// 📌 **Eliminar una tarea**
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const tarea = await Task.findOneAndDelete({ _id: req.params.id, usuario: req.user.userId });

        if (!tarea) {
            return res.status(404).json({ message: "Tarea no encontrada o no pertenece al usuario" });
        }

        res.json({ message: "Tarea eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

module.exports = router;
