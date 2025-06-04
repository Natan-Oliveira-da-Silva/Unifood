const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "SEGREDO_MUITO_SECRETO_PARA_DESENVOLVIMENTO_12345";

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não fornecido." });
    }

    
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: "Token mal formatado ou tipo de token inválido." });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        req.usuarioDecodificado = decoded; 

        return next(); 
    } catch (error) {
        console.error("Erro na verificação do token:", error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expirado." });
        }
        return res.status(401).json({ message: "Token inválido." });
    }
};