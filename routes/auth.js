const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

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

// **Ruta de Login de Usuario**
router.post("/login", async (req, res) => {
    try {
        // Extraemos email y password del body
        const { email, password } = req.body;

        // Verificamos si el usuario existe en la base de datos
        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        // Comparamos la contraseña ingresada con la almacenada (encriptada)
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // Generamos un token JWT válido por 1 hora
        const token = jwt.sign({ userId: usuario._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Enviamos el token en la respuesta
        res.json({ token, user: { id: usuario._id, nombre: usuario.nombre, email: usuario.email } });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// **Ruta de verificacion de Token**
router.get("/perfil", authMiddleware, async (req, res) => {
    try {
        const usuario = await User.findById(req.user.userId).select("-password");
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
});


module.exports = router; // Exporta las rutas para que puedan usarse en `server.js`
