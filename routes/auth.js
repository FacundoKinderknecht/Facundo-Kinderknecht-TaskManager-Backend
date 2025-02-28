const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router(); // Crea un objeto router de Express

// **Ruta de Registro de Usuario**
router.post("/register", async (req, res) => {
    try {
        // Extrae los datos enviados en el cuerpo de la petición
        const { nombre, apellido, email, telefono, password } = req.body;
        
        // Verifica si el usuario ya existe en la base de datos
        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) 
            return res.status(400).json({ message: "El email ya está registrado" });

        // Genera un "salt" y encripta la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Crea un nuevo usuario con la contraseña encriptada
        const nuevoUsuario = new User({ nombre, apellido, email, telefono, password: passwordHash });
        await nuevoUsuario.save(); // Guarda el usuario en la base de datos

        res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
});

module.exports = router; // Exporta las rutas para que puedan usarse en `server.js`
