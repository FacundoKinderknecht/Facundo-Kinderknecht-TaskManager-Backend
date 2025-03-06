const express = require ("express");
const Task = require ("../models/Task.js");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 **Crear una nueva tarea**
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: "Título y descripción son obligatorios." });
        }

        const newTask = new Task({
            userId: req.user.userId,
            title,
            description,
            completed: false
        });

        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: "Error al crear la tarea", error: error.message });
    }
});

// 📌 **Obtener todas las tareas del usuario autenticado**
router.get("/", authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.userId });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las tareas", error: error.message });
    }
});

// 📌 **Actualizar una tarea**
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la tarea", error: error.message });
    }
});

// 📌 **Eliminar una tarea**
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await Task.findByIdAndDelete(id);
        res.status(200).json({ message: "Tarea eliminada correctamente." });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la tarea", error: error.message });
    }
});

module.exports = router;
