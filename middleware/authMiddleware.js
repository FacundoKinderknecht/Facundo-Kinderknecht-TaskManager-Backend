const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        // Extraer el token del header Authorization
        const token = req.header("Authorization");
        if (!token) {
            return res.status(401).json({ message: "Acceso denegado. No hay token." });
        }

        // Validar el formato del token (debe empezar con "Bearer ")
        if (!token.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Formato de token inválido" });
        }

        // Extraer el token sin "Bearer "
        const tokenReal = token.split(" ")[1];

        // Verificar el token con la clave secreta
        const verified = jwt.verify(tokenReal, process.env.JWT_SECRET);
        req.user = verified; // Guardamos el usuario en la request
        next(); // Pasamos al siguiente middleware
    } catch (error) {
        res.status(401).json({ message: "Token inválido" });
    }
};
