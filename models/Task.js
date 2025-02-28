const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    completado: { type: Boolean, default: false },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);
