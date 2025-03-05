const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router(); // Crea un objeto router de Express

// 📌 **Ruta de Registro con Validaciones Completas**
router.post("/register", async (req, res) => {
    try {
        const { nombre, apellido, email, telefono, password } = req.body;

        // 📌 **Validaciones**
        if (!nombre || !apellido || !email || !telefono || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "El correo electrónico no es válido." });
        }

        const telefonoRegex = /^[0-9]{8,15}$/;
        if (!telefonoRegex.test(telefono)) {
            return res.status(400).json({ message: "El número de teléfono debe tener entre 8 y 15 dígitos." });
        }

        // 📌 **Verificar si el usuario ya existe**
        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ message: "El correo electrónico ya está registrado." });
        }

        // 📌 **Encriptar la contraseña**
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 📌 **Crear nuevo usuario**
        const nuevoUsuario = new User({ nombre, apellido, email, telefono, password: passwordHash });
        await nuevoUsuario.save();

        // 📌 **Generar Token JWT**
        const token = jwt.sign({ userId: nuevoUsuario._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({
            message: "Usuario registrado exitosamente.",
            token,
            user: {
                id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                telefono: nuevoUsuario.telefono
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// **Ruta de Login de Usuario**
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 📌 **Validaciones**
        if (!email || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        // 📌 **Verificar si el usuario existe**
        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ message: "El correo electrónico no está registrado." });
        }

        // 📌 **Verificar la contraseña**
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(400).json({ message: "Contraseña incorrecta." });
        }

        // 📌 **Generar Token JWT**
        const token = jwt.sign({ userId: usuario._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            message: "Inicio de sesión exitoso.",
            token,
            user: {
                id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                telefono: usuario.telefono
            }
        });

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
